import httpx

from fastapi import HTTPException

from core.config import settings


def generate_ml_career_plan(
    placement_date,
    target_role,
    dream_company,
    study_hours,
    skills=None
):
    """
    Sends student information to the ML microservice
    and returns the generated career plan.
    """

    ml_url = settings.ML_SERVICE_URL.rstrip("/")

    payload = {
        "placement_date": placement_date.isoformat(),

        "study_hours": float(study_hours),

        "dream_company": dream_company,

        "dream_role": target_role,

        # The current backend accepts skill names,
        # whereas ML requires numeric skill scores.
        # Until numeric scores are connected, use an
        # empty dictionary so ML uses historical medians.
        "skills": {}
    }

    try:

        response = httpx.post(
            f"{ml_url}/career-plan",
            json=payload,
            timeout=60.0
        )

        response.raise_for_status()

        result = response.json()

        if "roadmap" not in result:
            raise HTTPException(
                status_code=502,
                detail="ML service returned an invalid roadmap."
            )

        return result

    except httpx.ConnectError:

        raise HTTPException(
            status_code=503,
            detail="ML service is unavailable. Please start the ML server."
        )

    except httpx.TimeoutException:

        raise HTTPException(
            status_code=504,
            detail="ML service took too long to respond."
        )

    except httpx.HTTPStatusError as error:

        raise HTTPException(
            status_code=502,
            detail=(
                f"ML service returned an error: "
                f"{error.response.status_code}"
            )
        )

    except HTTPException:
        raise

    except Exception as error:

        print("ML CLIENT ERROR:", error)

        raise HTTPException(
            status_code=502,
            detail="Unable to process the ML-generated career plan."
        )