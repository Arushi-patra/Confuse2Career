import re, numpy as np, pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .config import MODELS, OUTPUTS

def _clean(x): return '' if pd.isna(x) else re.sub(r'\s+',' ',str(x)).strip()
def build_resources(wb):
    frames=[]
    if 'Courses' in wb:
        d=wb['Courses'].copy(); d['resource_type']='course'; d['resource_id']=d['Course_ID']; d['title']=d['Course_Name']; d['description']=d['Description']; d['skill']=d['Skills']; d['role']=d['Role']; d['difficulty']=d['Difficulty']; d['platform']=d['Platform']; d['duration']=d['Duration']; d['rating']=pd.to_numeric(d['Rating'].astype(str).str.extract(r'(\d+(?:\.\d+)?)')[0],errors='coerce'); d['url']=d['URL']; frames.append(d[['resource_id','resource_type','title','description','skill','role','difficulty','platform','duration','rating','url']])
    if 'YouTube' in wb:
        d=wb['YouTube'].copy(); d['resource_type']='youtube'; d['resource_id']=d['Video_ID']; d['title']=d['Video_Title']; d['description']=d['Description']; d['skill']=d['Skill']; d['role']=''; d['difficulty']=d['Difficulty']; d['platform']='YouTube'; d['duration']=d['Duration_Minutes']; d['rating']=np.nan; d['url']=d['URL']; frames.append(d[['resource_id','resource_type','title','description','skill','role','difficulty','platform','duration','rating','url']])
    if 'Projects' in wb:
        d=wb['Projects'].copy(); d['resource_type']='project'; d['resource_id']=d['Project_ID']; d['title']=d['Project_Name']; d['description']=d['Technology']; d['skill']=d['Technology']; d['role']=''; d['difficulty']=d['Difficulty']; d['platform']='GitHub'; d['duration']=''; d['rating']=np.nan; d['url']=d['GitHub_Link']; frames.append(d[['resource_id','resource_type','title','description','skill','role','difficulty','platform','duration','rating','url']])
    if not frames: return pd.DataFrame()
    r=pd.concat(frames,ignore_index=True).fillna(''); r['resource_text']=(r['title']+' '+r['description']+' '+r['skill']+' '+r['role']+' '+r['difficulty']+' '+r['platform']).map(_clean); r.to_csv(OUTPUTS/'resource_catalog.csv',index=False)
    vec=TfidfVectorizer(stop_words='english',ngram_range=(1,2),min_df=1); E=vec.fit_transform(r.resource_text); import joblib; joblib.dump(vec,MODELS/'resource_vectorizer.joblib'); joblib.dump(E,MODELS/'resource_tfidf.joblib'); return r

def recommend(catalog, query, skill='', role='', difficulty='Intermediate', resource_type=None):
    import joblib
    vec=joblib.load(MODELS/'resource_vectorizer.joblib'); E=joblib.load(MODELS/'resource_tfidf.joblib'); q=vec.transform([query]); sem=cosine_similarity(q,E).ravel()
    skill_alias={'operating_system':'operating systems','computer_networks':'computer networks','dbms':'dbms','oop':'oop','sql':'sql'}
    skill_q=skill_alias.get(str(skill).strip().lower(),str(skill).strip().lower())
    skill_s=catalog.skill.astype(str).str.lower().apply(lambda x: 1.0 if skill_q and skill_q in x else 0.0).to_numpy()
    role_s=catalog.role.astype(str).str.lower().apply(lambda x: 1.0 if role.lower() and role.lower() in x else 0.0).to_numpy()
    diff_s=catalog.difficulty.astype(str).str.lower().apply(lambda x: 1.0 if difficulty.lower() in x else (0.5 if 'not specified' in x else 0.0)).to_numpy()
    quality=pd.to_numeric(catalog.rating,errors='coerce').fillna(0).to_numpy()/5.0
    score=.40*sem+.20*skill_s+.15*role_s+.10*diff_s+.10*0+.05*quality
    # If the resource catalog has an explicit skill match, only rank within that relevant subset.
    if skill_s.sum()>0: score=np.where(skill_s>0,score,-1.0)
    if resource_type is not None: score=np.where(catalog.resource_type.eq(resource_type).to_numpy(),score,-1.0)
    i=int(np.argmax(score)); out=catalog.iloc[i].to_dict(); out['semantic_similarity']=float(sem[i]); out['final_resource_score']=float(score[i]); return out
