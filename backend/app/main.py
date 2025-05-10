from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import auth, listings, message, health, public_key
from .core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://www.leaselink.app", "https://leaselink.app"], 
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

# Include routers
@app.options("/{full_path:path}")
async def preflight(full_path: str, request: Request):
    response = JSONResponse(content={"message": "Preflight OK"})
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(listings.router, prefix="/api/v1/listings", tags=["listings"])
app.include_router(message.router, prefix="/api/v1/messages", tags=['messages'])
app.include_router(public_key.router, prefix="/api/v1/keys", tags=["keys"])

@app.get("/")
async def root():
    return {"message": "Welcome to SubletMatch API"}

# 👇 ADD THIS to enable running with `uvicorn app.main:app`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
 