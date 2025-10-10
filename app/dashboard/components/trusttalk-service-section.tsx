import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"

interface TrustTalkServiceSectionProps {
  icon: LucideIcon
  title: string
  subtitle: string
  benefits: string[]
  image: string
  imageAlt: string
  layout: "content-left" | "content-right"
}

export default function TrustTalkServiceSection({
  icon: Icon,
  title,
  subtitle,
  benefits,
  image,
  imageAlt,
  layout,
}: TrustTalkServiceSectionProps) {
  const ContentSection = () => (
    <div className="flex flex-col justify-center space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-gray-700" />
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>

      <p className="text-lg text-gray-600 mb-4">{subtitle}</p>

      <ul className="space-y-3">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span className="text-base text-gray-700 leading-relaxed">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const ImageSection = () => (
    <div className="flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <Image
          src={image || "/placeholder.svg"}
          alt={imageAlt}
          width={400}
          height={400}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </div>
  )

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {layout === "content-left" ? (
            <>
              <ContentSection />
              <ImageSection />
            </>
          ) : (
            <>
              <div className="lg:order-2">
                <ContentSection />
              </div>
              <div className="lg:order-1">
                <ImageSection />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
