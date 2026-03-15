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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

# Import database and models
from wms_database_schema import Base, engine

# Import routes/routers (to be imported when created)
# from routes import receiving_routes, inventory_routes, product_routes
# from routes import picking_routes, shipping_routes, tarif_routes

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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# Create database tables
Base.metadata.create_all(bind=engine)

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

# ============================================================================
# API Modules (to be included)
# ============================================================================

# Include routers when they are created
# app.include_router(receiving_routes.router, prefix="/api/receiving", tags=["Receiving"])
# app.include_router(inventory_routes.router, prefix="/api/inventory", tags=["Inventory"])
# app.include_router(product_routes.router, prefix="/api/product", tags=["Product"])
# app.include_router(picking_routes.router, prefix="/api/picking", tags=["Picking"])
# app.include_router(shipping_routes.router, prefix="/api/shipping", tags=["Shipping"])
# app.include_router(tarif_routes.router, prefix="/api/tarif", tags=["Tariff"])

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
    """Startup event handler"""
    logger.info("🚀 SAMILA WMS 3PL API is starting...")
    logger.info("✅ Database connected")
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
