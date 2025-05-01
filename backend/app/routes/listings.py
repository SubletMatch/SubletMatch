from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging
from ..database import get_db
from ..models.listing import Listing
from ..models.user import User
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from ..core.security import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ListingResponse)
async def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Creating listing for user {current_user.id}")
        logger.info(f"Listing data: {listing.dict()}")

        # Convert string dates to datetime objects
        try:
            available_from = datetime.fromisoformat(listing.available_from.replace('Z', '+00:00'))
            available_to = datetime.fromisoformat(listing.available_to.replace('Z', '+00:00'))
        except ValueError as e:
            logger.error(f"Invalid date format: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format: {str(e)}"
            )

        # Create new listing
        db_listing = Listing(
            user_id=current_user.id,
            title=listing.title,
            description=listing.description,
            price=float(listing.price),  # Ensure price is float
            address=listing.address,
            city=listing.city,
            state=listing.state,
            property_type=listing.property_type,
            bedrooms=int(listing.bedrooms),  # Ensure bedrooms is int
            bathrooms=float(listing.bathrooms),  # Ensure bathrooms is float
            available_from=available_from,
            available_to=available_to,
            status="active"
        )

        db.add(db_listing)
        db.commit()
        db.refresh(db_listing)

        logger.info(f"Listing created successfully with ID: {db_listing.id}")
        return db_listing

    except Exception as e:
        logger.error(f"Error creating listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[ListingResponse])
async def get_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: str,
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    return listing

@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    if db_listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    update_data = listing_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_listing, field, value)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    if db_listing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    db.delete(db_listing)
    db.commit()
    return {"message": "Listing deleted successfully"} 