"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, UserPlus, CheckCircle2, XCircle, Trash2, Mail } from "lucide-react"

export default function AdminDashboard() {
  // Settings State
  const [companyName, setCompanyName] = useState("")
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Users State
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  
  // New User Form State
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState("USER")
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)

  // UI State
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
    fetchUsers()
    fetchContactMessages()
  }, [])

  const fetchContactMessages = async () => {
    try {
      const res = await fetch("/api/admin/contact-messages")
      if (res.ok) {
        const data = await res.json()
        setContactMessages(data)
      }
    } catch (error) {
      console.error("Failed to fetch contact messages", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setCompanyName(data.name || "")
        setLogoBase64(data.logoUrl || null)
      }
    } catch (error) {
      console.error("Failed to fetch settings", error)
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setLogoBase64(result)
    }
    reader.readAsDataURL(file)
  }

  const saveSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          logoUrl: logoBase64
        })
      })

      if (!res.ok) throw new Error("Failed to save settings")

      showMessage("Company branding has been updated successfully.");
    } catch (error: any) {
      showMessage("Error: " + error.message, "error");
    } finally {
      setIsSavingSettings(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!res.ok) throw new Error("Failed to update user status")

      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u))
      
      showMessage(`User has been ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch (error: any) {
      showMessage("Error: " + error.message, "error");
    }
  }

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })

      if (!res.ok) throw new Error("Failed to update user role")

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      
      showMessage(`User role changed to ${newRole}.`);
    } catch (error: any) {
      showMessage("Error: " + error.message, "error");
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userToDelete}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete user")
      }

      setUsers(users.filter(u => u.id !== userToDelete))
      setUserToDelete(null)
      
      showMessage("The user account has been removed.");
    } catch (error: any) {
      showMessage("Error: " + error.message, "error");
      setUserToDelete(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          isActive: true
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create user")
      }

      const newUser = await res.json()
      setUsers([newUser, ...users])
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("USER")
      
      showMessage("New user account has been successfully created and activated.");
    } catch (error: any) {
      showMessage("Error: " + error.message, "error");
    } finally {
      setIsCreatingUser(false)
    }
  }

  return (
    <div className="space-y-6 relative">
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-2 text-white ${message.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-4 hover:opacity-80">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Delete User</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteUser}>Delete User</Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage company branding and user accounts.</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Company Branding</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="messages">Contact Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>Upload your company logo and set the company name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="Enter company name"
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                        {logoBase64 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoBase64} alt="Company Logo" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No logo</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input 
                          id="logoUpload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">Recommended size: 256x256px. Max 1MB.</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={saveSettings} disabled={isSavingSettings}>
                    {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Create User</CardTitle>
                <CardDescription>Add a new user account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreatingUser}>
                    {isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>Manage access and roles for all users.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>
                                <Select 
                                  value={user.role} 
                                  onValueChange={(val) => changeUserRole(user.id, val)}
                                >
                                  <SelectTrigger className="w-[110px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {user.isActive ? (
                                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant={user.isActive ? "outline" : "default"} 
                                    size="sm"
                                    onClick={() => toggleUserStatus(user.id, user.isActive)}
                                  >
                                    {user.isActive ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => setUserToDelete(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>Messages submitted through the contact form.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground">No messages found.</p>
                  ) : (
                    contactMessages.map((msg) => {
                      let details = { name: "Unknown", email: "Unknown", subject: "No Subject", message: "No content" };
                      try {
                        if (msg.details) details = JSON.parse(msg.details);
                      } catch (e) {}
                      
                      return (
                        <div key={msg.id} className="border rounded-lg p-4 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{details.subject}</h4>
                              <p className="text-sm text-slate-600">From: {details.name} ({details.email})</p>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-4 p-3 bg-white border rounded text-sm text-slate-800 whitespace-pre-wrap">
                            {details.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
