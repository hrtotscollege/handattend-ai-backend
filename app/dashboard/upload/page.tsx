"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Upload, File, X, CheckCircle, AlertCircle, Calendar, FileText, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, ThinkingLevel } from "@google/genai"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please configure it in the settings.");
      }
      const ai = new GoogleGenAI({ apiKey });

      // Fetch learning data (previously corrected rows)
      let learningContext = "";
      try {
        const [learningRes, employeesRes] = await Promise.all([
          fetch("/api/learning"),
          fetch("/api/employees")
        ]);

        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          if (employeesData && employeesData.length > 0) {
            const employeeNames = employeesData.map((e: any) => e.nameArabic).join(", ");
            learningContext += `\n\nKNOWN EMPLOYEES LIST (Use this list to match the handwritten names. If a name looks similar to one of these, it is highly likely to be that person):\n${employeeNames}\n`;
          }
        }

        if (learningRes.ok) {
          const learningData = await learningRes.json();
          if (learningData && learningData.length > 0) {
            learningContext += "\n\nHere are some examples of previously corrected data to help you learn the handwriting style and expected output:\n";
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
        console.error("Failed to fetch learning or employee data", e);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (!result) {
              reject(new Error("Failed to read file"));
              return;
            }
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Fetch AI Configuration from localStorage
        let aiConfigContext = "";
        try {
          const storedConfig = localStorage.getItem("handattend_ai_config");
          if (storedConfig) {
            const config = JSON.parse(storedConfig);
            if (config.customInstructions || config.handwritingStyle || config.defaultShiftStart) {
              aiConfigContext += "\n\n--- USER DEFINED AI CONFIGURATION ---\n";
              if (config.customInstructions) {
                aiConfigContext += `Custom Instructions: ${config.customInstructions}\n`;
              }
              if (config.handwritingStyle) {
                aiConfigContext += `Handwriting Style/Dialect: ${config.handwritingStyle}\n`;
              }
              if (config.defaultShiftStart) {
                aiConfigContext += `Default Shift Start Time: ${config.defaultShiftStart} (Use this as a fallback if the check-in time is highly ambiguous)\n`;
              }
              aiConfigContext += "--------------------------------------\n";
            }
          }
        } catch (e) {
          console.error("Failed to load AI config", e);
        }

        const prompt = `You are an AI assistant that extracts attendance data from Arabic handwritten attendance sheets.
${learningContext}
${aiConfigContext}

${startDate && endDate ? `CRITICAL CONTEXT: The user has explicitly stated that this attendance sheet covers the period from ${startDate} to ${endDate}. You MUST use this date range to accurately determine the exact dates for Day 1 through Day 5.` : ''}

CRITICAL INSTRUCTION 1: The attendance sheet typically contains 5 days of attendance for each person (e.g., Sunday to Thursday) in columns across the row. You MUST extract exactly 5 separate records for EACH person, one for each day. Even if a person was absent on a day, you MUST still output a record for that day with empty check_in and check_out times. If there are 10 people listed, you MUST output exactly 50 JSON objects.
CRITICAL INSTRUCTION 2: Pay extremely close attention to the Arabic names. Transcribe them as accurately as possible. Look at the strokes carefully. Compare them against the KNOWN EMPLOYEES LIST provided above. If a handwritten name looks very similar to a name in the list, use the name from the list. Do not invent names that are not on the sheet.
CRITICAL INSTRUCTION 3: Look for dates in the column headers or anywhere on the page to determine the date for each of the 5 days. ${startDate && endDate ? `Use the provided range (${startDate} to ${endDate}) to guide your date inference.` : `You MUST try to find or infer the date for each day (e.g., if the week starts on 2025-02-22, the next days are 02-23, 02-24, etc.). If the year is missing, assume the current year.`} Ensure each of the 5 records for a person has a different date.
CRITICAL INSTRUCTION 4: Do not skip any rows. Extract data for every single person listed on the sheet.

Please extract the following information to create a flat JSON array. For EACH person, generate exactly 5 objects (one for each day):
- raw_name: The employee's name written in Arabic. If unreadable, write "Unreadable". (This will be the same for the 5 records of this person).
- date: The date of the attendance in YYYY-MM-DD format. You MUST try to find or infer this date from the column headers${startDate && endDate ? ` and the provided range (${startDate} to ${endDate})` : ''}.
- check_in: The check-in time in HH:MM format for that specific day. If missing or empty, return an empty string.
- check_out: The check-out time in HH:MM format for that specific day. If missing or empty, return an empty string.
- confidence: Your confidence score in reading the handwriting (0.0 to 1.0).`;

        setProgress(30);

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
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
            systemInstruction: "You are a precise data extraction assistant. Your primary directive is to extract exactly 5 days of attendance for EVERY person on the sheet. Pay extreme attention to Arabic names, matching them to the known list when possible. Do not skip any rows.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  raw_name: { type: Type.STRING, description: "The employee's name written in Arabic." },
                  date: { type: Type.STRING, description: "The date of the attendance in YYYY-MM-DD format. Infer from headers if needed." },
                  check_in: { type: Type.STRING, description: "The check-in time in HH:MM format. Empty string if missing." },
                  check_out: { type: Type.STRING, description: "The check-out time in HH:MM format. Empty string if missing." },
                  confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0" }
                },
                required: ["raw_name", "date", "check_in", "check_out", "confidence"]
              }
            },
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
              },
            ],
          },
        });

        setProgress(70);

        const text = response.text;
        const finishReason = response.candidates?.[0]?.finishReason;
        console.log(`Gemini finish reason: ${finishReason}`);
        
        if (!text) {
          throw new Error(`No text returned from Gemini. Finish reason: ${finishReason}`);
        }

        let cleanText = text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "");
        }

        let extractedData;
        try {
          extractedData = JSON.parse(cleanText);
        } catch (parseError: any) {
          // Attempt a very basic fix for truncated arrays
          try {
            if (!cleanText.endsWith("]")) {
              const fixedText = cleanText.replace(/,\s*$/, "") + "]";
              extractedData = JSON.parse(fixedText);
              console.warn("Successfully recovered truncated JSON by appending bracket");
            } else {
              throw parseError;
            }
          } catch (e) {
            // Try regex extraction as a last resort
            const regex = /{[^{}]*}/g;
            const matches = cleanText.match(regex);
            if (matches && matches.length > 0) {
              extractedData = matches.map(m => {
                try {
                  return JSON.parse(m);
                } catch (err) {
                  return null;
                }
              }).filter(Boolean);
              
              if (extractedData.length > 0) {
                console.warn(`Recovered ${extractedData.length} objects via regex extraction from truncated JSON`);
              } else {
                console.error("Failed to parse JSON. Raw text:", text);
                throw new Error(`Failed to parse AI response: ${parseError.message}. The AI returned invalid formatting. Please try again or crop the image.`);
              }
            } else {
              console.error("Failed to parse JSON. Raw text:", text);
              throw new Error(`Failed to parse AI response: ${parseError.message}. The AI returned invalid formatting. Please try again or crop the image.`);
            }
          }
        }
        
        console.log(`Extracted ${extractedData.length} records from ${file.name}`);

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
          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Period Start Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-9"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Helps AI accurately detect dates.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Period End Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-9"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Typically 5 days after start date.</p>
            </div>
          </div>

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

          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Sheet Format Guide & Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4 text-sm text-slate-700">
                <p>For the best AI recognition results, please ensure your attendance sheets follow these guidelines:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Clear Headers:</strong> Dates should be written clearly at the top of each column.</li>
                  <li><strong>Structured Columns:</strong> Each day should have distinct &quot;حضور&quot; (Check-in) and &quot;انصراف&quot; (Check-out) sub-columns.</li>
                  <li><strong>Legible Names:</strong> Employee names should be written as clearly as possible in the designated column.</li>
                  <li><strong>Time Format:</strong> Times should be written clearly (e.g., 7:30, 2:15).</li>
                  <li><strong>Image Quality:</strong> Ensure the photo is well-lit, in focus, and captures the entire table without cutting off edges.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Example of a well-formatted sheet:</p>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                  <Image 
                    src="https://drive.google.com/uc?export=view&id=1T-peKqkW8IkhUMK3ykT6ataLNIS2R56-" 
                    alt="Example Attendance Sheet Format" 
                    width={600} 
                    height={300}
                    className="w-full h-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
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
