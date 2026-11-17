import sys, json, pandas as pd, numpy as np
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from src.config import REPORTS, OUTPUTS, MODELS
comp=pd.read_csv(REPORTS/'model_comparison.csv')
meta=json.load(open(MODELS/'model_metadata.json'))
cat=pd.read_csv(OUTPUTS/'resource_catalog.csv')
lines=['# Final Model Report\n','## Dataset\n','The final workbook contains 1,500 student records in `Master_Students` and 500 records in each resource/opportunity sheet.\n', '## Target\n','`Overall_Status` is modeled as historical preparation status, not placement outcome.\n','## Leakage prevention\n','Identifiers are excluded. Resume/status fields are conservatively excluded from the readiness classifier because of very strong association with the target and possible target-construction leakage.\n','## Model comparison\n',comp.to_markdown(index=False),'\n## Selected model\n',f"**{meta['model_name']}** selected by cross-validated Macro F1.\n",'## Recommendation system\n',f"Resource catalog contains {len(cat)} rows across courses, YouTube videos, and projects. URLs are taken from the workbook only. Exact skill matches are preferred before semantic ranking.\n",'## Roadmap\n','Roadmap hours are capped by days remaining × daily study hours.\n','## Limitations\n','No historical click/completion labels for resources are present, so recommendation Precision@K/Recall@K/NDCG/MRR are not claimed. Company-role profiles are historical dataset patterns, not official hiring requirements.\n']
(REPORTS/'final_model_report.md').write_text('\n'.join(lines),encoding='utf8')
