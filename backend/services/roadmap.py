from datetime import date


def calculate_days_remaining(placement_date: date) -> int:
    return max((placement_date - date.today()).days, 1)


def generate_roadmap(
    placement_date: date,
    target_role: str,
    dream_company: str,
    study_hours: float,
    skills: list[str],
    skill_level: str = "Beginner"
):
    days_remaining = calculate_days_remaining(placement_date)

    normalized_skills = {
        skill.strip().lower()
        for skill in skills
    }

    role = target_role.strip().lower()

    tasks = []

    def add_task(title, description, category, day):
        tasks.append({
            "title": title,
            "description": description,
            "category": category,
            "estimated_hours": round(study_hours, 1),
            "day_number": day
        })

    # 1. Programming foundations
    if skill_level == "Beginner":
        if not any(skill in normalized_skills for skill in ["python", "java", "c++"]):
            add_task(
                "Programming Fundamentals",
                "Learn variables, loops, functions, arrays and basic problem solving.",
                "Programming",
                1
            )

    # 2. DSA preparation
    dsa_topics = [
        ("Arrays and Strings",
         "Practice array traversal, string manipulation and hashing."),
        ("Searching and Sorting",
         "Learn linear search, binary search and sorting algorithms."),
        ("Linked Lists, Stacks and Queues",
         "Understand common linear data structures and their applications."),
        ("Trees and Graphs",
         "Practice tree traversal, graph traversal and basic graph problems."),
        ("Dynamic Programming",
         "Learn recursion, memoization and tabulation.")
    ]

    # Adjust the starting point according to skill level.
    if skill_level == "Beginner":
        selected_dsa = dsa_topics[:3]
    elif skill_level == "Intermediate":
        selected_dsa = dsa_topics[1:5]
    else:
        selected_dsa = dsa_topics[2:5]

    day = len(tasks) + 1

    for title, description in selected_dsa:
        add_task(title, description, "DSA", day)
        day += 1

    # 3. Core computer science
    core_topics = [
        ("DBMS and SQL",
         "Study normalization, joins, transactions and SQL queries."),
        ("Operating Systems",
         "Study processes, threads, deadlocks and memory management."),
        ("Computer Networks",
         "Study TCP/IP, HTTP, DNS and networking fundamentals."),
        ("Object Oriented Programming",
         "Revise classes, objects, inheritance, polymorphism and abstraction.")
    ]

    for title, description in core_topics:
        add_task(title, description, "Core CS", day)
        day += 1

    # 4. Role-specific preparation
    if "data analyst" in role:
        role_topics = [
            ("Advanced SQL", "Practice joins, subqueries, CTEs and window functions."),
            ("Python for Data Analysis", "Learn Pandas, NumPy and data cleaning."),
            ("Power BI and Data Visualization", "Build dashboards and interpret business data.")
        ]

    elif "data scientist" in role or "ai/ml" in role:
        role_topics = [
            ("Python for Data Science", "Practice NumPy, Pandas and data preprocessing."),
            ("Machine Learning Fundamentals", "Study regression, classification and clustering."),
            ("Model Evaluation", "Learn accuracy, precision, recall and model validation.")
        ]

    elif "cloud" in role:
        role_topics = [
            ("Cloud Computing Fundamentals", "Study cloud models and service types."),
            ("Cloud Platforms", "Explore AWS, Azure or Google Cloud fundamentals."),
            ("Deployment and DevOps", "Learn deployment, CI/CD and container basics.")
        ]

    elif "cybersecurity" in role:
        role_topics = [
            ("Networking and Security", "Study network protocols and security fundamentals."),
            ("Cybersecurity Fundamentals", "Learn common vulnerabilities and security controls."),
            ("Security Tools and Practices", "Explore security monitoring and basic testing.")
        ]

    else:
        role_topics = [
            ("REST API Development", "Learn HTTP methods, REST principles and API testing."),
            ("Git and GitHub", "Practice version control, branching and collaboration."),
            ("Projects and Deployment", "Build and deploy a practical development project.")
        ]

    for title, description in role_topics:
        add_task(title, description, "Role Preparation", day)
        day += 1

    # 5. Placement preparation
    placement_topics = [
        ("Aptitude Preparation",
         "Practice quantitative aptitude, logical reasoning and verbal ability."),
        ("Resume Preparation",
         "Improve your resume with projects, skills and measurable achievements."),
        ("Technical Interview Preparation",
         "Practice technical questions related to your target role."),
        ("Company-Specific Preparation",
         f"Research {dream_company}, its hiring process and commonly tested topics."),
        ("Mock Interviews",
         "Practice technical and HR interview questions.")
    ]

    for title, description in placement_topics:
        add_task(title, description, "Placement Preparation", day)
        day += 1

    # Keep the roadmap within the available preparation period.
    tasks = [
        task for task in tasks
        if task["day_number"] <= days_remaining
    ]

    # Ensure at least one task is returned.
    if not tasks:
        add_task(
            "Placement Revision",
            f"Revise important topics and prepare for your {dream_company} placement.",
            "Placement Preparation",
            1
        )

    return {
        "target_role": target_role,
        "dream_company": dream_company,
        "placement_date": placement_date.isoformat(),
        "days_remaining": days_remaining,
        "study_hours": study_hours,
        "skill_level": skill_level,
        "tasks": tasks
    }




