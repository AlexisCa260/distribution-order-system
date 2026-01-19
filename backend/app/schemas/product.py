from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==========================
# BASE
# ==========================
class ProductBase(BaseModel):
    name: str = Field(..., example="Arroz Diana 1kg")
    description: Optional[str] = Field(None, example="Arroz blanco premium")
    price: float = Field(..., example=4500)
    stock: int = Field(..., example=100)
    image_url: Optional[str] = Field(None, example="https://site.com/arroz.png")


# ==========================
# CREATE (ADMIN)
# ==========================
class ProductCreate(ProductBase):
    pass


# ==========================
# UPDATE (ADMIN)
# ==========================
class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    stock: Optional[int]
    image_url: Optional[str]
    is_active: Optional[bool]


# ==========================
# RESPONSE (PÚBLICO / ADMIN)
# ==========================
class ProductResponse(ProductBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
