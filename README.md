# BC Healthcare Resource Engine

__See it working here:__ [BC Healthcare Data Dashboard](https://bc-healthcare-data-dashboard.onrender.com/)

A lightweight analytics demo for exploring acute care bed utilization across British Columbia’s health authorities. The project combines a synthetic data pipeline, a FastAPI backend, and a React/Vite dashboard to show historical trends and short-term forecasts.

## What this app does

The app models regional capacity pressure by generating synthetic monthly healthcare metrics across four key indicators: Bed Utilization, ER Wait Times, Daily Admissions, and Staffing Ratios (Patients per Nurse). It transforms these into key performance indicators, forecasts the next six months with Prophet across all metrics, and presents the results through an interactive, multi-metric dashboard.

## Current architecture

The repository now follows a three-layer architecture:

- Data pipeline: Python scripts in [pipeline](pipeline) generate synthetic raw data and produce cleaned, forecasted output in SQLite.
- API layer: FastAPI in [api/main.py](api/main.py) serves dashboard data through endpoints such as /api/regions, /api/kpis, /api/metrics, and /api/regions/{region_id}/series.
- Frontend: React + Vite in [frontend](frontend) renders the overview and region drill-down pages.

## How it works

1. The extractor in [pipeline/extractor.py](pipeline/extractor.py) creates synthetic monthly health metrics for each health authority.
2. The transformer in [pipeline/transformer.py](pipeline/transformer.py) calculates bed utilization, applies a 3-month moving average across all four metrics, and dynamically runs Prophet forecasts for six future months.
3. The processed data is written to SQLite in [data](data), with tables for raw metrics and the cleaned forecasted dataset.
4. The FastAPI service reads the SQLite database and exposes structured JSON endpoints for the frontend.
5. The frontend requests those endpoints and renders KPI cards, a regional map, charts, and a detail table.

## Project structure

- [api/main.py](api/main.py): FastAPI backend
- [pipeline/extractor.py](pipeline/extractor.py): synthetic data generation
- [pipeline/transformer.py](pipeline/transformer.py): smoothing and forecasting
- [frontend](frontend): React/Vite dashboard
- [data](data): SQLite database and generated data files

## Tech stack

- Python 3
- FastAPI + Uvicorn for the backend API
- React + Vite + TypeScript for the frontend
- Recharts for interactive UI graphs
- pandas, NumPy, and scikit-learn for data preparation
- Prophet for time-series forecasting
- SQLite for local storage

## Getting started

The app runs entirely with Docker — [Docker](https://docs.docker.com/get-docker/) with Compose v2 is the only prerequisite.

### 1. (Optional) Generate the dataset

A prebuilt SQLite database is committed at [data/bc_healthcare.db](data/bc_healthcare.db), so you can skip this step. To regenerate it from scratch, run the one-shot pipeline service:

```bash
docker compose run --rm pipeline
```

This runs the extractor and transformer inside a container and writes the SQLite database to [data/bc_healthcare.db](data/bc_healthcare.db) via a bind mount. The `pipeline` directory is also bind-mounted, so you can freely tweak the math in the generation scripts without needing to rebuild the Docker image!

### 2. Start the app

```bash
docker compose up
```

This builds and starts the FastAPI backend on http://localhost:8000 and the Vite dev server on http://localhost:5173, with the frontend's `/api` proxy routed to the backend container. The `frontend`, `api`, and `data` directories are bind-mounted, so edits and dataset changes are picked up without rebuilding.

Then open http://localhost:5173. Stop everything with `docker compose down`.

## Notes

- The dataset is synthetic and intended for demonstration and testing rather than production decision-making.
- The current UI exposes historical tracking and 6-month AI forecasting for all four tracked metrics: Bed Utilization, ER Wait Times, Daily Admissions, and Patients per Nurse.
