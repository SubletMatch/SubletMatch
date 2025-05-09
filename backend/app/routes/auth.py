from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.user import User
from ..auth.utils import verify_password, get_password_hash, create_access_token, get_current_user
from datetime import timedelta
from ..core.config import settings
from pydantic import BaseModel, EmailStr
from ..services.email import send_welcome_email, send_password_reset_email
import logging
import secrets
from datetime import datetime
from fastapi import Body

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

# In-memory store for reset tokens (for demo; use DB or cache in production)
reset_tokens = {}

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserUpdate(BaseModel):
    name: str
    email: EmailStr


@router.post("/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send welcome email (do not block signup if it fails)
    try:
        send_welcome_email(user.email, user.name)
    except Exception as e:
        logging.error(f"Failed to send welcome email to {user.email}: {e}")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "created_at": current_user.created_at.isoformat()
    }


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # For security, do not reveal if user exists
        return {"message": "If that email exists, a reset link has been sent."}
    # Generate token
    token = secrets.token_urlsafe(32)
    # Store token with expiry (1 hour)
    reset_tokens[token] = {"user_id": str(user.id), "expires": datetime.utcnow() + timedelta(hours=1)}
    send_password_reset_email(user.email, token)
    return {"message": "If that email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = reset_tokens.get(data.token)
    if not token_data or token_data["expires"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    # Invalidate token
    del reset_tokens[data.token]
    return {"message": "Password reset successful"} 

@router.put("/me")
async def update_current_user(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if email is changing and already taken
    if update.email != current_user.email:
        existing = db.query(User).filter(User.email == update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    current_user.name = update.name
    current_user.email = update.email
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated"} 
