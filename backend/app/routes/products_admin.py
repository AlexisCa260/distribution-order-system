from core.database import get_db
from fastapi import APIRouter, Depends
from models.product import Product
from schemas.product import ProductCreate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/admin/products", tags=["Products - Admin"])


@router.post("/")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.put("/{product_id}")
def update_product(
    product_id: int, product: ProductCreate, db: Session = Depends(get_db)
):
    db_product = db.query(Product).get(product_id)

    if not db_product:
        return {"error": "Producto no encontrado"}

    for key, value in product.dict().items():
        setattr(db_product, key, value)

    db.commit()
    return db_product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).get(product_id)

    if not db_product:
        return {"error": "Producto no encontrado"}

    db.delete(db_product)
    db.commit()
    return {"message": "Producto eliminado"}
