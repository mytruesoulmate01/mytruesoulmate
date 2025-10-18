import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MyTrueSoulMate - Trust-Verified Marriage Connections",
  description:
    "Get verified credentials and a trust score to share with serious marriage seekers on any platform. Build confidence in your journey to marriage through comprehensive verification.",
  keywords:
    "trust verification, marriage connections, matrimonial verification, credential verification, marriage trust score, relationship safety, marriage compatibility",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  )
}
