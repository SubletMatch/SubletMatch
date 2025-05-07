from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
from sqlalchemy import text  # ← add this

from ..core.database import get_db

router = APIRouter()

@router.get("/", tags=["health"])
async def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        db.execute(text("SELECT 1"))  # ← fix here
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
