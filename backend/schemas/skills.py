
from pydantic import BaseModel, Field


class SkillAnalysisRequest(BaseModel):
    dsa: float = Field(ge=0, le=100)
    development: float = Field(ge=0, le=100)
    aptitude: float = Field(ge=0, le=100)
    resume: float = Field(ge=0, le=100)
    interview: float = Field(ge=0, le=100)


class SkillAnalysisResponse(BaseModel):
    dsa: float
    development: float
    aptitude: float
    resume: float
    interview: float
    career_readiness_score: float
    level: str



# from pydantic import BaseModel


# class SkillAnalysisRequest(BaseModel):
#     dsa: float
#     development: float
#     aptitude: float
#     resume: float
#     interview: float


# class SkillAnalysisResponse(BaseModel):
#     dsa: float
#     development: float
#     aptitude: float
#     resume: float
#     interview: float
#     career_readiness_score: float
#     level: str