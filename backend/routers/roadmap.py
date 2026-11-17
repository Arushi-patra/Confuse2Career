
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.roadmap import Roadmap, RoadmapTask

from schemas.roadmap import RoadmapGenerateRequest

from services.ml_client import generate_ml_career_plan
from services.ml_roadmap_adapter import convert_ml_response_to_tasks


router = APIRouter()


def roadmap_to_response(roadmap: Roadmap):
    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "description": roadmap.description,
        "start_date": (
            roadmap.start_date.isoformat()
            if roadmap.start_date else None
        ),
        "end_date": (
            roadmap.end_date.isoformat()
            if roadmap.end_date else None
        ),
        "is_completed": roadmap.is_completed,
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
            for task in sorted(
                roadmap.tasks,
                key=lambda item: item.day_number or 0
            )
        ]
    }


# --------------------------------------------------
# GENERATE NEW PERSONALIZED ROADMAP
# POST /roadmap/generate
# --------------------------------------------------

@router.post("/generate")
def generate_student_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # STEP 1: Validate placement date.
        if request.placement_date < date.today():
            raise HTTPException(
                status_code=400,
                detail="Placement date cannot be in the past."
            )

        # STEP 2: Generate a career plan through the ML service.
        ml_result = generate_ml_career_plan(
            placement_date=request.placement_date,
            target_role=request.target_role,
            dream_company=request.dream_company,
            study_hours=request.study_hours,
            skills=request.skills
        )

        # STEP 3: Convert ML output into database task format.
        generated_tasks = convert_ml_response_to_tasks(ml_result)

        if not generated_tasks:
            raise HTTPException(
                status_code=502,
                detail="ML service did not generate any roadmap tasks."
            )

        # STEP 4: Find existing roadmaps belonging to this user only.
        previous_roadmaps = (
            db.query(Roadmap)
            .filter(Roadmap.user_id == current_user.id)
            .all()
        )

        # Remove old roadmaps for this same user.
        # Their tasks are removed through cascade delete.
        for previous_roadmap in previous_roadmaps:
            db.delete(previous_roadmap)

        db.flush()

        # STEP 5: Create the new roadmap.
        roadmap = Roadmap(
            user_id=current_user.id,
            title=f"{request.target_role} Roadmap",
            description=(
                f"Personalized preparation roadmap for "
                f"{request.dream_company} - {request.target_role}"
            ),
            start_date=date.today(),
            end_date=request.placement_date,
            is_completed=False,
            created_at=datetime.now(timezone.utc)
        )

        db.add(roadmap)
        db.flush()

        # STEP 6: Save generated tasks in PostgreSQL.
        for task in generated_tasks:
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

        # STEP 7: Commit database changes.
        db.commit()

        # STEP 8: Retrieve saved roadmap with its tasks.
        saved_roadmap = (
            db.query(Roadmap)
            .options(selectinload(Roadmap.tasks))
            .filter(
                Roadmap.id == roadmap.id,
                Roadmap.user_id == current_user.id
            )
            .first()
        )

        if not saved_roadmap:
            raise HTTPException(
                status_code=500,
                detail="Roadmap was generated but could not be retrieved."
            )

        return {
            "message": "Roadmap generated successfully",
            "roadmap": roadmap_to_response(saved_roadmap),
            "generation_details": ml_result
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        print("ROADMAP GENERATION ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to generate roadmap."
        )


# --------------------------------------------------
# GET LATEST ROADMAP OF LOGGED-IN USER
# GET /roadmap
# --------------------------------------------------

@router.get("")
def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.tasks))
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.id.desc())
        .first()
    )

    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail="No roadmap found. Please complete onboarding."
        )

    return roadmap_to_response(roadmap)


# --------------------------------------------------
# GET A PARTICULAR ROADMAP
# GET /roadmap/{roadmap_id}
# --------------------------------------------------

@router.get("/{roadmap_id}")
def get_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.tasks))
        .filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        )
        .first()
    )

    if not roadmap:
        raise HTTPException(
            status_code=404,
            detail="Roadmap not found."
        )

    return roadmap_to_response(roadmap)
