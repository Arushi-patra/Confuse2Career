
import httpx

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.skill import SkillAnalysis
from models.user_profile import UserProfile

from schemas.skills import (
    SkillAnalysisRequest,
    SkillAnalysisResponse,
    SkillGapAnalysisRequest
)

from services.skills import (
    calculate_readiness,
    get_level
)


router = APIRouter()

ML_SERVICE_URL = "http://127.0.0.1:8002"


# -----------------------------------------
# EXISTING: Overall career readiness
# -----------------------------------------

@router.post(
    "/analyze",
    response_model=SkillAnalysisResponse
)
def analyze_skills(
    request: SkillAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    readiness = calculate_readiness(
        request.dsa,
        request.development,
        request.aptitude,
        request.resume,
        request.interview
    )

    level = get_level(readiness)

    analysis = (
        db.query(SkillAnalysis)
        .filter(
            SkillAnalysis.user_id == current_user.id
        )
        .first()
    )

    if analysis:
        analysis.dsa = request.dsa
        analysis.development = request.development
        analysis.aptitude = request.aptitude
        analysis.resume = request.resume
        analysis.interview = request.interview
        analysis.career_readiness_score = readiness
        analysis.level = level

    else:
        analysis = SkillAnalysis(
            user_id=current_user.id,
            dsa=request.dsa,
            development=request.development,
            aptitude=request.aptitude,
            resume=request.resume,
            interview=request.interview,
            career_readiness_score=readiness,
            level=level
        )

        db.add(analysis)

    db.commit()
    db.refresh(analysis)

    return analysis


# -----------------------------------------
# EXISTING: Get latest career readiness
# -----------------------------------------

@router.get(
    "/latest",
    response_model=SkillAnalysisResponse
)
def get_latest_skill_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(SkillAnalysis)
        .filter(
            SkillAnalysis.user_id == current_user.id
        )
        .order_by(
            SkillAnalysis.id.desc()
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No skill analysis found"
        )

    return {
        "dsa": analysis.dsa,
        "development": analysis.development,
        "aptitude": analysis.aptitude,
        "resume": analysis.resume,
        "interview": analysis.interview,
        "career_readiness_score": analysis.career_readiness_score,
        "level": analysis.level
    }


# -----------------------------------------
# NEW: ML-based technical skill-gap analysis
# -----------------------------------------

@router.post("/gaps")
def analyze_skill_gaps(
    request: SkillGapAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the student's saved profile.
    profile = (
        db.query(UserProfile)
        .filter(
            UserProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete your profile first."
        )

    if not profile.dream_company or not profile.target_role:
        raise HTTPException(
            status_code=400,
            detail="Please update your dream company and target role in your profile."
        )

    # Prepare the request for the ML service.
    ml_payload = {
        "dream_company": profile.dream_company,
        "dream_role": profile.target_role,
        "skills": request.skills
    }

    # Call the separate ML service.
    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/skill-gaps",
            json=ml_payload,
            timeout=30.0
        )

        response.raise_for_status()

        return response.json()

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="ML service request timed out."
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to the ML service. Please check whether it is running."
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"ML service returned an error: {exc.response.text}"
        )
