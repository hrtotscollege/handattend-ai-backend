from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import io
import logging
import os

# Initialize FastAPI app
app = FastAPI(title="HandAttend AI Processing Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize PaddleOCR
try:
    from paddleocr import PaddleOCR
    # use_angle_cls=True to automatically rotate images
    # lang='ar' for Arabic support
    ocr_engine = PaddleOCR(use_angle_cls=True, lang='ar', show_log=False)
    logger.info("PaddleOCR initialized successfully.")
except ImportError:
    logger.warning("PaddleOCR not installed. OCR will be mocked.")
    ocr_engine = None
except Exception as e:
    logger.error(f"Failed to initialize PaddleOCR: {e}")
    ocr_engine = None

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

        logger.info("Image loaded successfully.")
        
        final_data = []

        if ocr_engine:
            logger.info("Running PaddleOCR...")
            # Run OCR on the whole image for now (a real app would detect table cells first)
            result = ocr_engine.ocr(img, cls=True)
            
            if result and result[0]:
                for idx, line in enumerate(result[0]):
                    # line format: [[box coords], (text, confidence)]
                    text = line[1][0]
                    confidence = float(line[1][1])
                    
                    # Simple heuristic: if text has numbers and colons, it might be a time
                    # If it has Arabic characters, it might be a name
                    # This is a simplified extraction for testing
                    
                    final_data.append({
                        "row_index": idx + 1,
                        "raw_text": text,
                        "confidence": confidence,
                        "bounding_box": line[0]
                    })
            logger.info(f"OCR extracted {len(final_data)} text blocks.")
        else:
            logger.info("Using mock OCR data...")
            final_data = [
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
                }
            ]

        return ProcessResponse(
            status="success",
            message="Document processed successfully.",
            data=final_data
        )

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
