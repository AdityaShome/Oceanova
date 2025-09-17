"use client"

import { useState, useEffect } from "react"
import { BubbleButton } from "@/components/bubble-button"
import { ImageSlideshow } from "@/components/image-slideshow"
import { ArrowRight, Microscope, Waves, Brain, Fish, Anchor } from "lucide-react"

interface HeroStats {
  speciesIdentified: number
  waterQualityPoints: number
  conservationProjects: number
}

export function HeroSection() {
  const [stats, setStats] = useState<HeroStats>({
    speciesIdentified: 0,
    waterQualityPoints: 0,
    conservationProjects: 0,
  })
  const [loading, setLoading] = useState(true)

  // Deep sea images for slideshow
  const deepSeaImages = [
    "/deep-sea-images/slide1.jpg",
    "/deep-sea-images/slide2.jpg", 
    "/deep-sea-images/slide3.jpg",
    "/deep-sea-images/slide4.jpg",
    "/deep-sea-images/slide5.jpg",
  ]

  useEffect(() => {
    fetchHeroStats()
  }, [])

  const fetchHeroStats = async () => {
    try {
      const response = await fetch("/api/dashboard-data?timeframe=all")
      if (response.ok) {
        const data = await response.json()
        setStats({
          speciesIdentified: data.totalSpecies || 0,
          waterQualityPoints: data.waterQualityPoints || 0,
          conservationProjects: data.conservationProjects || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch hero stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSolutions = () => {
    const solutionsSection = document.getElementById("solutions")
    if (solutionsSection) {
      solutionsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToData = () => {
    const dataSection = document.getElementById("data-results")
    if (dataSection) {
      dataSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Underwater loop background..mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Animated deep sea particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating sea creatures silhouettes */}
      <div className="absolute inset-0 opacity-10">
        <Fish
          className="absolute top-20 left-10 w-16 h-16 text-cyan-400 animate-bounce"
          style={{ animationDuration: "4s" }}
        />
        <Fish
          className="absolute bottom-32 right-20 w-12 h-12 text-blue-400 animate-bounce"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
        <Anchor
          className="absolute top-1/2 left-1/4 w-8 h-8 text-slate-400 animate-pulse"
          style={{ animationDuration: "3s" }}
        />
      </div>

      {/* Underwater light rays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-cyan-400/40 to-transparent transform rotate-12 animate-pulse"></div>
        <div
          className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-blue-400/30 to-transparent transform -rotate-6 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                <span className="text-white">AI-Driven</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Deep Sea Biodiversity
                </span>
                <br />
                <span className="text-white">Research Platform</span>
              </h1>
              <p className="text-xl text-cyan-100 text-pretty max-w-2xl">
                Revolutionizing marine conservation through advanced AI-powered species identification, environmental
                monitoring, and predictive analytics for deep ocean ecosystems.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <BubbleButton
                onClick={scrollToSolutions}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/30 hover:from-cyan-400/30 hover:to-blue-500/30 text-white group"
              >
                Explore Our Solution
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </BubbleButton>
              <BubbleButton
                onClick={scrollToData}
                variant="outline"
                className="border-cyan-400/30 hover:bg-cyan-500/10 bg-transparent text-cyan-100 hover:text-white"
              >
                View Research Data
              </BubbleButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mb-8">
              <div className="flex items-center space-x-3 backdrop-blur-md bg-cyan-900/20 p-4 rounded-lg border border-cyan-400/20">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Microscope className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Species ID</h3>
                  <p className="text-sm text-cyan-200">
                    {loading ? "Loading..." : `${stats.speciesIdentified.toLocaleString()} identified`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 backdrop-blur-md bg-blue-900/20 p-4 rounded-lg border border-blue-400/20">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Waves className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Water Quality</h3>
                  <p className="text-sm text-blue-200">
                    {loading ? "Loading..." : `${stats.waterQualityPoints.toLocaleString()} monitoring points`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 backdrop-blur-md bg-emerald-900/20 p-4 rounded-lg border border-emerald-400/20">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Conservation</h3>
                  <p className="text-sm text-emerald-200">
                    {loading ? "Loading..." : `${stats.conservationProjects} active projects`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-cyan-400/20 backdrop-blur-md">
              {/* Image Slideshow */}
              <ImageSlideshow 
                images={deepSeaImages}
                autoSlide={true}
                slideInterval={5000}
              />

              {/* AI workflow visualization overlay */}
              <div className="absolute bottom-2 left-6 right-6 z-10">
                <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-4 border border-cyan-400/30">
                  <h3 className="font-semibold text-white mb-2">AI Deep Sea Analysis Pipeline</h3>
                  <div className="flex items-center justify-between text-sm text-cyan-200">
                    <span>Data Collection</span>
                    <ArrowRight className="h-4 w-4 text-cyan-400" />
                    <span>AI Processing</span>
                    <ArrowRight className="h-4 w-4 text-cyan-400" />
                    <span>Conservation Insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
