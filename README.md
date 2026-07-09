# BC Healthcare Resource Engine

A lightweight Python dashboard for exploring and forecasting acute care bed utilization across British Columbia’s health authorities.

## Purpose

This project combines a small data pipeline with an interactive dashboard to visualize historical capacity trends and short-term utilization forecasts. It is designed to help users understand how bed utilization evolves over time and to surface potential pressure points for planning and resource allocation.

## Stack

- Python 3
- Streamlit for the interactive web dashboard
- pandas and NumPy for data processing
- Plotly for charts and visualizations
- Prophet for time-series forecasting
- SQLite for local data storage

## How it works

1. The pipeline extracts synthetic monthly healthcare metrics for each regional health authority.
2. The transformation step creates utilization metrics, applies smoothing, and generates a 6-month forecast.
3. The Streamlit app loads the resulting SQLite dataset and displays KPIs, trend charts, and the underlying data table.

## Project structure

- app.py: main Streamlit dashboard
- pipeline/extractor.py: generates synthetic raw healthcare data
- pipeline/transformer.py: transforms the data and creates forecasts
- data/: local SQLite database and supporting data files

## Getting started

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Generate the local data

```bash
python pipeline/extractor.py
python pipeline/transformer.py
```

### 3. Launch the dashboard

```bash
streamlit run app.py
```

You can also run the app directly with:

```bash
python app.py
```

## What you will see

- A regional health authority selector in the sidebar
- Current utilization metrics and alert-style status indicators
- A time-series chart showing historical trends and forecast values
- A data table with the underlying transformed results
