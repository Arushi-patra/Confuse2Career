import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[1]))
import pandas as pd
from datetime import date, timedelta
from src.roadmap import generate


def test_roadmap_hours_do_not_exceed_available():
    class R:
        def __call__(self, *a, **k): return {'resource_type': 'youtube', 'title': 'x', 'url': 'u', 'final_resource_score': .5}
    p = pd.DataFrame([{'skill': 'SQL', 'priority_level': 'High', 'priority_score': .9, 'gap': 30},
                      {'skill': 'DBMS', 'priority_level': 'High', 'priority_score': .8, 'gap': 20}])
    future = (date.today() + timedelta(days=30)).isoformat()   # always in the future (old test used a fixed date that expired)
    x = generate(future, 1, p, R(), 'Backend Developer', 'Google')
    assert x['total_available_hours'] > 0 and x['roadmap']
    assert sum(w['estimated_hours'] for w in x['roadmap']) <= x['total_available_hours'] + 1e-9


def test_api_career_plan_and_validation():
    from fastapi.testclient import TestClient
    from src.api import app
    c = TestClient(app)
    future = (date.today() + timedelta(days=200)).isoformat()
    ok = c.post('/career-plan', json={'placement_date': future, 'study_hours': 2, 'dream_company': 'Google', 'dream_role': 'Backend Developer'})
    assert ok.status_code == 200 and ok.json()['roadmap']
    assert c.post('/career-plan', json={'placement_date': 'bad', 'study_hours': 2, 'dream_company': 'Google', 'dream_role': 'x'}).status_code == 422
    assert c.post('/career-plan', json={'placement_date': future, 'study_hours': 2, 'dream_company': 'G', 'dream_role': 'x', 'skills': {'Java': 50}}).status_code == 422
    assert c.get('/health').json() == {'status': 'ok'}
