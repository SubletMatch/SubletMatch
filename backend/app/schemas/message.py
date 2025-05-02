from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)
    sender_id: str = Field(..., description="UUID of the sender")
    receiver_id: str = Field(..., description="UUID of the receiver")
    listing_id: str = Field(..., description="UUID of the listing")

class MessageCreate(MessageBase):
    timestamp: Optional[datetime] = None  # This will be set by the database

class MessageOut(MessageBase):
    id: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, obj):
        # Convert UUID to string
        return cls(
            id=str(obj.id),
            content=obj.content,
            sender_id=str(obj.sender_id),
            receiver_id=str(obj.receiver_id),
            listing_id=str(obj.listing_id),
            timestamp=obj.timestamp
        )
