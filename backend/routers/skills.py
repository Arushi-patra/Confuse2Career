from fastapi import APIRouter, Depends

from core.deps import get_current_user

from models.user import User

from schemas.skills import (
    SkillAnalysisRequest,
    SkillAnalysisResponse
)

from services.skills import (
    calculate_readiness,
    get_level
)


router = APIRouter()


@router.post(
    "/analyze",
    response_model=SkillAnalysisResponse
)
def analyze_skills(

    request: SkillAnalysisRequest,

    current_user: User = Depends(
        get_current_user
    )
):

    readiness = calculate_readiness(
        request.dsa,
        request.development,
        request.aptitude,
        request.resume,
        request.interview
    )

    level = get_level(
        readiness
    )

    return {
        "dsa": request.dsa,
        "development": request.development,
        "aptitude": request.aptitude,
        "resume": request.resume,
        "interview": request.interview,
        "career_readiness_score": readiness,
        "level": level
    }