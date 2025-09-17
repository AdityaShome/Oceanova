import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region") || "all"
    const timeframe = searchParams.get("timeframe") || "6months"

    const { db } = await connectToDatabase()

    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Calculate date range based on timeframe
    const now = new Date()
    const timeframeMap = {
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365,
    }
    const daysBack = timeframeMap[timeframe as keyof typeof timeframeMap] || 180
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Build query filters
    const filters: any = {
      createdAt: { $gte: startDate },
    }

    if (region !== "all") {
      filters.region = region
    }

    // Fetch biodiversity data
    const biodiversityData = await db
      .collection("species_observations")
      .find(filters)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    // Fetch species distribution
    const speciesDistribution = await db
      .collection("species_observations")
      .aggregate([
        { $match: filters },
        {
          $group: {
            _id: "$species",
            count: { $sum: 1 },
            conservationStatus: { $first: "$conservationStatus" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            species: "$_id",
            count: 1,
            conservationStatus: 1,
            percentage: { $multiply: ["$count", 100] },
          },
        },
      ])
      .toArray()

    // Generate trend data (monthly aggregation)
    const trendData = await db
      .collection("species_observations")
      .aggregate([
        { $match: filters },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            speciesCount: { $sum: 1 },
            avgWaterQuality: { $avg: "$waterQuality" },
            avgThreatLevel: { $avg: "$threatLevel" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            month: {
              $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }],
            },
            speciesCount: 1,
            waterQuality: { $round: ["$avgWaterQuality", 1] },
            threatLevel: { $round: ["$avgThreatLevel", 1] },
          },
        },
      ])
      .toArray()

    // Transform data for frontend
    const transformedBiodiversityData = biodiversityData.map((item) => ({
      id: item._id.toString(),
      location: item.location,
      date: item.createdAt.toISOString(),
      speciesCount: item.speciesCount,
      threatLevel: item.threatLevel,
      waterQuality: item.waterQuality,
      temperature: item.temperature,
      depth: item.depth,
      coordinates: item.coordinates,
    }))

    const transformedSpeciesDistribution = speciesDistribution.map((item) => ({
      species: item.species,
      count: item.count,
      conservationStatus: item.conservationStatus,
      percentage: Math.round((item.count / biodiversityData.length) * 100),
    }))

    return NextResponse.json({
      biodiversityData: transformedBiodiversityData,
      speciesDistribution: transformedSpeciesDistribution,
      trendData: trendData,
    })
  } catch (error) {
    console.error("[v0] Dashboard data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
