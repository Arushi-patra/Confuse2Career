from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileCreateUpdate(BaseModel):

    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None

    placement_date: Optional[date] = None

    daily_study_hours: Optional[int] = Field(
        default=None,
        ge=1,
        le=24
    )

    dream_company: Optional[str] = None
    target_role: Optional[str] = None

    github_link: Optional[str] = None

    coding_platform: Optional[str] = None
    coding_link: Optional[str] = None

    resume_file_name: Optional[str] = None


class ProfileResponse(ProfileCreateUpdate):

    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )



# from datetime import date, datetime
# from typing import Optional

# from pydantic import BaseModel, ConfigDict, Field


# class ProfileCreateUpdate(BaseModel):
#     college: Optional[str] = None
#     branch: Optional[str] = None
#     year: Optional[str] = None

#     placement_date: Optional[date] = None
#     daily_study_hours: Optional[int] = Field(
#         default=None,
#         ge=1,
#         le=24,
#     )

#     dream_company: Optional[str] = None
#     target_role: Optional[str] = None

#     github_link: Optional[str] = None

#     coding_platform: Optional[str] = None
#     coding_link: Optional[str] = None

#     resume_file_name: Optional[str] = None


# class ProfileResponse(ProfileCreateUpdate):
#     id: int
#     user_id: int
#     updated_at: Optional[datetime] = None

#     model_config = ConfigDict(from_attributes=True)
