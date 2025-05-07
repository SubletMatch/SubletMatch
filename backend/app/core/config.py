from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
load_dotenv() 

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sublet"
    DATABASE_URL: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_ACCESS_KEY_ID: str
    AWS_DEFAULT_REGION: str
    SENDGRID_API_KEY: str
    SENDGRID_FROM_EMAIL: str
    # FRONTEND_URL: str  # Removed, not needed

    class Config:
        env_file = ".env"

settings = Settings() 
