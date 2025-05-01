from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from ..models.listing import PropertyType

class ListingBase(BaseModel):
    title: str
    description: str
    price: float = Field(..., gt=0)
    address: str
    city: str
    state: str
    property_type: str
    bedrooms: int = Field(..., gt=0)
    bathrooms: float = Field(..., gt=0)
    available_from: str
    available_to: str

class ListingCreate(ListingBase):
    pass

class ListingUpdate(ListingBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    available_from: Optional[str] = None
    available_to: Optional[str] = None
    status: Optional[str] = None

class ListingInDB(ListingBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ListingResponse(ListingInDB):
    pass 