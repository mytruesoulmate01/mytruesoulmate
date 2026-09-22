import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, Building2, Network, UserCheck, ShieldCheck, FileSearch } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <ClipboardList className="h-8 w-8 text-red-600" />,
      title: "Understand Your Requirements",
      description:
        "We understand your preferences for community, religion, location, profession, family background and lifestyle.",
    },
    {
      icon: <Building2 className="h-8 w-8 text-red-600" />,
      title: "Suitable Marriage Bureaus",
      description: "Get connected with marriage bureaus that specialize in profiles matching your requirements.",
    },
    {
      icon: <Network className="h-8 w-8 text-red-600" />,
      title: "Multiple Bureau Connections",
      description:
        "Reach relevant marriage bureaus through one platform instead of searching and registering everywhere.",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-red-600" />,
      title: "Personalized Assistance",
      description: "Our team guides you in selecting suitable marriage bureaus for your partner search.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-red-600" />,
      title: "Consent-Based Verification",
      description: "Verify important details of a shortlisted proposal with the other person's consent.",
    },
    {
      icon: <FileSearch className="h-8 w-8 text-red-600" />,
      title: "Independent Background Check",
      description: "Get professional pre-marriage investigation support when deeper verification is required.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Find Your <span className="text-red-600">True Soulmate</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From selecting the right marriage bureau to verifying a shortlisted proposal, we support you at every
              important step.
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
