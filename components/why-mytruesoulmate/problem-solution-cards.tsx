import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function ProblemSolutionCards() {
  const problemSolutions = [
    {
      id: 1,
      title: "Combating Fake Profiles",
      problem:
        "The rise of fake profiles and misinformation has made it difficult for genuine individuals to trust online matches.",
      solution: "MyTrueSoulMate restores faith by ensuring that users are who they claim to be.",
      image: "/images/whyverifytrust-1.png",
      alt: "Verification illustration showing protection against fake profiles with a shield",
      reverse: false,
    },
    {
      id: 2,
      title: "Transparency for Lifelong Commitments",
      problem:
        "Marriages are lifelong commitments. Before taking such a big step, families and individuals need a transparent view of a partner's background.",
      solution:
        "MyTrueSoulMate provides comprehensive verification of identity, education, employment, and background.",
      image: "/images/whyverifytrust-2.png",
      alt: "Transparent document showing verified credentials",
      reverse: true,
    },
    {
      id: 3,
      title: "Faster, Affordable Verification",
      problem: "Traditional background checks are slow, invasive, and expensive.",
      solution:
        "MyTrueSoulMate offers a faster, affordable, and tamper-proof alternative — tailored specifically for digital matchmaking.",
      image: "/images/whyverifytrust-3.png",
      alt: "Fast verification process illustration",
      reverse: false,
    },
    {
      id: 4,
      title: "Trust Score: The New Currency",
      problem: "In a digital-first world, trust is the new currency.",
      solution:
        "MyTrueSoulMate empowers users with a 'Trust Score' backed by verified credentials, making the entire matchmaking experience more secure and credible.",
      image: "/images/whyverifytrust-4.png",
      alt: "Trust score meter showing high credibility",
      reverse: true,
    },
    {
      id: 5,
      title: "Meaningful Connections",
      problem: "Not just matches — meaningful connections.",
      solution:
        "Verified information leads to better compatibility, fewer disappointments, and greater peace of mind for both individuals and families.",
      image: "/images/whyverifytrust-5.png",
      alt: "Network of people connecting with verified profiles",
      reverse: false,
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-red-50/30 dark:from-gray-950/50 dark:via-background dark:to-red-950/10">
      <div className="container mx-auto px-4">
        <div className="space-y-16 md:space-y-24">
          {problemSolutions.map((item) => (
            <div
              key={item.id}
              className={`grid lg:grid-cols-2 gap-12 items-center ${item.reverse ? "lg:grid-flow-col-dense" : ""}`}
            >
              {/* Content Side */}
              <div className={`space-y-6 ${item.reverse ? "lg:col-start-2" : ""}`}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">{item.title}</h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-l-4 border-red-600">
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-red-600">Problem: </span>
                          {item.problem}
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          <span className="font-semibold text-green-600">Solution: </span>
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Image Side */}
              <div className={`relative ${item.reverse ? "lg:col-start-1" : ""}`}>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl p-8 shadow-lg">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.alt}
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
