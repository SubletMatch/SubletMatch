from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from uuid import UUID
from typing import List
from datetime import datetime, timezone
import logging
import json

from ..models.message import Message
from ..schemas.message import MessageOut, MessageCreate, ConversationOut
from ..database import get_db
from ..models.user import User
from ..models.listing import Listing

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
            content=message.content,
            timestamp=datetime.now(timezone.utc)
        )
        
        # Add to database
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        
        logger.info(f"Returning message with timestamp: {db_message.timestamp} (type: {type(db_message.timestamp)})")
        
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

@router.get("/conversations/{user_id}", response_model=List[ConversationOut])
def get_conversations(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get all conversations for a user, grouped by listing and other participant
    """
    try:
        logger.info(f"Fetching conversations for user {user_id}")
        
        # Get all messages for the user
        messages = db.query(Message).filter(
            or_(
                Message.sender_id == user_id,
                Message.receiver_id == user_id
            )
        ).order_by(Message.timestamp.desc()).all()
        
        logger.info(f"Found {len(messages)} messages")
        
        # Group messages by listing_id and other participant
        conversations = {}
        for msg in messages:
            # Always use the listing owner as the 'other participant'
            listing = db.query(Listing).filter(Listing.id == msg.listing_id).first()
            if not listing:
                continue
            listing_owner_id = str(listing.user_id)
            key = f"{msg.listing_id}_{listing_owner_id if str(user_id) != listing_owner_id else msg.sender_id if str(msg.sender_id) != str(user_id) else msg.receiver_id}"

            if key not in conversations:
                # Get the listing owner's information
                owner = db.query(User).filter(User.id == listing_owner_id).first()
                if not owner:
                    logger.warning(f"Could not find listing owner {listing_owner_id}")
                    continue
                # Get the current user's information
                current_user = db.query(User).filter(User.id == user_id).first()
                current_user_name = current_user.name if current_user else "Unknown User"
                # Get the listing title
                listing_title = listing.title
                # Participants: always [current user, listing owner] (other is always owner)
                participants = []
                if str(user_id) == listing_owner_id:
                    # Current user is the owner, so the other is the message sender or receiver
                    other_user_id = str(msg.receiver_id) if str(msg.sender_id) == str(user_id) else str(msg.sender_id)
                    other_user = db.query(User).filter(User.id == other_user_id).first()
                    if not other_user:
                        continue
                    participants = [
                        {"id": str(user_id), "username": current_user_name},
                        {"id": other_user_id, "username": other_user.name or other_user.email}
                    ]
                else:
                    # Current user is not the owner, so show owner as the other participant
                    participants = [
                        {"id": str(user_id), "username": current_user_name},
                        {"id": listing_owner_id, "username": owner.name or owner.email}
                    ]
                conversation_data = {
                    "id": key,
                    "listing_id": str(msg.listing_id),
                    "listing_title": listing_title,
                    "listing_owner_id": listing_owner_id,
                    "participants": participants,
                    "lastMessage": {
                        "id": str(msg.id),
                        "content": msg.content,
                        "sender_id": str(msg.sender_id),
                        "receiver_id": str(msg.receiver_id),
                        "listing_id": str(msg.listing_id),
                        "timestamp": msg.timestamp
                    },
                    "unreadCount": 0  # We'll implement this later
                }
                
                logger.info(f"Created conversation data: {json.dumps(conversation_data, default=str)}")
                conversations[key] = conversation_data
        
        # Convert to ConversationOut models using from_dict
        conversation_list = []
        for conv in conversations.values():
            try:
                conversation_list.append(ConversationOut.from_dict(conv))
            except Exception as e:
                logger.error(f"Error converting conversation: {str(e)}")
                logger.error(f"Conversation data: {json.dumps(conv, default=str)}")
                continue
        
        logger.info(f"Returning {len(conversation_list)} conversations")
        return conversation_list
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching conversations"
        )

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
    return [MessageOut.from_orm(msg) for msg in messages]

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
    return [MessageOut.from_orm(msg) for msg in messages]
