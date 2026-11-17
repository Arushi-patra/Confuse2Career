# Leakage analysis

## Conservative exclusions

The target and direct identifiers are excluded. Resume/status fields are conservatively excluded because their very strong association with Overall_Status makes target construction/leakage plausible; this is a modeling safeguard, not proof of how the dataset was generated.

## Association check

- Year: correlation=0.062
- Study_Hours: correlation=0.911
- Easy_Solved: correlation=0.859
- Medium_Solved: correlation=0.859
- Hard_Solved: correlation=0.823
- Contest_Rating: correlation=0.879
- DBMS: correlation=0.904
- Operating_System: correlation=0.906
- Computer_Networks: correlation=0.900
- OOP: correlation=0.895
- SQL: correlation=0.894
- ATS_Score: correlation=0.960
- Grammar_Score: correlation=0.910
- Keywords_Matched: correlation=0.892
- days_until_placement_from_reference_date: correlation=-0.032
- weeks_until_placement: correlation=-0.032
- months_until_placement: correlation=-0.032
- total_coding_solved: correlation=0.884
- weighted_coding_score: correlation=0.884
- coding_volume: correlation=0.884
- hard_problem_ratio: correlation=0.626
- medium_problem_ratio: correlation=0.373
- weekly_study_hours: correlation=0.911
- core_cs_average: correlation=0.940
- project_exists: correlation=nan
- project_difficulty_score: correlation=-0.096
- certification_exists: correlation=nan
- internship_exists: correlation=nan
- internship_duration_months: correlation=nan