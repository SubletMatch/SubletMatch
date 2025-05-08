from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from ..schemas.listing import ListingImage as ListingImageSchema
import shutil
import uuid
import logging
import mimetypes
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from ..core.database import get_db
from ..models.listing import Listing, ListingImage
from ..models.user import User
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse, Listing as ListingSchema, ListingImage as ListingImageSchema
from ..core.security import get_current_user
from ..auth.utils import get_current_user as auth_get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_DEFAULT_REGION')
)

# S3 bucket name
S3_BUCKET = "sublet-match-images"

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
                "amenities": listing.amenities,
                "images": [{
                    "id": image.id,
                    "listing_id": image.listing_id,
                    "created_at": image.created_at,
                    "image_url": f"{image.image_url}"
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
            "amenities": listing.amenities,
            "images": [{
                "id": image.id,
                "listing_id": image.listing_id,
                "created_at": image.created_at,
                "image_url": image.image_url
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

    # Get the listing images
    images = db.query(ListingImage).filter(ListingImage.listing_id == listing_id).all()
    
    # Get the user data
    user = db.query(User).filter(User.id == db_listing.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert to response model with full image URLs
    response_data = {
        "id": db_listing.id,
        "title": db_listing.title,
        "description": db_listing.description,
        "price": db_listing.price,
        "address": db_listing.address,
        "city": db_listing.city,
        "state": db_listing.state,
        "property_type": db_listing.property_type,
        "bedrooms": db_listing.bedrooms,
        "bathrooms": db_listing.bathrooms,
        "available_from": db_listing.available_from,
        "available_to": db_listing.available_to,
        "user_id": db_listing.user_id,
        "created_at": db_listing.created_at,
        "host": db_listing.host,
        "amenities": db_listing.amenities,
        "images": [{
            "id": image.id,
            "listing_id": image.listing_id,
            "created_at": image.created_at,
            "image_url": image.image_url
        } for image in images],
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email
        }
    }
    return ListingResponse(**response_data)

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
        try:
            # Extract filename from S3 URL
            image_path = image.image_url.split('/')[-1]
            s3_client.delete_object(Bucket=S3_BUCKET, Key=image_path)
        except Exception as e:
            logger.error(f"Error deleting S3 object: {str(e)}")
        db.delete(image)
    
    db.delete(db_listing)
    db.commit()
    return {"message": "Listing deleted successfully"}

@router.post("/{listing_id}/images", response_model=List[ListingImageSchema])
async def upload_images(
    listing_id: str,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bucket_name = "sublet-match-images"
    s3 = boto3.client("s3")

    try:
        # Verify listing ownership
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to upload images for this listing")

        # Process each uploaded image
        for image in images:
            extension = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{extension}"

            try:
                s3.upload_fileobj(
                    image.file,
                    bucket_name,
                    unique_filename,
                    ExtraArgs={"ContentType": image.content_type}
                )

                image_url = f"https://{bucket_name}.s3.amazonaws.com/{unique_filename}"

                db_image = ListingImage(
                    listing_id=listing_id,
                    image_url=image_url
                )
                db.add(db_image)

            except Exception as e:
                logger.error(f"Error uploading {image.filename}: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload image {image.filename}: {str(e)}"
                )

        db.commit()

        return db.query(ListingImage).filter(ListingImage.listing_id == listing_id).all()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error uploading images: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while uploading images.")

@router.delete("/{listing_id}/images/{image_id}")
async def delete_listing_image(
    listing_id: str,
    image_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify listing ownership
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        if listing.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete images for this listing")

        # Find the image by its ID
        image = db.query(ListingImage).filter(
            ListingImage.id == image_id,
            ListingImage.listing_id == listing_id
        ).first()
        
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete from S3
        try:
            # Extract filename from S3 URL
            image_path = image.image_url.split('/')[-1]
            logger.info(f"Attempting to delete S3 object: {image_path}")
            s3_client.delete_object(Bucket=S3_BUCKET, Key=image_path)
            logger.info(f"Successfully deleted S3 object: {image_path}")
        except Exception as e:
            logger.error(f"Error deleting S3 object: {str(e)}")
            # Continue with database deletion even if S3 deletion fails
            logger.warning("Continuing with database deletion despite S3 error")

        # Delete from database
        db.delete(image)
        db.commit()

        return {"message": "Image deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting image: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="An unexpected error occurred while deleting the image")
