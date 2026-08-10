from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    skill_name = Column(String, nullable=False)

    # Skill rating from 0 to 100
    skill_score = Column(Float, default=0)

    # beginner / intermediate / advanced
    level = Column(String, default="beginner")

    user = relationship("User")