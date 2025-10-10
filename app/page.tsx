import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import ProcessSection from "@/components/process-section"
import CallToActionSection from "@/components/call-to-action-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <CallToActionSection />
    </div>
  )
}
