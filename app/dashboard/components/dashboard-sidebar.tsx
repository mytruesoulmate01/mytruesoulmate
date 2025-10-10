"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, Menu, Shield, Share2, Users, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface NavigationItem {
  name: string
  href: string
  icon?: any
  iconType: "lucide" | "image"
  iconSrc?: string
}

const navigationItems: NavigationItem[] = [
  {
    name: "Trust Profile",
    href: "/dashboard/profile",
    icon: User,
    iconType: "lucide",
  },
  {
    name: "Trust Score",
    href: "/dashboard/trustscore",
    icon: Shield,
    iconType: "lucide",
  },
  {
    name: "Trust Share",
    href: "/dashboard/share",
    icon: Share2,
    iconType: "lucide",
  },
  {
    name: "Trust Connection",
    href: "/dashboard/trust-connections",
    icon: Users,
    iconType: "lucide",
  },
  {
    name: "Trust Talk",
    href: "/dashboard/trusttalk",
    iconType: "image",
    iconSrc: "/images/trusttalk-logo.png",
  },
]

const supportNavigationItems: NavigationItem[] = [
  {
    name: "FAQ",
    href: "/faq",
    icon: HelpCircle,
    iconType: "lucide",
  },
]

interface SidebarContentProps {
  pathname: string
  onItemClick?: () => void
}

function SidebarContent({ pathname, onItemClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Dashboard</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {item.iconType === "lucide" ? (
                  <item.icon className="h-4 w-4" />
                ) : (
                  <Image
                    src={item.iconSrc || "/placeholder.svg"}
                    alt={`${item.name} icon`}
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                )}
                {item.name}
              </Link>
            )
          })}

          {/* Support Section */}
          <div className="pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Support</h3>
            {supportNavigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {item.iconType === "lucide" ? (
                    <item.icon className="h-4 w-4" />
                  ) : (
                    <Image
                      src={item.iconSrc || "/placeholder.svg"}
                      alt={`${item.name} icon`}
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain"
                    />
                  )}
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} onItemClick={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  )
}
