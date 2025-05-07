from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.database import Base

class PublicKey(Base):
    __tablename__ = "public_keys"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    public_key = Column(String, nullable=False)

    # Optional: Establish relationship
    user = relationship("User", back_populates="public_key", uselist=False)
