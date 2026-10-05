from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.roadmap import (
    Roadmap,
    RoadmapTask
)

from services.progress import (
    get_user_task,
    calculate_progress
)


router = APIRouter()


@router.post(
    "/task/{task_id}/complete"
)
def complete_task(

    task_id: int,

    current_user: User = Depends(
        get_current_user
    ),

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


@router.post(
    "/task/{task_id}/uncomplete"
)
def uncomplete_task(

    task_id: int,

    current_user: User = Depends(
        get_current_user
    ),

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

    return {
        "message": "Task marked incomplete",
        "task_id": task.id
    }


@router.get("")
def get_progress(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    tasks = (
        db.query(RoadmapTask)
        .join(Roadmap)
        .filter(
            Roadmap.user_id == current_user.id
        )
        .all()
    )

    progress = calculate_progress(
        tasks
    )

    return {
        "user_id": current_user.id,
        **progress
    }