from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
from PIL import Image
import io
import logging

# Initialize FastAPI app
app = FastAPI(title="HandAttend AI Processing Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock OCR initialization (Replace with actual PaddleOCR/EasyOCR initialization)
# from paddleocr import PaddleOCR
# ocr_engine = PaddleOCR(use_angle_cls=True, lang='ar')

class ProcessResponse(BaseModel):
    status: str
    message: str
    data: list

@app.get("/")
def read_root():
    return {"message": "HandAttend AI Processing Service is running."}

@app.post("/api/process", response_model=ProcessResponse)
async def process_document(file: UploadFile = File(...)):
    """
    Endpoint to process an uploaded attendance sheet.
    1. Reads the image
    2. Preprocesses (skew correction, noise removal)
    3. Detects table structure
    4. Runs OCR on cells
    5. Returns structured JSON data
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image.")

        # --- Pipeline Steps (Mocked for demonstration) ---
        
        # Step 1: Preprocessing
        logger.info("Preprocessing image...")
        # processed_img = preprocess_image(img)
        
        # Step 2: Table Detection
        logger.info("Detecting table structure...")
        # cells = detect_table(processed_img)
        
        # Step 3: OCR & Consensus
        logger.info("Running OCR...")
        # results = run_ocr_consensus(cells)
        
        # Step 4: Fuzzy Matching & Normalization
        logger.info("Normalizing data...")
        # final_data = normalize_and_match(results)

        # Mock Response Data
        mock_data = [
            {
                "row_index": 1,
                "raw_name": "أحمد محمد",
                "matched_employee_id": "EMP001",
                "date": "2026-02-24",
                "check_in": "07:30",
                "check_out": "15:00",
                "confidence": 0.95
            },
            {
                "row_index": 2,
                "raw_name": "سارة خالد",
                "matched_employee_id": "EMP002",
                "date": "2026-02-24",
                "check_in": "08:00",
                "check_out": "16:00",
                "confidence": 0.88
            },
             {
                "row_index": 3,
                "raw_name": "عمر عبدا", # Intentional typo for manual review
                "matched_employee_id": None,
                "date": "2026-02-24",
                "check_in": "07:45",
                "check_out": "15:30",
                "confidence": 0.65 # Low confidence, needs review
            }
        ]

        return ProcessResponse(
            status="success",
            message="Document processed successfully.",
            data=mock_data
        )

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Helper functions would go here or in separate modules
# def preprocess_image(img): ...
# def detect_table(img): ...
# def run_ocr_consensus(cells): ...
# def normalize_and_match(results): ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
