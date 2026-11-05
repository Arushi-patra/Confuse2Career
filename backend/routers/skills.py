from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.skill import SkillAnalysis

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
    ),

    db: Session = Depends(get_db)
):
    # Calculate the overall readiness score.
    readiness = calculate_readiness(
        request.dsa,
        request.development,
        request.aptitude,
        request.resume,
        request.interview
    )

    level = get_level(readiness)

    # Find the user's latest saved analysis.
    analysis = (
        db.query(SkillAnalysis)
        .filter(
            SkillAnalysis.user_id == current_user.id
        )
        .first()
    )

    # Update existing analysis.
    if analysis:
        analysis.dsa = request.dsa
        analysis.development = request.development
        analysis.aptitude = request.aptitude
        analysis.resume = request.resume
        analysis.interview = request.interview
        analysis.career_readiness_score = readiness
        analysis.level = level

    # Create a new analysis for this user.
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


@router.get(
    "/latest",
    response_model=SkillAnalysisResponse
)
def get_latest_skill_analysis(
    current_user: User = Depends(
        get_current_user
    ),
 
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
        "career_readiness_score":
            analysis.career_readiness_score,
        "level": analysis.level
    }




# from fastapi import APIRouter, Depends

# from core.deps import get_current_user

# from models.user import User

# from schemas.skills import (
#     SkillAnalysisRequest,
#     SkillAnalysisResponse
# )

# from services.skills import (
#     calculate_readiness,
#     get_level
# )


# router = APIRouter()


# @router.post(
#     "/analyze",
#     response_model=SkillAnalysisResponse
# )
# def analyze_skills(

#     request: SkillAnalysisRequest,

#     current_user: User = Depends(
#         get_current_user
#     )
# ):

#     readiness = calculate_readiness(
#         request.dsa,
#         request.development,
#         request.aptitude,
#         request.resume,
#         request.interview
#     )

#     level = get_level(
#         readiness
#     )

#     return {
#         "dsa": request.dsa,
#         "development": request.development,
#         "aptitude": request.aptitude,
#         "resume": request.resume,
#         "interview": request.interview,
#         "career_readiness_score": readiness,
#         "level": level
#     }