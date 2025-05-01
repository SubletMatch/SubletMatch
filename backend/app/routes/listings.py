from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging
import os
import shutil
from ..database import get_db
from ..models.listing import Listing, ListingImage
from ..models.user import User
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse, Listing as ListingSchema, ListingImage as ListingImageSchema
from ..core.security import get_current_user
from ..auth.utils import get_current_user as auth_get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads/listings"

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/my", response_model=List[ListingSchema])
async def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        listings = db.query(Listing).filter(Listing.user_id == current_user.id).all()
        return listings
    except Exception as e:
        logger.error(f"Error fetching user listings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create", response_model=ListingSchema)
async def create_listing(
    request: Request,
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Log the raw request body
        body = await request.body()
        logger.info(f"Raw request body: {body.decode()}")
        
        # Log the parsed listing data
        logger.info(f"Parsed listing data: {listing.model_dump()}")
        
        db_listing = Listing(
            **listing.model_dump(),
            user_id=current_user.id
        )
        db.add(db_listing)
        db.commit()
        db.refresh(db_listing)
        return db_listing
    except Exception as e:
        logger.error(f"Error creating listing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ListingResponse])
async def get_listings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    try:
        # Get all listings with their images and user data
        listings = db.query(Listing).offset(skip).limit(limit).all()
        
        # Convert to response model with full image URLs
        response_listings = []
        for listing in listings:
            # Get the listing images
            images = db.query(ListingImage).filter(ListingImage.listing_id == listing.id).all()
            
            # Get the user data
            user = db.query(User).filter(User.id == listing.user_id).first()
            if not user:
                continue  # Skip listings without a valid user
            
            # Convert to response model
            response_data = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "price": listing.price,
                "address": listing.address,
                "city": listing.city,
                "state": listing.state,
                "property_type": listing.property_type,
                "bedrooms": listing.bedrooms,
                "bathrooms": listing.bathrooms,
                "available_from": listing.available_from,
                "available_to": listing.available_to,
                "user_id": listing.user_id,
                "created_at": listing.created_at,
                "host": listing.host,
                "images": [{
                    "id": image.id,
                    "listing_id": image.listing_id,
                    "created_at": image.created_at,
                    "image_url": f"/uploads/{image.image_url}"
                } for image in images],
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                }
            }
            response_listings.append(ListingResponse(**response_data))
        
        return response_listings
    except Exception as e:
        logger.error(f"Error fetching listings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: str,
    db: Session = Depends(get_db)
):
    try:
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Get the listing images
        images = db.query(ListingImage).filter(ListingImage.listing_id == listing_id).all()
        
        # Get the user data
        user = db.query(User).filter(User.id == listing.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Convert to response model with full image URLs
        response_data = {
            "id": listing.id,
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "address": listing.address,
            "city": listing.city,
            "state": listing.state,
            "property_type": listing.property_type,
            "bedrooms": listing.bedrooms,
            "bathrooms": listing.bathrooms,
            "available_from": listing.available_from,
            "available_to": listing.available_to,
            "user_id": listing.user_id,
            "created_at": listing.created_at,
            "host": listing.host,
            "images": [{
                "id": image.id,
                "listing_id": image.listing_id,
                "created_at": image.created_at,
                "image_url": f"/uploads/{image.image_url}"
            } for image in images],
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }
        return ListingResponse(**response_data)
    except Exception as e:
        logger.error(f"Error fetching listing: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

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
    
    # Delete associated images
    images = db.query(ListingImage).filter(ListingImage.listing_id == listing_id).all()
    for image in images:
        # Delete the image file
        if os.path.exists(image.image_url):
            os.remove(image.image_url)
        db.delete(image)
    
    db.delete(db_listing)
    db.commit()
    return {"message": "Listing deleted successfully"}

@router.post("/{listing_id}/images", response_model=List[ListingImageSchema])
async def upload_listing_images(
    listing_id: str,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify listing exists and belongs to user
        listing = db.query(Listing).filter(
            Listing.id == listing_id,
            Listing.user_id == current_user.id
        ).first()
        
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        uploaded_images = []
        for image in images:
            # Generate unique filename
            filename = f"{uuid.uuid4()}_{image.filename}"
            relative_path = f"listings/{filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Save the file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            # Create database record with relative path
            db_image = ListingImage(
                image_url=relative_path,
                listing_id=listing_id
            )
            db.add(db_image)
            uploaded_images.append(db_image)

        db.commit()
        for image in uploaded_images:
            db.refresh(image)

        # Convert to response with full URLs
        response_images = []
        for image in uploaded_images:
            response_images.append({
                "id": image.id,
                "listing_id": image.listing_id,
                "created_at": image.created_at,
                "image_url": f"/uploads/{image.image_url}"
            })

        return response_images
    except Exception as e:
        logger.error(f"Error uploading images: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e)) 