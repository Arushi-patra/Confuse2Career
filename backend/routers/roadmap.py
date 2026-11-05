from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.roadmap import Roadmap, RoadmapTask

from schemas.roadmap import RoadmapGenerateRequest

from services.roadmap import generate_roadmap


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


@router.post("/generate")
def generate_student_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if request.placement_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Placement date cannot be in the past."
        )

    try:

        # Generate the roadmap using the existing service.
        result = generate_roadmap(
            placement_date=request.placement_date,
            target_role=request.target_role,
            dream_company=request.dream_company,
            study_hours=request.study_hours,
            skills=request.skills,
            skill_level=request.skill_level
        )

        # Remove the user's previous roadmap.
        # Its tasks are deleted through the model relationship cascade.
        previous_roadmaps = (
            db.query(Roadmap)
            .filter(Roadmap.user_id == current_user.id)
            .all()
        )

        for previous_roadmap in previous_roadmaps:
            db.delete(previous_roadmap)

        db.flush()

        # Create the new roadmap.
        roadmap = Roadmap(
            user_id=current_user.id,
            title=f"{request.target_role} Roadmap",
            description=(
                f"Personalized roadmap for "
                f"{request.dream_company}"
            ),
            start_date=date.today(),
            end_date=request.placement_date,
            is_completed=False,
            created_at=datetime.now(timezone.utc)
        )

        db.add(roadmap)
        db.flush()

        # Save generated tasks.
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

        saved_roadmap = (
            db.query(Roadmap)
            .options(selectinload(Roadmap.tasks))
            .filter(
                Roadmap.id == roadmap.id,
                Roadmap.user_id == current_user.id
            )
            .first()
        )

        return {
            "message": "Roadmap generated successfully",
            "roadmap": roadmap_to_response(saved_roadmap),
            "generation_details": result
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


@router.get("")
def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.tasks))
        .filter(
            Roadmap.user_id == current_user.id
        )
        .order_by(Roadmap.id.desc())
        .first()
    )

    if not roadmap:

        raise HTTPException(
            status_code=404,
            detail="No roadmap found. Please complete onboarding."
        )

    return roadmap_to_response(roadmap)


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



# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from datetime import date

# from core.database import get_db
# from core.deps import get_current_user

# from models.user import User
# from models.roadmap import Roadmap, RoadmapTask

# from schemas.roadmap import (
#     RoadmapGenerateRequest
# )

# from services.roadmap import (
#     generate_roadmap
# )


# router = APIRouter()


# @router.post("/generate")
# def generate_student_roadmap(
#     request: RoadmapGenerateRequest,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):

#     result = generate_roadmap(
#         placement_date=request.placement_date,
#         target_role=request.target_role,
#         dream_company=request.dream_company,
#         study_hours=request.study_hours,
#         skills=request.skills,
#          skill_level=request.skill_level
#     )

#     roadmap = Roadmap(
#         user_id=current_user.id,
#         title=f"{request.target_role} Roadmap",
#         description=(
#             f"Personalized roadmap for "
#             f"{request.dream_company}"
#         ),
#         start_date=date.today(),
#         end_date=request.placement_date
#     )

#     db.add(roadmap)
#     db.flush()

#     for task in result["tasks"]:

#         roadmap_task = RoadmapTask(
#             roadmap_id=roadmap.id,
#             title=task["title"],
#             description=task["description"],
#             category=task["category"],
#             estimated_hours=task["estimated_hours"],
#             day_number=task["day_number"],
#             is_completed=False
#         )

#         db.add(roadmap_task)

#     db.commit()
#     db.refresh(roadmap)

#     return {
#         "message": "Roadmap generated successfully",
#         "roadmap_id": roadmap.id,
#         "user_id": current_user.id,
#         "roadmap": result
#     }


# @router.get("")
# def get_my_roadmap(
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):

#     roadmap = (
#         db.query(Roadmap)
#         .filter(
#             Roadmap.user_id == current_user.id
#         )
#         .order_by(Roadmap.id.desc())
#         .first()
#     )

#     if not roadmap:

#         raise HTTPException(
#             status_code=404,
#             detail="No roadmap found"
#         )

#     return {
#         "id": roadmap.id,
#         "title": roadmap.title,
#         "description": roadmap.description,
#         "tasks": [
#             {
#                 "id": task.id,
#                 "title": task.title,
#                 "description": task.description,
#                 "category": task.category,
#                 "estimated_hours": task.estimated_hours,
#                 "day_number": task.day_number,
#                 "is_completed": task.is_completed
#             }
#             for task in roadmap.tasks
#         ]
#     }


# @router.get("/{roadmap_id}")
# def get_roadmap(
#     roadmap_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):

#     roadmap = (
#         db.query(Roadmap)
#         .filter(
#             Roadmap.id == roadmap_id,
#             Roadmap.user_id == current_user.id
#         )
#         .first()
#     )

#     if not roadmap:

#         raise HTTPException(
#             status_code=404,
#             detail="Roadmap not found"
#         )

#     return {
#         "id": roadmap.id,
#         "title": roadmap.title,
#         "description": roadmap.description,
#         "tasks": [
#             {
#                 "id": task.id,
#                 "title": task.title,
#                 "description": task.description,
#                 "category": task.category,
#                 "estimated_hours": task.estimated_hours,
#                 "day_number": task.day_number,
#                 "is_completed": task.is_completed
#             }
#             for task in roadmap.tasks
#         ]
#     }