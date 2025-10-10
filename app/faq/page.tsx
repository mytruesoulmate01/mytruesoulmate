import type { Metadata } from "next"
import FAQSection from "@/components/faq-section"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | MyTrueSoulMate",
  description:
    "Find answers to frequently asked questions about MyTrueSoulMate verification process, trust scores, privacy, and more.",
  keywords: "FAQ, frequently asked questions, MyTrueSoulMate, verification, trust score, help, support",
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSection />
    </div>
  )
}
