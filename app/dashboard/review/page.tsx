"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, Save, Download, ArrowUpDown, Filter, History } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReviewPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<any>({})
  const [filter, setFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")

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
        prev.map((item) => (item.id === editingId ? { ...editValues, confidence: 1.0, isEdited: true } : item))
      )
      setEditingId(null)
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to save changes. Please try again.");
    }
  }

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (filter === "low") {
      result = result.filter(item => item.confidence < 0.8);
    } else if (filter === "edited") {
      result = result.filter(item => item.isEdited);
    } else if (filter === "unmatched") {
      result = result.filter(item => !item.matchedId);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "date") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, filter, sortField, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  const handleExport = async () => {
    if (data.length === 0) {
      alert("No data to export.");
      return;
    }

    const XLSX = await import("xlsx");

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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="low">Low Confidence</SelectItem>
                  <SelectItem value="edited">Already Edited</SelectItem>
                  <SelectItem value="unmatched">Unmatched Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rawName">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading review data...</div>
          ) : filteredAndSortedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data matches your filters.</div>
          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("rawName")}>
                    Raw OCR Name {sortField === "rawName" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Matched Employee</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort("date")}>
                    Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((row) => {
                  const isEditing = editingId === row.id
                  const isLowConfidence = row.confidence < 0.8

                  return (
                    <TableRow key={row.id} className={isLowConfidence ? "bg-yellow-50/50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.isEdited && (
                            <span title="Manually edited">
                              <History className="h-3 w-3 text-blue-500" />
                            </span>
                          )}
                          {isEditing ? (
                            <Input
                              value={editValues.rawName}
                              onChange={(e) => setEditValues({ ...editValues, rawName: e.target.value })}
                              className="h-8 w-full"
                            />
                          ) : (
                            row.rawName
                          )}
                        </div>
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
