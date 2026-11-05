from sqlalchemy.orm import Session

from models.roadmap import Roadmap, RoadmapTask


def get_latest_user_roadmap(
    db: Session,
    user_id: int
):
    return (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user_id)
        .order_by(Roadmap.id.desc())
        .first()
    )


def get_user_task(
    db: Session,
    user_id: int,
    task_id: int
):
    return (
        db.query(RoadmapTask)
        .join(Roadmap)
        .filter(
            RoadmapTask.id == task_id,
            Roadmap.user_id == user_id
        )
        .first()
    )


def get_latest_roadmap_tasks(
    db: Session,
    user_id: int
):
    roadmap = get_latest_user_roadmap(db, user_id)

    if not roadmap:
        return []

    return (
        db.query(RoadmapTask)
        .filter(RoadmapTask.roadmap_id == roadmap.id)
        .all()
    )


def calculate_progress(tasks):

    total = len(tasks)

    completed = sum(
        1 for task in tasks
        if task.is_completed
    )

    pending = total - completed

    percentage = (
        completed / total * 100
        if total > 0
        else 0
    )

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "completion_percentage": round(percentage, 2)
    }


# from sqlalchemy.orm import Session

# from models.roadmap import (
#     Roadmap,
#     RoadmapTask
# )


# def get_user_task(
#     db: Session,
#     user_id: int,
#     task_id: int
# ):

#     return (
#         db.query(RoadmapTask)
#         .join(Roadmap)
#         .filter(
#             RoadmapTask.id == task_id,
#             Roadmap.user_id == user_id
#         )
#         .first()
#     )


# def calculate_progress(
#     tasks
# ):

#     total = len(tasks)

#     completed = sum(
#         1
#         for task in tasks
#         if task.is_completed
#     )

#     pending = total - completed

#     percentage = (
#         completed / total * 100
#         if total
#         else 0
#     )

#     return {
#         "total_tasks": total,
#         "completed_tasks": completed,
#         "pending_tasks": pending,
#         "completion_percentage": round(
#             percentage,
#             2
#         )
#     }