import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from src.config import DATA, REPORTS, OUTPUTS, MODELS
from src.data_loader import load
from src.feature_engineering import clean_master, engineer
from src.leakage_detection import analyze
from src.readiness_model import train
from src.profiles import build_profiles
from src.clustering import build as build_clusters
from src.recommender import build_resources
for d in [REPORTS,OUTPUTS,MODELS]: d.mkdir(exist_ok=True)
wb=load(DATA); master=engineer(clean_master(wb['Master_Students']),reference_date='2026-01-01')
excluded,txt=analyze(master); (REPORTS/'leakage_analysis.md').write_text(txt,encoding='utf8')
print('Training readiness model...'); best,comp=train(master,excluded); print(comp.to_string(index=False)); print('Best:',best)
print('Building profiles...'); build_profiles(master)
print('Building clusters...'); ev,prof=build_clusters(master); print(ev.to_string(index=False)); print('Selected K:',len(prof))
print('Building resource catalog...'); cat=build_resources(wb); print('Resources:',len(cat))
print('Training complete.')
