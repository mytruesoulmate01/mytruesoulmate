"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Moon, Sun, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const howItWorksRef = useRef(false)

  useEffect(() => {
    if (pathname === "/" && window.location.hash === "#how-it-works") {
      howItWorksRef.current = true
    }
  }, [pathname])

  useEffect(() => {
    if (howItWorksRef.current) {
      setTimeout(() => {
        smoothScrollToSection("how-it-works")
        howItWorksRef.current = false
      }, 100)
    }
  }, [])

  if (pathname?.startsWith("/dashboard")) {
    return null
  }

  // Navigation items
  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Why MyTrueSoulMate?", href: "/why-mytruesoulmate" },
    { name: "How It Works", href: "#how-it-works", isScroll: true },
    { name: "FAQ", href: "/faq" },
  ]

  const smoothScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    }
  }

  const handleNavigation = (item: (typeof navigationItems)[0]) => {
    if (item.isScroll) {
      if (pathname !== "/") {
        router.push("/")
        setTimeout(() => {
          smoothScrollToSection("how-it-works")
        }, 100)
      } else {
        smoothScrollToSection("how-it-works")
      }
      setIsOpen(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image
            src="/images/truesoulmate-full-logo.png"
            alt="MyTrueSoulMate"
            width={420}
            height={72}
            priority
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navigationItems.map((item) =>
              item.isScroll ? (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ),
            )}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Authentication Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard/profile">
                <Button variant="ghost" className="text-sm font-medium">
                  My Profile
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="text-sm font-medium flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-red-600 hover:bg-red-700 text-white">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                {/* Logo */}
                <Image
                  src="/images/truesoulmate-full-logo.png"
                  alt="MyTrueSoulMate"
                  width={320}
                  height={56}
                  priority
                  className="h-14 w-auto"
                />

                <nav className="flex flex-col gap-4">
                  {navigationItems.map((item) =>
                    item.isScroll ? (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item)}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2 text-left cursor-pointer"
                      >
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ),
                  )}
                </nav>

                {/* Mobile Authentication */}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {user ? (
                    <>
                      <div className="text-sm text-muted-foreground">Logged in as: {user.email}</div>
                      <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center bg-transparent">
                          My Profile
                        </Button>
                      </Link>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center bg-transparent">
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="w-full justify-center"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center bg-transparent">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-center bg-red-600 hover:bg-red-700 text-white">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
