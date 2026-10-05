ROLE_KEYWORDS = {

    "software developer": [
        "python",
        "java",
        "c++",
        "dsa",
        "data structures",
        "algorithms",
        "sql",
        "oops",
        "dbms",
        "operating systems",
        "computer networks",
        "git",
        "github",
        "api",
        "rest"
    ],

    "backend developer": [
        "python",
        "java",
        "sql",
        "api",
        "rest",
        "fastapi",
        "django",
        "node",
        "postgresql",
        "mysql",
        "git",
        "github"
    ],

    "data analyst": [
        "python",
        "sql",
        "excel",
        "power bi",
        "tableau",
        "statistics",
        "pandas",
        "numpy"
    ],

    "ai engineer": [
        "python",
        "machine learning",
        "deep learning",
        "nlp",
        "tensorflow",
        "pytorch",
        "scikit-learn",
        "pandas",
        "numpy",
        "sql"
    ]
}


def analyze_resume(
    resume_text: str,
    target_role: str
):

    text = resume_text.lower()

    keywords = ROLE_KEYWORDS.get(
        target_role.lower(),
        ROLE_KEYWORDS["software developer"]
    )

    matched = []

    missing = []

    for keyword in keywords:

        if keyword.lower() in text:
            matched.append(keyword)
        else:
            missing.append(keyword)

    total = len(keywords)

    score = (
        len(matched) / total * 100
        if total > 0
        else 0
    )

    suggestions = []

    if missing:

        suggestions.append(
            "Consider adding relevant missing "
            "technical keywords."
        )

    if "github" in missing:

        suggestions.append(
            "Add your GitHub profile or projects."
        )

    if "sql" in missing:

        suggestions.append(
            "Mention SQL/database experience "
            "if applicable."
        )

    if "api" in missing:

        suggestions.append(
            "Mention API/REST API experience "
            "if applicable."
        )

    return {
        "ats_score": round(score, 2),
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": suggestions
    }