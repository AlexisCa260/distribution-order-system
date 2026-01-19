from pydantic import BaseModel


class WebContentOut(BaseModel):
    content_key: str
    content_value: str


class WebImageOut(BaseModel):
    image_key: str
    image_url: str


class WebSectionOut(BaseModel):
    section_key: str
    title: str | None
    content: list[WebContentOut]
    images: list[WebImageOut]
