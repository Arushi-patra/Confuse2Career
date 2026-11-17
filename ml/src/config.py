from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT/'data'/'raw'/'Confused2Career_Data_1500.xlsx'
MODELS = ROOT/'models'; OUTPUTS=ROOT/'outputs'; REPORTS=ROOT/'reports'; PROCESSED=ROOT/'data'/'processed'
RANDOM_STATE=42
TARGET='Overall_Status'
IDENTIFIERS={'Student_ID','Name','Email'}
SKILLS=['DBMS','Operating_System','Computer_Networks','OOP','SQL']
