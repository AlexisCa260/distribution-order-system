from core.database import Base
from sqlalchemy import Column, Integer, String


class WebImage(Base):
    __tablename__ = "web_images"

    id = Column(Integer, primary_key=True, index=True)

    # Sección a la que pertenece la imagen (home, banner, products, etc)
    section = Column(String(100), nullable=False, index=True)

    # URL o path local de la imagen
    image_url = Column(String(255), nullable=False)

    # Texto alternativo (SEO / accesibilidad)
    alt_text = Column(String(255), nullable=True)

    # Orden de aparición
    position = Column(Integer, default=0)

    # Activar / desactivar imagen
    is_active = Column(Integer, default=1)
