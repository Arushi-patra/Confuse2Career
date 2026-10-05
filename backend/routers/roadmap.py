from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.roadmap import Roadmap, RoadmapTask

from schemas.roadmap import (
    RoadmapGenerateRequest
)

from services.roadmap import (
    generate_roadmap
)


router = APIRouter()


@router.post("/generate")
def generate_student_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    result = generate_roadmap(
        placement_date=request.placement_date,
        target_role=request.target_role,
        dream_company=request.dream_company,
        study_hours=request.study_hours,
        skills=request.skills
    )

    roadmap = Roadmap(
        user_id=current_user.id,
        title=f"{request.target_role} Roadmap",
        description=(
            f"Personalized roadmap for "
            f"{request.dream_company}"
        )
    )

    db.add(roadmap)
    db.flush()

    for task in result["tasks"]:

        roadmap_task = RoadmapTask(
            roadmap_id=roadmap.id,
            title=task["title"],
            description=task["description"],
            category=task["category"],
            estimated_hours=task["estimated_hours"],
            day_number=task["day_number"],
            is_completed=False
        )

        db.add(roadmap_task)

    db.commit()
    db.refresh(roadmap)

    return {
        "message": "Roadmap generated successfully",
        "roadmap_id": roadmap.id,
        "user_id": current_user.id,
        "roadmap": result
    }


@router.get("")
def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.user_id == current_user.id
        )
        .order_by(Roadmap.id.desc())
        .first()
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail="No roadmap found"
        )

    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "description": roadmap.description,
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "category": task.category,
                "estimated_hours": task.estimated_hours,
                "day_number": task.day_number,
                "is_completed": task.is_completed
            }
            for task in roadmap.tasks
        ]
    }


@router.get("/{roadmap_id}")
def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    roadmap = (
        db.query(Roadmap)
        .filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        )
        .first()
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail="Roadmap not found"
        )

    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "description": roadmap.description,
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "category": task.category,
                "estimated_hours": task.estimated_hours,
                "day_number": task.day_number,
                "is_completed": task.is_completed
            }
            for task in roadmap.tasks
        ]
    }