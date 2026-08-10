from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text
)

from core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    platform = Column(String, nullable=False)

    url = Column(String, nullable=False)

    description = Column(Text)

    skill = Column(String)

    difficulty = Column(String)

    resource_type = Column(String)

    rating = Column(Float)

    created_at = Column(DateTime(timezone=True))