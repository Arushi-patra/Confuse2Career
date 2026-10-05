from fastapi import (
    APIRouter,
    Depends,
    Query
)

from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User

from services.recommendation import (
    recommend_resources
)


router = APIRouter()


@router.get("")
def get_recommendations(

    skills: list[str] = Query(...),

    platform: str | None = None,

    resource_type: str | None = None,

    limit: int = Query(
        default=10,
        ge=1,
        le=50
    ),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    resources = recommend_resources(
        db=db,
        skills=skills,
        platform=platform,
        resource_type=resource_type,
        limit=limit
    )

    return {
        "user_id": current_user.id,
        "count": len(resources),
        "recommendations": [
            {
                "id": resource.id,
                "title": resource.title,
                "platform": resource.platform,
                "resource_type": resource.resource_type,
                "skill": resource.skill,
                "difficulty": resource.difficulty,
                "url": resource.url,
                "rating": resource.rating
            }
            for resource in resources
        ]
    }