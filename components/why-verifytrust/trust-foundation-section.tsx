import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function TrustFoundationSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Trust is the Foundation of Every Marriage
              </h2>

              {/* Enhanced Content Cards */}
              <div className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-lg border-l-4 border-red-600">
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-red-600">Our Vision: </span>
                        MyTrueSoulMate was born from a simple yet powerful idea: building meaningful marriages on a
                        foundation of verified credentials and transparent sharing for serious life partnerships.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border-l-4 border-green-600">
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-green-600">Our Promise: </span>
                        MyTrueSoulMate bridges the gap between convenience and peace of mind, ensuring that every marriage
                        connection you make is built on authenticity and long-term commitment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl p-8 shadow-lg">
              <Image
                src="/images/whyverifytrust-6.png"
                alt="Mobile verification interface showing VerifyTrust profile with verification checkmarks"
                width={400}
                height={300}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
