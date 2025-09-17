"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Camera, Loader2, CheckCircle, AlertCircle, Eye, Microscope, FileImage, Zap } from "lucide-react"
import Image from "next/image"
import type { SpeciesIdentificationResult } from "@/lib/gemini-client"

interface AnalysisResult extends SpeciesIdentificationResult {
  analysisId: string
  processingTime: number
}

export function SpeciesRecognitionSystem() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [additionalContext, setAdditionalContext] = useState("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelectedImage(result)
      setError(null)
      setAnalysisResult(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setSelectedImage(result)
          setError(null)
          setAnalysisResult(null)
        }
        reader.readAsDataURL(file)
      } else {
        setError("Please drop a valid image file")
      }
    }
  }, [])

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log("[v0] Starting species identification analysis...")

      const response = await fetch("/api/ai/species-identification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          imageData: selectedImage,
          additionalContext: additionalContext || undefined,
        }),
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429 && errorData.tokenLimitReached) {
          setError("Daily token limit reached. Please upgrade your plan to continue using AI features.")
          // You could also redirect to subscription page here
          return
        }
        throw new Error(errorData.error || "Failed to analyze image")
      }

      const data = await response.json()

      if (data.success) {
        setAnalysisResult({
          ...data.result,
          analysisId: data.analysisId,
          processingTime: Date.now(),
        })
        console.log("[v0] Species identification completed:", data.result.species)
      } else {
        throw new Error(data.error || "Analysis failed")
      }
    } catch (err) {
      console.error("[v0] Species identification error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze image")
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 70) return "text-blue-600"
    if (confidence >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return "default"
    if (confidence >= 70) return "secondary"
    return "outline"
  }

  const getConservationStatusColor = (status: string) => {
    switch (status) {
      case "CR":
        return "bg-red-600"
      case "EN":
        return "bg-red-500"
      case "VU":
        return "bg-yellow-500"
      case "NT":
        return "bg-yellow-400"
      case "LC":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Microscope className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Species Recognition System</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
          Upload deep-sea organism images for instant AI-powered species identification, classification, and
          conservation analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Upload className="h-5 w-5 text-primary" />
              Image Upload & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected organism"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    <FileImage className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-foreground">Upload Deep-Sea Organism Image</p>
                    <p className="text-sm text-muted-foreground mt-2">Drag and drop or click to select</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports: JPG, PNG, WebP (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Additional Context (Optional)</label>
              <Textarea
                placeholder="Provide additional information about the specimen: location, depth, habitat conditions, or any other relevant details..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium text-foreground">Analyzing with Gemini AI...</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={analyzeImage}
              disabled={!selectedImage || isAnalyzing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Species
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Eye className="h-5 w-5 text-accent" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult ? (
              <div className="space-y-6">
                {/* Success Indicator */}
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Analysis Complete</span>
                </div>

                {/* Species Identification */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-card-foreground">{analysisResult.species}</h3>
                    <Badge variant={getConfidenceBadgeVariant(analysisResult.confidence)}>
                      <span className={getConfidenceColor(analysisResult.confidence)}>
                        {analysisResult.confidence}% confidence
                      </span>
                    </Badge>
                  </div>

                  {analysisResult.commonName && (
                    <p className="text-muted-foreground italic">Common name: {analysisResult.commonName}</p>
                  )}

                  <p className="text-sm text-muted-foreground font-mono">{analysisResult.scientificName}</p>
                </div>

                {/* Classification */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Taxonomic Classification</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kingdom:</span>
                      <span className="text-card-foreground">{analysisResult.classification.kingdom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phylum:</span>
                      <span className="text-card-foreground">{analysisResult.classification.phylum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Class:</span>
                      <span className="text-card-foreground">{analysisResult.classification.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order:</span>
                      <span className="text-card-foreground">{analysisResult.classification.order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Family:</span>
                      <span className="text-card-foreground">{analysisResult.classification.family}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genus:</span>
                      <span className="text-card-foreground">{analysisResult.classification.genus}</span>
                    </div>
                  </div>
                </div>

                {/* Conservation Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Conservation Information</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getConservationStatusColor(analysisResult.conservationStatus)}`}
                    ></div>
                    <span className="text-sm text-card-foreground">Status: {analysisResult.conservationStatus}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Habitat:</strong> {analysisResult.habitat}
                  </p>
                </div>

                {/* Threats */}
                {analysisResult.threats.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-card-foreground">Known Threats</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.threats.map((threat, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysisResult.description}</p>
                </div>

                {/* Analysis Metadata */}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Analysis ID: {analysisResult.analysisId}</span>
                    <span>Powered by Gemini AI</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Microscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Upload an image to start species identification analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Tips for Best Results</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>• Use high-resolution, clear images</p>
              <p>• Ensure good lighting and focus</p>
              <p>• Include scale references when possible</p>
            </div>
            <div className="space-y-2">
              <p>• Provide location and depth information</p>
              <p>• Include multiple angles if available</p>
              <p>• Note any distinctive features or behaviors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
