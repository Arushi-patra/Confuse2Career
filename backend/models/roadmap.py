from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from core.database import Base

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text
)
from sqlalchemy.orm import relationship

from core.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    description = Column(Text)

    start_date = Column(Date)

    end_date = Column(Date)

    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True))

    user = relationship("User")

    tasks = relationship(
        "RoadmapTask",
        back_populates="roadmap",
        cascade="all, delete-orphan"
    )


class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(Integer, primary_key=True, index=True)

    roadmap_id = Column(
        Integer,
        ForeignKey("roadmaps.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    description = Column(Text)

    category = Column(String)

    day_number = Column(Integer)

    estimated_hours = Column(Float)

    is_completed = Column(Boolean, default=False)

    roadmap = relationship(
        "Roadmap",
        back_populates="tasks"
    )