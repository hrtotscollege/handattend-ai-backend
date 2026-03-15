import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account and AI processing preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" defaultValue="Acme Corp" />
              </div>
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="email">Admin Email</Label>
                <Input id="email" type="email" defaultValue="admin@acme.com" />
              </div>
              <Button>Save Changes</Button>
            </TabsContent>
            <TabsContent value="ai" className="space-y-4">
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="confidence">Minimum Confidence Threshold (%)</Label>
                <Input id="confidence" type="number" defaultValue="80" />
                <p className="text-xs text-muted-foreground">
                  Results below this threshold will be flagged for manual review.
                </p>
              </div>
              <div className="grid gap-2 max-w-md">
                <Label htmlFor="fuzzy">Fuzzy Matching Tolerance</Label>
                <Input id="fuzzy" type="number" defaultValue="2" />
                <p className="text-xs text-muted-foreground">
                  Maximum Levenshtein distance for employee name matching.
                </p>
              </div>
              <Button>Update AI Settings</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
