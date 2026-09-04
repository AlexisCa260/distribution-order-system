from datetime import date, datetime
from typing import Optional

from core.database import get_db
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from models.category import Category
from models.product import Product
from models.brand import Brand
from sqlalchemy.orm import Session

router = APIRouter(tags=["SEO"])

BASE_URL = "https://comercializadoramorenosantos.com"

# Recetas estáticas (slugs del archivo recipes.js del frontend)
RECIPE_SLUGS = [
    "sancocho-de-pollo-antioqueno",
    "salchipapas-colombianas",
    "pollo-apanado-con-hogao",
    "ajiaco-bogotano-tradicional",
    "bandeja-paisa-simplificada",
    "papas-chorreadas-colombianas",
    "perro-caliente-estilo-colombiano",
    "cazuela-de-mariscos-colombiana",
]

# Ciudades con página propia en /distribuidor/:ciudad
CIUDADES = [
    "medellin", "bello", "itagui", "envigado",
    "sabaneta", "la-estrella", "caldas",
    "copacabana", "girardota",
]

# Páginas estáticas con su prioridad y frecuencia de cambio
STATIC_PAGES = [
    ("/home",        "1.0", "weekly"),
    ("/products",    "0.9", "daily"),
    ("/about",       "0.7", "monthly"),
    ("/contact",     "0.7", "monthly"),
    ("/recetas",     "0.8", "weekly"),
    ("/track-order", "0.4", "monthly"),
    ("/privacy",     "0.3", "yearly"),
]


def _url(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        f"  <url>\n"
        f"    <loc>{BASE_URL}{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        f"  </url>"
    )


@router.get("/sitemap.xml", response_class=Response)
def dynamic_sitemap(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    entries: list[str] = []

    # ── Páginas estáticas ─────────────────────────────────────────────────
    for loc, priority, freq in STATIC_PAGES:
        entries.append(_url(loc, today, freq, priority))

    # ── Productos activos → /productos/{id} ───────────────────────────────
    products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.id)
        .all()
    )
    for p in products:
        lastmod = (
            p.updated_at.date().isoformat()
            if p.updated_at
            else p.created_at.date().isoformat()
            if p.created_at
            else today
        )
        entries.append(_url(f"/productos/{p.id}", lastmod, "weekly", "0.8"))

    # ── Categorías activas → /products/categoria/{id} ────────────────────
    categories = (
        db.query(Category)
        .filter(Category.is_active == 1)
        .order_by(Category.id)
        .all()
    )
    for c in categories:
        lastmod = (
            c.updated_at.date().isoformat()
            if c.updated_at
            else today
        )
        entries.append(_url(f"/products/categoria/{c.id}", lastmod, "weekly", "0.75"))

    # ── Recetas estáticas → /recetas/{slug} ───────────────────────────────
    for slug in RECIPE_SLUGS:
        entries.append(_url(f"/recetas/{slug}", today, "monthly", "0.7"))

    # ── Páginas por ciudad → /distribuidor/{ciudad} ───────────────────────
    for ciudad in CIUDADES:
        entries.append(_url(f"/distribuidor/{ciudad}", today, "monthly", "0.85"))

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>"
    )

    return Response(
        content=xml,
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=3600"},
    )
