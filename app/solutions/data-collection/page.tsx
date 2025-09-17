"use client"

import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { Bookmark, Upload, FileText, Mail, Shield, Send, User, MessageSquare, Phone, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type WatchItem = {
  _id: string
  itemType: "gene_sequence" | "image_recognition"
  title?: string | null
  summary?: string | null
  score?: number | null
  createdAt?: string
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const { toast } = useToast()

  // Data submission form state
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    institution: "",
    verificationCode: ""
  })
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Contact form state
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    institution: "",
    message: ""
  })

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist')
      if (response.ok) {
        const data = await response.json()
        setWatchlist(data.watchlist || [])
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDataSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', credentials.name)
      formData.append('email', credentials.email)
      formData.append('institution', credentials.institution)
      formData.append('verificationCode', credentials.verificationCode)
      formData.append('description', description)
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('/api/admin-message', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your data submission has been sent to the admin team for review.",
        })
        // Reset form
        setCredentials({ name: "", email: "", institution: "", verificationCode: "" })
        setDescription("")
        setSelectedFile(null)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitting(true)

    try {
      const response = await fetch('/api/admin-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'contact',
          ...contactForm
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your message has been sent to the admin team.",
        })
        setContactForm({ firstName: "", lastName: "", email: "", institution: "", message: "" })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setContactSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden">
      <BubbleCursor />
      <HomeButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full mb-6 backdrop-blur-md border border-cyan-400/30">
              <Bookmark className="h-10 w-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Research Watchlist</h1>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto text-balance">
              Track your research interests, submit new data for review, and collaborate with our marine biodiversity research team.
            </p>
          </div>

          {/* Watchlist Section */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
              <Bookmark className="h-8 w-8 text-cyan-400" />
              Your Research Watchlist
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-cyan-100/80 text-sm">Loading your watchlist...</div>
                ) : watchlist.length === 0 ? (
                  <div className="text-cyan-100/80 text-sm">No items in your watchlist yet. Start by exploring our AI tools!</div>
                ) : (
                  watchlist.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {item.title || (item.itemType === "gene_sequence" ? "eDNA Analysis" : "Image Recognition")}
                        </div>
                        {item.summary && <div className="text-cyan-200 text-xs">{item.summary}</div>}
                      </div>
                      <div className="text-cyan-200 text-xs">
                        {typeof item.score === "number" ? `${Math.round(item.score * 100) / 100}%` : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassmorphismCard>

          {/* Data Submission Section */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
              <Upload className="h-8 w-8 text-emerald-400" />
              Submit New Data
            </h2>
            <p className="text-cyan-100 text-center mb-8 max-w-2xl mx-auto">
              Contribute to our marine biodiversity database by submitting your research data, images, or documents for review by our expert team.
            </p>

            <form onSubmit={handleDataSubmission} className="max-w-4xl mx-auto space-y-6">
              {/* Credentials Verification */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  Verify Your Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Full Name *</label>
                    <Input
                      value={credentials.name}
                      onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                      placeholder="Dr. Jane Smith"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      placeholder="jane.smith@university.edu"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Institution/Organization *</label>
                    <Input
                      value={credentials.institution}
                      onChange={(e) => setCredentials({...credentials, institution: e.target.value})}
                      placeholder="Marine Research Institute"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Verification Code *</label>
                    <Input
                      value={credentials.verificationCode}
                      onChange={(e) => setCredentials({...credentials, verificationCode: e.target.value})}
                      placeholder="Enter verification code"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                    <p className="text-xs text-cyan-200 mt-1">Contact admin for verification code</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-cyan-100 mb-2 block">Data Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide a detailed explanation of the data you want to add, including its source, collection method, and relevance to marine biodiversity research..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200 min-h-[120px]"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-cyan-100 mb-2 block">Attach Supporting Files (Optional)</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-cyan-400/50 transition-colors">
                  <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xlsx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-cyan-100 hover:text-cyan-300">Click to upload files</span>
                  </label>
                  {selectedFile && (
                    <p className="text-cyan-200 text-sm mt-2">Selected: {selectedFile.name}</p>
                  )}
                  <p className="text-cyan-200/70 text-xs mt-1">PDF, DOC, images, or data files (max 10MB)</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 text-white"
              >
                {submitting ? "Submitting..." : "Send Message to Admin"}
              </Button>
            </form>
          </GlassmorphismCard>

          {/* Contact Admin Section */}
          <GlassmorphismCard className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-400" />
              Contact Admin Team
            </h2>
            <p className="text-cyan-100 text-center mb-8 max-w-2xl mx-auto">
              Have questions or need assistance? Get in touch with our research team for support and collaboration opportunities.
            </p>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmission} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-cyan-100 mb-2 block">First Name</label>
                        <Input
                          value={contactForm.firstName}
                          onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                          placeholder="John"
                          className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-cyan-100 mb-2 block">Last Name</label>
                        <Input
                          value={contactForm.lastName}
                          onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                          placeholder="Doe"
                          className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-cyan-100 mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        placeholder="john.doe@university.edu"
                        className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-cyan-100 mb-2 block">Institution/Organization</label>
                      <Input
                        value={contactForm.institution}
                        onChange={(e) => setContactForm({...contactForm, institution: e.target.value})}
                        placeholder="Marine Research Institute"
                        className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-cyan-100 mb-2 block">Message</label>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        placeholder="Tell us about your research interests or collaboration ideas..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200 min-h-[120px]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={contactSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:from-blue-400/30 hover:to-cyan-400/30 text-white"
                    >
                      {contactSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Research Center</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-cyan-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">
                          Centre for Marine Living Resources and Ecology
                        </div>
                        <div className="text-sm text-cyan-200">
                          Ministry of Earth Sciences
                          <br />
                          Kochi, Kerala, India
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">heise3nberg@gmail.com</div>
                        <div className="text-sm text-cyan-200">Admin inquiries</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-cyan-400" />
                      <div>
                        <div className="font-medium text-white">+91-484-2390814</div>
                        <div className="text-sm text-cyan-200">Research collaboration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-2">Join Our Research Network</h3>
                    <p className="text-sm text-cyan-200 mb-4">
                      Collaborate with marine researchers worldwide and contribute to deep sea biodiversity conservation.
                    </p>
                    <Button className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30 hover:from-cyan-400/30 hover:to-blue-400/30 text-white">
                      Apply for Access
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  )
}