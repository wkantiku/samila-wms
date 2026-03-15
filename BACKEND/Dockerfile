# ── BB WMS Backend Dockerfile ─────────────────────
FROM python:3.11-slim

LABEL maintainer="BB Innovation"
LABEL description="BB WMS FastAPI Backend"
LABEL version="1.0.0"

# Security: รันด้วย non-root user
RUN groupadd -r bbwms && useradd -r -g bbwms bbwms

WORKDIR /app

# ติดตั้ง system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ติดตั้ง Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# เปลี่ยน ownership ให้ non-root user
RUN chown -R bbwms:bbwms /app
USER bbwms

# แก้ TrustedHostMiddleware ให้รองรับ external
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["/bin/sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
