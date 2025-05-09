# backend/app/routes/public_key.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..core.database import get_db
from ..models.public_key import PublicKey
from uuid import UUID


router = APIRouter(tags=["keys"])

class PublicKeyUpload(BaseModel):
    user_id: UUID
    public_key: str  # Base64-encoded string

@router.post("/upload")
def upload_public_key(payload: PublicKeyUpload, db: Session = Depends(get_db)):
    # Check if the user already has a key
    existing = db.query(PublicKey).filter(PublicKey.user_id == payload.user_id).first()

    if existing:
        existing.public_key = payload.public_key  # Update if exists
    else:
        new_key = PublicKey(user_id=payload.user_id, public_key=payload.public_key)
        db.add(new_key)

    db.commit()
    return {"status": "success"}

@router.get("/{user_id}")
def get_public_key(user_id: UUID, db: Session = Depends(get_db)):
    key = db.query(PublicKey).filter(PublicKey.user_id == user_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Public key not found")
    return {
        "user_id": str(key.user_id),
        "public_key": key.public_key
    }
