"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, Save } from "lucide-react"

// Mock data from AI Service
const initialData = [
  { id: "1", rawName: "أحمد محمد", matchedId: "EMP001", date: "2026-02-24", checkIn: "07:30", checkOut: "15:00", confidence: 0.95 },
  { id: "2", rawName: "سارة خالد", matchedId: "EMP002", date: "2026-02-24", checkIn: "08:00", checkOut: "16:00", confidence: 0.88 },
  { id: "3", rawName: "عمر عبدا", matchedId: null, date: "2026-02-24", checkIn: "07:45", checkOut: "15:30", confidence: 0.65 }, // Needs review
  { id: "4", rawName: "فاطمة علي", matchedId: "EMP004", date: "2026-02-24", checkIn: "7.3", checkOut: "15:15", confidence: 0.75 }, // Needs review (time format)
]

export default function ReviewPage() {
  const [data, setData] = useState(initialData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})

  const startEdit = (row: any) => {
    setEditingId(row.id)
    setEditValues({ ...row })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const saveEdit = () => {
    setData((prev) =>
      prev.map((item) => (item.id === editingId ? { ...editValues, confidence: 1.0 } : item))
    )
    setEditingId(null)
  }

  const handleExport = () => {
    // In a real app, this would call the backend to generate and download the Excel file
    alert("Exporting to Excel...")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Review & Correct</CardTitle>
            <CardDescription>
              Review low-confidence OCR results and correct them before exporting to Excel.
            </CardDescription>
          </div>
          <Button onClick={handleExport}>
            <Save className="mr-2 h-4 w-4" /> Export to Excel
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raw OCR Name</TableHead>
                  <TableHead>Matched Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isEditing = editingId === row.id
                  const isLowConfidence = row.confidence < 0.8

                  return (
                    <TableRow key={row.id} className={isLowConfidence ? "bg-yellow-50/50" : ""}>
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input
                            value={editValues.rawName}
                            onChange={(e) => setEditValues({ ...editValues, rawName: e.target.value })}
                            className="h-8 w-full"
                          />
                        ) : (
                          row.rawName
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editValues.matchedId || ""}
                            onChange={(e) => setEditValues({ ...editValues, matchedId: e.target.value })}
                            className="h-8 w-full"
                            placeholder="Employee ID"
                          />
                        ) : row.matchedId ? (
                          <span className="text-green-600 font-medium">{row.matchedId}</span>
                        ) : (
                          <span className="text-red-500 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Unmatched
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editValues.checkIn}
                            onChange={(e) => setEditValues({ ...editValues, checkIn: e.target.value })}
                            className="h-8 w-20"
                          />
                        ) : (
                          row.checkIn
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editValues.checkOut}
                            onChange={(e) => setEditValues({ ...editValues, checkOut: e.target.value })}
                            className="h-8 w-20"
                          />
                        ) : (
                          row.checkOut
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Badge variant="outline">Manual</Badge>
                        ) : (
                          <Badge variant={isLowConfidence ? "destructive" : "default"}>
                            {(row.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="icon" onClick={saveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
