"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  const [errorMessage, setErrorMessage] = useState<string>("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setStatus("uploading")
    setProgress(10)
    setErrorMessage("")

    try {
      // Import GoogleGenAI dynamically or ensure it's available
      const { GoogleGenAI, Type } = await import("@google/genai");
      
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please configure it in the settings.");
      }
      const ai = new GoogleGenAI({ apiKey });

      // Fetch learning data (previously corrected rows)
      let learningContext = "";
      try {
        const learningRes = await fetch("/api/learning");
        if (learningRes.ok) {
          const learningData = await learningRes.json();
          if (learningData && learningData.length > 0) {
            learningContext = "\n\nHere are some examples of previously corrected data to help you learn the handwriting style and expected output:\n";
            learningData.forEach((item: any, index: number) => {
              learningContext += `Example ${index + 1}:\n`;
              learningContext += `- raw_name: ${item.rawNameText}\n`;
              if (item.employee?.nameArabic) {
                learningContext += `- Corrected/Expected Name: ${item.employee.nameArabic}\n`;
              }
              learningContext += `- check_in: ${item.checkIn || 'N/A'}\n`;
              learningContext += `- check_out: ${item.checkOut || 'N/A'}\n\n`;
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch learning data", e);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const prompt = `You are an AI assistant that extracts attendance data from Arabic handwritten attendance sheets.
Please extract the following information for each row:
- raw_name: The employee's name written in Arabic.
- date: The date of the attendance in YYYY-MM-DD format.
- check_in: The check-in time in HH:MM format.
- check_out: The check-out time in HH:MM format.
- confidence: Your confidence score in reading the handwriting (0.0 to 1.0).

Return the data as a JSON array of objects.${learningContext}`;

        setProgress(30);

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  raw_name: { type: Type.STRING },
                  date: { type: Type.STRING },
                  check_in: { type: Type.STRING },
                  check_out: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["raw_name", "date", "check_in", "check_out", "confidence"],
              },
            },
          },
        });

        setProgress(70);

        const text = response.text;
        if (!text) {
          throw new Error("No text returned from Gemini");
        }

        const extractedData = JSON.parse(text);

        const serverResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            extractedData,
          }),
        });

        if (!serverResponse.ok) {
          throw new Error(`Server save failed for ${file.name}`);
        }

        // Update progress
        setProgress(10 + Math.floor(((i + 1) / files.length) * 90));
      }

      setStatus("success")
    } catch (error: any) {
      console.error("Upload error:", error)
      setErrorMessage(error.message || "An error occurred during upload.")
      setStatus("error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Attendance Sheets</CardTitle>
          <CardDescription>
            Upload scanned images or PDFs of Arabic handwritten attendance sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports JPG, PNG, and PDF up to 10MB
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <div className="grid gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {status === "uploading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Files successfully uploaded and processed!</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{errorMessage || "An error occurred during upload. Please try again."}</span>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiles([])
                    setStatus("idle")
                    setProgress(0)
                  }}
                  disabled={uploading}
                >
                  Clear All
                </Button>
                <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
                  {uploading ? "Processing..." : "Process Files"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
