import { Card, CardContent } from "@/components/ui/card"
import { Shield, TrendingUp, Share2, FileCheck, Lock, Award } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Comprehensive Verification",
      description: "Verify your education, employment, and background information through our secure platform.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-red-600" />,
      title: "Trust Score",
      description: "Receive a quantifiable trust score based on your verified credentials and background checks.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-red-600" />,
      title: "Secure Sharing",
      description: "Share your trust score and verified information securely with potential partners on any platform.",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-red-600" />,
      title: "Tamper-Proof Verification",
      description: "All verifications are cryptographically secured to prevent tampering or falsification.",
    },
    {
      icon: <Lock className="h-8 w-8 text-red-600" />,
      title: "Privacy Control",
      description: "You control who sees your information and how much is shared with each recipient.",
    },
    {
      icon: <Award className="h-8 w-8 text-red-600" />,
      title: "Premium Verification",
      description: "Enhanced verification options for those seeking additional trust assurance.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trust-Based Features for <span className="text-red-600">Marriage Success</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform offers comprehensive tools to verify your background and build trust for serious marriage
              connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
