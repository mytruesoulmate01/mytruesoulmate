import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-red-600 via-red-700 to-red-800">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Trust your journey to marriage with verified connections
          </h2>
          <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get verified today and share your trust score with serious marriage partners on any platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
            <Link href="/why-mytruesoulmate">
              <Button size="lg" variant="secondary" className="bg-white text-red-700 hover:bg-gray-100">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
