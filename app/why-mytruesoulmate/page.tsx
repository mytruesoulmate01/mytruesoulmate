import WhyMyTrueSoulMateHero from "@/components/why-mytruesoulmate/hero-section"
import ProblemSolutionCards from "@/components/why-mytruesoulmate/problem-solution-cards"
import CallToActionSection from "@/components/call-to-action-section"

// Why MyTrueSoulMate - Complete rebrand from VerifyTrust
export default function WhyMyTrueSoulMatePage() {
  return (
    <div className="min-h-screen">
      <WhyMyTrueSoulMateHero />
      <ProblemSolutionCards />
      <CallToActionSection />
    </div>
  )
}
