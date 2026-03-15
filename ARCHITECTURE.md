# HandAttend AI - Architecture Design & Planning

Welcome to **HandAttend AI**. This document outlines the complete architecture, tech stack, and development phases for building a production-ready system that converts Arabic handwritten attendance sheets into structured Excel files with 98-99% accuracy.

## System Architecture

The system is divided into three main components:

1. **Frontend Web Application (Next.js / React / Tailwind CSS)**
   - User interface for uploading documents, reviewing results, and correcting low-confidence OCR fields.
   - Admin dashboard for managing employees and viewing processing history.
   - Excel export functionality.

2. **Backend API (Next.js API Routes / Node.js)**
   - Handles authentication (JWT), secure file uploads, and database operations.
   - Acts as an orchestrator between the Frontend and the AI Processing Service.
   - Stores employees, attendance records, and processing history in PostgreSQL (via Prisma/Drizzle) and Firebase.

3. **AI Processing Service (Python / FastAPI / PyTorch / OpenCV / PaddleOCR)**
   - Dedicated GPU-accelerated microservice for document preprocessing, table detection, and Arabic OCR.
   - Implements the 9-technique accuracy strategy (Preprocessing, Table Detection, Row-mapping, Multi-OCR consensus, Fuzzy matching, Normalization, Confidence scoring).

## Database Schema (PostgreSQL)

- **Users**: `id`, `email`, `password_hash`, `role`, `created_at`
- **Employees**: `id`, `employee_id`, `name_arabic`, `department`, `created_at`
- **AttendanceSheets**: `id`, `user_id`, `file_url`, `status` (pending, processing, review_needed, completed), `created_at`
- **RecognizedData**: `id`, `sheet_id`, `employee_id`, `date`, `check_in`, `check_out`, `confidence_score`, `is_manually_corrected`
- **AttendanceRecords**: `id`, `employee_id`, `date`, `check_in`, `check_out`, `status` (present, absent, late)
- **Logs**: `id`, `action`, `user_id`, `details`, `timestamp`

## Folder Structure

```text
/
├── app/                    # Next.js Frontend & Backend API (App Router)
│   ├── api/                # Backend API Routes (Node.js)
│   ├── dashboard/          # Frontend Dashboard Pages
│   └── ...
├── components/             # React UI Components (ShadCN UI)
├── lib/                    # Shared utilities, DB clients
├── ai-service/             # Python AI Processing Microservice
│   ├── main.py             # FastAPI entry point
│   ├── models/             # PyTorch/LayoutLM models
│   ├── ocr/                # PaddleOCR, EasyOCR, TrOCR wrappers & consensus logic
│   ├── preprocessing/      # OpenCV image enhancement scripts
│   └── table_detection/    # Table structure recognition
└── docs/                   # Documentation
```

## Development Phases

- **Phase 1: Architecture design** (Current) - Defining the system, schemas, and folder structures.
- **Phase 2: Frontend application** - Building the Next.js UI, ShadCN components, upload interfaces, and manual correction grids.
- **Phase 3: Backend API** - Implementing Next.js API routes, authentication, and database integration.
- **Phase 4: AI OCR engine** - Developing the Python FastAPI service with OpenCV and PaddleOCR.
- **Phase 5: Database integration** - Setting up PostgreSQL and Firebase Storage.
- **Phase 6: Excel generation** - Implementing the logic to export structured data to `.xlsx`.
- **Phase 7: Deployment** - Dockerizing the AI service, configuring Vercel for the web app.
- **Phase 8: Monitoring** - Adding logging and performance tracking.

---

*This document serves as the blueprint for the automated generation process.*
