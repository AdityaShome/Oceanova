"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Fish, Waves, Loader2, Globe, Activity, Thermometer, Gauge, Calendar } from "lucide-react"
import dynamic from "next/dynamic"
import * as XLSX from "xlsx"

// Dynamically import the map component to avoid SSR issues
const MarineMap = dynamic(() => import("@/components/marine-map"), {
  ssr: false,
  loading: () => (
        <div className="w-full h-[600px] bg-slate-800 animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-400" />
        <p className="text-slate-300">Loading deep sea research map...</p>
      </div>
    </div>
  ),
})

interface SpeciesData {
  id: string
  species: string
  scientificName: string
  count: number
  latitude: number
  longitude: number
  depth: number
  temperature: number
  lastUpdated: string
}

interface SearchSuggestion {
  species: string
  scientificName: string
  commonNames: string[]
}

export default function DeepSeaResearchDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [totalSpeciesCount, setTotalSpeciesCount] = useState(0)
  const [avgDepth, setAvgDepth] = useState(0)
  const [avgTemp, setAvgTemp] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)


  const fetchSpeciesData = async (species?: string) => {
    setLoading(true)
    try {
      const name = species?.trim()
      if (!name) {
        setSpeciesData([])
        setTotalSpeciesCount(0)
        setAvgDepth(0)
        setAvgTemp(0)
        return
      }

      console.log(`[v0] Fetching OBIS occurrences for: ${name}`)
      const response = await fetch("/api/obis-species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scientificName: name }),
      })

      if (!response.ok) throw new Error(`OBIS route failed ${response.status}`)
      const data = await response.json()

      console.log(`[v0] OBIS returned ${data.observations?.length || 0} observations`)

      const processedData: SpeciesData[] = (data.observations || []).map((o: any) => ({
        id: o.id,
        species: o.scientificName,
        scientificName: o.scientificName,
        count: 1,
        latitude: Number(o.latitude),
        longitude: Number(o.longitude),
        depth: Number(o.depth) || 0,
        temperature: typeof o.temperature === "number" ? o.temperature : 0,
        lastUpdated: o.lastUpdated || new Date().toISOString(),
      }))

      // Only use real OBIS data - no fallback data
      setSpeciesData(processedData)
      setTotalSpeciesCount(new Set(processedData.map((d) => d.scientificName)).size)
      setAvgDepth(data.summary?.avgDepth || 0)
      setAvgTemp(data.summary?.avgTemp ?? 0)
    } catch (error) {
      console.error("[v0] Error fetching OBIS species data:", error)
      setSpeciesData([])
      setTotalSpeciesCount(0)
      setAvgDepth(0)
      setAvgTemp(0)
    } finally {
      setLoading(false)
    }
  }

  const getSearchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      // Use only Groq API for suggestions - no hardcoded data
      const response = await fetch("/api/search-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        console.error("Groq API failed:", response.status)
        setSuggestions([])
      }
    } catch (error) {
      console.error("Error getting suggestions from Groq API:", error)
      setSuggestions([])
    }
  }




  const handleExportData = () => {
    if (speciesData.length === 0) {
      alert("No species data available to export")
      return
    }

    // Prepare data for Excel export
    const exportData = speciesData.map((species, index) => ({
      "Record ID": index + 1,
      "Species Name": species.species,
      "Scientific Name": species.scientificName,
      "Species Count": species.count,
      "Latitude": species.latitude.toFixed(6),
      "Longitude": species.longitude.toFixed(6),
      "Depth (meters)": species.depth,
      "Temperature (°C)": species.temperature.toFixed(2),
      "Last Updated": new Date(species.lastUpdated).toLocaleDateString(),
      "Depth Zone": species.depth > 4000 ? "Hadal" : 
                   species.depth > 2000 ? "Abyssal" : 
                   species.depth > 1000 ? "Bathyal" : "Mesopelagic"
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = [
      { wch: 10 }, // Record ID
      { wch: 25 }, // Species Name
      { wch: 30 }, // Scientific Name
      { wch: 15 }, // Species Count
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 15 }, // Depth
      { wch: 15 }, // Temperature
      { wch: 15 }, // Last Updated
      { wch: 15 }  // Depth Zone
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Deep Sea Species Data")

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `deep_sea_species_${selectedSpecies || 'all'}_${timestamp}.xlsx`

    // Export file
    XLSX.writeFile(wb, filename)
  }

  // Handle search input changes with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(true)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      getSearchSuggestions(value)
    }, 300)
  }

  // Handle species selection
  const handleSpeciesSelect = (species: string) => {
    setSelectedSpecies(species)
    setSearchQuery(species)
    setShowSuggestions(false)
    setHasSearched(true)
    fetchSpeciesData(species)
  }

  // Handle manual search button click or Enter key
  const handleManualSearch = () => {
    const query = searchQuery.trim()
    if (query.length >= 2) {
      setSelectedSpecies(query)
      setShowSuggestions(false)
      setHasSearched(true)
      fetchSpeciesData(query)
    }
  }

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch()
    }
  }

  // Initial data load - removed to prevent showing all species on page load
  // Data will only be loaded when a specific species is searched

  // Update time on client side to prevent hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Waves className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">Deep Sea Research Institute</h1>
              <p className="text-xl text-blue-100 text-pretty">Real-time Marine Species Abundance Monitoring System</p>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search deep sea species (e.g., vampire squid, anglerfish, giant tube worm)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-3 text-lg bg-white border-0 shadow-lg text-slate-900 placeholder:text-slate-500"
                />
                {loading && (
                  <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-blue-600" />
                )}
              </div>
              <Button
                onClick={handleManualSearch}
                disabled={loading || searchQuery.trim().length < 2}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto shadow-xl border-0 bg-white">
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSpeciesSelect(suggestion.species)}
                      className="w-full text-left p-3 rounded-lg transition-colors hover:bg-blue-50 text-slate-900"
                    >
                      <div className="font-semibold text-slate-900">{suggestion.species}</div>
                      <div className="text-sm text-slate-600">{suggestion.commonNames.join(", ")}</div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Show search hint when user types but no suggestions */}
            {searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50">
                <Card className="p-3 bg-blue-50 border border-blue-200 shadow-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Search className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      No suggestions found. Press Enter or click Search to find locations for "{searchQuery}"
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Selected Species Info */}
          {selectedSpecies && (
            <div className="mt-6 flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 hover:bg-white/30">
                <Fish className="h-4 w-4 mr-2" />
                Tracking: {selectedSpecies}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        <div className="w-80 bg-slate-800 shadow-xl border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Research Dashboard</h2>

            {/* Real-time Stats */}
            <div className="space-y-4 mb-8">
              <Card className="p-4 border border-slate-700 bg-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-slate-100">Live Data Status</span>
                </div>
                <div className="text-2xl font-bold text-green-400">Active</div>
                <div className="text-sm text-slate-300">Last updated: {currentTime || "Loading..."}</div>
              </Card>

              <Card className="p-4 border border-slate-700 bg-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <Fish className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-slate-100">Species Detected</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{totalSpeciesCount}</div>
                <div className="text-sm text-slate-300">Unique species found</div>
              </Card>

              <Card className="p-4 border border-slate-700 bg-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <Gauge className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-slate-100">Avg Depth</span>
                </div>
                <div className="text-2xl font-bold text-indigo-400">{avgDepth}m</div>
                <div className="text-sm text-slate-300">Deep sea focus</div>
              </Card>

              <Card className="p-4 border border-slate-700 bg-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <Thermometer className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-slate-100">Avg Temperature</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400">{avgTemp}°C</div>
                <div className="text-sm text-slate-300">Water temperature</div>
              </Card>
            </div>

            {/* Data Sources */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-100 mb-4">Data Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-slate-100">OBIS Database</div>
                    <div className="text-sm text-slate-300">Global species occurrences</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-slate-100">Groq AI API</div>
                    <div className="text-sm text-slate-300">Intelligent species suggestions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Tools */}
            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Research Tools</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-200 border-slate-600 bg-slate-700 hover:bg-slate-600"
                  onClick={handleExportData}
                  disabled={!hasSearched || speciesData.length === 0}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 p-6">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedSpecies ? `${selectedSpecies} Distribution Map` : "Global Deep Sea Species Distribution"}
                    </h2>
                    <p className="text-blue-100">
                      {loading
                        ? "Loading deep sea data..."
                        : `${speciesData.length} real observation points • Focus: 200m+ depth • Max: 600 points`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Research Institute</div>
                  <div className="font-semibold">Deep Sea Monitoring</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {!hasSearched ? (
                <div className="w-full h-[600px] bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Search className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">Search for Deep Sea Species</h3>
                    <p className="text-slate-400">Enter a scientific name or common name to explore deep sea species on the map</p>
                  </div>
                </div>
              ) : speciesData.length === 0 && !loading ? (
                <div className="w-full h-[600px] bg-slate-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Fish className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No Data Found</h3>
                    <p className="text-slate-400 mb-4">No observations found for "{selectedSpecies}" in the OBIS database</p>
                    <p className="text-sm text-slate-500">Try searching for a different species or check the spelling</p>
                  </div>
                </div>
              ) : (
              <MarineMap speciesData={speciesData} loading={loading} selectedSpecies={selectedSpecies} />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
