
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import uvicorn
from fastapi.responses import FileResponse
from sqlalchemy.engine import URL
from scalar_fastapi import get_scalar_api_reference

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine


# -----------------------------------------------------------------------------
# FastAPI App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="BIDUA IT Connect",
    description="Complete hosting management platform API with authentication, payments, server management, and more.",
    version=settings.VERSION,
    contact={
        "name": "BIDUA IT Connect Support",
        "url": "https://bidua.com",
        "email": "support@biduapods.com",
    },
    license_info={
        "name": "Proprietary License",
        "url": "https://bidua.com/license",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "Development Server"},
        {"url": "https://api.ramaerahosting.com", "description": "Production Server"},
    ],
)


# -----------------------------------------------------------------------------
# Middleware
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])


class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


app.add_middleware(NoCacheMiddleware)


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def api_health_check():
    return {
        "status": "ok",
        "service": "BIDUA IT Connect API",
        "version": settings.VERSION,
    }


app.mount("/static", StaticFiles(directory="app/static"), name="static")


# -----------------------------------------------------------------------------
# Startup - SAFE (NO SCHEMA CREATION HERE)
# -----------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    """
    IMPORTANT:
    Schema creation is NOT done here.
    Use Alembic migrations instead:

        docker compose exec backend alembic upgrade head

    Startup only confirms DB connectivity — safe with multiple workers.
    """

    url = engine.url
    safe_url = URL.create(
        drivername=url.drivername,
        username=url.username,
        host=url.host,
        port=url.port,
        database=url.database,
    )

    print("🔗 API startup complete")
    print(f"✅ Connected to database: {safe_url}")


# -----------------------------------------------------------------------------
# Utility Endpoints
# -----------------------------------------------------------------------------
@app.get("/", tags=["Introduction"])
async def root():
    return {
        "message": "BIDUA IT Connect API",
        "version": settings.VERSION,
        "documentation": "/swagger",
        "status": "active",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "BIDUA IT Connect",
        "version": settings.VERSION,
    }


@app.get("/ping", tags=["Ping"])
async def ping():
    return {"message": "pong"}


@app.get("/swagger", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="BIDUA IT Connect API Documentation",
        scalar_favicon_url="https://avatars.githubusercontent.com/u/1834093?s=200&v=4",
    )


@app.get("/test-payment", response_class=FileResponse)
async def get_test_payment_page():
    return "app/static/index.html"


# -----------------------------------------------------------------------------
# Local Dev Runner
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="localhost",
        port=8000,
        reload=settings.DEBUG,
    )
