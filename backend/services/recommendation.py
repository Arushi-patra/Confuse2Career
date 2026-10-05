from sqlalchemy.orm import Session

from models.resource import Resource


def recommend_resources(
    db: Session,
    skills: list[str],
    platform: str | None = None,
    resource_type: str | None = None,
    limit: int = 10
):

    normalized_skills = {
        skill.lower().strip()
        for skill in skills
    }

    resources = (
        db.query(Resource)
        .all()
    )

    recommendations = []

    for resource in resources:

        resource_skill = (
            resource.skill.lower().strip()
            if resource.skill
            else ""
        )

        if (
            resource_skill
            not in normalized_skills
        ):
            continue

        if (
            platform
            and resource.platform.lower()
            != platform.lower()
        ):
            continue

        if (
            resource_type
            and resource.resource_type.lower()
            != resource_type.lower()
        ):
            continue

        recommendations.append(resource)

    recommendations.sort(
        key=lambda x: (
            x.rating
            if x.rating is not None
            else 0
        ),
        reverse=True
    )

    return recommendations[:limit]