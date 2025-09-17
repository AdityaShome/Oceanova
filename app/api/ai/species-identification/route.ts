import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromAuthHeader } from "@/lib/auth"
import { TokenService } from "@/lib/token-service"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getUserCollection } from "@/dbCollections"

export async function POST(request: NextRequest) {
  try {
    const { imageData, additionalContext, watchlist } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // Check token availability for authenticated users
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const token = cookies['auth_token'];
      if (token) {
        try {
          const jwtSecret = process.env.JWT_SECRET || "supersecret";
          const decoded: any = jwt.verify(token, jwtSecret);
          
          if (decoded && decoded.id) {
            // Check token availability
            const tokenCheck = await TokenService.checkTokenAvailability(decoded.id);
            if (!tokenCheck.success) {
              return NextResponse.json({ 
                error: "Daily token limit reached. Please upgrade your plan to continue.",
                tokenLimitReached: true,
                tokensRemaining: tokenCheck.tokensRemaining
              }, { status: 429 });
            }

            // Consume token
            const tokenResult = await TokenService.consumeToken(decoded.id, "species_identification");
            if (!tokenResult.success) {
              return NextResponse.json({ 
                error: "Failed to process request. Please try again.",
                tokenLimitReached: true,
                tokensRemaining: tokenResult.tokensRemaining
              }, { status: 429 });
            }
          }
        } catch (jwtError) {
          // Continue without token check for invalid tokens
          console.log("JWT verification failed, proceeding without token check");
        }
      }
    }

    console.log("[v0] Starting species identification analysis...")

    // Analyze image with Gemini AI
    const result = await GeminiAIService.identifySpeciesFromImage(imageData, additionalContext)

    console.log("[v0] Species identification completed:", result.species)

    // Resolve user from auth header if present
    const authUser = getUserFromAuthHeader(request.headers.get("authorization"))

    // Store analysis result in database
    const db = await getDatabase()
    const analysisRecord = {
      analysisType: "species_identification",
      inputData: {
        type: "image",
        data: imageData.substring(0, 100) + "...", // Store truncated for privacy
      },
      results: {
        primary: result.species,
        confidence: result.confidence,
        alternatives: [],
        explanation: result.description,
      },
      modelUsed: "gemini-2.0-flash",
      processingTime: Date.now(),
      createdAt: new Date(),
      userId: authUser?.id || null,
    }

    await db.collection("aiAnalyses").insertOne(analysisRecord)

    // Optionally add to watchlist
    if (watchlist === true) {
      try {
        await db.collection("watchlist").insertOne({
          userId: authUser?.id || null,
          itemType: "image_recognition",
          referenceId: null,
          title: result.species,
          summary: result.description?.slice(0, 140) || null,
          dataPreview: (imageData as string)?.slice(0, 60) + "...",
          score: result.confidence,
          createdAt: new Date(),
        })
      } catch (err) {
        console.warn("Failed to add image recognition to watchlist", err)
      }
    }

    return NextResponse.json({
      success: true,
      result,
      analysisId: analysisRecord._id,
    })
  } catch (error) {
    console.error("[v0] Species identification API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Species identification failed",
      },
      { status: 500 },
    )
  }
}
