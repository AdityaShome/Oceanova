import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Code, 
  Database, 
  Brain, 
  Globe, 
  Zap, 
  Shield, 
  Mail, 
  Image, 
  Droplets, 
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Dna,
  BarChart3,
  ExternalLink
} from "lucide-react"

export default function APIDocsPage() {
  const authToken = cookies().get("auth_token")?.value
  if (!authToken) {
    redirect("/try")
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      <BubbleCursor />
      <HomeButton />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">API Documentation</h1>
          </div>
          <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
            Comprehensive guide to Oceanova's APIs, data sources, and integration methods for marine biodiversity research
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="bg-slate-900/50 border-cyan-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-cyan-100 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-cyan-300 mb-2">Platform Overview</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• Architecture & Technologies</li>
                  <li>• Data Flow Pipeline</li>
                  <li>• Authentication System</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-300 mb-2">API Endpoints</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• AI Processing APIs</li>
                  <li>• Data Collection APIs</li>
                  <li>• External Data Sources</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Platform Overview
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-100">Core Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-300 border-blue-300">Next.js 14</Badge>
                  <span className="text-slate-300 text-sm">Frontend Framework</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-300 border-green-300">MongoDB</Badge>
                  <span className="text-slate-300 text-sm">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-300 border-purple-300">Python Flask</Badge>
                  <span className="text-slate-300 text-sm">ML Model Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-orange-300 border-orange-300">Gemini AI</Badge>
                  <span className="text-slate-300 text-sm">AI Processing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-100">Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">OpenWeatherMap API</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">NOAA NDBC Buoys</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 text-sm">NASA Ocean Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300 text-sm">Meteomatics API</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI Processing APIs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            AI Processing APIs
          </h2>

          <div className="grid gap-6">
            {/* Species Identification */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Species Identification
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-300 border-green-300">POST</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/ai/species-identification
                    </code>
                  </div>
                  <p className="text-slate-300">
                    Identify marine species from uploaded images using Google Gemini Vision AI
                  </p>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-semibold mb-2">Request Body:</h4>
                    <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "imageData": "base64_encoded_image",
  "additionalContext": "optional_context_string"
}`}
                    </pre>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-semibold mb-2">Response:</h4>
                    <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "success": true,
  "result": {
    "species": "Manta birostris",
    "confidence": 0.95,
    "conservationStatus": "Vulnerable",
    "description": "Giant oceanic manta ray..."
  }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Water Quality Analysis */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Water Quality Analysis
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-300 border-green-300">POST</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/ai/water-quality-analysis
                    </code>
                  </div>
                  <p className="text-slate-300">
                    Analyze water quality data and provide AI-powered insights
                  </p>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-semibold mb-2">Request Body:</h4>
                    <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "waterQualityData": {
    "temperature": 25.5,
    "ph": 8.1,
    "salinity": 35.2,
    "dissolvedOxygen": 6.8
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "region": "Bangalore"
  }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gene Sequence Analysis */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Dna className="w-5 h-5" />
                    Gene Sequence Analysis
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-300 border-green-300">POST</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/ml/gene-prediction
                    </code>
                  </div>
                  <p className="text-slate-300">
                    Predict species from DNA sequences using ensemble ML models
                  </p>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-semibold mb-2">Request Body:</h4>
                    <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "sequences": ["ATGCGATCGATCGATCG"],
  "sequenceType": "COI"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    AI Chatbot
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-300 border-green-300">POST</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/ai/chatbot
                    </code>
                  </div>
                  <p className="text-slate-300">
                    AI-powered chatbot for marine biology and conservation queries
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Collection APIs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Data Collection APIs
          </h2>

          <div className="grid gap-6">
            {/* Dashboard Data */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Dashboard Data
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-300">GET</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/dashboard-data?region=all&timeframe=6months
                    </code>
                  </div>
                  <p className="text-slate-300">
                    Get biodiversity data, species distribution, and trend analysis
                  </p>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-cyan-300 font-semibold mb-2">Query Parameters:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• <code className="text-cyan-300">region</code> - Filter by region (all, specific region)</li>
                      <li>• <code className="text-cyan-300">timeframe</code> - Time period (1month, 3months, 6months, 1year)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Water Quality Data */}
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyan-100 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Water Quality Data
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-300">GET</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <code className="text-cyan-300 bg-slate-800 px-2 py-1 rounded text-sm">
                      /api/water-quality
                    </code>
                  </div>
                  <p className="text-slate-300">
                    Get water quality measurements and monitoring data
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* External Data Sources */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            External Data Sources
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-100">Ocean Data APIs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">OpenWeatherMap</h4>
                  <p className="text-slate-300 text-sm">Sea surface temperature data</p>
                  <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded">
                    api.openweathermap.org/data/2.5/weather
                  </code>
                </div>
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">NOAA NDBC</h4>
                  <p className="text-slate-300 text-sm">Real-time ocean buoy data</p>
                  <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded">
                    ndbc.noaa.gov/data/realtime2
                  </code>
                </div>
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">NASA Ocean Color</h4>
                  <p className="text-slate-300 text-sm">Chlorophyll and plankton data</p>
                  <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded">
                    oceandata.sci.gsfc.nasa.gov/opendap
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-100">Weather & Atmospheric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">Meteomatics</h4>
                  <p className="text-slate-300 text-sm">Weather and atmospheric data</p>
                  <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded">
                    api.meteomatics.com
                  </code>
                </div>
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">Copernicus Marine</h4>
                  <p className="text-slate-300 text-sm">Ocean salinity and parameters</p>
                  <code className="text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded">
                    marine.copernicus.eu
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Authentication System
          </h2>

          <Card className="bg-slate-900/50 border-cyan-400/20">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2">OTP-Based Authentication</h4>
                  <p className="text-slate-300 mb-4">
                    Secure email-based verification system for user registration and login
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h5 className="text-cyan-300 font-semibold mb-2">Send OTP</h5>
                      <code className="text-sm text-cyan-300">POST /api/send-otp</code>
                      <p className="text-slate-300 text-sm mt-2">Send verification code to email</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h5 className="text-cyan-300 font-semibold mb-2">Verify OTP</h5>
                      <code className="text-sm text-cyan-300">POST /api/verify-otp</code>
                      <p className="text-slate-300 text-sm mt-2">Verify code and complete auth</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Integration Examples */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Code className="w-8 h-8 text-cyan-400" />
            Integration Examples
          </h2>

          <Card className="bg-slate-900/50 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-cyan-100">JavaScript/TypeScript Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 p-6 rounded-lg">
                <h4 className="text-cyan-300 font-semibold mb-4">Species Identification Example:</h4>
                <pre className="text-sm text-slate-300 overflow-x-auto">
{`// Identify species from image
const identifySpecies = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('/api/ai/species-identification', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
};

// Usage
const result = await identifySpecies(imageFile);
console.log('Identified species:', result.result.species);
console.log('Confidence:', result.result.confidence);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact & Support */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Need Help with Integration?</h3>
                <p className="text-cyan-200 mb-6">
                  Contact our team for API support, custom integrations, or technical assistance
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contact" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </a>
                  <a 
                    href="https://github.com/AdityaShome/Oceanova" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Source Code
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
