"use client"

import Link from "next/link"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { Database, Cpu, TrendingUp, Shield } from "lucide-react"

export function SolutionSection() {
  const solutions = [
    {
      icon: Database,
      title: "Data Collection",
      description: "ROVs, Sonar, Environmental DNA sampling from deep ocean environments",
      features: ["Remote sensing", "eDNA analysis", "Multi-depth sampling"],
      href: "/solutions/data-collection",
    },
    {
      icon: Cpu,
      title: "AI Processing",
      description: "Advanced machine learning for species identification and population analysis",
      features: ["Image recognition", "Genetic analysis", "Pattern detection"],
      href: "/solutions/ai-processing",
    },
    {
      icon: TrendingUp,
      title: "Abundance",
      description: "Real-time monitoring and predictive modeling of marine biodiversity",
      features: ["Trend analysis", "Population modeling", "Risk assessment"],
      href: "/solutions/population-trends",
    },
    {
      icon: Shield,
      title: "Conservation Insights",
      description: "OCEANOVA",
      features: ["Threat detection", "Action plans", "Impact assessment"],
      href: "/solutions/conservation-insights",
    },
  ]

  return (
    <section id="solution" className="py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">Our Deep Sea Solutions</h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto text-balance">
            Comprehensive AI-powered platform for deep sea biodiversity research, combining cutting-edge technology with
            marine conservation expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <GlassmorphismCard key={index} className="p-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-md border border-cyan-400/30">
                <solution.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{solution.title}</h3>
              <p className="text-cyan-100 mb-4 text-sm">{solution.description}</p>
              <ul className="space-y-2 mb-6">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-cyan-200">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={solution.href}>
                <BubbleButton className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 text-sm">
                  Explore Solution →
                </BubbleButton>
              </Link>
            </GlassmorphismCard>
          ))}
        </div>

        {/* Process Flow */}
        <GlassmorphismCard className="p-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">AI-Powered Research Workflow</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-cyan-400/30">
                <span className="text-2xl font-bold text-cyan-400">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Data Collection</h4>
              <p className="text-sm text-cyan-100">
                Collect environmental DNA, images, and sensor data from deep ocean environments using ROVs and advanced
                sampling techniques.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-emerald-400/30">
                <span className="text-2xl font-bold text-emerald-400">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">AI Analysis</h4>
              <p className="text-sm text-cyan-100">
                Process data through advanced AI models for species identification, population analysis, and
                environmental assessment.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-purple-400/30">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Insights & Action</h4>
              <p className="text-sm text-cyan-100">
                Generate actionable insights for conservation efforts, threat assessment, and biodiversity preservation
                strategies.
              </p>
            </div>
          </div>
        </GlassmorphismCard>
      </div>
    </section>
  )
}
