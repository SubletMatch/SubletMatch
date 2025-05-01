from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    sender_id: UUID
    receiver_id: UUID
    content: str = Field(min_length=1)

class MessageOut(MessageCreate):
    id: UUID  # Changed to UUID for consistency
    timestamp: datetime

    class Config:
        orm_mode = True
