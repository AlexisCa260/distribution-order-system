from dependencies.db import get_db
from fastapi import APIRouter, Depends
from models.order import Order
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("/")
def create_order(payload: dict, db: Session = Depends(get_db)):
    order = Order(
        customer_id=payload["customer_id"],
        order_date=payload["order_date"],
        delivery_date=payload["delivery_date"],
        subtotal=payload["subtotal"],
        total=payload["total"],
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"order_id": order.id}
