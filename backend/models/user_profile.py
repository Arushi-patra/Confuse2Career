from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    year = Column(String, nullable=True)

    placement_date = Column(Date, nullable=True)
    daily_study_hours = Column(Integer, nullable=True)

    dream_company = Column(String, nullable=True)
    target_role = Column(String, nullable=True)

    github_link = Column(String, nullable=True)

    coding_platform = Column(String, nullable=True)
    coding_link = Column(String, nullable=True)

    resume_file_name = Column(String, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship(
        "User",
        back_populates="profile",
    )


# from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
# from sqlalchemy.orm import relationship

# from core.database import Base


# class UserProfile(Base):
#     __tablename__ = "user_profiles"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False
#     )

#     dream_company = Column(String)
#     placement_date = Column(Date)
#     daily_study_hours = Column(Integer)
#     education = Column(String)
#     updated_at = Column(DateTime(timezone=True))

#     user = relationship(
#         "User",
#         back_populates="profile"
#     )



# from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
# from sqlalchemy.orm import relationship

# from core.database import Base


# class UserProfile(Base):
#     __tablename__ = "user_profiles"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False
#     )

#     dream_company = Column(String)
#     placement_date = Column(Date)
#     daily_study_hours = Column(Integer)
#     education = Column(String)
#     updated_at = Column(DateTime(timezone=True))

#     user = relationship(
#         "User",
#         back_populates="profile"
#     )