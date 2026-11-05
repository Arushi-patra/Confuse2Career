from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class RoadmapGenerateRequest(BaseModel):
    placement_date: date
    target_role: str = Field(min_length=2)
    dream_company: str = Field(min_length=1)
    study_hours: float = Field(gt=0, le=24)
    skills: List[str] = Field(default_factory=list)
    skill_level: str = "Beginner"

    @field_validator("placement_date")
    @classmethod
    def validate_placement_date(cls, value: date):
        if value < date.today():
            raise ValueError("Placement date cannot be in the past")
        return value

    @field_validator("skill_level")
    @classmethod
    def validate_skill_level(cls, value: str):
        allowed = {"Beginner", "Intermediate", "Advanced"}
        if value not in allowed:
            raise ValueError("Invalid skill level")
        return value

    @field_validator("skills")
    @classmethod
    def clean_skills(cls, value: List[str]):
        return [skill.strip() for skill in value if skill.strip()]


class RoadmapTaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    estimated_hours: float
    day_number: int
    is_completed: bool

    class Config:
        from_attributes = True



# from datetime import date
# from typing import List

# from pydantic import BaseModel, Field


# class RoadmapGenerateRequest(BaseModel):
#     placement_date: date
#     target_role: str
#     dream_company: str
#     study_hours: float = Field(gt=0, le=24)
#     skills: List[str] = []


# class RoadmapTaskResponse(BaseModel):
#     id: int
#     title: str
#     description: str
#     category: str
#     estimated_hours: float
#     day_number: int
#     is_completed: bool

#     class Config:
#         from_attributes = True


# class RoadmapResponse(BaseModel):
#     id: int
#     title: str
#     description: str
#     target_role: str
#     dream_company: str
#     days_remaining: int
#     tasks: List[RoadmapTaskResponse]