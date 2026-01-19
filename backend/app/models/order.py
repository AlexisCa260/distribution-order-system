from core.database import Base
from sqlalchemy import Column, Float, Integer, String


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    total = Column(Float, nullable=False)
