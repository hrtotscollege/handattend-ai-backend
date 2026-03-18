"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Save } from "lucide-react"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    customInstructions: "",
    handwritingStyle: "",
    defaultShiftStart: "08:00",
    confidenceThreshold: "80"
  });

  useEffect(() => {
    // Load settings from localStorage on mount
    const storedConfig = localStorage.getItem("handattend_ai_config");
    if (storedConfig) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAiConfig(JSON.parse(storedConfig));
      } catch (e) {
        console.error("Failed to parse stored config");
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("handattend_ai_config", JSON.stringify(aiConfig));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account and AI processing preferences to improve accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai" className="w-full">
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

            <TabsContent value="ai" className="space-y-6">
              <div className="space-y-4 max-w-2xl">
                <div className="grid gap-2">
                  <Label htmlFor="customInstructions">Custom AI Instructions (Context)</Label>
                  <Textarea 
                    id="customInstructions" 
                    placeholder="e.g., Our company week starts on Sunday. If a time is illegible, assume they arrived on time." 
                    className="h-24"
                    value={aiConfig.customInstructions}
                    onChange={(e) => setAiConfig({...aiConfig, customInstructions: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions are passed directly to the AI to help it understand your specific attendance sheet format and rules.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="handwritingStyle">Handwriting Style / Numerals</Label>
                  <Input 
                    id="handwritingStyle" 
                    placeholder="e.g., Egyptian Arabic, uses Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)" 
                    value={aiConfig.handwritingStyle}
                    onChange={(e) => setAiConfig({...aiConfig, handwritingStyle: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify regional dialects or numeral types to improve OCR accuracy.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="defaultShiftStart">Default Shift Start Time</Label>
                    <Input 
                      id="defaultShiftStart" 
                      type="time" 
                      value={aiConfig.defaultShiftStart}
                      onChange={(e) => setAiConfig({...aiConfig, defaultShiftStart: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Helps the AI guess ambiguous check-in times.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confidence">Review Threshold (%)</Label>
                    <Input 
                      id="confidence" 
                      type="number" 
                      value={aiConfig.confidenceThreshold}
                      onChange={(e) => setAiConfig({...aiConfig, confidenceThreshold: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Results below this will be flagged for review.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" /> Save AI Configuration
                  </Button>
                  {saved && (
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" /> Saved successfully
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
