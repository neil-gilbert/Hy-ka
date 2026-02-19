.PHONY: setup backend frontend test run-api run-frontend lint infra-up infra-down

setup:
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -U pip && pip install -e '.[dev]'
	cd frontend && NPM_CONFIG_CACHE=.npm-cache npm install

infra-up:
	podman machine init || true
	podman machine start
	cd infra && podman compose up -d

infra-down:
	cd infra && podman compose down

run-api:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

test:
	cd backend && . .venv/bin/activate && pytest

lint:
	cd backend && . .venv/bin/activate && ruff check app tests
