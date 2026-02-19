# ModelEval

ModelEval is a Phase-1 engineering model evaluation platform with:
- FastAPI backend + Postgres
- Synchronous evaluation pipeline (planner -> executor -> scorer -> aggregator)
- Multi-provider adapters (OpenAI, Anthropic, Mock)
- CLI for experiment/run operations
- React dashboard for experiment and run comparisons

## Project Layout

- `/backend` FastAPI API, DB models, pipeline, providers
- `/frontend` React dashboard
- `/cli` Thin HTTP client examples
- `/datasets` Static JSONL benchmark workloads
- `/infra` Local infrastructure (Postgres)
- `/docs` Product and architecture docs

## Quickstart

1. Start Postgres (Podman)

```bash
cd infra
podman machine init   # one-time, if needed
podman machine start
podman compose up -d
```

If you use Docker instead of Podman, run `docker compose up -d`.

2. Backend setup and migrate

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

3. Frontend

```bash
cd frontend
NPM_CONFIG_CACHE=.npm-cache npm install
npm run dev
```

4. CLI examples

```bash
cd backend
source .venv/bin/activate
python ../cli/main.py experiments list
```
