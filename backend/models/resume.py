
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    String,
    JSON,
    func,
)
from sqlalchemy.orm import relationship

from core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Resume information
    summary = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    resume_content = Column(Text, nullable=True)

    # Analysis information
    target_role = Column(String(255), nullable=True)
    ats_score = Column(Integer, default=0, nullable=False)

    matched_keywords = Column(JSON, default=list, nullable=False)
    missing_keywords = Column(JSON, default=list, nullable=False)
    suggestions = Column(JSON, default=list, nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    user = relationship("User")





# from sqlalchemy import (
#     Column,
#     DateTime,
#     ForeignKey,
#     Integer,
#     Text,
#     String,
#     JSON,
#     func,
# )
# from sqlalchemy.orm import relationship

# from core.database import Base


# class Resume(Base):
#     __tablename__ = "resumes"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False
#     )

#     # Resume information
#     summary = Column(Text)
#     education = Column(Text)
#     experience = Column(Text)
#     projects = Column(Text)
#     skills = Column(Text)
#     certifications = Column(Text)
#     resume_content = Column(Text)

#     # Analysis information
#     target_role = Column(String(255), nullable=True)
#     ats_score = Column(Integer, default=0, nullable=False)

#     matched_keywords = Column(JSON, default=list, nullable=False)
#     missing_keywords = Column(JSON, default=list, nullable=False)
#     suggestions = Column(JSON, default=list, nullable=False)

#     created_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now()
#     )

#     updated_at = Column(
#         DateTime(timezone=True),
#         server_default=func.now(),
#         onupdate=func.now()
#     )

#     user = relationship("User")






# from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
# from sqlalchemy.orm import relationship

# from core.database import Base


# class Resume(Base):
#     __tablename__ = "resumes"

#     id = Column(Integer, primary_key=True, index=True)

#     user_id = Column(
#         Integer,
#         ForeignKey("users.id"),
#         nullable=False
#     )

#     # Resume content
#     summary = Column(Text)

#     education = Column(Text)

#     experience = Column(Text)

#     projects = Column(Text)

#     skills = Column(Text)

#     certifications = Column(Text)
    
#     resume_content = Column(Text)

#     ats_score = Column(Integer, default=0)

#     created_at = Column(DateTime(timezone=True))

#     updated_at = Column(DateTime(timezone=True))

#     user = relationship("User")