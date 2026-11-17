# Confused2Career – ML Module: Abstract, Summary, Integration

## Abstract
Confused2Career is an AI-based career guidance platform for engineering students preparing for placements. This ML module turns four simple inputs (placement date, daily study hours, dream company, dream role), plus optional core-subject scores, into a personalised preparation plan. It is trained on a 1,500-student dataset and uses: (1) a supervised classifier (ExtraTrees, macro-F1 ≈ 0.96 in 5-fold CV) that predicts a student's historical preparation status (Needs Improvement / Average / Good / Excellent); (2) role and company-role benchmarking that computes a weighted skill-gap and priority score for DBMS, OS, Computer Networks, OOP and SQL; (3) K-Means student segmentation; (4) a hybrid content-based recommender (TF-IDF cosine similarity + skill/role/difficulty/rating matching) that selects a course, YouTube video or GitHub project from the dataset; and (5) a time-constrained roadmap generator that fits tasks into (days remaining × daily hours). The system is exposed through a FastAPI endpoint (`POST /career-plan`) that the React frontend consumes.

## Summary
| Component | File | What it does |
|---|---|---|
| Data & cleaning | data_loader.py, feature_engineering.py | Loads the Excel workbook, cleans types, engineers coding/skill/time features |
| Leakage control | leakage_detection.py | Excludes IDs, resume scores, links and free text from the classifier |
| Readiness model | readiness_model.py | Compares Dummy / LogReg / RandomForest / ExtraTrees / HistGB, keeps best by macro-F1 |
| Profiles | profiles.py | Role and company-role historical averages |
| Skill gap | skill_gap.py | target = 75th percentile of role (70%) + company-role (30%); priority = 0.55·gap + 0.25·importance + 0.20·company relevance |
| Clustering | clustering.py | K-Means, K chosen by silhouette |
| Recommender | recommender.py, project_recommender.py | TF-IDF + rule scoring; one best resource per skill, one best project per role |
| Roadmap | roadmap.py | Weekly plan capped by available hours |
| API | api.py, inference.py | FastAPI service, validated input, CORS, /health |

Limitations: benchmarks are historical dataset patterns, not employer requirements; the classifier predicts preparation status, not placement outcome; no click/completion data, so recommendation precision@K is not claimed; with only the four frontend inputs, skill gaps are benchmark-based (send `skills` for personalisation).

## How to connect

Run the ML service:
    pip install -r requirements.txt
    python scripts/train.py            # only if models/ is missing or sklearn version differs
    uvicorn src.api:app --port 8001 --reload

### Request
POST http://localhost:8001/career-plan
{
  "placement_date": "2027-08-01",
  "study_hours": 3,
  "dream_company": "Google",
  "dream_role": "Backend Developer",
  "skills": { "DBMS": 40, "SQL": 80 }      // optional, 0-100
}

### Response keys
career_target, role_profile, company_role_profile, days_remaining, available_hours,
skill_gaps, priority_skills, best_project, github_setup, linkedin_setup, roadmap[ {week, estimated_hours, tasks[ {skill, priority, estimated_hours, best_resource{title,url,resource_type}} ]} ], warning (only if date is past)

### Option A – frontend calls the ML API directly (simplest, good for a demo)
.env in the Vite project:  VITE_ML_API=http://localhost:8001

    export async function getCareerPlan(form) {
      const res = await fetch(`${import.meta.env.VITE_ML_API}/career-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_date: form.placementDate,      // 'YYYY-MM-DD'
          study_hours: Number(form.studyHours),
          dream_company: form.company,
          dream_role: form.role,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).detail?.[0]?.msg || 'Request failed');
      return res.json();
    }

### Option B – main backend proxies to the ML service (recommended for the final project)
Browser -> your main backend (auth, DB, user history) -> ML API on port 8001.

    # main FastAPI backend
    import httpx
    @router.post('/api/career-plan')
    async def career_plan(payload: dict, user=Depends(get_current_user)):
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post('http://localhost:8001/career-plan', json=payload)
        r.raise_for_status()
        plan = r.json()
        # save plan to DB for the user here
        return plan

Then the frontend only talks to your main backend, and CORS only needs to be set there.

### Frontend mapping
- Roadmap page / timeline  <- roadmap (weeks -> tasks -> best_resource.url)
- Skill-gap bar/radar chart (Recharts) <- skill_gaps (current_score vs target_score)
- Top priorities cards <- priority_skills
- Project card <- best_project
- Dropdowns for company and role should use the exact values in the dataset:
  Roles: Data Analyst, Data Scientist, Frontend Developer, Software Engineer, Full Stack Developer, ML Engineer, Backend Developer
  Companies: Adobe, Google, TCS, Oracle, Accenture, Infosys, Amazon, Wipro, Microsoft, Capgemini
