import { ContactSection } from "@/components/contact-section"
import { BubbleCursor } from "@/components/bubble-cursor"
import { HomeButton } from "@/components/home-button"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function ContactPage() {
  const authToken = cookies().get("auth_token")?.value
  if (!authToken) {
    redirect("/try")
  }

  return (
    <div className="min-h-screen relative">
      <BubbleCursor />
      <HomeButton />
      <main>
        <ContactSection />
      </main>
    </div>
  )
}
