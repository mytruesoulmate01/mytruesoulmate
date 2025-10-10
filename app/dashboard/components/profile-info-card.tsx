import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Calendar, User } from "lucide-react"
import ProfileField from "./profile-field"
import { formatDateOfBirth, formatGender, formatEmail } from "@/lib/format-utils"

interface ProfileInfoCardProps {
  email: string
  dateOfBirth: string
  gender: string
}

export default function ProfileInfoCard({ email, dateOfBirth, gender }: ProfileInfoCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your registered account information</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileField icon={Mail} label="Email Address" value={formatEmail(email)} />

        <ProfileField icon={Calendar} label="Date of Birth" value={formatDateOfBirth(dateOfBirth)} />

        <ProfileField icon={User} label="Gender" value={formatGender(gender)} />
      </CardContent>
    </Card>
  )
}
