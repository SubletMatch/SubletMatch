from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.user import User
from ..models.verification_token import VerificationToken
from datetime import datetime

router = APIRouter()

@router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    db_token = db.query(VerificationToken).filter(VerificationToken.token == token).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.delete(db_token)
    db.commit()

    return {"message": "Email successfully verified"}
