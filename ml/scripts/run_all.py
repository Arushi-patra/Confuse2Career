import subprocess,sys
from pathlib import Path
root=Path(__file__).parents[1]
for s in ['inspect_data.py','train.py','build_report.py']:
    subprocess.run([sys.executable,str(root/'scripts'/s)],check=True)
print('All pipeline stages completed.')
