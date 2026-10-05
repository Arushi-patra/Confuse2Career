from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user

from models.user import User
from models.resume import Resume

from services.resume import (
    save_resume_file,
    extract_resume_text
)

from utils.ats import analyze_resume
from schemas.resume import ResumeUpdateRequest
from utils.pdf import generate_resume_pdf


router = APIRouter()


@router.post("/analyze")
async def analyze_uploaded_resume(

    target_role: str = Form(...),

    file: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    content = await file.read()

    filename = (
        f"user_{current_user.id}_"
        f"resume.pdf"
    )

    path = save_resume_file(
        content,
        filename
    )

    resume_text = extract_resume_text(
        path
    )

    if not resume_text:

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract text from "
                "the uploaded PDF"
            )
        )

    result = analyze_resume(
        resume_text,
        target_role
    )

    # IMPORTANT:
    # Adjust these fields to match
    # Developer 1's Resume model.

    resume = Resume(
        user_id=current_user.id,
        resume_content=resume_text,
        ats_score=int(result["ats_score"]),
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume analyzed successfully",
        "resume_id": resume.id,
        "ats_score": result["ats_score"],
        "matched_keywords": result[
            "matched_keywords"
        ],
        "missing_keywords": result[
            "missing_keywords"
        ],
        "suggestions": result[
            "suggestions"
        ]
    }

@router.post("/generate")
def generate_resume(

    request: ResumeUpdateRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    path = generate_resume_pdf(
        user_id=current_user.id,
        resume_text=request.content
    )

    return {
        "message": "Resume generated successfully",
        "file": path
    }

@router.get("/latest")
def get_latest_resume(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.id.desc()
        )
        .first()
    )

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="No resume found"
        )

    return {
        "id": resume.id,
        "ats_score": resume.ats_score,
        "resume_content": resume.resume_content
    }

@router.get("/download")
def download_resume(
    current_user: User = Depends(get_current_user)
):
    filename = f"user_{current_user.id}_resume.pdf"

    path = Path("generated/resumes") / filename

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Generated resume not found"
        )

    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename="resume.pdf"
    )
# @router.get("/download")
# def download_resume(

#     current_user: User = Depends(
#         get_current_user
#     )
# ):

#     filename = (
#         f"user_{current_user.id}_resume.pdf"
#     )

#     path = (
#         Path("uploads/resumes")
#         / filename
#     )

#     if not path.exists():

#         raise HTTPException(
#             status_code=404,
#             detail="Resume file not found"
#         )

#     return FileResponse(
#         path=str(path),
#         media_type="application/pdf",
#         filename="resume.pdf"
#     )

@router.put("/update")
def update_resume(

    request: ResumeUpdateRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.id.desc()
        )
        .first()
    )

    if not resume:

        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    resume.resume_content = request.content
    # resume.target_role = request.target_role

    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume updated successfully",
        "resume_id": resume.id
    }