from datetime import date


def calculate_days_remaining(placement_date: date) -> int:
    return max(
        (placement_date - date.today()).days,
        0
    )


def generate_roadmap(
    placement_date: date,
    target_role: str,
    dream_company: str,
    study_hours: float,
    skills: list[str]
):
    """
    Generates a personalized roadmap.

    This is initially rule-based.
    Later, replace this logic with your ML model.
    """

    normalized_skills = {
        skill.strip().lower()
        for skill in skills
    }

    days_remaining = calculate_days_remaining(
        placement_date
    )

    tasks = []

    day = 1

    # --------------------------------
    # Programming
    # --------------------------------

    if "python" not in normalized_skills:

        tasks.append({
            "title": "Python Fundamentals",
            "description": (
                "Learn Python syntax, "
                "functions, collections and OOP."
            ),
            "category": "Programming",
            "estimated_hours": study_hours,
            "day_number": day
        })

        day += 1

    # --------------------------------
    # DSA
    # --------------------------------

    tasks.extend([
        {
            "title": "Arrays and Strings",
            "description": (
                "Practice arrays, strings, "
                "hashing and common patterns."
            ),
            "category": "DSA",
            "estimated_hours": study_hours,
            "day_number": day
        },
        {
            "title": "Searching and Sorting",
            "description": (
                "Study binary search, "
                "sorting and related problems."
            ),
            "category": "DSA",
            "estimated_hours": study_hours,
            "day_number": day + 1
        },
        {
            "title": "Two Pointers and Sliding Window",
            "description": (
                "Practice important interview patterns."
            ),
            "category": "DSA",
            "estimated_hours": study_hours,
            "day_number": day + 2
        }
    ])

    day += 3

    # --------------------------------
    # Core CS
    # --------------------------------

    tasks.extend([
        {
            "title": "DBMS",
            "description": (
                "Study SQL, normalization, "
                "transactions and indexing."
            ),
            "category": "Core CS",
            "estimated_hours": study_hours,
            "day_number": day
        },
        {
            "title": "Operating Systems",
            "description": (
                "Study processes, threads, "
                "deadlocks and memory management."
            ),
            "category": "Core CS",
            "estimated_hours": study_hours,
            "day_number": day + 1
        },
        {
            "title": "Computer Networks",
            "description": (
                "Study HTTP, TCP/IP, DNS and networking basics."
            ),
            "category": "Core CS",
            "estimated_hours": study_hours,
            "day_number": day + 2
        }
    ])

    day += 3

    # --------------------------------
    # Development
    # --------------------------------

    if target_role.lower() in [
        "software developer",
        "backend developer",
        "full stack developer"
    ]:

        tasks.extend([
            {
                "title": "REST API Development",
                "description": (
                    "Learn REST APIs, HTTP methods "
                    "and API design."
                ),
                "category": "Development",
                "estimated_hours": study_hours,
                "day_number": day
            },
            {
                "title": "Git and GitHub",
                "description": (
                    "Practice Git workflow and GitHub."
                ),
                "category": "Development",
                "estimated_hours": study_hours,
                "day_number": day + 1
            }
        ])

        day += 2

    # --------------------------------
    # Interview
    # --------------------------------

    tasks.append({
        "title": f"{dream_company} Interview Preparation",
        "description": (
            f"Prepare technical and HR questions "
            f"for {dream_company}."
        ),
        "category": "Interview",
        "estimated_hours": study_hours,
        "day_number": day
    })

    return {
        "target_role": target_role,
        "dream_company": dream_company,
        "placement_date": placement_date.isoformat(),
        "days_remaining": days_remaining,
        "tasks": tasks
    }