# Confused2Career — ML & Recommendation Backend

Built against the final `Confused2Career_Data_1500.xlsx` workbook. The pipeline is modular and API-ready.

## Pipeline
1. Workbook inspection and data dictionary
2. Leakage-aware preprocessing and feature engineering
3. Preparation-status classification (`Overall_Status`)
4. Role and company-role historical profiles
5. Skill-gap and priority engine
6. K-Means student segmentation
7. Course/YouTube/project resource catalog and TF-IDF semantic retrieval fallback
8. Hybrid single-best-resource ranking
9. Time-constrained roadmap
10. FastAPI inference interface

## Run
```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python scripts/inspect_data.py
python scripts/train.py
python scripts/demo.py
```

API:
```bash
uvicorn src.api:app --reload
```
Then POST JSON to `/career-plan`.

## Important modeling decisions
- `Student_ID`, `Name`, and `Email` are never predictive features.
- `Overall_Status` is the supervised target and is excluded from predictors.
- Resume/status fields are conservatively excluded from the readiness classifier because their association with the target is extremely strong and may reflect target construction.
- The classifier predicts historical preparation status; it does **not** predict placement outcomes.
- Four frontend inputs alone do not reveal current skills. Without optional skill data, skill gaps use historical role/company benchmarks.
- Company/role benchmarks are historical patterns in this dataset, not official employer requirements.
- Resource URLs are only taken from the workbook; no URLs are invented.
- If resource interaction labels are absent, recommendation quality is evaluated descriptively rather than with fake Precision@K/Recall@K.

## Generated artifacts
- `reports/data_quality_report.html`
- `reports/data_dictionary.csv`
- `reports/leakage_analysis.md`
- `reports/model_comparison.csv`
- `reports/classification_report.txt`
- `outputs/role_profiles.csv`
- `outputs/company_role_profiles.csv`
- `outputs/cluster_selection.csv`
- `outputs/cluster_profiles.csv`
- `outputs/resource_catalog.csv`
- `models/preparation_status_model.joblib`
- `models/model_metadata.json`
- `models/student_segmentation_model.joblib`
- `models/resource_vectorizer.joblib`
- `models/resource_tfidf.joblib`
