from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from uuid import UUID
from typing import List

from ..models.message import Message
from ..schemas.message import MessageOut, MessageCreate
from ..database import get_db

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/", response_model=List[MessageOut])
def get_messages(user1_id: UUID, user2_id: UUID, db: Session = Depends(get_db)):
    """
    Fetch all messages exchanged between user1 and user2, ordered by timestamp.
    """
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
            and_(Message.sender_id == user2_id, Message.receiver_id == user1_id),
        )
    ).order_by(Message.timestamp).all()
    return messages

@router.get("/user/{user_id}", response_model=List[MessageOut])
def get_all_messages_for_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Fetch all messages sent or received by a user.
    """
    messages = db.query(Message).filter(
        or_(
            Message.sender_id == user_id,
            Message.receiver_id == user_id
        )
    ).order_by(Message.timestamp.desc()).all()
    return messages

@router.post("/", response_model=MessageOut)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """
    Create and store a new message.
    """
    new_message = Message(**message.dict())
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
