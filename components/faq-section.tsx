import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageCircle, HelpCircle } from "lucide-react"

export default function FAQSection() {
  const faqData = [
    {
      category: "Account & Registration",
      questions: [
        {
          question: "How do I create an account on MyTrueSoulMate?",
          answer:
            "Creating an account is simple. Click on 'Sign up' in the top navigation, provide your email address, create a secure password  and after successfull registration you will get email  with all details .",
        },
        {
          question: "What information do I need to provide during registration?",
          answer:
            "During registration, you'll need a valid email address . For verification, you may need to provide documents like ID proof, educational certificates, employment verification, and other relevant credentials depending on your verification level .",
        },
        {
          question: "Can I update my profile information after registration?",
          answer:
            "Yes, you can update most of your profile information anytime by sending email to our support team. We will verify information as per our  verification process again to maintain trust score accuracy.",
        },
      ],
    },
    {
      category: "Verification Process",
      questions: [
        {
          question: "What documents are required for verification?",
          answer:
            "After successfull sign up , we will send you email ccontain all required background verification document  ,  documents depends on  verification level but typically include government-issued ID, educational certificates, employment verification letters, address proof, and character references. ",
        },
        {
          question: "How long does the verification process take?",
          answer:
            "Standard verification typically takes 3-5 business days but sometime it will take 7-10 days due to additional background checks. You'll receive email updates throughout the process and can track progress in your dashboard.",
        },
        {
          question: "What happens if my verification is rejected?",
          answer:
            "If verification is rejected, you'll receive detailed feedback on the reasons. You can resubmit with corrected documents or additional information. Our support team is available to help you understand requirements and successfully complete verification.",
        },
      ],
    },
    {
      category: "Trust Profile",
      questions: [
        {
          question: "What is Trust Profile?",
          answer:
            "Trust Profile provide details based on these categories personal , social media , education and employment , marriage details , criminal record , expectation .",
        },
        {
          question: "Which document required for Trust Profile ?",
          answer:
            "After sign-up , our team will send you list of document required for verification , evey document will be verified as per our verification process , all details will be shared with you via email .",
        },
        {
          question: "What will happen after my Trust Profile is verified ?",
          answer:
            "Once your Trust Profile is verified, you'll receive a Trust Score that reflects your credibility based on the verifications completed. You can then share your Trust Profile and score with potential partners to build trust and confidence in your interactions by creating Trust Share .",
        },
        {
          question: "Why some details marked as  Not Available  although I already provided verification document ?",
          answer:
            "If any details marked as Not Available  then it means  verification process is still pending for that particular detail , once verification process is completed that detail will be updated automatically in your Trust Profile  and in case we not able to verify that detail then we will notify you with exact reason .",
        },
      ],
    },
    {
      category: "Trust Score",
      questions: [
        {
          question: "What is Trust Score",
          answer:
            "Trust Score is a numerical representation of your trustworthiness based on the verifications you complete on MyTrueSoulMate. It helps potential partners quickly assess your credibility and reliability.",
        },
        {
          question: "How is my trust score calculated?",
          answer: "Every  verified Trust-Details  5 points will be added in your trust score .",
        },
        {
          question: "Can I improve my trust score?",
          answer:
            "Yes! You can improve your trust score by completing additional verifications, adding more credentials, obtaining character references, maintaining consistent information, and choosing premium verification options for enhanced credibility.",
        },
        {
          question: "How often is my trust score updated?",
          answer:
            "Trust scores are updated in real-time when new verifications are completed or when existing information is updated. The system continuously monitors for any changes that might affect your score.",
        },
      ],
    },
    {
      category: "Trust Share",
      questions: [
        {
          question: "What is Trust Share ?",
          answer:
            "Trust Share  help you to select  which trust-details you want to  share with your potential partner.",
        },
        {
          question: "How can I get  potential partner's email id?",
          answer:
            "You can  ask your potential partner to share   email id  that he/she used to register in MyTrueSoulMate .",
        },
        {
          question: "Can I   add/remove  potential partner's email id later ?",
          answer:
            "Yes, you can add by clicking  button - Add Person  and Remove by  clicking on Delete button. you can add maximum 5 email id at a time and if you want to add more than 5 email id then you can send email to support team .",
        },
      ],
    },

    {
      category: "Trust Connection",
      questions: [
        {
          question: "What is Trust Connection ?",
          answer:
            "Trust Connection will show you Trust Share Details and Trust Score of your potential partner who added you in their Trust Share .",
        },
        {
          question: "Why some details marked as Green  and Red color icon ",
          answer:
            "Green Color means   this details has been shared with you  by your potential partner  in the trust share  and Red Color means   this details has not been shared with you  by your potential partner  in the trust share .",
        },
        {
          question: "How can I get  actual details  as  it showing only status of details shared  ?",
          answer:
            "Yes, you can add by clicking  button - Get All Details we will send you email  with actual  details for all Trust Connection .",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my personal information secure?",
          answer:
            "Absolutely. We use bank-level encryption, secure data centers, and follow strict privacy protocols. Your information is encrypted both in transit and at rest. We never share your data without your explicit consent.",
        },
        {
          question: "Who can see my trust score and information?",
          answer:
            "You have complete control over your privacy settings. You can choose what information to share, with whom, and for how long. Recipients only see information you explicitly authorize them to view.",
        },
        {
          question: "Can I delete my account and data?",
          answer:
            "Yes, you can delete your account anytime from your dashboard settings. Upon deletion, all your personal data will be permanently removed from our systems within 30 days, except for legally required records.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I forgot my password. How can I reset it?",
          answer:
            "Click 'Forgot Password' on the login page, enter your registered email address, and you'll receive a password reset link. Follow the instructions in the email to create a new password.",
        },
        {
          question: "How to share  document for verification ?",
          answer:
            "Our support team will  send you email with detailed instruction and documents required for verification process . You can reply to that email with scanned copies or clear photos of the requested documents. Ensure all details are visible and legible for smooth processing.",
        },
        {
          question: "How do I share my trust score with someone?",
          answer:
            "Go to your dashboard, click 'Share Trust Score', enter the recipient's details, choose what information to share, set an expiration date, and send. The recipient will receive a secure link to view your verified information.",
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
              Find answers to common questions about MyTrueSoulMate verification process, trust scores, privacy
              settings, and more. Can't find what you're looking for? We're here to help.
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
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
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
