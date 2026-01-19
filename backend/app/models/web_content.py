from core.database import Base
from sqlalchemy import Column, Integer, String, Text


class WebContent(Base):
    __tablename__ = "web_contents"

    id = Column(Integer, primary_key=True, index=True)

    # Identifica la sección de la web (home, about, services, contact, footer, etc)
    section = Column(String(100), nullable=False, index=True)

    # Título visible en la página
    title = Column(String(255), nullable=True)

    # Contenido principal (texto largo)
    content = Column(Text, nullable=True)

    # URL o path de la imagen asociada
    image_url = Column(String(255), nullable=True)

    # Orden para controlar el layout en el frontend
    position = Column(Integer, default=0)

    # Estado para activar/desactivar contenido sin borrarlo
    is_active = Column(Integer, default=1)
