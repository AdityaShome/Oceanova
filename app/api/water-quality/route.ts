import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")
    const contaminationLevel = searchParams.get("contaminationLevel")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log("[v0] Fetching water quality data...")

    const db = await getDatabase()

    // Build query filters
    const query: any = {}
    if (region && region !== "all") {
      query["location.region"] = { $regex: region, $options: "i" }
    }
    if (contaminationLevel && contaminationLevel !== "all") {
      query.contaminationLevel = contaminationLevel
    }

    const waterQualityData = await db
      .collection("waterQualityData")
      .find(query)
      .sort({ samplingDate: -1 })
      .limit(limit)
      .toArray()

    console.log("[v0] Retrieved", waterQualityData.length, "water quality records")

    return NextResponse.json({
      success: true,
      data: waterQualityData,
      count: waterQualityData.length,
    })
  } catch (error) {
    console.error("[v0] Water quality data fetch error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch water quality data",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const waterQualityRecord = await request.json()

    console.log("[v0] Adding new water quality record...")

    const db = await getDatabase()

    const record = {
      ...waterQualityRecord,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("waterQualityData").insertOne(record)

    console.log("[v0] Water quality record added:", result.insertedId)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      message: "Water quality record added successfully",
    })
  } catch (error) {
    console.error("[v0] Water quality record creation error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to add water quality record",
      },
      { status: 500 },
    )
  }
}
