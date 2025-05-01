from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from enum import Enum
from ..models.listing import PropertyType

class PropertyType(str, Enum):
    APARTMENT = "Apartment"
    HOUSE = "House"
    CONDO = "Condo"
    TOWNHOUSE = "Townhouse"
    STUDIO = "Studio"
    LOFT = "Loft"
    DUPLEX = "Duplex"
    ROOM = "Room"

class ListingBase(BaseModel):
    title: str
    description: str
    price: float = Field(gt=0)
    address: str
    city: str
    state: str
    property_type: PropertyType
    bedrooms: int = Field(gt=0)
    bathrooms: float = Field(gt=0)
    available_from: datetime
    available_to: datetime
    host: Optional[str] = None
    amenities: Optional[str] = None

class ListingCreate(ListingBase):
    pass

class ListingImageBase(BaseModel):
    listing_id: UUID
    image_url: str

class ListingImageCreate(ListingImageBase):
    pass

class ListingImage(ListingImageBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class Listing(ListingBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    images: List[ListingImage] = []

    class Config:
        from_attributes = True

class ListingUpdate(ListingBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    host: Optional[str] = None
    amenities: Optional[str] = None

class ListingInDB(ListingBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ListingResponse(ListingInDB):
    images: List[ListingImage] = []
    user: dict 