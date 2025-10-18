import WhyMyTrueSoulMateHero from "@/components/why-mytruesoulmate/hero-section"
import TrustFoundationSection from "@/components/why-mytruesoulmate/trust-foundation-section"
import ProblemSolutionCards from "@/components/why-mytruesoulmate/problem-solution-cards"
import CallToActionSection from "@/components/call-to-action-section"

export default function WhyMyTrueSoulMatePage() {
  return (
    <div className="min-h-screen">
      <WhyMyTrueSoulMateHero />
      <TrustFoundationSection />
      <ProblemSolutionCards />
      <CallToActionSection />
    </div>
  )
}
