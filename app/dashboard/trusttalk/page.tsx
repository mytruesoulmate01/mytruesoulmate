// app/dashboard/trusttalk/page.tsx
"use client"

import { User, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"

const trustTalkServices = [
  {
    id: "individual-counseling",
    icon: User,
    title: "Individual Counseling",
    subtitle: "Personal guidance for singles preparing for marriage",
    benefits: [
      "Gain clearer insight into your relationship goals",
      "Learn to manage emotions effectively",
      "Secure space for personal expression",
      "Professional guidance for mental wellness",
    ],
    image: "/images/trust-talk-1.png",
    imageAlt: "Professional male counselor providing individual counseling services",
  },
  {
    id: "couples-counseling",
    icon: Users,
    title: "Couples Counseling",
    subtitle: "Joint sessions for couples planning their future together",
    benefits: [
      "Plan your perfect marriage together",
      "Learn negotiation and compromise skills",
      "Discuss household responsibilities",
      "Family and child planning guidance",
    ],
    image: "/images/trust-talk-2.png",
    imageAlt: "Professional female counselor providing couples counseling services",
  },
]

export default function TrustTalkPage() {
  return (
    <ProtectedRoute>
      <TrustTalkContent />
    </ProtectedRoute>
  )
}

function TrustTalkContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold">TrustTalk</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-8">
              {trustTalkServices.map((service) => (
                <div key={service.id} className="rounded-md border overflow-hidden">
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 border-b">
                    <div className="flex items-center gap-3">
                      <service.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{service.title}</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{service.subtitle}</p>
                  </div>

                  <div className="p-6 bg-white dark:bg-gray-800">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Benefits:</h3>
                        <ul className="space-y-3">
                          {service.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-md">
                          <img
                            src={service.image || "/placeholder.svg?height=300&width=300&query=counseling session"}
                            alt={service.imageAlt}
                            className="w-full h-auto object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
