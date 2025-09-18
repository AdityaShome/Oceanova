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

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/species-recognition", label: "Species ID", icon: "🐠" },
    { href: "/water-quality", label: "Water Quality", icon: "💧" },
    { href: "/solutions/ai-processing", label: "AI Tools", icon: "🤖" },
    { href: "/solutions/conservation-insights", label: "Conservation", icon: "🌊" },
    { href: "/solutions/population-trends", label: "Trends", icon: "📈" },
    { href: "/solutions/data-collection", label: "Data", icon: "📋" }
  ]

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
    { href: "/solutions/population-trends", label: "Abundance", icon: TrendingUp },
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start h-18 relative w-full">
            {/* Centered Navigation Container */}
            <div className="flex items-center w-full">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-2">
                {/* Brand Logo + Text */}
                <div className="hidden lg:flex items-center space-x-2">
                  <img src="/placeholder-logo.png" alt="Oceanova Logo" className="w-20 h-20 drop-shadow" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent tracking-wide">
                      OCEANOVA
                    </span>
                    <span className="text-xs text-cyan-300/40 font-medium tracking-wider">
                      Marine Conservation Platform
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden lg:flex items-center ml-6">
                <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/10">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-300 group ${
                          isActive
                            ? "text-white"
                            : "text-cyan-100 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Profile and Contact */}
              <div className="flex items-center space-x-2 ml-auto pl-2">
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-1 p-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-md overflow-hidden border-2 border-cyan-400/40 group-hover:border-cyan-300 transition-colors duration-300">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                            <User className="w-3 h-3 text-cyan-300" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-slate-900"></div>
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-[10px] font-medium text-white">
                        {userData?.firstName || "User"}
                      </div>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-medium text-white">{userData?.firstName} {userData?.lastName}</div>
                        <div className="text-xs text-cyan-300/70">{userData?.email}</div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-cyan-100 hover:text-white hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-cyan-100 hover:text-white hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <div className="border-t border-white/10 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                <BubbleButton
                  onClick={scrollToContact}
                  className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 hover:shadow-lg hover:shadow-emerald-400/25 transition-all duration-300 px-2 py-1.5 text-[10px]"
                >
                  Contact Us
                </BubbleButton>
              </div>
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="lg:hidden">
              <BubbleButton 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-white hover:bg-white/10 transition-all duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </BubbleButton>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-slate-900/95 backdrop-blur-2xl border-t border-cyan-400/20 rounded-b-3xl shadow-2xl">
                {navItems.map((item) => {

                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}

                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? "text-white bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30"
                          : "text-cyan-100 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                {/* Mobile Profile Section */}
                {userData && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="px-4 py-3 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-400/40">
                          {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-cyan-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{userData.firstName} {userData.lastName}</div>
                          <div className="text-xs text-cyan-300/70">{userData.email}</div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-cyan-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
                
                <div className="pt-4">
                  <BubbleButton
                    onClick={() => {
                      scrollToContact()
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30"
                  >
                    Contact Us
                  </BubbleButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  )
}

