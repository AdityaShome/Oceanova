import { DataVisualizationDashboard } from "@/components/data-visualization-dashboard"
import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { UpgradeBanner } from "@/components/upgrade-banner"

export default function DashboardPage() {
  return (
    <>
      <BubbleCursor />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Deep sea background effects */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-slate-900/40 to-black/60"></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(59,130,246,0.1)_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(99,102,241,0.1)_0%,_transparent_50%)]"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <HomeButton />
          <div className="container mx-auto px-4 py-8">
            {/* Upgrade Banner */}
            <div className="mb-6">
              <UpgradeBanner variant="card" />
            </div>
            
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <DataVisualizationDashboard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}