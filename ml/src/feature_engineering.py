import numpy as np, pandas as pd
from .config import SKILLS

def clean_master(df):
    d=df.copy()
    d.columns=[str(c).strip() for c in d.columns]
    for c in d.select_dtypes(include='object').columns: d[c]=d[c].astype(str).str.strip().replace({'nan':np.nan,'None':np.nan})
    for c in ['Placement_Date']:
        if c in d: d[c]=pd.to_datetime(d[c],errors='coerce')
    numeric=['Study_Hours','Easy_Solved','Medium_Solved','Hard_Solved','Contest_Rating']+SKILLS+['ATS_Score','Grammar_Score','Keywords_Matched']
    for c in numeric:
        if c in d: d[c]=pd.to_numeric(d[c],errors='coerce')
    for c in numeric:
        if c in d: d[c]=d[c].fillna(d[c].median())
    return d

def engineer(d, reference_date=None):
    d=d.copy()
    if 'Placement_Date' in d:
        ref=pd.Timestamp(reference_date) if reference_date else pd.Timestamp.today().normalize()
        d['days_until_placement_from_reference_date']=(d['Placement_Date']-ref).dt.days
        d['weeks_until_placement']=d['days_until_placement_from_reference_date']/7
        d['months_until_placement']=d['days_until_placement_from_reference_date']/30.44
    for c in ['Easy_Solved','Medium_Solved','Hard_Solved']:
        d[c]=pd.to_numeric(d.get(c,0),errors='coerce').fillna(0)
    d['total_coding_solved']=d['Easy_Solved']+d['Medium_Solved']+d['Hard_Solved']
    d['weighted_coding_score']=d['Easy_Solved']+2*d['Medium_Solved']+3*d['Hard_Solved']
    d['coding_volume']=d['total_coding_solved']
    d['hard_problem_ratio']=np.where(d['total_coding_solved']>0,d['Hard_Solved']/d['total_coding_solved'],0)
    d['medium_problem_ratio']=np.where(d['total_coding_solved']>0,d['Medium_Solved']/d['total_coding_solved'],0)
    d['weekly_study_hours']=d['Study_Hours']*7
    d['core_cs_average']=d[SKILLS].mean(axis=1)
    d['project_exists']=d.get('Project_ID',pd.Series(index=d.index,dtype=object)).notna().astype(int)
    d['project_difficulty_score']=d.get('Difficulty',pd.Series(index=d.index,dtype=object)).map({'Easy':1,'Medium':2,'Hard':3}).fillna(0)
    d['certification_exists']=d.get('Certification_ID',pd.Series(index=d.index,dtype=object)).notna().astype(int)
    d['internship_exists']=d.get('Internship_ID',pd.Series(index=d.index,dtype=object)).notna().astype(int)
    d['internship_duration_months']=pd.to_numeric(d.get('Duration',0),errors='coerce').fillna(0)
    return d
