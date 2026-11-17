import pandas as pd, numpy as np
from .config import SKILLS

def _norm(x): return float(np.clip(x,0,100))
def gaps(df, company, role, student=None):
    d=df.copy(); role_d=d[d.Target_Role.astype(str).str.casefold()==str(role).casefold()]; cr=d[(d.Dream_Company.astype(str).str.casefold()==str(company).casefold()) & (d.Target_Role.astype(str).str.casefold()==str(role).casefold())]
    if role_d.empty: role_d=d
    result=[]
    for s in SKILLS:
        target=float(role_d[s].quantile(.75)); company_target=float(cr[s].quantile(.75)) if len(cr)>=10 else np.nan; target=0.7*target+0.3*company_target if np.isfinite(company_target) else target
        current=np.nan if student is None else student.get(s,np.nan)
        if not np.isfinite(current): current=float(role_d[s].median())
        gap=max(0,target-current); importance=target/100; company_rel=1.0 if len(cr)>=10 else .5; priority=.55*(gap/100)+.25*importance+.20*company_rel
        level='High' if priority>=.60 else ('Medium' if priority>=.35 else 'Low')
        result.append({'skill':s,'current_score':round(_norm(current),2),'target_score':round(_norm(target),2),'gap':round(gap,2),'importance':round(importance,3),'company_role_relevance':company_rel,'priority_score':round(priority,3),'priority_level':level,'role_sample_size':len(role_d),'company_role_sample_size':len(cr)})
    return pd.DataFrame(result).sort_values('priority_score',ascending=False).reset_index(drop=True)
