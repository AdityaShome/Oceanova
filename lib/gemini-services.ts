import { getGeminiFlashModel, getGeminiFlashVisionModel } from "./gemini-client"
import type {
  SpeciesIdentificationResult,
  ThreatAssessmentResult,
  ConservationRecommendation,
  WaterQualityAnalysis,
} from "./gemini-client"

export class GeminiAIService {
  /**
   * Identify species from image using Gemini 2.0 Flash Vision
   */
  static async identifySpeciesFromImage(
    imageData: string,
    additionalContext?: string,
  ): Promise<SpeciesIdentificationResult> {
    try {

      const prompt = `
        Analyze this deep-sea marine organism image and provide detailed species identification.
        
        Please provide a comprehensive analysis including:
        1. Most likely species identification with confidence level
        2. Complete taxonomic classification
        3. Habitat information
        4. Conservation status
        5. Known threats to this species
        6. Detailed description of identifying features
        
        ${additionalContext ? `Additional context: ${additionalContext}` : ""}
        
        Format the response as a detailed scientific analysis suitable for marine research.
        If the species cannot be definitively identified, provide the closest matches and explain the uncertainty.
      `

      // Convert base64 to the format Gemini expects
      const imagePart = {
        inlineData: {
          data: imageData.replace(/^data:image\/[a-z]+;base64,/, ""),
          mimeType: "image/jpeg",
        },
      }

      const geminiFlashVisionModel = getGeminiFlashVisionModel()
      const result = await geminiFlashVisionModel.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      // Parse the AI response into structured data
      return this.parseSpeciesIdentification(text)
    } catch (error) {
      console.error("[v0] Species identification error:", error)
      throw new Error("Failed to identify species from image")
    }
  }

  /**
   * Analyze environmental threats using human activity data
   */
  static async assessEnvironmentalThreats(
    locationData: {
      latitude: number
      longitude: number
      depth: number
      region: string
    },
    environmentalData: {
      temperature: number
      salinity: number
      pH: number
      pollutants: any
    },
    humanActivityData?: string,
  ): Promise<ThreatAssessmentResult> {
    try {

      const prompt = `
        Analyze environmental threats to deep-sea marine ecosystems based on the following data:
        
        Location: ${locationData.region} (${locationData.latitude}, ${locationData.longitude}) at ${locationData.depth}m depth
        
        Environmental Conditions:
        - Temperature: ${environmentalData.temperature}°C
        - Salinity: ${environmentalData.salinity} PSU
        - pH: ${environmentalData.pH}
        - Pollutant levels: ${JSON.stringify(environmentalData.pollutants)}
        
        ${humanActivityData ? `Human Activity Context: ${humanActivityData}` : ""}
        
        Please provide:
        1. Overall threat level assessment (low/moderate/high/critical)
        2. Primary environmental threats identified
        3. Human impact factors contributing to threats
        4. Species likely to be affected
        5. Timeframe for potential impacts
        6. Specific recommendations for threat mitigation
        7. Urgency rating (1-10 scale)
        
        Focus on actionable insights for marine conservation efforts.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseThreatAssessment(text)
    } catch (error) {
      console.error("[v0] Threat assessment error:", error)
      throw new Error("Failed to assess environmental threats")
    }
  }

  /**
   * Generate conservation recommendations
   */
  static async generateConservationRecommendations(
    speciesData: string[],
    threatData: ThreatAssessmentResult,
    resourceConstraints?: string,
  ): Promise<ConservationRecommendation> {
    try {

      const prompt = `
        Generate comprehensive conservation recommendations based on:
        
        Affected Species: ${speciesData.join(", ")}
        
        Threat Assessment:
        - Threat Level: ${threatData.threatLevel}
        - Primary Threats: ${threatData.primaryThreats.join(", ")}
        - Human Impact Factors: ${threatData.humanImpactFactors.join(", ")}
        - Urgency: ${threatData.urgency}/10
        
        ${resourceConstraints ? `Resource Constraints: ${resourceConstraints}` : ""}
        
        Please provide:
        1. Priority level for conservation action
        2. Specific actionable conservation measures
        3. Implementation timeline
        4. Required resources and expertise
        5. Expected conservation outcomes
        6. Long-term monitoring plan
        7. Key stakeholders to involve
        
        Focus on practical, science-based conservation strategies that can be implemented effectively.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseConservationRecommendations(text)
    } catch (error) {
      console.error("[v0] Conservation recommendations error:", error)
      throw new Error("Failed to generate conservation recommendations")
    }
  }

