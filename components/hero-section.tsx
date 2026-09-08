import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-red-600">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">Find Your TrueSoulMate</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find the right marriage bureau and verify shortlisted proposals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
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
