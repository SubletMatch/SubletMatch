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
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings

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
        # S3 Configuration
        S3_BUCKET = "sublet-match-images"  # Replace with your actual bucket name

        # Initialize S3 client
        region = os.getenv("AWS_DEFAULT_REGION")
        s3_client = boto3.client("s3", region_name=region) 
        for image in images:
            # Generate unique filename
            file_extension = image.filename.split('.')[-1].lower()
            if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
                raise HTTPException(status_code=400, detail="Invalid image format")
            
            # Generate unique filename
            filename = f"{uuid.uuid4()}.{file_extension}"
            
            # Upload to S3
            try:
                
                # Force correct MIME type using known extensions
                file_extension = image.filename.split('.')[-1].lower()
                if file_extension in ['jpg', 'jpeg']:
                    content_type = 'image/jpeg'
                elif file_extension == 'png':
                    content_type = 'image/png'
                elif file_extension == 'gif':
                    content_type = 'image/gif'
                else:
                    raise HTTPException(status_code=400, detail="Unsupported image type")

                # Upload to S3 with explicit Content-Type
                s3_client.upload_fileobj(
                    image.file,
                    S3_BUCKET,
                    filename,
                    ExtraArgs={
                        'ContentType': content_type,
                        'Metadata': {
                            'Cache-Control': 'public,max-age=31536000'
                        }
                    }
                )



                # Create ListingImage record
                image_url = f"https://{S3_BUCKET}.s3.{region}.amazonaws.com/{filename}"
                db_image = ListingImage(
                    listing_id=listing_id,
                    image_url=image_url
                )
                db.add(db_image)
                db.commit()
                db.refresh(db_image)
                uploaded_images.append(db_image)
                
            except NoCredentialsError:
                raise HTTPException(status_code=500, detail="AWS credentials not configured")
            except PartialCredentialsError:
                raise HTTPException(status_code=500, detail="Incomplete AWS credentials")
            except Exception as e:
                logger.error(f"Error uploading image to S3: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to upload image")
        
        return [ListingImageSchema.model_validate(img) for img in uploaded_images]
    except Exception as e:
        logger.error(f"Error uploading listing images: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

