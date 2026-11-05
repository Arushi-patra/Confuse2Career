from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.user_profile import UserProfile

from schemas.profile import (
    ProfileCreateUpdate,
    ProfileResponse,
)


router = APIRouter(tags=["Profile"])


@router.get(
    "/profile",
    response_model=ProfileResponse
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    profile = (
        db.query(UserProfile)
        .filter(
            UserProfile.user_id == current_user.id
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Please complete your profile."
        )

    return profile


@router.put(
    "/profile",
    response_model=ProfileResponse
)
def save_or_update_profile(
    payload: ProfileCreateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    profile = (
        db.query(UserProfile)
        .filter(
            UserProfile.user_id == current_user.id
        )
        .first()
    )

    if profile is None:

        profile = UserProfile(
            user_id=current_user.id
        )

        db.add(profile)

    profile_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in profile_data.items():

        setattr(
            profile,
            field,
            value
        )

    profile.updated_at = datetime.now(timezone.utc)

    try:

        db.commit()
        db.refresh(profile)

    except Exception as error:

        db.rollback()

        print("PROFILE SAVE ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to save profile."
        )

    return profile


# from datetime import datetime, timezone

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from core.database import get_db
# from core.deps import get_current_user

# from models.user import User
# from models.user_profile import UserProfile

# from schemas.profile import (
#     ProfileCreateUpdate,
#     ProfileResponse,
# )


# router = APIRouter(tags=["Profile"])


# @router.get("/profile", response_model=ProfileResponse)
# def get_profile(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """
#     Retrieve the profile of the currently logged-in user.
#     """

#     profile = (
#         db.query(UserProfile)
#         .filter(UserProfile.user_id == current_user.id)
#         .first()
#     )

#     if not profile:
#         raise HTTPException(
#             status_code=404,
#             detail="Profile not found. Please complete your profile.",
#         )

#     return profile


# @router.put("/profile", response_model=ProfileResponse)
# def save_or_update_profile(
#     payload: ProfileCreateUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """
#     Create a profile if one does not exist.
#     Otherwise, update the existing profile.
#     """

#     profile = (
#         db.query(UserProfile)
#         .filter(UserProfile.user_id == current_user.id)
#         .first()
#     )

#     if profile is None:
#         profile = UserProfile(
#             user_id=current_user.id,
#         )
#         db.add(profile)

#     profile_data = payload.model_dump(exclude_unset=True)

#     for field, value in profile_data.items():
#         setattr(profile, field, value)

#     profile.updated_at = datetime.now(timezone.utc)

#     try:
#         db.commit()
#         db.refresh(profile)

#     except Exception:
#         db.rollback()
#         raise HTTPException(
#             status_code=500,
#             detail="Unable to save profile.",
#         )

#     return profile