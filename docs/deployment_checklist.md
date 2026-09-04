# Production Deployment & Verification Checklist

This guide covers deployment procedures for hosting the HarvestIQ backend on Render/Railway and the frontend on Vercel.

---

## 1. Backend Deployment (Render / Railway Free Tier)

### Environment Variables
Configure the following in the hosting dashboard:
```env
APP_NAME=HarvestIQ
MODEL_VERSION=1.0.0
PARAMETER_VERSION=1.0.0
DATABASE_URL=sqlite:///./harvest_iq.db
API_TIMEOUT_SECONDS=5
```

### Build & Start Commands
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/health`

---

## 2. Frontend Deployment (Vercel)

### Environment Variables
```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

### Build Settings
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 3. Pre-Flight Verification Checklist

- [x] Backend responds to `GET /api/health` with `{"status": "healthy", "offline_ready": true}`.
- [x] SQLite database initializes tables automatically on startup (`init_db()`).
- [x] CORS middleware allows frontend origin.
- [x] Offline fallback triggers gracefully if external NASA POWER API times out.
- [x] All 20 automated unit and integration tests pass (`python backend/tests/run_tests.py`).
- [x] Bilingual static localization files (`en.json`, `ta.json`) load without runtime errors.
