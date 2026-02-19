from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Organization


DEFAULT_ORG_NAME = "default"


def get_or_create_default_org(db: Session) -> Organization:
    org = db.scalar(select(Organization).where(Organization.name == DEFAULT_ORG_NAME))
    if org:
        return org

    org = Organization(name=DEFAULT_ORG_NAME)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org
