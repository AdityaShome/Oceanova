import { type NextRequest, NextResponse } from "next/server"
import { GeminiAIService } from "@/lib/gemini-services"
import { VISION_MODEL_ID } from "@/lib/gemini-client"
import { getDatabase } from "@/lib/mongodb"


export async function POST(request: NextRequest) {
  try {
    const { imageData, additionalContext } = await request.json()

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

    // Try to store analysis result in database, but don't fail the request if DB write fails
    let analysisId: unknown = undefined
    try {
      const db = await getDatabase()
      const analysisRecord = {
        analysisType: "species_identification",
        inputData: {
          type: "image",
          data: imageData.substring(0, 100) + "...",
        },
        results: {
          primary: result.species,
          confidence: result.confidence,
          alternatives: [],
          explanation: result.description,
        },
        modelUsed: VISION_MODEL_ID,
        processingTime: Date.now(),
        createdAt: new Date(),
      }
      const insert = await db.collection("aiAnalyses").insertOne(analysisRecord)
      analysisId = insert.insertedId
    } catch (dbError) {
      console.warn("[v0] Skipping DB save for species identification:", dbError)
    }

    return NextResponse.json({
      success: true,
      result,
      analysisId,
    })
  } catch (error) {
    console.error("[v0] Species identification API error:", error)
    const message = error instanceof Error ? error.message : "Species identification failed"
    const isOverloaded = /503|overloaded|temporarily unavailable/i.test(message)
    const isRateLimited = /429|rate limit/i.test(message)
    const status = isOverloaded ? 503 : isRateLimited ? 429 : 500
    return NextResponse.json({ error: message }, { status })
  }
}