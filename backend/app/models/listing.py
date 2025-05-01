from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, LargeBinary, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database import Base
import enum
from datetime import datetime
import uuid

class PropertyType(str, enum.Enum):
    APARTMENT = "Apartment"
    HOUSE = "House"
    CONDO = "Condo"
    TOWNHOUSE = "Townhouse"
    STUDIO = "Studio"
    LOFT = "Loft"
    DUPLEX = "Duplex"
    ROOM = "Room"

class Listing(Base):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    property_type = Column(String, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    available_from = Column(DateTime, nullable=False)
    available_to = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    host = Column(String, default="Active")
    amenities = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="images") 