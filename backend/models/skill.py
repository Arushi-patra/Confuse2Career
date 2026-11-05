from sqlalchemy import Column, Float, Integer, String

from core.database import Base


class SkillAnalysis(Base):
    __tablename__ = "skill_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        index=True,
        nullable=False
    )

    dsa = Column(Float, nullable=False)
    development = Column(Float, nullable=False)
    aptitude = Column(Float, nullable=False)
    resume = Column(Float, nullable=False)
    interview = Column(Float, nullable=False)

    career_readiness_score = Column(
        Float,
        nullable=False
    )

    level = Column(
        String,
        nullable=False
    )





# from sqlalchemy import Column, Float, ForeignKey, Integer, String
# from sqlalchemy.orm import relationship

# from core.database import Base


# class Skill(Base):
#     __tablename__ = "skills"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False
#     )

#     skill_name = Column(String, nullable=False)

#     # Skill rating from 0 to 100
#     skill_score = Column(Float, default=0)

#     # beginner / intermediate / advanced
#     level = Column(String, default="beginner")

#     user = relationship("User")