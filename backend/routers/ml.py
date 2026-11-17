from fastapi import APIRouter

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)


@router.get("/health")
def ml_health():
    return {
        "status": "ML router connected successfully"
    }