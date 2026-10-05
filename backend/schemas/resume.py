from typing import List, Optional

from pydantic import BaseModel


class ResumeAnalysisResponse(BaseModel):
    message: str
    resume_id: int
    ats_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]


class ResumeUpdateRequest(BaseModel):
    target_role: str | None = None
    content: str


class ResumeResponse(BaseModel):
    id: int
    ats_score: Optional[float] = NotImplemented