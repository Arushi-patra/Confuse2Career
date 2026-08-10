# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.user import User
from models.user_profile import UserProfile 
from models.skill import Skill
from models.resume import Resume
from models.roadmap import Roadmap
from models.resource import Resource

from core.database import Base, engine
# from routers import auth, profile, dashboard, roadmap, resume
from routers import auth, onboarding, recommendations, resume, roadmap, skills
from routers.auth import router as auth_router

# Create all tables (only for dev — use Alembic migrations for production changes)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Confused2Career API",
    description="Backend API for AI-powered career guidance platform",
    version="1.0.0"
)

# CORS — allow your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your frontend URL in production, e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
# app.include_router(profile.router, prefix="", tags=["profile"])
# app.include_router(dashboard.router, prefix="", tags=["dashboard"])
# app.include_router(roadmap.router, prefix="/roadmap", tags=["roadmap"])
# app.include_router(resume.router, prefix="/resume", tags=["resume"])


@app.get("/")
def root():
    return {"message": "Confused2Career API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}