import pandas as pd, numpy as np
from .config import SKILLS, OUTPUTS

def _difficulty(s): return s.map({'Easy':1,'Medium':2,'Hard':3}).fillna(0)
def build_profiles(df):
    d=df.copy(); d['total_coding_solved']=d[['Easy_Solved','Medium_Solved','Hard_Solved']].sum(axis=1); d['project_difficulty_score']=_difficulty(d['Difficulty'])
    metrics=['Study_Hours','total_coding_solved','Contest_Rating']+SKILLS+['project_difficulty_score','ATS_Score']
    role=d.groupby('Target_Role')[metrics].agg(['mean','median']).reset_index(); role.columns=['_'.join([str(x) for x in c if str(x)!='']).strip('_') for c in role.columns]
    role.to_csv(OUTPUTS/'role_profiles.csv',index=False)
    cr=d.groupby(['Dream_Company','Target_Role'])[metrics].agg(['mean','median']).reset_index(); cr.columns=['_'.join([str(x) for x in c if str(x)!='']).strip('_') for c in cr.columns]; cr.to_csv(OUTPUTS/'company_role_profiles.csv',index=False)
    return role,cr
