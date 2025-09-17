import { NextRequest, NextResponse } from "next/server"

type ObisOccurrence = {
  decimalLatitude?: number
  decimalLongitude?: number
  depth?: number
  minimumDepthInMeters?: number
  temperature?: number
  scientificName?: string
  eventDate?: string
  id?: string | number
}

export async function POST(req: NextRequest) {
  try {
    const { scientificName } = await req.json()
    if (!scientificName || typeof scientificName !== "string") {
      return NextResponse.json({ error: "scientificName is required" }, { status: 400 })
    }

    const baseUrl = "https://api.obis.org/v3/occurrence"
    const pageSize = 500
    let from = 0
    const all: ObisOccurrence[] = []

    for (;;) {
      const params = new URLSearchParams({
        size: String(pageSize),
        from: String(from),
        hasgeom: "true",
        scientificname: scientificName,
      })
      const url = `${baseUrl}?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) {
        const text = await res.text()
        console.error("[OBIS] Error:", res.status, text)
        return NextResponse.json({ observations: [], summary: { count: 0, avgDepth: 0, avgTemp: null } })
      }
      const data = await res.json()
      const results: ObisOccurrence[] = data.results || []
      all.push(...results)

      if (results.length < pageSize) break
      from += pageSize
      if (from > 20000) break
    }

    const observations = all
      .filter(
        (o) =>
          o &&
          typeof o.decimalLatitude === "number" &&
          typeof o.decimalLongitude === "number" &&
          (typeof o.depth === "number" || typeof o.minimumDepthInMeters === "number"),
      )
      .map((o, idx) => ({
        id: String(o.id ?? idx),
        scientificName: o.scientificName || scientificName,
        latitude: Number(o.decimalLatitude),
        longitude: Number(o.decimalLongitude),
        depth: typeof o.depth === "number" ? o.depth : Number(o.minimumDepthInMeters),
        temperature: typeof o.temperature === "number" ? o.temperature : null,
        lastUpdated: o.eventDate || null,
      }))

    const depthValues = observations.map((o) => o.depth).filter((d) => typeof d === "number") as number[]
    const tempValues = observations
      .map((o) => (typeof o.temperature === "number" ? o.temperature : null))
      .filter((t): t is number => typeof t === "number")

    const avgDepth = depthValues.length ? Math.round(depthValues.reduce((a, b) => a + b, 0) / depthValues.length) : 0
    const avgTemp = tempValues.length
      ? Math.round((tempValues.reduce((a, b) => a + b, 0) / tempValues.length) * 10) / 10
      : null

    return NextResponse.json({
      observations,
      summary: {
        count: observations.length,
        avgDepth,
        avgTemp,
      },
    })
  } catch (err) {
    console.error("[OBIS] Route error", err)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}





