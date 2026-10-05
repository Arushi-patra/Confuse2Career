from datetime import date
from typing import List

from pydantic import BaseModel, Field


class RoadmapGenerateRequest(BaseModel):
    placement_date: date
    target_role: str
    dream_company: str
    study_hours: float = Field(gt=0, le=24)
    skills: List[str] = []


class RoadmapTaskResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    estimated_hours: float
    day_number: int
    is_completed: bool

    class Config:
        from_attributes = True


# class RoadmapResponse(BaseModel):
#     id: int
#     title: str
#     description: str
#     target_role: str
#     dream_company: str
#     days_remaining: int
#     tasks: List[RoadmapTaskResponse]