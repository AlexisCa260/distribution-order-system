import os

from core.limiter import limiter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.ai_director.router import router as ai_director_router
from routes import admin_modules, auth, logistics_routes, orders
from routes.admin import users as admin_users
from routes.designer import store_sections, upload_admin
from routes.private import (
    admin_analytics,
    admin_brand,
    admin_categories,
    admin_dashboard,
    contact_admin,
    invoice,
    operator_dashboard,
    products_admin,
    site_config,
)
from routes.private import users as private_users
from routes.public import (
    analytics_track,
    brand_public,
    categories_public,
    contact,
    products_public,
    public_pages,
    sitemap,
    upload_public,
)
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# Docs solo en desarrollo
app = FastAPI(
    title="Distribution Order System API",
    version="1.0.0",
    description="Backend para sistema de pedidos de distribuidora",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
    openapi_url="/openapi.json" if ENVIRONMENT == "development" else None,
)

# Rate limiting — responde 429 cuando se excede el límite
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS — solo dominios autorizados
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://comercializadoramorenosantos.com,https://api.comercializadoramorenosantos.com",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rutas
app.include_router(orders.router, prefix="/api")
app.include_router(products_public.router, prefix="/api")
app.include_router(products_admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(admin_dashboard.router, prefix="/api")
app.include_router(invoice.router, prefix="/api")
app.include_router(operator_dashboard.router, prefix="/api")
app.include_router(admin_categories.router, prefix="/api")
app.include_router(categories_public.router, prefix="/api")
app.include_router(logistics_routes.router, prefix="/api")
app.include_router(store_sections.router)
app.include_router(public_pages.router)
app.include_router(admin_brand.router, prefix="/api")
app.include_router(brand_public.router, prefix="/api")
app.include_router(ai_director_router)
app.include_router(admin_modules.router)

app.include_router(admin_users.router, prefix="/api")
app.include_router(private_users.router, prefix="/api")

app.include_router(contact.router, prefix="/api")
app.include_router(contact_admin.router, prefix="/api")

app.include_router(upload_public.router)
app.include_router(upload_admin.router)
app.include_router(site_config.router, prefix="/api")
app.include_router(analytics_track.router)
app.include_router(admin_analytics.router, prefix="/api")
app.include_router(sitemap.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Distribution Order System API running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
