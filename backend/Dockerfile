# ==============================================================================
# HarvestIQ Backend - Production Multi-Stage Dockerfile (FastAPI / Python 3.12)
# ==============================================================================

FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.12-slim AS runner

WORKDIR /app

# Create non-root user for security
RUN useradd -m -u 1001 harvestuser

# Copy installed wheels from builder
COPY --from=builder /root/.local /home/harvestuser/.local
COPY backend/app /app/app
COPY backend/data /app/data

ENV PATH=/home/harvestuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN chown -R harvestuser:harvestuser /app

USER harvestuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
