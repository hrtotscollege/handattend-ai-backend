"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Upload, Download, Trash2, Edit2, X, Check, Loader2 } from "lucide-react"
import { read, utils, writeFile } from "xlsx"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ employeeId: "", nameArabic: "", department: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/employees')
      if (!res.ok) throw new Error('Failed to fetch employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error(error)
      alert("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (employees.length === 0) {
      alert("No employees to export.");
      return;
    }

    const exportData = employees.map(emp => ({
      "Employee ID": emp.employeeId || "",
      "Name (Arabic)": emp.nameArabic || "",
      "Department": emp.department || ""
    }));

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Employees");

    writeFile(workbook, "employees_export.xlsx");
  }

  const filteredEmployees = employees.filter(emp => 
    (emp.nameArabic || "").includes(searchQuery) || 
    (emp.employeeId || "").includes(searchQuery) || 
    (emp.department || "").includes(searchQuery)
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setEmployees(employees.filter(emp => emp.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleEditClick = (employee: any) => {
    setEditingId(employee.id)
    setEditForm({ 
      employeeId: employee.employeeId, 
      nameArabic: employee.nameArabic, 
      department: employee.department || "" 
    })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      if (!editForm.employeeId || !editForm.nameArabic) {
        alert("Employee ID and Name are required")
        return
      }

      const isNew = id.startsWith('new-')
      const url = isNew ? '/api/employees' : `/api/employees/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      const savedEmployee = await res.json()
      
      if (isNew) {
        setEmployees([savedEmployee, ...employees.filter(e => e.id !== id)])
      } else {
        setEmployees(employees.map(emp => emp.id === id ? savedEmployee : emp))
      }
      
      setEditingId(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleCancelEdit = () => {
    if (editingId?.startsWith('new-')) {
      setEmployees(employees.filter(e => e.id !== editingId))
    }
    setEditingId(null)
  }

  const handleAddEmployee = () => {
    const newId = `new-${Date.now()}`
    const newEmployee = { id: newId, employeeId: "", nameArabic: "", department: "" }
    setEmployees([newEmployee, ...employees])
    setEditingId(newId)
    setEditForm({ employeeId: "", nameArabic: "", department: "" })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = utils.sheet_to_json(ws) as any[]
        
        let successCount = 0
        let errorCount = 0

        for (const row of data) {
          const empData = {
            employeeId: (row.ID || row.id || row["الرقم الوظيفي"] || "").toString(),
            nameArabic: row.Name || row.name || row["الاسم"] || "Unknown",
            department: row.Department || row.department || row["القسم"] || "",
          }

          if (!empData.employeeId) continue;

          try {
            const res = await fetch('/api/employees', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(empData)
            })
            if (res.ok) successCount++
            else errorCount++
          } catch (e) {
            errorCount++
          }
        }

        alert(`Successfully imported ${successCount} employees. ${errorCount > 0 ? `Failed to import ${errorCount} employees.` : ''}`)
        
        fetchEmployees()
      } catch (error) {
        alert("Failed to parse Excel file")
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Employees Database</CardTitle>
            <CardDescription>
              Manage your employees for accurate OCR fuzzy matching.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Import Excel
            </Button>
            <Button onClick={handleAddEmployee}>
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name (Arabic)</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  {editingId === employee.id ? (
                    <>
                      <TableCell>
                        <Input 
                          value={editForm.employeeId} 
                          onChange={(e) => setEditForm({...editForm, employeeId: e.target.value})}
                          className="h-8"
                          placeholder="ID"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={editForm.nameArabic} 
                          onChange={(e) => setEditForm({...editForm, nameArabic: e.target.value})}
                          className="h-8"
                          placeholder="Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={editForm.department} 
                          onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                          className="h-8"
                          placeholder="Department"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(employee.id)} className="h-8 w-8 text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8 text-red-600">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{employee.employeeId}</TableCell>
                      <TableCell>{employee.nameArabic}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(employee)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
