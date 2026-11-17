import json, joblib, numpy as np, pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from .config import RANDOM_STATE, TARGET, MODELS, REPORTS

def train(df, excluded):
    y=df[TARGET].astype(str); drop=[c for c in excluded if c in df.columns]; X=df.drop(columns=drop)
    X=X.drop(columns=[c for c in ['Placement_Date'] if c in X])
    num=X.select_dtypes(include=np.number).columns.tolist(); cat=[c for c in X.columns if c not in num]
    pre=ColumnTransformer([('num',Pipeline([('imp',SimpleImputer(strategy='median')),('sc',StandardScaler())]),num),('cat',Pipeline([('imp',SimpleImputer(strategy='most_frequent')),('oh',OneHotEncoder(handle_unknown='ignore',sparse_output=False))]),cat)])
    models={'Dummy':DummyClassifier(strategy='most_frequent',random_state=RANDOM_STATE),'LogisticRegression':LogisticRegression(max_iter=3000,class_weight='balanced',random_state=RANDOM_STATE),'RandomForest':RandomForestClassifier(n_estimators=500,min_samples_leaf=2,class_weight='balanced',random_state=RANDOM_STATE,n_jobs=-1),'ExtraTrees':ExtraTreesClassifier(n_estimators=500,min_samples_leaf=2,class_weight='balanced',random_state=RANDOM_STATE,n_jobs=-1)}
    try: models['HistGradientBoosting']=HistGradientBoostingClassifier(max_iter=250,random_state=RANDOM_STATE)
    except: pass
    Xt,Xv,yt,yv=train_test_split(X,y,test_size=.2,stratify=y,random_state=RANDOM_STATE)
    cv=StratifiedKFold(5,shuffle=True,random_state=RANDOM_STATE); rows=[]
    scoring={'accuracy':'accuracy','macro_precision':'precision_macro','macro_recall':'recall_macro','macro_f1':'f1_macro','weighted_f1':'f1_weighted'}
    for name,model in models.items():
        pipe=Pipeline([('pre',pre),('model',model)])
        try:
            z=cross_validate(pipe,Xt,yt,cv=cv,scoring=scoring,n_jobs=1,error_score='raise')
            row={'model':name,**{k:float(np.mean(z['test_'+k])) for k in scoring}}
            rows.append(row)
        except Exception as e: rows.append({'model':name,'error':str(e)})
    comp=pd.DataFrame(rows); comp.to_csv(REPORTS/'model_comparison.csv',index=False)
    valid=comp.dropna(subset=['macro_f1']); best=valid.sort_values('macro_f1',ascending=False).iloc[0]['model']
    eval_pipe=Pipeline([('pre',pre),('model',models[best])]); eval_pipe.fit(Xt,yt); pred=eval_pipe.predict(Xv)
    pd.DataFrame(confusion_matrix(yv,pred),index=sorted(y.unique()),columns=sorted(y.unique())).to_csv(REPORTS/'confusion_matrix.csv')
    with open(REPORTS/'classification_report.txt','w') as f: f.write(classification_report(yv,pred,zero_division=0))
    # Refit the selected pipeline on all labeled data for production inference after unbiased test evaluation.
    final=Pipeline([('pre',pre),('model',models[best])]); final.fit(X,y)
    joblib.dump(final,MODELS/'preparation_status_model.joblib')
    # Model-agnostic feature influence on the held-out test set.
    from sklearn.inspection import permutation_importance
    pi=permutation_importance(eval_pipe,Xv,yv,n_repeats=5,random_state=RANDOM_STATE,scoring='f1_macro')
    imp=pd.DataFrame({'feature':X.columns,'importance_mean':0.0,'importance_std':0.0})
    # permutation_importance sees raw columns at pipeline level.
    for i,c in enumerate(X.columns): imp.loc[i,'importance_mean']=float(pi.importances_mean[i]); imp.loc[i,'importance_std']=float(pi.importances_std[i])
    imp.sort_values('importance_mean',ascending=False).to_csv(REPORTS/'feature_importance.csv',index=False)
    meta={'model_name':best,'training_rows':len(X),'heldout_test_rows':len(Xv),'features_used':X.columns.tolist(),'target':TARGET,'cv_results':comp.to_dict('records'),'random_state':RANDOM_STATE}
    json.dump(meta,open(MODELS/'model_metadata.json','w'),indent=2,default=str)
    return best,comp
