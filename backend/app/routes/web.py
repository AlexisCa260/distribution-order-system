from dependencies.db import get_db
from fastapi import APIRouter, Depends
from models.web_content import WebContent
from models.web_image import WebImage
from models.web_section import WebSection
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/web", tags=["Web"])


@router.get("/sections/{section_key}")
def get_section(section_key: str, db: Session = Depends(get_db)):
    section = db.query(WebSection).filter_by(section_key=section_key).first()
    if not section:
        return {}

    content = db.query(WebContent).filter_by(section_id=section.id).all()
    images = db.query(WebImage).filter_by(section_id=section.id).all()

    return {
        "section_key": section.section_key,
        "title": section.title,
        "content": content,
        "images": images,
    }
