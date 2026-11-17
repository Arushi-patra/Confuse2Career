import math, pandas as pd

def generate(placement_date, study_hours, priorities, recommender, role, company):
    today=pd.Timestamp.today().normalize(); date=pd.Timestamp(placement_date); days=max(0,(date-today).days); available=max(0,days*float(study_hours)); weekly=max(1,float(study_hours)*7)
    tasks=[]; remaining=available
    for _,r in priorities.iterrows():
        if remaining<1: break
        hrs=min(max(2,round(float(r.priority_score)*12)),remaining)
        q=f'{role} preparation: {r.skill} skill gap {r.gap:.0f} points'; best=recommender(q,r.skill,role,'Intermediate'); tasks.append({'skill':r.skill,'priority':r.priority_level,'estimated_hours':float(hrs),'best_resource':{k:best[k] for k in ['resource_type','title','url','final_resource_score'] if k in best}}); remaining-=hrs
    weeks=[]; w=1; cur=[]; used=0
    for t in tasks:
        if used+t['estimated_hours']>weekly and cur: weeks.append({'week':w,'estimated_hours':used,'tasks':cur}); w+=1; cur=[]; used=0
        cur.append(t); used+=t['estimated_hours']
    if cur: weeks.append({'week':w,'estimated_hours':used,'tasks':cur})
    return {'days_remaining':days,'total_available_hours':available,'weekly_available_hours':weekly,'roadmap':weeks}
