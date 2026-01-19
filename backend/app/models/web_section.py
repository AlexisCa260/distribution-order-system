from core.database import Base
from sqlalchemy import Column, Integer, String


class WebSection(Base):
    __tablename__ = "web_sections"

    id = Column(Integer, primary_key=True, index=True)

    # Identificador lógico de la sección (home, about, products, etc)
    key = Column(String(50), unique=True, nullable=False, index=True)

    # Nombre visible en la web o panel admin
    name = Column(String(100), nullable=False)

    # Descripción interna (opcional)
    description = Column(String(255), nullable=True)

    # Orden de aparición en la web
    position = Column(Integer, default=0)

    # Activar / desactivar sección completa
    is_active = Column(Integer, default=1)
