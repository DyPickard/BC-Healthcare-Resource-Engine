import os
import sqlite3
import numpy as np
import pandas as pd
from prophet import Prophet

DB_PATH = os.path.join("data", "bc_healthcare.db")

def run_transformations_and_forecast():
    print("Executing Phase 3: Transforming data and generating predictive forecasts via Prophet...")
    
    # 1. Read raw data from SQLite
    conn = sqlite3.connect(DB_PATH)
    df_raw = pd.read_sql_query("SELECT * FROM raw_health_metrics", conn)
    
    # Ensure chronology
    df_raw = df_raw.sort_values(by=["health_authority", "ref_date"]).reset_index(drop=True)
    
    # 2. Feature Engineering: Calculate healthcare KPIs
    df_raw["bed_utilization_rate"] = (df_raw["patient_days"] / (df_raw["total_beds"] * 30)) * 100
    df_raw["avg_length_of_stay"] = df_raw["patient_days"] / df_raw["total_discharges"]
    
    # Statistical Smoothing: 3-month moving average per Health Authority
    df_raw["smoothed_utilization"] = df_raw.groupby("health_authority")["bed_utilization_rate"].transform(
        lambda x: x.rolling(window=3, min_periods=1).mean()
    )
    
    forecast_records = []
    health_authorities = df_raw["health_authority"].unique()
    
    # 3. Time-Series Forecasting Loop
    for ha in health_authorities:
        df_ha = df_raw[df_raw["health_authority"] == ha].copy()
        
        # Format the DataFrame to meet Prophet's strict naming criteria
        df_prophet = df_ha[["ref_date", "smoothed_utilization"]].rename(
            columns={"ref_date": "ds", "smoothed_utilization": "y"}
        )
        
        # Initialize Prophet with yearly seasonality enabled to catch the cyclical wave
        model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
        model.fit(df_prophet)
        
        # Generate a 6-month future date grid array 
        future_dates = model.make_future_dataframe(periods=6, freq="MS")
        
        # Extract only the newly created future dates
        future_only = future_dates.tail(6)
        
        # Execute prediction mapping
        forecast = model.predict(future_only)
        
        # Append the new prediction outputs back to match the original database schema
        for _, row in forecast.iterrows():
            # Format Timestamp cleanly back into YYYY-MM strings
            date_str = row["ds"].strftime("%Y-%m")
            
            # Bound the outputs logically between 45% and 100%
            pred_capped = min(max(row["yhat"], 45.0), 100.0)
            
            forecast_records.append({
                "ref_date": date_str,
                "health_authority": ha,
                "total_beds": df_ha["total_beds"].iloc[0],
                "patient_days": None,
                "total_discharges": None,
                "bed_utilization_rate": None,
                "avg_length_of_stay": None,
                "smoothed_utilization": pred_capped,
                "is_forecast": 1
            })
            
    # Mark historical rows
    df_raw["is_forecast"] = 0
    
    # Combine historical baselines with Prophet's seasonal models
    df_forecast = pd.DataFrame(forecast_records)
    df_final = pd.concat([df_raw, df_forecast], ignore_index=True)
    
    # 4. Save clean data state back to SQLite
    df_final.to_sql("clean_capacity_forecast", conn, if_exists="replace", index=False)
    conn.close()
    
    print(f"[SUCCESS] Prophet completed forecasting. Data committed to 'clean_capacity_forecast' table.")

if __name__ == "__main__":
    run_transformations_and_forecast()