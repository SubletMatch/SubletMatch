from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
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

    model_config = ConfigDict(
        from_attributes=True,
        ser_json_tz="utc"
    )

    @classmethod
    def from_orm(cls, obj):
        # Ensure timestamp is always timezone-aware and in UTC
        ts = obj.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        else:
            ts = ts.astimezone(timezone.utc)
        return cls(
            id=str(obj.id),
            content=obj.content,
            sender_id=str(obj.sender_id),
            receiver_id=str(obj.receiver_id),
            listing_id=str(obj.listing_id),
            timestamp=ts,
        )

class Participant(BaseModel):
    id: str
    username: str

class ConversationOut(BaseModel):
    id: str
    listing_id: str
    listing_title: Optional[str] = None
    listing_owner_id: Optional[str] = None
    participants: List[Participant]
    lastMessage: MessageOut
    unreadCount: int = 0

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_dict(cls, data: dict):
        try:
            # Ensure all required fields are present
            if not all(key in data for key in ["id", "listing_id", "participants", "lastMessage", "unreadCount"]):
                raise ValueError("Missing required fields in conversation data")
            
            # Convert the lastMessage to MessageOut
            last_message_data = data["lastMessage"]
            last_message = MessageOut(
                id=str(last_message_data["id"]),
                content=last_message_data["content"],
                sender_id=str(last_message_data["sender_id"]),
                receiver_id=str(last_message_data["receiver_id"]),
                listing_id=str(last_message_data["listing_id"]),
                timestamp=last_message_data["timestamp"]
            )
            
            # Create and return the conversation
            return cls(
                id=str(data["id"]),
                listing_id=str(data["listing_id"]),
                listing_title=data.get("listing_title"),
                listing_owner_id=data.get("listing_owner_id"),
                participants=[
                    Participant(id=str(p["id"]), username=p["username"])
                    for p in data["participants"]
                ],
                lastMessage=last_message,
                unreadCount=data["unreadCount"]
            )
        except Exception as e:
            raise ValueError(f"Error creating ConversationOut from dict: {str(e)}")
