import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPrompt = `You are an AI assistant for the Deep Sea Biodiversity Research Platform. This platform focuses on:

${context}

Key features of the platform include:
- AI-powered species identification using advanced machine learning
- Environmental monitoring and water quality analysis
- Predictive analytics for deep ocean ecosystems
- Conservation insights and recommendations
- Real-time data collection from various ocean sources
- Gene sequence prediction for marine species
- Population trend analysis
- Interactive water quality mapping

You should help users with:
- Understanding how to use the platform features
- Explaining marine biodiversity concepts
- Providing information about ocean conservation
- Guiding users through species identification processes
- Answering questions about water quality monitoring
- Explaining AI/ML techniques used in marine research

Keep responses helpful, informative, and focused on the platform's capabilities. Be concise but thorough.

User message: ${message}`

    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chatbot API error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
