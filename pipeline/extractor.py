import os
import sqlite3
import numpy as np
import pandas as pd

DB_PATH = os.path.join("data", "bc_healthcare.db")
START_DATE = "2022-01"
END_DATE = "2026-06"

# Synthetic baselines match approximate regional acute care footprints; 
# bias weights reflect StatsCan demographic profiles to test ETL 
# and forecasting pipelines against realistic, privacy-compliant data.
HEALTH_AUTHORITIES = {
    "Interior Health": {"base_beds": 1400, "elderly_bias": 1.25},
    "Fraser Health": {"base_beds": 2800, "elderly_bias": 1.05},
    "Vancouver Coastal Health": {"base_beds": 2200, "elderly_bias": 1.10},
    "Island Health": {"base_beds": 1600, "elderly_bias": 1.35},
    "Northern Health": {"base_beds": 600, "elderly_bias": 0.95}
}

def generate_provincial_health_data():
    """
    Generates realistic historical healthcare ingestion timelines across BC Health Authorities
    blended with seasonal variance and demographic baseline constraints.
    """
    print("Fetching and expanding provincial health baselines...")

    # generate continous monthly calender series
    date_range = pd.date_range(start=START_DATE, end=END_DATE, freq="MS").strftime("%Y-%m")

    all_records = []

    # generate realistic metrics for each Health Authority using localized parameters
    for ha_name, config in HEALTH_AUTHORITIES.items():
        base_beds = config["base_beds"]
        bias = config["elderly_bias"]

        for idx, current_month in enumerate(date_range):
            # extract month integer to compute seasonal wave patterns (Winter peaks)
            month_int = int(current_month.split("-")[1])
            seasonal_wave = np.sin((month_int - 2) * (2 *   np.pi / 12)) * 0.15

            # formulate simualted base ingestion load with subtle historical variance trend
            growth_trend = idx * 0.001
            base_utilization = 0.72 + seasonal_wave + growth_trend

            # apply demographic modifiers
            adjusted_utilization = min(max(base_utilization * bias, 0.45), 0.98)

            # finalize resource metrics
            patient_days = int(base_beds * adjusted_utilization * 30)
            discharges = int(patient_days / np.random.uniform(5.2, 7.1))

            all_records.append({
                "ref_date": current_month,
                "health_authority": ha_name,
                "total_beds": base_beds,
                "patient_days": patient_days,
                "total_discharges": discharges
            })

    df_raw = pd.DataFrame(all_records)

    # commit the payload into a local SQLite database sink
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    df_raw.to_sql("raw_health_metrics", conn, if_exists="replace", index=False)
    conn.close()

    print(f"[SUCCESS] Ingested {len(df_raw)} records into local table 'raw_health_metrics'.")

if __name__ == "__main__":
    generate_provincial_health_data()
        