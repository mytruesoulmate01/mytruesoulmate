import { User, Upload, TrendingUp, Share2, Users } from "lucide-react"

export default function ProcessSection() {
  const steps = [
    {
      number: 1,
      icon: <User className="h-8 w-8 text-red-600" />,
      title: "Create Your Profile",
      description: "Sign up and create your profile with your personal information.",
    },
    {
      number: 2,
      icon: <Upload className="h-8 w-8 text-red-600" />,
      title: "Submit Verification Documents",
      description: "Share your education, employment, and background documents for verification.",
    },
    {
      number: 3,
      icon: <TrendingUp className="h-8 w-8 text-red-600" />,
      title: "Get Your Trust Score",
      description: "Once verified, receive your trust score based on our comprehensive algorithm.",
    },
    {
      number: 4,
      icon: <Share2 className="h-8 w-8 text-red-600" />,
      title: "Share Your Trust Score",
      description: "Share your trust score with potential partners",
    },
    {
      number: 5,
      icon: <Users className="h-8 w-8 text-red-600" />,
      title: "Build Trusted Connections",
      description: "Connect with confidence —everyone’s profile is verified and secure.",
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
            Our simple process helps you verify and share your trustworthiness in just a few steps.
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
