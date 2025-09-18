"use client"

import { useState, useRef } from "react"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dna, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  BarChart3,
  Sparkles,
  Upload,
  Copy,
  Download,
  Star
} from "lucide-react"
import { toast } from "sonner"

interface PredictionResult {
  sequence_id: string
  sequence_length: number
  predicted_species: string
  confidence: number
  probability_distribution: number[]
  sequence_preview: string
}

interface AnalysisResponse {
  success: boolean
  predictions?: PredictionResult[]
  model_info?: any
  total_sequences?: number
  error?: string
  message?: string
}

export function GeneSequenceAnalyzer() {
  const [sequences, setSequences] = useState<string[]>([])
  const [sequenceType, setSequenceType] = useState("COI")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [currentSequence, setCurrentSequence] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [watchlistedIndexes, setWatchlistedIndexes] = useState<Set<number>>(new Set())

  const handleAddSequence = () => {
    if (currentSequence.trim()) {
      const cleanSequence = currentSequence.trim().toUpperCase().replace(/[^ATGC]/g, '')
      if (cleanSequence.length > 0) {
        setSequences(prev => [...prev, cleanSequence])
        setCurrentSequence("")
        toast.success("Sequence added successfully")
      } else {
        toast.error("Please enter a valid DNA sequence (A, T, G, C only)")
      }
    }
  }

  const handleAddToWatchlist = async (seq: string, index: number) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "gene_sequence",
          title: `DNA sequence (${seq.length} bp)`,
          summary: seq.length > 60 ? `${seq.substring(0, 60)}...` : seq,
          dataPreview: seq.length > 60 ? `${seq.substring(0, 60)}...` : seq,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to add to watchlist")
      }
      setWatchlistedIndexes(prev => new Set(prev).add(index))
      toast.success("Added to watchlist")
    } catch (e: any) {
      toast.error(e?.message || "Could not add to watchlist")
    }
  }

  const handleRemoveSequence = (index: number) => {
    setSequences(prev => prev.filter((_, i) => i !== index))
    toast.success("Sequence removed")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split('\n').filter(line => line.trim())
        const validSequences = lines
          .map(line => line.trim().toUpperCase().replace(/[^ATGC]/g, ''))
          .filter(seq => seq.length > 0)
        
        if (validSequences.length > 0) {
          setSequences(prev => [...prev, ...validSequences])
          toast.success(`Added ${validSequences.length} sequences from file`)
        } else {
          toast.error("No valid DNA sequences found in file")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleAnalyze = async () => {
    if (sequences.length === 0) {
      toast.error("Please add at least one sequence to analyze")
      return
    }

    setIsAnalyzing(true)
    setResults(null)

    try {
      const response = await fetch("/api/ai/gene-sequence-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequences: sequences,
          sequence_type: sequenceType,
        }),
      })

      const data: AnalysisResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setResults(data)
      toast.success(`Analysis completed for ${data.total_sequences} sequences`)
    } catch (error: any) {
      console.error("Analysis error:", error)
      toast.error(error.message || "Failed to analyze sequences")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadResults = () => {
    if (!results?.predictions) return

    const csvContent = [
      "Sequence ID,Length,Predicted Species,Confidence,Sequence Preview",
      ...results.predictions.map(pred => 
        `${pred.sequence_id},${pred.sequence_length},"${pred.predicted_species}",${pred.confidence},"${pred.sequence_preview}"`
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gene_sequence_analysis_results.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Dna className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gene Sequence Analyzer
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Advanced AI-powered analysis of DNA sequences for species identification and genetic research
          </p>
        </div>

        {/* Input Section */}
        <GlassmorphismCard className="p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Sequence Input</h2>
            </div>

            {/* Sequence Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sequence Type</label>
              <select
                value={sequenceType}
                onChange={(e) => setSequenceType(e.target.value)}
                className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="COI">COI (Cytochrome c oxidase subunit I)</option>
                <option value="16S">16S rRNA</option>
                <option value="ITS">ITS (Internal Transcribed Spacer)</option>
                <option value="18S">18S rRNA</option>
              </select>
            </div>

            {/* Manual Sequence Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Add DNA Sequence</label>
              <Textarea
                value={currentSequence}
                onChange={(e) => setCurrentSequence(e.target.value)}
                placeholder="Enter DNA sequence (A, T, G, C only)..."
                className="min-h-[120px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
              <Button
                onClick={handleAddSequence}
                disabled={!currentSequence.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Dna className="h-4 w-4 mr-2" />
                Add Sequence
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Or Upload File</label>
              <div className="flex items-center space-x-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.fasta,.fa"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Supports .txt, .fasta, .fa files with one sequence per line
              </p>
            </div>

            {/* Sequences List */}
            {sequences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    Sequences ({sequences.length})
                  </h3>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? "Analyzing..." : "Analyze Sequences"}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sequences.map((seq, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                            {seq.length} bp
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {seq.substring(0, 30)}...
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddToWatchlist(seq, index)}
                          disabled={watchlistedIndexes.has(index)}
                          className="text-slate-400 hover:text-yellow-400"
                        >
                          <Star className={`h-4 w-4 ${watchlistedIndexes.has(index) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSequence(index)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassmorphismCard>

        {/* Results Section */}
        {results && (
          <GlassmorphismCard className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                  <h2 className="text-2xl font-semibold text-white">Analysis Results</h2>
                </div>
                <Button
                  onClick={handleDownloadResults}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>

              {results.success && results.predictions ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                      <div className="text-2xl font-bold text-blue-400">
                        {results.total_sequences}
                      </div>
                      <div className="text-sm text-slate-300">Sequences Analyzed</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(results.predictions.reduce((acc, pred) => acc + pred.confidence, 0) / results.predictions.length * 100)}%
                      </div>
                      <div className="text-sm text-slate-300">Average Confidence</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600">
                      <div className="text-2xl font-bold text-purple-400">
                        {new Set(results.predictions.map(p => p.predicted_species)).size}
                      </div>
                      <div className="text-sm text-slate-300">Unique Species</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {results.predictions.map((prediction, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-800/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                              {prediction.sequence_id}
                            </Badge>
                            <span className="text-sm text-slate-400">
                              {prediction.sequence_length} bp
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-sm font-medium text-green-400">
                              {Math.round(prediction.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-slate-300">Predicted Species: </span>
                            <span className="font-medium text-white">
                              {prediction.predicted_species}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-slate-300">Sequence Preview: </span>
                            <span className="font-mono text-sm text-slate-300 bg-slate-900/50 px-2 py-1 rounded">
                              {prediction.sequence_preview}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${prediction.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="border-red-600 bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {results.error || "Analysis failed"}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </GlassmorphismCard>
        )}
      </div>
    </div>
  )
}