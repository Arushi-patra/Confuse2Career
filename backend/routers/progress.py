from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.skill import SkillAnalysis
from models.resume import Resume

from services.progress import (
    get_user_task,
    get_latest_user_roadmap,
    get_latest_roadmap_tasks,
    calculate_progress
)


router = APIRouter()


# --------------------------------
# COMPLETE ROADMAP TASK
# --------------------------------

@router.post("/task/{task_id}/complete")
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = get_user_task(
        db,
        current_user.id,
        task_id
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.is_completed = True

    db.commit()
    db.refresh(task)

    return {
        "message": "Task completed successfully",
        "task_id": task.id,
        "is_completed": task.is_completed
    }


# --------------------------------
# MARK TASK INCOMPLETE
# --------------------------------

@router.post("/task/{task_id}/uncomplete")
def uncomplete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    task = get_user_task(
        db,
        current_user.id,
        task_id
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.is_completed = False

    db.commit()
    db.refresh(task)

    return {
        "message": "Task marked incomplete",
        "task_id": task.id,
        "is_completed": task.is_completed
    }


# --------------------------------
# ROADMAP PROGRESS STATISTICS
# --------------------------------

@router.get("")
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    roadmap = get_latest_user_roadmap(
        db,
        current_user.id
    )

    tasks = get_latest_roadmap_tasks(
        db,
        current_user.id
    )

    progress = calculate_progress(tasks)

    return {
        "user_id": current_user.id,
        "roadmap_id": roadmap.id if roadmap else None,
        **progress
    }


# --------------------------------
# CAREER READINESS SCORE
# --------------------------------

@router.get("/employability")
def get_employability_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Get latest skill assessment
    skill_analysis = (
        db.query(SkillAnalysis)
        .filter(
            SkillAnalysis.user_id == current_user.id
        )
        .order_by(SkillAnalysis.id.desc())
        .first()
    )

    # Get latest resume analysis
    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(Resume.id.desc())
        .first()
    )

    # Get latest roadmap and its progress
    roadmap = get_latest_user_roadmap(
        db,
        current_user.id
    )

    tasks = get_latest_roadmap_tasks(
        db,
        current_user.id
    )

    roadmap_progress = calculate_progress(tasks)

    roadmap_score = roadmap_progress[
        "completion_percentage"
    ]

    # Available score components
    components = []

    if skill_analysis:
        components.append((
            float(skill_analysis.career_readiness_score),
            0.40
        ))

    if resume:
        components.append((
            float(resume.ats_score),
            0.30
        ))

    if roadmap:
        components.append((
            float(roadmap_score),
            0.30
        ))

    # Calculate weighted score.
    # Missing components are excluded and
    # the remaining weights are normalized.

    if components:

        total_weight = sum(
            weight for _, weight in components
        )

        employability_score = round(
            sum(
                score * weight
                for score, weight in components
            ) / total_weight,
            2
        )

    else:
        employability_score = None

    return {
        "user_id": current_user.id,

        "employability_score": employability_score,

        "skill_score": (
            skill_analysis.career_readiness_score
            if skill_analysis else None
        ),

        "resume_ats_score": (
            resume.ats_score
            if resume else None
        ),

        "roadmap_progress": (
            roadmap_score
            if roadmap else None
        ),

        "available_components": len(components),

        "roadmap_statistics": roadmap_progress
    }



# from fastapi import (
#     APIRouter,
#     Depends,
#     HTTPException
# )

# from sqlalchemy.orm import Session

# from core.database import get_db
# from core.deps import get_current_user

# from models.user import User
# from models.roadmap import (
#     Roadmap,
#     RoadmapTask
# )
# from models.skill import SkillAnalysis
# from models.resume import Resume

# from services.progress import (
#     get_user_task,
#     calculate_progress
# )


# router = APIRouter()


# @router.post(
#     "/task/{task_id}/complete"
# )
# def complete_task(

#     task_id: int,

#     current_user: User = Depends(
#         get_current_user
#     ),

#     db: Session = Depends(get_db)
# ):

#     task = get_user_task(
#         db,
#         current_user.id,
#         task_id
#     )

#     if not task:

#         raise HTTPException(
#             status_code=404,
#             detail="Task not found"
#         )

#     task.is_completed = True

#     db.commit()
#     db.refresh(task)

#     return {
#         "message": "Task completed successfully",
#         "task_id": task.id,
#         "is_completed": task.is_completed
#     }


# @router.post(
#     "/task/{task_id}/uncomplete"
# )
# def uncomplete_task(

#     task_id: int,

#     current_user: User = Depends(
#         get_current_user
#     ),

#     db: Session = Depends(get_db)
# ):

#     task = get_user_task(
#         db,
#         current_user.id,
#         task_id
#     )

#     if not task:

#         raise HTTPException(
#             status_code=404,
#             detail="Task not found"
#         )

#     task.is_completed = False

#     db.commit()

#     return {
#         "message": "Task marked incomplete",
#         "task_id": task.id
#     }


# # 
# @router.get("")
# def get_progress(

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
#         return {
#             "user_id": current_user.id,
#             "total_tasks": 0,
#             "completed_tasks": 0,
#             "completion_percentage": 0
#         }

#     tasks = (
#         db.query(RoadmapTask)
#         .filter(
#             RoadmapTask.roadmap_id == roadmap.id
#         )
#         .all()
#     )

#     progress = calculate_progress(tasks)

#     return {
#         "user_id": current_user.id,
#         "roadmap_id": roadmap.id,
#         **progress
#     }

# @router.get("/employability")
# def get_employability_score(
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     # Fetch latest skill analysis
#     skill_analysis = (
#         db.query(SkillAnalysis)
#         .filter(SkillAnalysis.user_id == current_user.id)
#         .order_by(SkillAnalysis.id.desc())
#         .first()
#     )

#     # Fetch latest resume analysis
#     resume = (
#         db.query(Resume)
#         .filter(Resume.user_id == current_user.id)
#         .order_by(Resume.id.desc())
#         .first()
#     )

#     # Calculate roadmap completion
#     tasks = (
#         db.query(RoadmapTask)
#         .join(Roadmap)
#         .filter(Roadmap.user_id == current_user.id)
#         .all()
#     )

#     roadmap_progress = calculate_progress(tasks)

#     roadmap_score = roadmap_progress.get(
#         "completion_percentage", 0
#     )

#     # Collect available scores and their weights
#     components = []

#     if skill_analysis:
#         components.append(
#             (skill_analysis.career_readiness_score, 0.40)
#         )

#     if resume:
#         components.append(
#             (resume.ats_score, 0.30)
#         )

#     if tasks:
#         components.append(
#             (roadmap_score, 0.30)
#         )

#     # Calculate weighted score using available components
#     if components:
#         total_weight = sum(weight for _, weight in components)

#         employability_score = round(
#             sum(score * weight for score, weight in components)
#             / total_weight,
#             2
#         )
#     else:
#         employability_score = None

#     return {
#         "employability_score": employability_score,
#         "skill_score": (
#             skill_analysis.career_readiness_score
#             if skill_analysis else None
#         ),
#         "resume_ats_score": (
#             resume.ats_score if resume else None
#         ),
#         "roadmap_progress": (
#             roadmap_score if tasks else None
#         ),
#         "available_components": len(components)
#     }