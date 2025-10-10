import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Delhi, India",
      quote:
        "Before MyTrueSoulMate, I was constantly worried about fake profiles. I had encountered several dishonest people who lied about their education and employment. After I got verified, I felt much more confident about sharing my profile.",
      trustScore: 92,
    },
    {
      name: "Rahul Patel",
      location: "Mumbai, India",
      quote:
        "My parents were skeptical about online matchmaking until I showed them my MyTrueSoulMate score. It gave them the confidence they needed to proceed with the relationship.",
      trustScore: 88,
    },
    {
      name: "Ananya Gupta",
      location: "Bangalore, India",
      quote:
        "The Trust Score feature helped me find my life partner. I found someone with similar values and a high trust score, and we got married last year!",
      trustScore: 95,
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Stories, <span className="text-red-600">Real Trust</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from users who found peace of mind through MyTrueSoulMate
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                {/* Trust Score Badge */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white border-2 border-red-500 rounded-full flex flex-col items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-red-600">{testimonial.trustScore}</span>
                    <span className="text-[8px] font-semibold text-red-600 -mt-0.5">TRUST</span>
                  </div>
                </div>

                {/* Name and Location */}
                <h3 className="text-xl font-semibold mb-2">{testimonial.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{testimonial.location}</p>

                {/* Quote */}
                <blockquote className="text-muted-foreground leading-relaxed italic">"{testimonial.quote}"</blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
