import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import Image from "next/image"

export default function FooterSection() {
  const footerSections = [
    {
      title: "MyTrueSoulMate",
      links: [
        {
          name: "Building trust through verified credentials and transparent sharing.",
          href: "#",
          isDescription: true,
        },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Press", href: "/press" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "How It Works", href: "/how-it-works" },
        { name: "FAQ", href: "/faq" },
        { name: "Support", href: "/support" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Compliance", href: "/compliance" },
      ],
    },
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
  ]

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              {index === 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
                      <Image
                        src="/images/clean-heart-logo.png"
                        alt="TrueSoulMate Heart Logo"
                        width={20}
                        height={20}
                        className="filter brightness-0 invert"
                      />
                    </div>
                    <span className="text-xl font-bold">{section.title}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{section.links[0].name}</p>
                  <div className="flex gap-4">
                    {socialLinks.map((social, socialIndex) => (
                      <Link
                        key={socialIndex}
                        href={social.href}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-red-600 transition-colors text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">© 2025 MyTrueSoulMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
