import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.warn("[v0] GROQ_API_KEY not found - returning sample suggestions for testing")
      return NextResponse.json({ 
        suggestions: [
          { species: "Vampyroteuthis infernalis", scientificName: "Vampyroteuthis infernalis", commonNames: ["Vampire squid"] },
          { species: "Melanocetus johnsonii", scientificName: "Melanocetus johnsonii", commonNames: ["Deep sea anglerfish"] },
          { species: "Grimpoteuthis", scientificName: "Grimpoteuthis", commonNames: ["Dumbo octopus"] },
          { species: "Riftia pachyptila", scientificName: "Riftia pachyptila", commonNames: ["Giant tube worm"] },
          { species: "Mitsukurina owstoni", scientificName: "Mitsukurina owstoni", commonNames: ["Goblin shark"] },
          { species: "Chlamydoselachus anguineus", scientificName: "Chlamydoselachus anguineus", commonNames: ["Frilled shark"] },
          { species: "Macropinna microstoma", scientificName: "Macropinna microstoma", commonNames: ["Barreleye fish"] },
          { species: "Bathynomus giganteus", scientificName: "Bathynomus giganteus", commonNames: ["Giant isopod"] },
          { species: "Chauliodus sloani", scientificName: "Chauliodus sloani", commonNames: ["Sloane's viperfish"] },
          { species: "Opisthoproctus soleatus", scientificName: "Opisthoproctus soleatus", commonNames: ["Barreleye fish"] }
        ]
      })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a deep sea marine biology expert specializing in abyssal and bathyal zone species. Given a search query, provide up to 10 diverse and relevant deep sea marine species suggestions. IMPORTANT: Return DIFFERENT species each time, even for similar queries. Focus on species found at depths greater than 200 meters. Include a variety of taxonomic groups (fish, cephalopods, invertebrates, etc.). Return ONLY a valid JSON array with no additional text.",
          },
          {
            role: "user",
            content: `Given the search query "${query}" for deep sea marine species, provide up to 10 relevant suggestions focusing on deep water species (200m+ depth). Handle typos, partial matches, and scientific name fragments intelligently. Return ONLY the JSON array with this exact format:
[
  {
    "species": "Scientific name",
    "scientificName": "Scientific name", 
    "commonNames": ["common name 1", "common name 2"]
  }
]

IMPORTANT: The query could be:
- A scientific name (genus, species, or partial)
- A common name or partial common name
- A fragment or typo

Examples of what to match:
- "Melanocetus" -> Melanocetus johnsonii (Deep sea anglerfish)
- "johnsonii" -> Melanocetus johnsonii (Deep sea anglerfish)  
- "angler" -> Melanocetus johnsonii (Deep sea anglerfish)
- "vampire" -> Vampyroteuthis infernalis (Vampire squid)
- "Vampyroteuthis" -> Vampyroteuthis infernalis (Vampire squid)
- "dumbo" -> Grimpoteuthis (Dumbo octopus)
- "tube worm" -> Riftia pachyptila (Giant tube worm)
- "Riftia" -> Riftia pachyptila (Giant tube worm)

Prioritize deep sea species like:
- Anglerfish, vampire squid, giant tube worms, dumbo octopus
- Deep sea sharks (goblin shark, frilled shark)
- Abyssal fish (barreleye fish, deep sea hatchetfish)
- Hydrothermal vent species
- Bioluminescent deep sea creatures
- Deep sea jellyfish, siphonophores, ctenophores
- Abyssal crustaceans, isopods, amphipods
- Deep sea eels, grenadiers, rattails
- Benthic invertebrates, sea stars, sea cucumbers

Return only the JSON array, no other text or formatting.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error("[v0] Groq API error:", response.status, response.statusText)
      return NextResponse.json({ suggestions: [] })
    }

    const data = await response.json()
    const generatedText = data.choices?.[0]?.message?.content

    if (!generatedText) {
      console.warn("[v0] No content from Groq API")
      return NextResponse.json({ suggestions: [] })
    }

    try {
      const cleanedText = generatedText.trim()
      let suggestions

      try {
        suggestions = JSON.parse(cleanedText)
      } catch {
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No valid JSON found")
        }
      }

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        const validSuggestions = suggestions
          .filter((s: any) => s.species && s.scientificName && Array.isArray(s.commonNames))
          .slice(0, 10)

        if (validSuggestions.length > 0) {
          console.log(`[v0] Returning ${validSuggestions.length} suggestions from Groq API`)
          return NextResponse.json({ suggestions: validSuggestions })
        }
      }
    } catch (parseError) {
      console.error("[v0] Error parsing Groq response:", parseError)
    }

    return NextResponse.json({ suggestions: [] })
  } catch (error) {
    console.error("[v0] Error in search suggestions:", error)
    return NextResponse.json({ suggestions: [] })
  }
}



