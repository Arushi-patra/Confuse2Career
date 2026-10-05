def validate_score(score: float) -> float:

    return max(
        0,
        min(100, score)
    )


def calculate_readiness(
    dsa: float,
    development: float,
    aptitude: float,
    resume: float,
    interview: float
):

    scores = [
        validate_score(dsa),
        validate_score(development),
        validate_score(aptitude),
        validate_score(resume),
        validate_score(interview)
    ]

    return round(
        sum(scores) / len(scores),
        2
    )


def get_level(score: float):

    if score < 40:
        return "Beginner"

    if score < 70:
        return "Intermediate"

    if score < 85:
        return "Advanced"

    return "Placement Ready"