"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ChevronDown, ChevronUp } from "lucide-react"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

interface MarineMapProps {
  speciesData: SpeciesData[]
  loading: boolean
  selectedSpecies?: string | null
}

export default function MarineMap({ speciesData, loading, selectedSpecies }: MarineMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const [isLegendMinimized, setIsLegendMinimized] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0], // Center on equator
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
        maxBounds: [
          [-85, -180],
          [85, 180],
        ],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
        maxZoom: 12,
        worldCopyJump: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(mapInstanceRef.current)

      // Beautiful deep ocean overlay
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri Ocean Service",
          opacity: 0.8,
        },
      ).addTo(mapInstanceRef.current)

      // Initialize markers layer group
      markersRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return

    // Clear existing markers
    markersRef.current.clearLayers()

    if (loading) return

    const createSpeciesIcon = (count: number, depth: number, isSelected = false) => {
      const baseSize = Math.min(Math.max(count / 3 + 14, 12), 45)
      const size = isSelected ? baseSize * 1.3 : baseSize

      // Research-grade color scheme based on depth zones
      let color: string
      let zone: string
      if (depth > 4000) {
        color = "#0f172a" // Slate-900 for hadal zone
        zone = "Hadal"
      } else if (depth > 2000) {
        color = "#1e40af" // Blue-800 for abyssal
        zone = "Abyssal"
      } else if (depth > 1000) {
        color = "#2563eb" // Blue-600 for bathyal
        zone = "Bathyal"
      } else if (depth > 200) {
        color = "#0ea5e9" // Sky-500 for mesopelagic
        zone = "Mesopelagic"
      } else {
        color = "#06b6d4" // Cyan-500 for epipelagic
        zone = "Epipelagic"
      }

      const borderColor = isSelected ? "#fbbf24" : "#ffffff"
      const borderWidth = isSelected ? 4 : 2

      return L.divIcon({
        html: `
          <div class="species-marker" style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: ${borderWidth}px solid ${borderColor};
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${Math.max(size / 3.2, 10)}px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            ${isSelected ? "animation: researchPulse 2s infinite; z-index: 1000;" : ""}
          ">
            ${count > 999 ? "999+" : count}
          </div>
          <style>
            @keyframes researchPulse {
              0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
              50% { transform: scale(1.15); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.6); }
            }
            .species-marker:hover {
              transform: scale(1.1);
              box-shadow: 0 8px 25px rgba(0,0,0,0.5);
            }
          </style>
        `,
        className: "custom-species-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
    }

    speciesData.forEach((species) => {
      if (!species.latitude || !species.longitude) return

      const isSelectedSpecies =
        selectedSpecies &&
        (species.species.toLowerCase().includes(selectedSpecies.toLowerCase()) ||
          species.scientificName.toLowerCase().includes(selectedSpecies.toLowerCase()))

      const marker = L.marker([species.latitude, species.longitude], {
        icon: createSpeciesIcon(species.count, species.depth, !!isSelectedSpecies),
      })

      const depthZone =
        species.depth > 4000
          ? "Hadal"
          : species.depth > 2000
            ? "Abyssal"
            : species.depth > 1000
              ? "Bathyal"
              : species.depth > 200
                ? "Mesopelagic"
                : "Epipelagic"

      const popupContent = `
        <div class="p-5 min-w-[320px] font-sans bg-white">
          <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
            <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background: ${
              species.depth > 4000
                ? "#0f172a"
                : species.depth > 2000
                  ? "#1e40af"
                  : species.depth > 1000
                    ? "#2563eb"
                    : species.depth > 200
                      ? "#0ea5e9"
                      : "#06b6d4"
            }"></div>
            <div>
              <h3 class="font-bold text-xl text-slate-900">${species.species}</h3>
              <p class="text-sm italic text-slate-600">${species.scientificName}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div class="font-semibold text-blue-900 mb-1">Population Count</div>
              <div class="text-blue-700 font-bold text-lg">${species.count.toLocaleString()}</div>
              <div class="text-blue-600 text-xs">individuals observed</div>
            </div>
            <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <div class="font-semibold text-indigo-900 mb-1">Depth Zone</div>
              <div class="text-indigo-700 font-bold text-lg">${species.depth}m</div>
              <div class="text-indigo-600 text-xs">${depthZone} zone</div>
            </div>
            <div class="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
              <div class="font-semibold text-cyan-900 mb-1">Water Temp</div>
              <div class="text-cyan-700 font-bold text-lg">${species.temperature.toFixed(1)}°C</div>
              <div class="text-cyan-600 text-xs">ambient temperature</div>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div class="font-semibold text-slate-900 mb-1">Coordinates</div>
              <div class="text-slate-700 font-bold text-sm">${species.latitude.toFixed(3)}°</div>
              <div class="text-slate-700 font-bold text-sm">${species.longitude.toFixed(3)}°</div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-slate-200">
            <div class="flex justify-between items-center text-xs">
              <div class="text-slate-600">
                <span class="font-medium">Last observed:</span> ${new Date(species.lastUpdated).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </div>
              <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Research Data
              </div>
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 360,
        className: "research-popup",
      })

      markersRef.current?.addLayer(marker)
    })

    if (speciesData.length > 0) {
      const group = L.featureGroup(markersRef.current.getLayers())
      const bounds = group.getBounds()

      if (bounds.isValid()) {
        if (selectedSpecies) {
          // For specific species, zoom closer
          mapInstanceRef.current.fitBounds(bounds.pad(0.2), {
            maxZoom: 6,
          })
        } else {
          // For all species, show global view
          mapInstanceRef.current.fitBounds(bounds.pad(0.1), {
            maxZoom: 4,
          })
        }
      }
    } else if (!selectedSpecies) {
      // Reset to global ocean view when no data
      mapInstanceRef.current.setView([10, 0], 2)
    }
  }, [speciesData, loading, selectedSpecies])

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-700"
        style={{ minHeight: "600px" }}
      />

      {loading && (
        <div className="absolute inset-0 bg-slate-800/95 flex items-center justify-center rounded-lg backdrop-blur-sm" style={{ zIndex: 3000 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-100">Loading Deep Sea Data...</p>
            <p className="text-sm text-slate-300">Fetching real-time species observations</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700" style={{ zIndex: 4000 }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h4 className="font-bold text-sm text-slate-100">Ocean Depth Zones</h4>
          <button
            onClick={() => setIsLegendMinimized(!isLegendMinimized)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title={isLegendMinimized ? "Expand legend" : "Minimize legend"}
          >
            {isLegendMinimized ? (
              <ChevronUp className="h-4 w-4 text-slate-300" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-300" />
            )}
          </button>
        </div>
        
        {!isLegendMinimized && (
          <div className="p-4">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-sm"></div>
                <span className="text-slate-200 font-medium">Epipelagic (0-200m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-sky-500 rounded-full border-2 border-white shadow-sm"></div>
                <span className="text-slate-200 font-medium">Mesopelagic (200-1000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                <span className="text-slate-200 font-medium">Bathyal (1000-2000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-800 rounded-full border-2 border-white shadow-sm"></div>
                <span className="text-slate-200 font-medium">Abyssal (2000-4000m)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-900 rounded-full border-2 border-white shadow-sm"></div>
                <span className="text-slate-200 font-medium">Hadal (&gt;4000m)</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-300 mb-1">Circle size = population count</p>
              {selectedSpecies && (
                <p className="text-xs text-blue-300 font-semibold bg-blue-900/30 px-2 py-1 rounded">
                  Tracking: {selectedSpecies}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Research Institute Watermark */}
      <div className="absolute top-4 right-4 bg-blue-900/90 text-white px-3 py-2 rounded-lg text-xs font-medium" style={{ zIndex: 4000 }}>
        Deep Sea Research Institute
      </div>
    </div>
  )
}





