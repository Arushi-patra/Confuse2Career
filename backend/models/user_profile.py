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
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    dream_company = Column(String)
    placement_date = Column(Date)
    daily_study_hours = Column(Integer)
    education = Column(String)
    updated_at = Column(DateTime(timezone=True))

    user = relationship(
        "User",
        back_populates="profile"
    )