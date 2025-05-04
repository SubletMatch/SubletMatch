from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, listings, message
from .core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sublet-match.vercel.app"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["listings"])
app.include_router(message.router, prefix="/api/v1/messages", tags=['messages'])

@app.get("/")
async def root():
    return {"message": "Welcome to SubletMatch API"}

# 👇 ADD THIS to enable running with `uvicorn app.main:app`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
 