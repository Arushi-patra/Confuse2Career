from pydantic import BaseModel


class SkillAnalysisRequest(BaseModel):
    dsa: float
    development: float
    aptitude: float
    resume: float
    interview: float


class SkillAnalysisResponse(BaseModel):
    dsa: float
    development: float
    aptitude: float
    resume: float
    interview: float
    career_readiness_score: float
    level: str