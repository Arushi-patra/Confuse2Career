import sys, json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parents[1]))
from src.inference import generate_career_plan
if __name__=='__main__':
    p={'placement_date':input('Placement Date (YYYY-MM-DD): ').strip(),'study_hours':float(input('Daily Study Hours: ').strip()),'dream_company':input('Dream Company: ').strip(),'dream_role':input('Dream Role: ').strip(),'skills':{}}
    print(json.dumps(generate_career_plan(p),indent=2,default=str))
