from datetime import date
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from .inference import (
    generate_career_plan,
    predict_preparation_status,
    calculate_skill_gaps,
    init
)

app = FastAPI(title='Confused2Career ML API', version='1.1.0')

# Allow the React/Vite dev server (and your deployed frontend) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],  # add your deployed URL
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

SKILL_KEYS = {'DBMS', 'Operating_System', 'Computer_Networks', 'OOP', 'SQL'}


class CareerRequest(BaseModel):
    placement_date: str                      # YYYY-MM-DD
    study_hours: float = Field(gt=0, le=24)  # hours per day
    dream_company: str = Field(min_length=1)
    dream_role: str = Field(min_length=1)
    skills: Dict[str, float] = {}            # optional, 0-100, keys: DBMS, Operating_System, Computer_Networks, OOP, SQL

    @field_validator('placement_date')
    @classmethod
    def _date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('placement_date must be in YYYY-MM-DD format')
        return v

    @field_validator('skills')
    @classmethod
    def _skills(cls, v):
        bad = set(v) - SKILL_KEYS
        if bad:
            raise ValueError(f'Unknown skill keys {sorted(bad)}. Allowed: {sorted(SKILL_KEYS)}')
        if any(not 0 <= x <= 100 for x in v.values()):
            raise ValueError('Skill scores must be between 0 and 100')
        return v

class SkillGapRequest(BaseModel):
    dream_company: str = Field(min_length=1)
    dream_role: str = Field(min_length=1)

    skills: Dict[str, float] = Field(default_factory=dict)

    @field_validator('skills')
    @classmethod
    def validate_skills(cls, v):
        bad = set(v) - SKILL_KEYS

        if bad:
            raise ValueError(
                f'Unknown skill keys {sorted(bad)}. '
                f'Allowed: {sorted(SKILL_KEYS)}'
            )

        if any(not 0 <= score <= 100 for score in v.values()):
            raise ValueError('Skill scores must be between 0 and 100')

        return v

@app.on_event('startup')
def _warm():
    init()  # load data + models once so the first request is fast


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/career-plan')
def career_plan(req: CareerRequest):
    data = req.model_dump()
    plan = generate_career_plan(data)
    if plan['days_remaining'] == 0:
        plan['warning'] = 'placement_date is today or in the past, so no roadmap could be generated.'
    return plan

@app.post('/skill-gaps')
def skill_gap_analysis(req: SkillGapRequest):
    try:
        student_data = req.model_dump()

        results = calculate_skill_gaps(student_data)

        if not results:
            raise HTTPException(
                status_code=404,
                detail="No skill-gap results found."
            )

        priority_skills = [
            skill for skill in results
            if skill["priority_level"] == "High"
        ]

        return {
            "message": "ML skill-gap analysis completed successfully",
            "career_target": {
                "company": req.dream_company,
                "role": req.dream_role
            },
            "total_skills_analyzed": len(results),
            "skill_gaps": results,
            "priority_skills": priority_skills
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Skill-gap analysis error:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to perform ML skill-gap analysis."
        )