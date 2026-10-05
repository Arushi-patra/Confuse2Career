from pathlib import Path

from PyPDF2 import PdfReader


UPLOAD_DIR = Path(
    "uploads/resumes"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


def extract_resume_text(file_path: str):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()


def save_resume_file(
    content: bytes,
    filename: str
):

    safe_filename = Path(filename).name

    file_path = (
        UPLOAD_DIR / safe_filename
    )

    with open(file_path, "wb") as file:

        file.write(content)

    return str(file_path)