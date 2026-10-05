from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)


OUTPUT_DIR = Path("generated/resumes")

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def generate_resume_pdf(
    user_id: int,
    resume_text: str
):
    filename = f"user_{user_id}_resume.pdf"

    file_path = OUTPUT_DIR / filename

    styles = getSampleStyleSheet()

    document = SimpleDocTemplate(
        str(file_path),
        pagesize=A4
    )

    story = []

    for line in resume_text.splitlines():

        line = line.strip()

        if not line:
            story.append(Spacer(1, 8))
            continue

        story.append(
            Paragraph(
                line,
                styles["Normal"]
            )
        )

        story.append(Spacer(1, 5))

    document.build(story)

    return str(file_path)