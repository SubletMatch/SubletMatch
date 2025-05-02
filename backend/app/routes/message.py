from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from uuid import UUID
from typing import List
from datetime import datetime
import logging
import json

from ..models.message import Message
from ..schemas.message import MessageOut, MessageCreate
from ..database import get_db

router = APIRouter(tags=["Messages"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=MessageOut)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """
    Create a new message
    """
    try:
        # Log the raw message data
        logger.info(f"Raw message data: {json.dumps(message.model_dump(), default=str)}")
        
        # Log each field separately
        logger.info(f"Content: {message.content}")
        logger.info(f"Sender ID: {message.sender_id} (type: {type(message.sender_id)})")
        logger.info(f"Receiver ID: {message.receiver_id} (type: {type(message.receiver_id)})")
        logger.info(f"Listing ID: {message.listing_id} (type: {type(message.listing_id)})")
        
        # Convert string IDs to UUIDs
        sender_id = UUID(message.sender_id)
        receiver_id = UUID(message.receiver_id)
        listing_id = UUID(message.listing_id)
        logger.info("Successfully converted all IDs to UUIDs")
        
        # Create the message
        db_message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            listing_id=listing_id,
            content=message.content
        )
        
        # Add to database
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        logger.info(f"Successfully created message with ID: {db_message.id}")
        return MessageOut.from_orm(db_message)
    except ValueError as e:
        logger.error(f"Invalid UUID format: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid UUID format"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating message"
        )

@router.get("/conversations/{user_id}", response_model=List[MessageOut])
def get_conversations(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get all conversations for a user, grouped by listing and other participant
    """
    # Get unique combinations of listing_id and other participant
    conversations = db.query(
        Message.listing_id,
        Message.sender_id,
        Message.receiver_id,
        Message.content,
        Message.timestamp
    ).filter(
        or_(
            Message.sender_id == user_id,
            Message.receiver_id == user_id
        )
    ).order_by(Message.timestamp.desc()).all()
    
    return conversations

@router.get("/conversation/{listing_id}/{user1_id}/{user2_id}", response_model=List[MessageOut])
def get_conversation(
    listing_id: UUID,
    user1_id: UUID,
    user2_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all messages in a specific conversation between two users about a listing
    """
    messages = db.query(Message).filter(
        and_(
            Message.listing_id == listing_id,
        or_(
            and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
                and_(Message.sender_id == user2_id, Message.receiver_id == user1_id)
            )
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
