from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from ..core.database import get_db
from ..models.saved_listings import SavedListing  # you'll create this model soon
from ..models.listing import Listing

router = APIRouter()

@router.post("/saved-listings/")
def save_listing(user_id: UUID, listing_id: UUID, db: Session = Depends(get_db)):
    existing = (
        db.query(SavedListing)
        .filter_by(user_id=user_id, listing_id=listing_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Listing already saved")

    new_save = SavedListing(user_id=user_id, listing_id=listing_id)
    db.add(new_save)
    db.commit()

    return {"status": "saved"}

from sqlalchemy.orm import selectinload

@router.get("/saved-listings/")
def get_saved_listings(user_id: UUID, db: Session = Depends(get_db)):
    saved = (
        db.query(Listing)
        .join(SavedListing, SavedListing.listing_id == Listing.id)
        .filter(SavedListing.user_id == user_id)
        .options(selectinload(Listing.images))  # ✅ This is the only thing missing
        .all()
    )
    return saved


@router.delete("/saved-listings/")
def unsave_listing(user_id: UUID, listing_id: UUID, db: Session = Depends(get_db)):
    deleted = (
        db.query(SavedListing)
        .filter_by(user_id=user_id, listing_id=listing_id)
        .delete()
    )

    if not deleted:
        raise HTTPException(status_code=404, detail="Saved listing not found")

    db.commit()
    return {"status": "unsaved"}
