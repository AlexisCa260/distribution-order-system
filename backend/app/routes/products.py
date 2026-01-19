from dependencies.db import get_db
from fastapi import APIRouter, Depends
from models.product import Product
from schemas.product import ProductOut
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=list[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == 1).all()
