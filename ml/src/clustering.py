import pandas as pd, numpy as np, joblib
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from .config import MODELS, OUTPUTS, RANDOM_STATE

def build(df):
    d=df.copy(); d['total_coding_solved']=d[['Easy_Solved','Medium_Solved','Hard_Solved']].sum(axis=1); d['project_level']=d['Difficulty'].map({'Easy':1,'Medium':2,'Hard':3}).fillna(0); d['cert']=d['Certification_ID'].notna().astype(int); d['intern']=d['Internship_ID'].notna().astype(int)
    cols=['total_coding_solved','Contest_Rating','DBMS','Operating_System','Computer_Networks','OOP','SQL','Study_Hours','project_level','cert','intern','ATS_Score']; X=d[cols].fillna(d[cols].median())
    scaler=StandardScaler(); Z=scaler.fit_transform(X); scores=[]
    for k in range(2,9):
        km=KMeans(n_clusters=k,n_init=20,random_state=RANDOM_STATE); lab=km.fit_predict(Z); scores.append({'k':k,'inertia':km.inertia_,'silhouette':silhouette_score(Z,lab)})
    ev=pd.DataFrame(scores); ev.to_csv(OUTPUTS/'cluster_selection.csv',index=False); k=int(ev.loc[ev.silhouette.idxmax(),'k']); km=KMeans(n_clusters=k,n_init=20,random_state=RANDOM_STATE).fit(Z); d['cluster']=km.labels_
    prof=d.groupby('cluster')[cols].mean(); prof.to_csv(OUTPUTS/'cluster_profiles.csv'); joblib.dump({'scaler':scaler,'model':km,'features':cols},MODELS/'student_segmentation_model.joblib')
    return ev,prof
