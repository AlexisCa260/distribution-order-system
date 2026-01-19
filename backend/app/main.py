from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, orders, products_admin, products_public, web

# ==================================================
# Crear tablas automáticamente
# ==================================================


# ==================================================
# App FastAPI
# ========================
# ==========================
app = FastAPI(
    title="Distribution Order System API",
    version="1.0.0",
    description="Backend para sistema de pedidos de distribuidora",
)

# ==================================================
# CORS (para React u otros frontends)
# ==================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción limita dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# Rutas
# ==================================================
app.include_router(orders.router, prefix="/api")
app.include_router(web.router, prefix="/api")
app.include_router(products_public.router, prefix="/api")
app.include_router(products_admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


# ==================================================
# Health check
# ==================================================
@app.get("/")
def root():
    return {"status": "ok", "message": "Distribution Order System API running"}


# ==================================================
# Run with: uvicorn app.main:app --reload
# ==================================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
# ==================================================
