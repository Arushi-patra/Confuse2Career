import pandas as pd
from pathlib import Path

def load_workbook(path):
    return pd.read_excel(path, sheet_name=None)

def normalize_columns(df):
    out=df.copy(); out.columns=[str(c).strip() for c in out.columns]; return out

def load(path):
    wb=load_workbook(path); return {k:normalize_columns(v) for k,v in wb.items()}
