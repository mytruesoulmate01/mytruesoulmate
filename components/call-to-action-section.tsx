import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-red-600 via-red-700 to-red-800">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Take the Next Step Towards Finding Your True Soulmate
          </h2>
          <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Share your requirements, and we'll help you find suitable marriage bureaus and arrange pre-marriage
            verification when required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                Share Your Requirements
              </Button>
            </Link>
            <Link href="/why-mytruesoulmate">
              <Button size="lg" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                Talk to Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
