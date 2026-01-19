from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    # Información básica
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    # Precio y stock
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)

    # Imagen
    image_url = Column(String(255), nullable=True)

    # Control
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