# from datetime import date


# def calculate_days_remaining(placement_date: date) -> int:
#     return max(
#         (placement_date - date.today()).days,
#         0
#     )


# def generate_roadmap(
#     placement_date: date,
#     target_role: str,
#     dream_company: str,
#     study_hours: float,
#     skills: list[str]
# ):
#     """
#     Generates a personalized roadmap.

#     This is initially rule-based.
#     Later, replace this logic with your ML model.
#     """

#     normalized_skills = {
#         skill.strip().lower()
#         for skill in skills
#     }

#     days_remaining = calculate_days_remaining(
#         placement_date
#     )

#     tasks = []

#     day = 1

#     # --------------------------------
#     # Programming
#     # --------------------------------

#     if "python" not in normalized_skills:

#         tasks.append({
#             "title": "Python Fundamentals",
#             "description": (
#                 "Learn Python syntax, "
#                 "functions, collections and OOP."
#             ),
#             "category": "Programming",
#             "estimated_hours": study_hours,
#             "day_number": day
#         })

#         day += 1

#     # --------------------------------
#     # DSA
#     # --------------------------------

#     tasks.extend([
#         {
#             "title": "Arrays and Strings",
#             "description": (
#                 "Practice arrays, strings, "
#                 "hashing and common patterns."
#             ),
#             "category": "DSA",
#             "estimated_hours": study_hours,
#             "day_number": day
#         },
#         {
#             "title": "Searching and Sorting",
#             "description": (
#                 "Study binary search, "
#                 "sorting and related problems."
#             ),
#             "category": "DSA",
#             "estimated_hours": study_hours,
#             "day_number": day + 1
#         },
#         {
#             "title": "Two Pointers and Sliding Window",
#             "description": (
#                 "Practice important interview patterns."
#             ),
#             "category": "DSA",
#             "estimated_hours": study_hours,
#             "day_number": day + 2
#         }
#     ])

#     day += 3

#     # --------------------------------
#     # Core CS
#     # --------------------------------

#     tasks.extend([
#         {
#             "title": "DBMS",
#             "description": (
#                 "Study SQL, normalization, "
#                 "transactions and indexing."
#             ),
#             "category": "Core CS",
#             "estimated_hours": study_hours,
#             "day_number": day
#         },
#         {
#             "title": "Operating Systems",
#             "description": (
#                 "Study processes, threads, "
#                 "deadlocks and memory management."
#             ),
#             "category": "Core CS",
#             "estimated_hours": study_hours,
#             "day_number": day + 1
#         },
#         {
#             "title": "Computer Networks",
#             "description": (
#                 "Study HTTP, TCP/IP, DNS and networking basics."
#             ),
#             "category": "Core CS",
#             "estimated_hours": study_hours,
#             "day_number": day + 2
#         }
#     ])

#     day += 3

#     # --------------------------------
#     # Development
#     # --------------------------------

#     if target_role.lower() in [
#         "software developer",
#         "backend developer",
#         "full stack developer"
#     ]:

#         tasks.extend([
#             {
#                 "title": "REST API Development",
#                 "description": (
#                     "Learn REST APIs, HTTP methods "
#                     "and API design."
#                 ),
#                 "category": "Development",
#                 "estimated_hours": study_hours,
#                 "day_number": day
#             },
#             {
#                 "title": "Git and GitHub",
#                 "description": (
#                     "Practice Git workflow and GitHub."
#                 ),
#                 "category": "Development",
#                 "estimated_hours": study_hours,
#                 "day_number": day + 1
#             }
#         ])

#         day += 2

#     # --------------------------------
#     # Interview
#     # --------------------------------

#     tasks.append({
#         "title": f"{dream_company} Interview Preparation",
#         "description": (
#             f"Prepare technical and HR questions "
#             f"for {dream_company}."
#         ),
#         "category": "Interview",
#         "estimated_hours": study_hours,
#         "day_number": day
#     })

#     return {
#         "target_role": target_role,
#         "dream_company": dream_company,
#         "placement_date": placement_date.isoformat(),
#         "days_remaining": days_remaining,
#         "tasks": tasks
#     }