import joblib, pandas as pd, numpy as np
from .config import DATA, MODELS, OUTPUTS
from .data_loader import load
from .feature_engineering import clean_master, engineer
from .skill_gap import gaps
from .roadmap import generate
from .recommender import build_resources, recommend
from .project_recommender import recommend_project

_WB=None; _M=None; _CAT=None

def init():
    global _WB,_M,_CAT
    if _WB is None: _WB=load(DATA); _M=joblib.load(MODELS/'preparation_status_model.joblib'); _CAT=pd.read_csv(OUTPUTS/'resource_catalog.csv',keep_default_na=False)

def get_role_profile(role):
    init(); d=_WB['Master_Students']; x=d[d.Target_Role.astype(str).str.casefold()==str(role).casefold()];
    if x.empty: return {'found':False,'message':'No historical students for this role.'}
    return {'found':True,'student_count':len(x),'role':role,'average_skills':{c:float(x[c].mean()) for c in ['DBMS','Operating_System','Computer_Networks','OOP','SQL']}}

def get_company_role_profile(company,role):
    init(); d=_WB['Master_Students']; x=d[(d.Dream_Company.astype(str).str.casefold()==str(company).casefold())&(d.Target_Role.astype(str).str.casefold()==str(role).casefold())]
    if x.empty:return {'found':False,'message':'No historical company-role records.'}
    return {'found':True,'student_count':len(x),'company':company,'role':role,'average_skills':{c:float(x[c].mean()) for c in ['DBMS','Operating_System','Computer_Networks','OOP','SQL']}}

def predict_preparation_status(student_data):
    init(); row=pd.DataFrame([student_data]); base=_WB['Master_Students'].iloc[0:1].copy(); base.loc[0,:]=np.nan; row=pd.concat([base,row],ignore_index=True).iloc[[1]]; row=engineer(clean_master(row)); return str(_M.predict(row)[0])

def calculate_skill_gaps(student_data):
    init(); d=_WB['Master_Students']; return gaps(d,student_data.get('dream_company',''),student_data.get('dream_role',''),student_data.get('skills',{})).to_dict('records')

def generate_career_plan(student_data):
    init(); role=student_data['dream_role']; company=student_data['dream_company']; pr=gaps(_WB['Master_Students'],company,role,student_data.get('skills',{}));
    def rec(q,s,r,d): return recommend(_CAT,q,s,r,d)
    rm=generate(student_data['placement_date'],student_data['study_hours'],pr,rec,role,company)
    project_catalog=_CAT[_CAT.resource_type=='project'].copy()
    best_project=recommend_project(project_catalog, role)
    return {'career_target':{'company':company,'role':role},'role_profile':get_role_profile(role),'company_role_profile':get_company_role_profile(company,role),'days_remaining':rm['days_remaining'],'available_hours':rm['total_available_hours'],'skill_gaps':pr.to_dict('records'),'priority_skills':pr.head(5).to_dict('records'),'best_project':best_project,'github_setup':['Create/update GitHub profile','Pin your strongest relevant project','Add clear README files','Keep repositories active and organized'],'linkedin_setup':['Update headline for target role','Add relevant skills','Add projects and certifications','Add internship experience when applicable'],'roadmap':rm['roadmap']}

def get_skill_priorities(student_data):
    return calculate_skill_gaps(student_data)

def recommend_best_resource(student_data, task):
    init(); return recommend(_CAT, task.get('query',task.get('task',str(task))), task.get('skill',''), student_data.get('dream_role',''), task.get('difficulty','Intermediate'))

def recommend_best_project(student_data):
    init(); return recommend_project(_CAT[_CAT.resource_type=='project'].copy(), student_data.get('dream_role',''))

def update_recommendations(progress_data):
    # Progress updates are accepted as a future feedback-loop contract. Current recalculation uses supplied skill scores.
    return generate_career_plan(progress_data)
