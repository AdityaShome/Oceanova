import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { SolutionSection } from "@/components/solution-section"
import { InteractivePredictionSection } from "@/components/interactive-prediction-section"
import { DataResultsSection } from "@/components/data-results-section"
import { ContactSection } from "@/components/contact-section"
import { ContaminationMap } from "@/components/contamination-map"
import { BubbleCursor } from "@/components/bubble-cursor"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function HomePage() {
  const authToken = cookies().get("auth_token")?.value
  if (!authToken) {
    redirect("/try")
  }

  return (
    <div className="min-h-screen bg-background">
      <BubbleCursor />
      <Navigation />
      <main>
        <HeroSection />
        <SolutionSection />
        <InteractivePredictionSection />
        <DataResultsSection />
        <section className="py-20 bg-gradient-to-b from-slate-950 via-blue-950 to-cyan-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Global Ocean Contamination Monitoring</h2>
              <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
                Real-time tracking of contaminated marine areas using AI-powered water quality analysis
              </p>
            </div>
            <ContaminationMap />
          </div>
        </section>
        <ContactSection />
      </main>
    </div>
  )
}