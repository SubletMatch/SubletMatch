from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from ..database import Base
import enum

class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    CONDO = "condo"
    STUDIO = "studio"
    ROOM = "room"

class Listing(Base):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    address = Column(String, nullable=False)
    property_type = Column(Enum(PropertyType), nullable=False)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    available_from = Column(DateTime, nullable=False)
    available_to = Column(DateTime, nullable=False)
    status = Column(String, default="draft")  # draft or active
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 