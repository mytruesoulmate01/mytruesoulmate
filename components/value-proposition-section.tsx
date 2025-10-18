import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, TrendingUp, Users, User, Check } from "lucide-react"
import Image from "next/image"

export default function ValuePropositionSection() {
  const benefits = [
    {
      icon: <Shield className="h-5 w-5 text-red-600" />,
      text: "Verify your credentials for successful marriage connections",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-red-600" />,
      text: "Get a marriage compatibility trust score to share",
    },
    {
      icon: <Users className="h-5 w-5 text-red-600" />,
      text: "Build confidence in your journey to marriage",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-red-50/50 via-white to-pink-50/30 dark:from-red-950/10 dark:via-background dark:to-pink-950/10">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30">
                        {benefit.icon}
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Get Verified
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Side - Mockup */}
          <div className="relative">
            <Card className="max-w-md mx-auto shadow-2xl border-0 bg-white dark:bg-card">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
                      <Image
                        src="/images/clean-heart-logo.png"
                        alt="TrueSoulMate Heart Logo"
                        width={20}
                        height={20}
                        className="filter brightness-0 invert"
                      />
                    </div>
                    <span className="font-semibold text-lg">MyTrueSoulMate</span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">Trust-verified profiles for serious marriage seekers</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get verified credentials and marriage compatibility score
                  </p>

                  {/* Main Content Area with Couple Photo and Right Side Elements */}
                  <div className="relative flex items-center justify-between gap-4 mb-6">
                    {/* Professional Couple Photo */}
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/couple-photo.png"
                        alt="Professional couple representing verified users"
                        width={200}
                        height={150}
                        className="w-full h-auto object-cover rounded-lg"
                        priority
                      />
                    </div>

                    {/* Right Side UI Elements */}
                    <div className="flex flex-col items-center space-y-3">
                      {/* User Avatar - Updated with red color scheme */}
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-red-500" />
                      </div>

                      {/* Verification Checkmarks */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>

                      {/* Trust Score Badge - With reduced size text */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-white border-3 border-blue-500 rounded-full flex flex-col items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-red-600">85</span>
                          <span className="text-[10px] font-semibold text-red-600 -mt-0.5">TRUST SCORE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
