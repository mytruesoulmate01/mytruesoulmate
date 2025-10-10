"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Users } from "lucide-react"
import Image from "next/image"
import ProtectedRoute from "@/components/protected-route"

export default function ProfilePage() {
  const { user, logout } = useAuth()

  if (!user) {
    return null // ProtectedRoute will handle redirect
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Your Profile</h1>
              <Button
                variant="outline"
                onClick={logout}
                className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
              >
                Logout
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image
                      src="/images/clean-heart-logo.png"
                      alt="TrueSoulMate Heart Logo"
                      width={20}
                      height={20}
                      className="filter brightness-0 invert"
                    />
                    Trust Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-red-600">{user.trustScore || 0}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Your current trust score</p>
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {user.verified ? "Verified" : "Pending Verification"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-red-600 hover:bg-red-700">Update Profile</Button>
              <Button variant="outline">Start Verification Process</Button>
              <Button variant="outline">View Trust Score Details</Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
