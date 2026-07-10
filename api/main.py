import os
import sqlite3
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "bc_healthcare.db")

# Design id -> DB health_authority name. "Island Health" in the DB is shown
# as "Vancouver Island Health" in the UI to match the design's labeling.
REGIONS = [
    {"id": "northern", "name": "Northern Health", "short": "Northern", "db_name": "Northern Health"},
    {"id": "interior", "name": "Interior Health", "short": "Interior", "db_name": "Interior Health"},
    {"id": "coastal", "name": "Vancouver Coastal Health", "short": "Van. Coastal", "db_name": "Vancouver Coastal Health"},
    {"id": "fraser", "name": "Fraser Health", "short": "Fraser", "db_name": "Fraser Health"},
    {"id": "island", "name": "Vancouver Island Health", "short": "Van. Island", "db_name": "Island Health"},
]
REGION_BY_ID = {r["id"]: r for r in REGIONS}

# Matches the design's thresholds (not the legacy Streamlit app's 90/80).
CRITICAL_THRESHOLD = 95.0
ELEVATED_THRESHOLD = 85.0

# Only bed utilization is backed by real pipeline data today. The other
# design metrics are not yet produced by pipeline/extractor.py + transformer.py.
METRICS = {
    "bedUtilization": {
        "label": "Bed Utilization",
        "unit": "%",
        "decimals": 1,
        "column": "smoothed_utilization",
        "available": True,
    },
    "erWait": {"label": "ER Wait Time", "unit": " min", "decimals": 0, "column": "smoothed_er_wait_time", "available": True},
    "admissions": {"label": "Daily Admissions", "unit": "/day", "decimals": 0, "column": "smoothed_daily_admissions", "available": True},
    "staffing": {"label": "Patients per Nurse", "unit": ":1", "decimals": 1, "column": "smoothed_patients_per_nurse", "available": True},
}

app = FastAPI(title="BC Healthcare Resource Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _load_df() -> pd.DataFrame:
    if not os.path.exists(DB_PATH):
        raise HTTPException(
            status_code=503,
            detail="Database file missing. Run pipeline/extractor.py and pipeline/transformer.py first.",
        )
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query("SELECT * FROM clean_capacity_forecast", conn)
    finally:
        conn.close()
    return df.sort_values(["health_authority", "ref_date"]).reset_index(drop=True)


def _status_for(util: float) -> dict:
    if util >= CRITICAL_THRESHOLD:
        return {"label": "Critical", "color": "#c0392b"}
    if util >= ELEVATED_THRESHOLD:
        return {"label": "Elevated", "color": "#c47f17"}
    return {"label": "Normal", "color": "#1e8a5c"}


def _latest_actual(df: pd.DataFrame, db_name: str) -> pd.Series:
    rows = df[(df["health_authority"] == db_name) & (df["is_forecast"] == 0)]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No data for {db_name}")
    return rows.iloc[-1]


@app.get("/api/regions")
def get_regions():
    df = _load_df()
    out = []
    for r in REGIONS:
        latest = _latest_actual(df, r["db_name"])
        util = float(latest["smoothed_utilization"])
        status = _status_for(util)
        out.append(
            {
                "id": r["id"],
                "name": r["name"],
                "short": r["short"],
                "currentUtil": round(util, 1),
                "status": status["label"],
                "statusColor": status["color"],
            }
        )
    return out


@app.get("/api/kpis")
def get_kpis():
    df = _load_df()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    latest_date = conn.execute("SELECT MAX(ref_date) FROM clean_capacity_forecast WHERE is_forecast = 0").fetchone()[0]

    # Calculate provincial KPIs for that month
    records = conn.execute("""
        SELECT smoothed_utilization, smoothed_er_wait_time, smoothed_patients_per_nurse
        FROM clean_capacity_forecast
        WHERE ref_date = ? AND is_forecast = 0
    """, (latest_date,)).fetchall()
    conn.close()

    if not records:
        return {"avgBedUtil": 0, "elevatedCount": 0, "totalRegions": 5, "avgErWait": 0, "avgStaffing": None}

    avg_util = round(sum([r["smoothed_utilization"] for r in records if r["smoothed_utilization"] is not None]) / len(records), 1)
    avg_er_wait = round(sum([r["smoothed_er_wait_time"] for r in records if r["smoothed_er_wait_time"] is not None]) / len(records))
    avg_staffing = round(sum([r["smoothed_patients_per_nurse"] for r in records if r["smoothed_patients_per_nurse"] is not None]) / len(records), 1)
    elevated_count = sum([1 for r in records if r["smoothed_utilization"] and r["smoothed_utilization"] > 85.0])
    
    return {
        "avgBedUtil": avg_util,
        "elevatedCount": elevated_count,
        "totalRegions": 5,
        "avgErWait": avg_er_wait,
        "avgStaffing": avg_staffing
    }


@app.get("/api/regions/{region_id}/series")
def get_region_series(region_id: str, metric: str = "bedUtilization"):
    region = REGION_BY_ID.get(region_id)
    if not region:
        raise HTTPException(status_code=404, detail=f"Unknown region '{region_id}'")

    metric_def = METRICS.get(metric)
    if not metric_def:
        raise HTTPException(status_code=404, detail=f"Unknown metric '{metric}'")
    if not metric_def["available"]:
        raise HTTPException(
            status_code=501,
            detail=f"Metric '{metric}' is not yet produced by the data pipeline.",
        )

    df = _load_df()
    rows = df[df["health_authority"] == region["db_name"]].sort_values("ref_date")
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No data for {region['db_name']}")

    column = metric_def["column"]
    points = [
        {
            "month": row["ref_date"],
            "value": round(float(row[column]), metric_def["decimals"]),
            "isForecast": bool(row["is_forecast"]),
        }
        for _, row in rows.iterrows()
        if pd.notna(row[column])
    ]

    actual_points = [p for p in points if not p["isForecast"]]
    current = actual_points[-1]["value"] if actual_points else None
    six_ago = actual_points[-7]["value"] if len(actual_points) >= 7 else None
    delta = round(current - six_ago, metric_def["decimals"]) if current is not None and six_ago is not None else None

    return {
        "regionId": region["id"],
        "regionName": region["name"],
        "metricKey": metric,
        "metricLabel": metric_def["label"],
        "unit": metric_def["unit"],
        "current": current,
        "delta": delta,
        "points": points,
    }


@app.get("/api/metrics")
def get_metrics():
    return [
        {"key": key, "label": m["label"], "unit": m["unit"], "available": m["available"]}
        for key, m in METRICS.items()
    ]


from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    # Mount assets folder
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all route to serve SPA
    @app.get("/{catchall:path}")
    def serve_spa(catchall: str):
        requested_file = os.path.join(frontend_dist, catchall)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
        
        index_file = os.path.join(frontend_dist, "index.html")
        return FileResponse(index_file)