  /**
   * Analyze water quality and contamination levels
   */
  static async analyzeWaterQuality(
    waterQualityData: {
      temperature: number
      salinity: number
      pH: number
      dissolvedOxygen: number
      turbidity: number
      pollutants: {
        microplastics: number
        heavyMetals: any
        chemicals: any
      }
    },
    location: {
      latitude: number
      longitude: number
      depth: number
      region: string
    },
  ): Promise<WaterQualityAnalysis> {
    try {

      const prompt = `
        Analyze water quality data for deep-sea marine environment:
        
        Location: ${location.region} (${location.latitude}, ${location.longitude}) at ${location.depth}m depth
        
        Water Quality Parameters:
        - Temperature: ${waterQualityData.temperature}°C
        - Salinity: ${waterQualityData.salinity} PSU
        - pH: ${waterQualityData.pH}
        - Dissolved Oxygen: ${waterQualityData.dissolvedOxygen} mg/L
        - Turbidity: ${waterQualityData.turbidity} NTU
        - Microplastics: ${waterQualityData.pollutants.microplastics} particles/m³
        - Heavy Metals: ${JSON.stringify(waterQualityData.pollutants.heavyMetals)}
        - Chemical Pollutants: ${JSON.stringify(waterQualityData.pollutants.chemicals)}
        
        Please provide:
        1. Overall water quality assessment (excellent/good/moderate/poor/critical)
        2. Water Quality Index (0-100 scale)
        3. Contamination level classification
        4. Primary contaminants of concern
        5. Health risks to marine life
        6. Ecosystem impact assessment
        7. Specific recommendations for improvement
        8. Monitoring priorities
        
        Consider deep-sea ecosystem standards and marine life requirements.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseWaterQualityAnalysis(text)
    } catch (error) {
      console.error("[v0] Water quality analysis error:", error)
      throw new Error("Failed to analyze water quality")
    }
  }

  /**
   * Analyze gene sequences for species identification
   */
  static async analyzeGeneSequence(
    dnaSequence: string,
    sequenceType: "COI" | "16S" | "18S" | "ITS" | "other",
    locationContext?: string,
  ): Promise<SpeciesIdentificationResult> {
    try {

      const prompt = `
        Analyze this ${sequenceType} gene sequence for species identification:
        
        DNA Sequence: ${dnaSequence}
        Sequence Type: ${sequenceType}
        ${locationContext ? `Location Context: ${locationContext}` : ""}
        
        Please provide:
        1. Most likely species identification with confidence level
        2. Complete taxonomic classification
        3. Alternative possible matches with confidence levels
        4. Phylogenetic relationships
        5. Habitat and ecological information
        6. Conservation status
        7. Known threats and conservation concerns
        8. Novelty assessment (likelihood of new species)
        
        Focus on marine organisms, particularly deep-sea species.
        If this appears to be a novel or undescribed species, highlight this finding.
      `

      const geminiFlashModel = getGeminiFlashModel()
      const result = await geminiFlashModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return this.parseSpeciesIdentification(text)
    } catch (error) {
      console.error("[v0] Gene sequence analysis error:", error)
      throw new Error("Failed to analyze gene sequence")
    }
  }

  // Helper methods to parse AI responses into structured data
  private static parseSpeciesIdentification(text: string): SpeciesIdentificationResult {
    console.log("[DEBUG] Raw AI response:", text)
    
    // Try to extract species name from various patterns
    const species = this.extractValue(text, "species") || 
                      this.extractValue(text, "Species") || 
                      this.extractValue(text, "species name") ||
                      this.extractValue(text, "Species Name") ||
                      this.extractValue(text, "identified") ||
                      this.extractValue(text, "identification") ||
                      this.extractValue(text, "organism") ||
                      this.extractValue(text, "marine") ||
                      "Unknown Species"
    
    const confidence = Number.parseFloat(this.extractValue(text, "confidence") || 
                                           this.extractValue(text, "Confidence") || 
                                           this.extractValue(text, "probability") ||
                                           this.extractValue(text, "certainty") ||
                                           "75")
    
    const scientificName = this.extractValue(text, "scientific") || 
                           this.extractValue(text, "Scientific") || 
                           this.extractValue(text, "scientific name") ||
                           this.extractValue(text, "Scientific Name") ||
                           this.extractValue(text, "binomial") ||
                           this.extractValue(text, "taxonomic") ||
                           species

    // If we still don't have a species, try to extract from the first line
    const finalSpecies = species === "Unknown Species" ? 
      text.split('\n')[0]?.trim().substring(0, 50) || "Unknown Marine Species" : 
      species

    return {
      species: finalSpecies,
      confidence: isNaN(confidence) ? 75 : confidence,
      scientificName: scientificName || finalSpecies,
      commonName: this.extractValue(text, "common") || 
                  this.extractValue(text, "Common") || 
                  this.extractValue(text, "common name") ||
                  this.extractValue(text, "Common Name") ||
                  finalSpecies,
      classification: {
        kingdom: this.extractValue(text, "kingdom") || 
                 this.extractValue(text, "Kingdom") || 
                 this.extractValue(text, "Animalia") || "",
        phylum: this.extractValue(text, "phylum") || 
                this.extractValue(text, "Phylum") || 
                this.extractValue(text, "Chordata") || "",
        class: this.extractValue(text, "class") || 
               this.extractValue(text, "Class") || "",
        order: this.extractValue(text, "order") || 
               this.extractValue(text, "Order") || "",
        family: this.extractValue(text, "family") || 
                this.extractValue(text, "Family") || "",
        genus: this.extractValue(text, "genus") || 
               this.extractValue(text, "Genus") || "",
      },
      habitat: this.extractValue(text, "habitat") || 
               this.extractValue(text, "Habitat") || 
               this.extractValue(text, "environment") ||
               this.extractValue(text, "depth") ||
               "Marine environment",
      conservationStatus: this.extractValue(text, "conservation") || 
                          this.extractValue(text, "Conservation") || 
                          this.extractValue(text, "status") ||
                          this.extractValue(text, "threatened") ||
                          "Unknown",
      threats: this.extractList(text, "threats") || 
               this.extractList(text, "Threats") || 
               this.extractList(text, "risks") ||
               [],
      description: this.extractValue(text, "description") || 
                   this.extractValue(text, "Description") || 
                   this.extractValue(text, "characteristics") ||
                   text.substring(0, 200),
    }
  }

  private static parseThreatAssessment(text: string): ThreatAssessmentResult {
    const threatLevel = this.extractThreatLevel(text)
    const urgency = Number.parseInt(this.extractValue(text, "urgency") || "0")

    if (!threatLevel) {
      throw new Error("Failed to parse threat assessment from AI response")
    }

    return {
      threatLevel,
      primaryThreats: this.extractList(text, "threats") || [],
      humanImpactFactors: this.extractList(text, "human") || [],
      affectedSpecies: this.extractList(text, "species") || [],
      timeframe: this.extractValue(text, "timeframe") || "",
      recommendations: this.extractList(text, "recommendations") || [],
      urgency,
    }
  }

  private static parseConservationRecommendations(text: string): ConservationRecommendation {
    const priority = this.extractPriority(text)

    if (!priority) {
      throw new Error("Failed to parse conservation recommendations from AI response")
    }

    return {
      priority,
      actions: this.extractList(text, "actions") || [],
      timeline: this.extractValue(text, "timeline") || "",
      resources: this.extractList(text, "resources") || [],
      expectedOutcome: this.extractValue(text, "outcome") || "",
      monitoringPlan: this.extractList(text, "monitoring") || [],
      stakeholders: this.extractList(text, "stakeholders") || [],
    }
  }

  private static parseWaterQualityAnalysis(text: string): WaterQualityAnalysis {
    const overallQuality = this.extractQualityLevel(text)
    const qualityIndex = Number.parseInt(this.extractValue(text, "index") || "0")
    const contaminationLevel = this.extractContaminationLevel(text)

    if (!overallQuality || !contaminationLevel) {
      throw new Error("Failed to parse water quality analysis from AI response")
    }

    return {
      overallQuality,
      qualityIndex,
      contaminationLevel,
      primaryContaminants: this.extractList(text, "contaminants") || [],
      healthRisks: this.extractList(text, "risks") || [],
      ecosystemImpact: this.extractValue(text, "impact") || "",
      recommendations: this.extractList(text, "recommendations") || [],
      monitoringNeeds: this.extractList(text, "monitoring") || [],
    }
  }

  // Utility methods for parsing
  private static extractValue(text: string, key: string): string | undefined {
    // Try multiple patterns
    const patterns = [
      new RegExp(`${key}[:\\s]+([^\\n]+)`, "i"),
      new RegExp(`${key}[\\s]*:?\\s*([^\\n]+)`, "i"),
      new RegExp(`${key}[\\s]*-?\\s*([^\\n]+)`, "i"),
      new RegExp(`${key}[\\s]*\\|\\s*([^\\n]+)`, "i"),
      new RegExp(`${key}[\\s]*=\\s*([^\\n]+)`, "i"),
    ]
    
    for (const regex of patterns) {
      const match = text.match(regex)
      if (match && match[1] && match[1].trim()) {
        return match[1].trim()
      }
    }
    
    return undefined
  }

  private static extractList(text: string, key: string): string[] | undefined {
    const value = this.extractValue(text, key)
    if (!value) return undefined
    return value
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  private static extractThreatLevel(text: string): "low" | "moderate" | "high" | "critical" {
    const lower = text.toLowerCase()
    if (lower.includes("critical")) return "critical"
    if (lower.includes("high")) return "high"
    if (lower.includes("moderate")) return "moderate"
    return "low"
  }

  private static extractPriority(text: string): "low" | "medium" | "high" | "urgent" {
    const lower = text.toLowerCase()
    if (lower.includes("urgent")) return "urgent"
    if (lower.includes("high")) return "high"
    if (lower.includes("medium")) return "medium"
    return "low"
  }

  private static extractQualityLevel(text: string): "excellent" | "good" | "moderate" | "poor" | "critical" {
    const lower = text.toLowerCase()
    if (lower.includes("excellent")) return "excellent"
    if (lower.includes("good")) return "good"
    if (lower.includes("poor")) return "poor"
    if (lower.includes("critical")) return "critical"
    return "moderate"
  }

  private static extractContaminationLevel(text: string): "low" | "moderate" | "high" | "severe" {
    const lower = text.toLowerCase()
    if (lower.includes("severe")) return "severe"
    if (lower.includes("high")) return "high"
    if (lower.includes("moderate")) return "moderate"
    return "low"
  }
}