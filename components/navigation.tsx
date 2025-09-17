"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BubbleButton } from "@/components/bubble-button"
import { Menu, X, User, LogOut, Settings, ChevronDown, Zap, Crown, Building2, MoreHorizontal, Phone, BarChart3, TrendingUp, Leaf } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [avatar, setAvatar] = useState<string>("")
  const [userData, setUserData] = useState<any>(null)
  const [tokenStatus, setTokenStatus] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile")
      if (stored) {
        const data = JSON.parse(stored)
        setUserData(data)
        if (data?.avatar) {
          setAvatar(data.avatar)
        }
      }
    } catch {}
  }, [])

  // Fetch token status and subscription info
  useEffect(() => {
    const fetchTokenStatus = async () => {
      try {
        const response = await fetch('/api/tokens/status', {
          credentials: 'include'
        })
        const data = await response.json()
        if (data.success) {
          setTokenStatus(data.tokenStatus)
          setSubscription(data.subscription)
        }
      } catch (error) {
        console.error('Error fetching token status:', error)
      }
    }

    if (userData) {
      fetchTokenStatus()
    }
  }, [userData])

  const mainNavItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/solutions/data-collection", label: "Watchlist", icon: "📋" },
    { href: "/solutions/ai-processing", label: "AI Processing", icon: "🤖" },
    { href: "/species-recognition", label: "Species Recognition", icon: "🔍" },
    { href: "/water-quality", label: "Water Quality", icon: "💧" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
  ]

  const moreNavItems = [
    { href: "/solutions/population-trends", label: "Population Trends", icon: TrendingUp },
    { href: "/solutions/conservation-insights", label: "Conservation", icon: Leaf },
    { href: "/subscription", label: "Subscription", icon: Crown },
  ]

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem("profile")
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-cyan-900/95 border-b border-gradient-to-r from-cyan-400/30 via-blue-400/20 to-cyan-400/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center backdrop-blur-md border border-cyan-400/40 shadow-lg group-hover:shadow-cyan-400/25 transition-all duration-300 group-hover:scale-105">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                  AI-driven Biodiversity
                </span>
                <span className="text-xs text-cyan-300/70 font-medium tracking-wider">
                  Marine Conservation Platform
                </span>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item