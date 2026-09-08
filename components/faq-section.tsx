import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageCircle, HelpCircle } from "lucide-react"

export default function FAQSection() {
  const faqData = [
    {
      category: "About MyTrueSoulMate",
      questions: [
        {
          question: "What is MyTrueSoulMate?",
          answer:
            "MyTrueSoulMate helps you find the right marriage bureau for your requirements and connects you with professional verification services to check important details of a shortlisted proposal — all through one platform.",
        },
        {
          question: "How is MyTrueSoulMate different from a regular matrimony site?",
          answer:
            "We are not a matrimony site. Instead of listing profiles, we understand your requirements, match you with marriage bureaus that specialize in your community, religion, location or profession, and help you register with them. We also arrange pre-marriage verification when needed.",
        },
        {
          question: "Who can use MyTrueSoulMate?",
          answer:
            "Anyone looking for the right marriage bureau to assist with their partner search, or anyone who wants a shortlisted proposal verified before making a final decision, can use MyTrueSoulMate.",
        },
      ],
    },
    {
      category: "Sharing Your Requirements",
      questions: [
        {
          question: "How do I share my requirements?",
          answer:
            "Click 'Share Your Requirements' or 'Get Started', sign up with your email, and fill in your preferences such as community, religion, location, profession, family background and partner expectations.",
        },
        {
          question: "Do I need to repeat my requirements to every marriage bureau?",
          answer:
            "No. You share your requirements with us once, and we use them to identify and connect you with all relevant marriage bureaus, saving you the effort of explaining them separately each time.",
        },
        {
          question: "Can I update my requirements later?",
          answer:
            "Yes, you can update your requirements anytime by contacting our support team. We'll use the updated information to refine the marriage bureau matches we recommend for you.",
        },
      ],
    },
    {
      category: "Marriage Bureau Matching",
      questions: [
        {
          question: "How do you find suitable marriage bureaus for me?",
          answer:
            "Our team reviews your requirements and searches for marriage bureaus that specialize in profiles matching your community, religion, location, profession or family background, then shares the most relevant options with you.",
        },
        {
          question: "Will I be registered with multiple marriage bureaus?",
          answer:
            "We can connect you with multiple marriage bureaus so you have more search opportunities, but you decide which ones you'd like to proceed and register with.",
        },
        {
          question: "Can I compare marriage bureaus before choosing?",
          answer:
            "Yes, we share details about each recommended bureau's services, specialization and pricing so you can compare and make an informed choice before registering.",
        },
      ],
    },
    {
      category: "Registration Assistance",
      questions: [
        {
          question: "How does MyTrueSoulMate help with registration?",
          answer:
            "Once you select a marriage bureau, our team assists you in completing the registration process with them, so you don't have to navigate it on your own.",
        },
        {
          question: "Do I pay MyTrueSoulMate or the marriage bureau directly?",
          answer:
            "Marriage bureau registration fees are paid directly to the respective bureau as per their terms. Our team will guide you on the process and any charges applicable for our matching and assistance services.",
        },
        {
          question: "What if I'm not satisfied with a recommended marriage bureau?",
          answer:
            "Let us know and our team will look for other suitable marriage bureaus that better match your requirements.",
        },
      ],
    },
    {
      category: "Pre-Marriage Verification",
      questions: [
        {
          question: "What is pre-marriage verification?",
          answer:
            "It's a service where we connect you with professional, independent agencies to verify important details of a shortlisted proposal — such as identity, education, employment or background information — before you make your final decision.",
        },
        {
          question: "Is verification done with the other person's consent?",
          answer:
            "Yes. Verification of a shortlisted proposal's details is carried out with the consent of the person concerned, ensuring the process is transparent and respectful for everyone involved.",
        },
        {
          question: "When should I request verification?",
          answer:
            "You can request verification support once you have a shortlisted proposal and want additional confidence before proceeding towards marriage.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my personal information kept confidential?",
          answer:
            "Yes. Your requirements and personal details are shared only with the marriage bureaus or verification agencies relevant to your case, and only to the extent necessary to assist you.",
        },
        {
          question: "Who can see the requirements I share?",
          answer:
            "Only our internal team and the specific marriage bureaus or verification partners we connect you with, for the purpose of assisting your search, can see your requirements.",
        },
        {
          question: "Can I ask you to delete my information?",
          answer:
            "Yes, you can request deletion of your account and data anytime by contacting our support team, and we will remove it in line with our data retention policy.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          question: "How can I contact the MyTrueSoulMate team?",
          answer:
            "You can reach us anytime at support@mytruesoulmate.com, or use the 'Talk to Our Team' option on the website, and we'll respond as soon as possible.",
        },
        {
          question: "How long does it take to get matched with a marriage bureau?",
          answer:
            "Timelines vary based on how specific your requirements are, but our team typically shares suitable marriage bureau options within a few business days of receiving your requirements.",
        },
        {
          question: "What if I have a complaint about a marriage bureau or verification service?",
          answer:
            "Please contact our support team with the details. We will look into the matter and assist in resolving it, and take it into account for future recommendations.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-600 rounded-full">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Find answers to common questions about finding the right marriage bureau, sharing your requirements,
              pre-marriage verification, and more. Can't find what you're looking for? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-red-600">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-full">
                    <MessageCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4">Talk To Our Team</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Our support team is here to help you with any questions or concerns. We typically respond within 24
                  hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Email us at:</span>
                  </div>
                  <a
                    href="mailto:support@mytruesoulmate.com"
                    className="text-red-600 hover:text-red-700 font-semibold text-lg transition-colors"
                  >
                    support@mytruesoulmate.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
