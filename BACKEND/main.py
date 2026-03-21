#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SAMILA WMS 3PL - FastAPI Backend Application
================================================================================
Application: SAMILA Warehouse Management System 3PL
Client: Nayong Hospital, Trang Province, Thailand
Version: 1.0.0
================================================================================
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from datetime import datetime

# Import database and models
from wms_database_schema import Base, engine

# Import routes/routers
from tarif_billing_api import router as tarif_router
from routers import auth, users, warehouses, customers, products
from routers import inventory, receiving, orders, picking, putaway, packing, shipping, cs, reports

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="SAMILA WMS 3PL API",
    description="Professional Warehouse Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ── CORS — restrict to known origins ────────────────────────────────────────
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:80,http://localhost,http://127.0.0.1:3000,http://127.0.0.1,https://samila-wms.onrender.com"
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)

# ── Trusted hosts ────────────────────────────────────────────────────────────
_raw_hosts = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,samila-wms-backend.onrender.com,*.onrender.com")
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip()]

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)

# ── Security response headers middleware ─────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as exc:
        # Catch unhandled exceptions so they don't bypass CORS middleware
        logger.error(f"Unhandled exception in middleware: {exc}")
        response = JSONResponse(
            status_code=500,
            content={"detail": "เกิดข้อผิดพลาดภายในระบบ"}
        )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"]        = "DENY"
    response.headers["X-XSS-Protection"]       = "1; mode=block"
    response.headers["Referrer-Policy"]        = "strict-origin-when-cross-origin"
    return response

# Create database tables
Base.metadata.create_all(bind=engine)

# ── Migrate: add new columns to warehouses if not yet present ──────────────
def _migrate_warehouses():
    try:
        from sqlalchemy import text
        from database import SessionLocal
        db = SessionLocal()
        cols_to_add = [
            ("used_sqm",    "FLOAT DEFAULT 0"),
            ("zones",       "INTEGER DEFAULT 0"),
            ("staff",       "INTEGER DEFAULT 0"),
            ("wh_type",     "VARCHAR(100) DEFAULT 'General'"),
            ("icon",        "VARCHAR(10) DEFAULT '🏭'"),
            ("company_no",  "VARCHAR(50) DEFAULT 'COMP-001'"),
        ]
        for col, col_def in cols_to_add:
            try:
                db.execute(text(f"ALTER TABLE warehouses ADD COLUMN {col} {col_def}"))
                db.commit()
            except Exception:
                db.rollback()   # column already exists — ignore
        db.close()
    except Exception as e:
        logging.warning(f"Warehouse migration skipped: {e}")

_migrate_warehouses()

# ── Migrate: add company_no to customers ──────────────────────────────────
def _migrate_customers():
    try:
        from sqlalchemy import text
        from database import SessionLocal
        db = SessionLocal()
        try:
            db.execute(text("ALTER TABLE customers ADD COLUMN company_no VARCHAR(50)"))
            db.commit()
        except Exception:
            db.rollback()
        db.close()
    except Exception as e:
        logging.warning(f"Customer migration skipped: {e}")

_migrate_customers()

# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "SAMILA WMS 3PL API",
        "version": "1.0.0"
    }

# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/", tags=["Info"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": "SAMILA WMS 3PL",
        "version": "1.0.0",
        "description": "Professional Warehouse Management System API",
        "client": "Nayong Hospital, Trang Province, Thailand",
        "docs_url": "http://localhost:8000/docs",
        "redoc_url": "http://localhost:8000/redoc",
        "health_url": "http://localhost:8000/health"
    }

@app.get("/api/info", tags=["Info"])
async def api_info():
    """API information endpoint"""
    return {
        "name": "SAMILA WMS 3PL",
        "version": "1.0.0",
        "tagline": "Professional 3PL Warehouse Management System",
        "organization": {
            "name": "Samila WMS 3PL",
            "contact": "support@samila-wms.com"
        },
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# API Modules (to be included)
# ============================================================================

# Include routers
app.include_router(tarif_router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(warehouses.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(receiving.router)
app.include_router(orders.router)
app.include_router(picking.router)
app.include_router(putaway.router)
app.include_router(packing.router)
app.include_router(shipping.router)
app.include_router(cs.router)
app.include_router(reports.router)

# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc)
        }
    )

# ============================================================================
# Startup and Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Startup event handler — auto-seed initial data + ensure superadmin exists"""
    logger.info("🚀 SAMILA WMS 3PL API is starting...")
    try:
        from seed import seed
        seed()
        logger.info("✅ Database seeded")
    except Exception as e:
        logger.warning(f"Seed skipped: {e}")
    # Ensure superadmin always exists with correct password
    try:
        from database import SessionLocal
        from auth import User, hash_password
        import os
        db = SessionLocal()
        sa = db.query(User).filter(User.username == "superadmin").first()
        sa_pass = os.getenv("REACT_APP_SA_PASS", "Super@2026")
        if not sa:
            from wms_database_schema import Base
            sa = User(
                username="superadmin",
                name="Samila Super Admin",
                email="superadmin@samila.th",
                hashed_password=hash_password(sa_pass),
                role="superadmin",
                warehouses=["All"],
                menus={k: True for k in ["dashboard","receiving","inventory","product",
                       "picking","putaway","packing","shipping","tarif","customer",
                       "reports","kpi","mobile","users","warehouse-setting","user-limit","settings"]},
                status="active",
            )
            db.add(sa)
            db.commit()
            logger.info("✅ Superadmin created")
        else:
            # Always sync password + status on every startup
            sa.hashed_password = hash_password(sa_pass)
            sa.status = "active"
            db.commit()
            logger.info("✅ Superadmin password synced")
        db.close()
    except Exception as e:
        logger.warning(f"Superadmin ensure skipped: {e}")
    logger.info("✅ All services initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("🛑 SAMILA WMS 3PL API is shutting down...")

# ============================================================================
# Run Application
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
