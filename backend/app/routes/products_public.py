from core.database import get_db
from fastapi import APIRouter, Depends
from models.product import Product
from sqlalchemy.orm import Session

router = APIRouter(prefix="/products", tags=["Products - Public"])


@router.get("/")
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.stock > 0).all()
