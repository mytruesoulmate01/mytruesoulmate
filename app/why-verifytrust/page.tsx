import WhyVerifyTrustHero from "@/components/why-verifytrust/hero-section"
import TrustFoundationSection from "@/components/why-verifytrust/trust-foundation-section"
import ProblemSolutionCards from "@/components/why-verifytrust/problem-solution-cards"
import CallToActionSection from "@/components/call-to-action-section"

export default function WhyVerifyTrustPage() {
  return (
    <div className="min-h-screen">
      <WhyVerifyTrustHero />
      <TrustFoundationSection />
      <ProblemSolutionCards />
      <CallToActionSection />
    </div>
  )
}
