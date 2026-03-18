"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AnalyticsDashboardProps {
  attendanceData: { date: string, PRESENT: number, ABSENT: number, LATE: number }[];
  accuracyData: { date: string, accuracy: number }[];
  employeeStats: { name: string, status: string, count: number }[];
}

export default function AnalyticsDashboard({ attendanceData, accuracyData, employeeStats }: AnalyticsDashboardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Attendance Trends Chart */}
      <Card className="col-span-1 md:col-span-2 border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Attendance Trends (Last 30 Days)</CardTitle>
          <CardDescription>Daily breakdown of present, absent, and late employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="PRESENT" name="Present" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="LATE" name="Late" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="ABSENT" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No attendance data available for the selected period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Accuracy Trends */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">AI OCR Accuracy</CardTitle>
          <CardDescription>Average daily confidence score of the AI extraction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={accuracyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No AI processing data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Absent/Late Employees */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Attendance Alerts</CardTitle>
          <CardDescription>Employees with the most absences or late arrivals.</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeStats.length > 0 ? (
            <div className="overflow-auto max-h-[300px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          stat.status === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {stat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{stat.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-500">
              No absence or late records found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
