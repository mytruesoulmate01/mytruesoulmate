"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("")
  const [loginTestResult, setLoginTestResult] = useState<any>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        console.error("Failed to fetch users:", data.message)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    if (!testEmail || !testPassword) {
      alert("Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/debug/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })

      const data = await response.json()
      setLoginTestResult(data)
    } catch (error) {
      console.error("Login test error:", error)
      setLoginTestResult({
        success: false,
        message: "Network error during login test",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      {/* Fetch Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Database Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={fetchUsers} disabled={loading}>
            {loading ? "Loading..." : "Fetch All Users"}
          </Button>

          {users.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Found {users.length} users:</h3>
              {users.map((user, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p>
                    <strong>ID:</strong> {user.user_id}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email_id}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.user_role || "Not set"}
                  </p>
                  <p>
                    <strong>Token Version:</strong> {user.token_version || "Not set"}
                  </p>
                  <p>
                    <strong>Password:</strong> {user.password_status} ({user.password_length} chars)
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
            <Input
              placeholder="Password"
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
            />
          </div>

          <Button onClick={testLogin} disabled={loading}>
            {loading ? "Testing..." : "Test Login"}
          </Button>

          {loginTestResult && (
            <Alert variant={loginTestResult.success ? "default" : "destructive"}>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(loginTestResult, null, 2)}</pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
