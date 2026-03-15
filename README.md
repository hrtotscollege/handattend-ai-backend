# HandAttend AI - Setup & Deployment Guide

This repository contains the full source code for HandAttend AI, a platform that converts Arabic handwritten attendance sheets into structured Excel files.

## Project Structure

- `/app`: Next.js frontend and backend API routes.
- `/components`: Reusable UI components (ShadCN UI).
- `/prisma`: Database schema and migrations.
- `/ai-service`: Python FastAPI microservice for AI processing (OCR, OpenCV).

## Phase 1: Architecture Design
The architecture is defined in `/ARCHITECTURE.md`. It outlines the 3-tier system (Frontend, Backend, AI Service) and the 9-technique accuracy strategy.

## Phase 2 & 3: Frontend & Backend Setup
The frontend is built with Next.js App Router and Tailwind CSS. The backend uses Next.js API routes (`/app/api`).

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Installation
1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   Copy `.env.example` to `.env` and update the `DATABASE_URL` and `JWT_SECRET`.
3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Phase 4: AI OCR Engine Setup
The AI service is built with Python, FastAPI, OpenCV, and PaddleOCR.

### Prerequisites
- Python 3.10+
- CUDA-compatible GPU (recommended for PaddleOCR)

### Installation
1. Navigate to the AI service directory:
   ```bash
   cd ai-service
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the AI service:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Phase 5: Database Integration
The database schema is defined in `/prisma/schema.prisma`. It includes tables for Users, Employees, AttendanceSheets, RecognizedData, and Logs.

## Phase 6: Excel Generation
Excel generation is implemented in `/app/api/export/route.ts` using the `xlsx` library. It converts the recognized data into a downloadable `.xlsx` file.

## Phase 7: Deployment

### Frontend & Backend (Next.js)
Deploy easily to Vercel:
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the `DATABASE_URL`, `JWT_SECRET`, and `AI_SERVICE_URL` environment variables.
4. Deploy.

### AI Service (Python)
Deploy the AI service using Docker to a GPU-enabled cloud provider (e.g., AWS EC2, Google Cloud Run with GPU, or RunPod).
Create a `Dockerfile` in the `/ai-service` directory:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Phase 8: Monitoring
Logs are stored in the PostgreSQL database via the `Log` model. In production, integrate with Datadog or Sentry for advanced monitoring.
