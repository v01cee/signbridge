from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    description: str | None = None
    slug: str


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int

    model_config = {"from_attributes": True}
