# 🐳 Docker Setup Guide for NumiViz

This project is fully dockerized with both **Production** (Nginx + FastAPI) and **Development** (Vite HMR + FastAPI reload) configurations.

---

## 📋 Prerequisites
1. Install and launch **Docker Desktop** on Windows.
2. Ensure Docker Desktop engine is running (whale icon in the system tray).

---

## 🚀 Running in Production Mode (Recommended)

Builds the optimized frontend bundle and serves it with Nginx, proxying API requests to FastAPI:

```bash
docker compose up --build
```

To run in the background (detached mode):
```bash
docker compose up -d --build
```

### Accessing the Services
- **Frontend Web App:** [http://localhost:8080](http://localhost:8080)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Alternative Docs (ReDoc):** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🛠️ Running in Development Mode (Live Hot Reloading)

If you are modifying code and want immediate changes to reflect without rebuilding images:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 🛑 Stopping the Containers

```bash
# For production:
docker compose down

# For development:
docker compose -f docker-compose.dev.yml down
```

To stop and remove associated volumes (resets SQLite data):
```bash
docker compose down -v
```

---

## 📂 Architecture Overview

```
              ┌────────────────────────────────────────┐
              │           Docker Host / User           │
              └──────────────┬──────────────────┬──────┘
                             │                  │
                    Port 8080│                  │Port 8000
                             ▼                  ▼
              ┌──────────────────────┐   ┌──────────────────────┐
              │   numiviz-frontend   │   │   numiviz-backend    │
              │     (Nginx:1.25)     │   │    (Python 3.11)     │
              │                      │   │                      │
              │  Serves static React │   │   FastAPI + Uvicorn  │
              │  Proxies /api to     │──►│   Numerical Engine   │
              │  backend:8000        │   │   SQLite Database    │
              └──────────────────────┘   └──────────────────────┘
                         ▲                          ▲
                         └───────────┬──────────────┘
                                     │
                             numiviz-net (bridge)
```

---

## 🔍 Useful Docker Commands

- **View Logs:**
  ```bash
  docker compose logs -f
  docker compose logs -f backend
  docker compose logs -f frontend
  ```

- **Restart a single service:**
  ```bash
  docker compose restart backend
  ```

- **Open a shell inside the backend container:**
  ```bash
  docker compose exec backend bash
  ```
