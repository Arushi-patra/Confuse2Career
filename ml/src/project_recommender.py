import pandas as pd
ROLE_TECH={
 'ml engineer':['python','fastapi','flask','django','face recognition','prediction','recommendation','chatbot','ai','machine learning'],
 'data scientist':['python','mysql','mongodb','prediction','recommendation','ai','face recognition'],
 'data analyst':['python','mysql','mongodb','sql','expense','analytics'],
 'backend developer':['fastapi','django','flask','node.js','mysql','mongodb','java'],
 'frontend developer':['react','javascript','html','css'],
 'full stack developer':['react','node.js','django','flask','fastapi','mysql','mongodb','javascript'],
 'software engineer':['java','c++','python','fastapi','django','node.js','mysql','mongodb']
}
def recommend_project(projects, role, difficulty=None):
    if projects.empty:return None
    keys=ROLE_TECH.get(role.casefold(),[])
    rows=[]
    for _,r in projects.iterrows():
        text=f"{r.get('Project_Name',r.get('title',''))} {r.get('Technology',r.get('skill',''))}".lower(); tech=str(r.get('Technology',r.get('skill',''))).lower(); name=str(r.get('Project_Name',r.get('title',''))).lower()
        hits=sum(1 for k in keys if k in text); namehit=sum(1 for k in keys if k in name); diff=1 if difficulty and str(r.get('Difficulty','')).casefold()==difficulty.casefold() else 0
        score=0.65*(hits/max(1,len(keys)))+0.25*min(1,namehit/2)+0.10*diff
        rows.append((score,r))
    score,r=max(rows,key=lambda x:x[0]); return {'project_id':r.get('Project_ID',r.get('resource_id')),'project_name':r.get('Project_Name',r.get('title')),'technology':r.get('Technology',r.get('skill')),'difficulty':r.get('Difficulty',r.get('difficulty')),'github_url':r.get('GitHub_Link',r.get('url')),'score':float(score),'why_recommended':f"Matches the historical project catalog with {role} technology/keyword alignment; the GitHub link is taken directly from the dataset."}
