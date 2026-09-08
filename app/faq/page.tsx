import type { Metadata } from "next"
import FAQSection from "@/components/faq-section"

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | MyTrueSoulMate",
  description:
    "Find answers to frequently asked questions about finding the right marriage bureau, sharing your requirements, and pre-marriage verification with MyTrueSoulMate.",
  keywords: "FAQ, frequently asked questions, MyTrueSoulMate, marriage bureau, pre-marriage verification, help, support",
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSection />
    </div>
  )
}
