import os
import sqlite3
import pandas as pd
import streamlit as st
import plotly.express as px

# Dashboard Setup
st.set_page_config(page_title="BC Healthcare Resource Engine", layout="wide")
st.title("🏥 British Columbia Healthcare Resource Allocation & Forecasting Engine")

DB_PATH = os.path.join("data", "bc_healthcare.db")

# 1. Read Processed Engine Schema
if not os.path.exists(DB_PATH):
    st.error("Database file missing. Please execute pipeline/extractor.py and pipeline/transformer.py first.")
    st.stop()

conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM clean_capacity_forecast", conn)
conn.close()

# 2. Sidebar Configuration
st.sidebar.header("Geography Controls")
health_authorities = sorted(df["health_authority"].unique())
selected_ha = st.sidebar.selectbox("Select Regional Health Authority", health_authorities)

# Filter Data Matrix based on UI Selection
df_filtered = df[df["health_authority"] == selected_ha].sort_values("ref_date")

# Split metrics to isolate historical context from machine learning models
df_hist = df_filtered[df_filtered["is_forecast"] == 0]
df_pred = df_filtered[df_filtered["is_forecast"] == 1]

# 3. Present Executive KPI Metrics (Pulling latest known historical month)
latest_actual = df_hist.iloc[-1]
current_utilization = latest_actual["smoothed_utilization"]

st.subheader(f"Current Operational Status: {selected_ha}")
col1, col2, col3 = st.columns(3)

with col1:
    st.metric(label="Active Acute Care Beds", value=f"{int(latest_actual['total_beds'])}")
with col2:
    st.metric(label="Bed Utilization (Smoothed)", value=f"{current_utilization:.1f}%")
with col3:
    # Threshold Alert Logic
    if current_utilization >= 90.0:
        status_label = "🔴 Critical Overload Alert"
    elif current_utilization >= 80.0:
        status_label = "🟡 High Utilization Warning"
    else:
        status_label = "🟢 System Nominal"
    st.metric(label="Resource Ingestion Status", value=status_label)

st.markdown("---")

# 4. Construct Time-Series Trend Projections
st.subheader("Bed Utilization Trajectory & Projections")

# We create an explicit column mapping to display clean legend keys inside the Plotly UI
df_filtered["Data Type"] = df_filtered["is_forecast"].map({0: "Historical (3-Mo Moving Avg)", 1: "Machine Learning Forecast"})

fig = px.line(
    df_filtered,
    x="ref_date",
    y="smoothed_utilization",
    color="Data Type",
    color_discrete_map={
        "Historical (3-Mo Moving Avg)": "#1f77b4",
        "Machine Learning Forecast": "#ff7f0e"
    },
    labels={"ref_date": "Timeline", "smoothed_utilization": "Bed Utilization Rate (%)"},
    title=f"Acute Care Bed Occupancy Optimization Path ({selected_ha})"
)

# Style chart presentation canvas
fig.update_layout(hovermode="x unified", legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1))
st.plotly_chart(fig, use_container_width=True)

# 5. Output Tabular Data Grids
st.subheader("Data Registry Extract")
st.dataframe(df_filtered.drop(columns=["Data Type"]), use_container_width=True)