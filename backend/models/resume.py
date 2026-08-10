from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Resume content
    summary = Column(Text)

    education = Column(Text)

    experience = Column(Text)

    projects = Column(Text)

    skills = Column(Text)

    certifications = Column(Text)
    
    resume_content = Column(Text)

    ats_score = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True))

    updated_at = Column(DateTime(timezone=True))

    user = relationship("User")