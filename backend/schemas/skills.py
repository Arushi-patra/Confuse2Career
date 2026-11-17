from typing import Dict

from pydantic import BaseModel, Field, field_validator


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


class SkillGapAnalysisRequest(BaseModel):
    skills: Dict[str, float] = Field(default_factory=dict)

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, value):
        allowed_skills = {
            "DBMS",
            "Operating_System",
            "Computer_Networks",
            "OOP",
            "SQL"
        }

        invalid_skills = set(value.keys()) - allowed_skills

        if invalid_skills:
            raise ValueError(
                f"Invalid skill names: {sorted(invalid_skills)}"
            )

        if any(score < 0 or score > 100 for score in value.values()):
            raise ValueError("Skill scores must be between 0 and 100")

        return value




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