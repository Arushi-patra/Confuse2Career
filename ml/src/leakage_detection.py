import pandas as pd

def analyze(df,target='Overall_Status'):
    lines=['# Leakage analysis\n','## Conservative exclusions\n']
    excluded=['Student_ID','Name','Email',target,'ATS_Score','Grammar_Score','Keywords_Matched','Resume_Format','Status_x','Status_y',
        # row-level IDs / free text / links: no predictive meaning, only noise or memorisation
        'Project_ID','Project_Name','GitHub_Link','Certification_ID','Certification_Name','Internship_ID','Resume_ID',
        'project_exists','certification_exists','internship_exists']
    lines.append('The target and direct identifiers are excluded. Resume/status fields are conservatively excluded because their very strong association with Overall_Status makes target construction/leakage plausible; this is a modeling safeguard, not proof of how the dataset was generated.\n')
    lines.append('## Association check\n')
    if target in df:
        y=df[target].map({'Needs Improvement':0,'Average':1,'Good':2,'Excellent':3})
        for c in df.select_dtypes('number').columns:
            if c!=target: lines.append(f'- {c}: correlation={df[c].corr(y):.3f}')
    return excluded,'\n'.join(lines)
