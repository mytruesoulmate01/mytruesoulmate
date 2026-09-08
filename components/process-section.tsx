import { ClipboardList, Building2, FileText, ShieldCheck } from "lucide-react"

export default function ProcessSection() {
  const steps = [
    {
      number: 1,
      icon: <ClipboardList className="h-8 w-8 text-red-600" />,
      title: "Share Your Requirements",
      description:
        "Tell us your preferences, including community, religion, location, profession, family background and partner expectations.",
    },
    {
      number: 2,
      icon: <Building2 className="h-8 w-8 text-red-600" />,
      title: "We Find Suitable Marriage Bureaus",
      description: "Our team searches for marriage bureaus that best match your specific requirements.",
    },
    {
      number: 3,
      icon: <FileText className="h-8 w-8 text-red-600" />,
      title: "We Help You Register",
      description: "We assist you in completing the registration process with each selected marriage bureau.",
    },
    {
      number: 4,
      icon: <ShieldCheck className="h-8 w-8 text-red-600" />,
      title: "Verify Shortlisted Proposals",
      description:
        "If required, we connect you with professional pre-marriage investigation services before you make the final decision.",
    },
  ]

  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-red-50/30 dark:from-gray-950/50 dark:via-background dark:to-red-950/10"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our team simplifies your marriage search—from finding suitable marriage bureaus to verifying shortlisted
            proposals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full border-4 border-red-100 dark:border-red-900/50">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
