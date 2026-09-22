export default function ProblemSolutionCards() {
  const benefits = [
    {
      id: 1,
      title: "Personalized Marriage Search",
      description: "We understand your preferences before identifying marriage bureaus that are relevant to your needs.",
    },
    {
      id: 2,
      title: "Access to Suitable Marriage Bureaus",
      description: "Connect with bureaus specializing in your community, religion, location, profession or financial background.",
    },
    {
      id: 3,
      title: "One Requirement, Multiple Options",
      description: "Share your requirements once instead of explaining them separately to every marriage bureau.",
    },
    {
      id: 4,
      title: "Wider Search Coverage",
      description:
        "Explore suitable marriage bureaus across different communities and locations to increase your search opportunities.",
    },
    {
      id: 5,
      title: "Save Valuable Time",
      description: "Our team handles the research so you do not have to search for marriage bureaus individually.",
    },
    {
      id: 6,
      title: "Registration Assistance",
      description: "Get help completing your profile and registration process with every selected marriage bureau.",
    },
    {
      id: 7,
      title: "Avoid Unnecessary Registrations",
      description:
        "Focus only on relevant marriage bureaus instead of registering and paying everywhere without proper information.",
    },
    {
      id: 8,
      title: "Compare Before You Choose",
      description: "Understand the services, specialization and pricing of different marriage bureaus before proceeding.",
    },
    {
      id: 9,
      title: "Dedicated Support",
      description: "Receive assistance from our team throughout your marriage bureau discovery and registration journey.",
    },
    {
      id: 10,
      title: "Pre-Marriage Verification Support",
      description:
        "When required, we connect you with professional agencies to verify important details about a shortlisted proposal.",
    },
    {
      id: 11,
      title: "More Informed Decisions",
      description:
        "Combine marriage bureau assistance with verification support to make your marriage decision with greater clarity.",
    },
    {
      id: 12,
      title: "Complete Support in One Place",
      description:
        "From finding suitable marriage bureaus to verifying a shortlisted proposal, access both services through one platform.",
    },
    {
      id: 13,
      title: "Personal & Couple Counseling",
      description:
        "Connect with professional counselors for personal or couple counseling sessions to help you take a more informed marriage decision.",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-red-50/30 dark:from-gray-950/50 dark:via-background dark:to-red-950/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          {benefits.map((item) => (
            <div key={item.id} className="flex items-start gap-6">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white font-bold text-lg">
                {item.id}
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
