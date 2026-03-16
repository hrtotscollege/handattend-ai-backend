"use client"

import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, Save, Download } from "lucide-react"

export default function ReviewPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/review');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch review data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startEdit = (row: any) => {
    setEditingId(row.id)
    setEditValues({ ...row })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const saveEdit = async () => {
    try {
      const response = await fetch('/api/review', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          rawName: editValues.rawName,
          matchedId: editValues.matchedId,
          checkIn: editValues.checkIn,
          checkOut: editValues.checkOut,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setData((prev) =>
        prev.map((item) => (item.id === editingId ? { ...editValues, confidence: 1.0 } : item))
      )
      setEditingId(null)
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to save changes. Please try again.");
    }
  }

  const handleExport = () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const exportData = data.map(row => ({
      "Raw OCR Name": row.rawName || "",
      "Matched Employee ID": row.matchedId || "Unmatched",
      "Date": row.date || "",
      "Check In": row.checkIn || "",
      "Check Out": row.checkOut || "",
      "Confidence": row.confidence ? `${(row.confidence * 100).toFixed(0)}%` : "Manual"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");

    XLSX.writeFile(workbook, "attendance_export.xlsx");
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
            {editingId && (
              <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" /> Save Current Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading review data...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data to review.</div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
