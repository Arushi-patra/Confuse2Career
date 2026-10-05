from typing import Optional

from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: int
    title: str
    platform: str
    resource_type: Optional[str] = None
    skill: Optional[str] = None
    difficulty: Optional[str] = None
    url: str
    rating: Optional[float] = None