import WhyMyTrueSoulMateHero from "@/components/why-mytruesoulmate/hero-section"
import ProblemSolutionCards from "@/components/why-mytruesoulmate/problem-solution-cards"
import TrustFoundationSection from "@/components/why-mytruesoulmate/trust-foundation-section"
import CallToActionSection from "@/components/call-to-action-section"

export default function WhyMyTrueSoulMatePage() {
  return (
    <div className="min-h-screen">
      <WhyMyTrueSoulMateHero />
      <ProblemSolutionCards />
      <TrustFoundationSection />
      <CallToActionSection />
    </div>
  )
}
