def convert_ml_response_to_tasks(ml_result):
    """
    Converts the weekly roadmap returned by the ML service
    into the task structure supported by the existing database.
    """

    ml_weeks = ml_result.get("roadmap", [])

    converted_tasks = []

    day_number = 1

    for week_data in ml_weeks:

        week_number = week_data.get("week", 1)

        week_tasks = week_data.get("tasks", [])

        for task in week_tasks:

            skill = task.get("skill", "General Preparation")

            priority = task.get("priority", "Medium")

            estimated_hours = float(
                task.get("estimated_hours", 1)
            )

            resource = task.get("best_resource") or {}

            resource_title = resource.get("title")
            resource_type = resource.get("resource_type")
            resource_url = resource.get("url")
            resource_score = resource.get("final_resource_score")

            # Build task description.
            description_parts = [
                f"Improve your {skill} skills.",
                f"Priority: {priority}.",
                f"Scheduled for Week {week_number}."
            ]

            # Add recommended resource information.
            if resource_title:

                description_parts.append(
                    f"Recommended Resource: {resource_title}"
                )

            if resource_type:

                description_parts.append(
                    f"Resource Type: {resource_type}"
                )

            if resource_url:

                description_parts.append(
                    f"Resource URL: {resource_url}"
                )

            if resource_score is not None:

                description_parts.append(
                    f"Recommendation Score: {resource_score}"
                )

            description = " ".join(description_parts)

            converted_task = {

                "title": skill,

                "description": description,

                "category": f"{priority} Priority",

                "estimated_hours": estimated_hours,

                "day_number": day_number

            }

            converted_tasks.append(converted_task)

            day_number += 1

    return converted_tasks