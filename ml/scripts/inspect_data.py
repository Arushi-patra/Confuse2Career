import sys, json, pandas as pd, numpy as np
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from src.config import DATA, REPORTS
from src.data_loader import load
from src.feature_engineering import clean_master
wb=load(DATA); REPORTS.mkdir(exist_ok=True)
rows=[]
for s,d in wb.items():
    for c in d.columns:
        rows.append({'sheet':s,'column_name':c,'data_type':str(d[c].dtype),'missing_count':int(d[c].isna().sum()),'missing_percentage':round(float(d[c].isna().mean()*100),2),'unique_count':int(d[c].nunique(dropna=True)),'example_values':' | '.join(d[c].dropna().astype(str).head(3).tolist()),'role_in_model':'inspect'})
pd.DataFrame(rows).to_csv(REPORTS/'data_dictionary.csv',index=False)
html=['<html><body><h1>Confused2Career Data Quality Report</h1>']
for s,d in wb.items(): html.append(f'<h2>{s}: {len(d)} rows × {len(d.columns)} columns</h2>'); html.append(d.head(5).to_html(index=False))
html.append('</body></html>'); (REPORTS/'data_quality_report.html').write_text('\n'.join(html),encoding='utf8')
with open(REPORTS/'workbook_summary.json','w') as f: json.dump({s:{'rows':len(d),'columns':len(d.columns)} for s,d in wb.items()},f,indent=2)
print(json.dumps({s:d.shape for s,d in wb.items()},indent=2))
