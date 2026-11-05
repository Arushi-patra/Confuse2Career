
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ResumeAnalysisResponse(BaseModel):
    message: str
    resume_id: int
    ats_score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]


class ResumeUpdateRequest(BaseModel):
    target_role: Optional[str] = None
    content: str


class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ats_score: Optional[float] = None
    target_role: Optional[str] = None
    resume_content: Optional[str] = None
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    suggestions: List[str] = []




# from typing import List, Optional

# from pydantic import BaseModel


# class ResumeAnalysisResponse(BaseModel):
#     message: str
#     resume_id: int
#     ats_score: float
#     matched_keywords: List[str]
#     missing_keywords: List[str]
#     suggestions: List[str]


# class ResumeUpdateRequest(BaseModel):
#     target_role: str | None = None
#     content: str


# class ResumeResponse(BaseModel):
#     id: int
#     ats_score: Optional[float] = NotImplemented