from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes import auth, listings, message, health, public_key
from .core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

ENV = os.getenv("APP_ENV")

if ENV == "dev":
    allowed_origins = [
        "http://localhost:3000",
        "https://dev.leaselink.app",
        "https://www.dev.leaselink.app",
    ]
else:
    allowed_origins = [
        "https://leaselink.app",
        "https://www.leaselink.app",
    ]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

from fastapi.routing import APIRoute

@app.get("/debug/messages-routes")
def debug_routes():
    return [
        {
            "path": route.path,
            "methods": list(route.methods),
            "name": route.name
        }
        for route in app.routes
        if isinstance(route, APIRoute)
    ]



@app.get("/")
async def root():
    return {"message": "Welcome to LeaseLink API"}

# 👇 ADD THIS to enable running with `uvicorn app.main:app`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
 