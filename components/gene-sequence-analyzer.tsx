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
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const formatKey = (key: string) => {
    // prettify snake_case keys for display
    return key
      .replace(/_/g, ' ')
      .replace(/\b([a-z])/g, (m) => m.toUpperCase())
  }

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }))
  }

  // Generic recursive value renderer to ensure we show EVERYTHING the model returns
  function ValueView({ value }: { value: unknown }) {
    const [open, setOpen] = useState(true)
    if (value === null || value === undefined) return <span className="text-white/60">—</span>
    if (Array.isArray(value)) {
      return (
        <div>
          <div className="text-xs text-white/60 mb-1">Array [{value.length}]</div>
          <Button onClick={() => setOpen(!open)} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-2">
            {open ? 'Collapse' : 'Expand'}
          </Button>
          {open && (
            <div className="space-y-2">
              {value.map((v, i) => (
                <div key={i} className="p-2 rounded bg-black/10 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">[{i}]</div>
                  <ValueView value={v} />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
      return (
        <div>
          <div className="text-xs text-white/60 mb-1">Object {`{${entries.length} keys}`}</div>
          <Button onClick={() => setOpen(!open)} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-2">
            {open ? 'Collapse' : 'Expand'}
          </Button>
          {open && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entries.map(([k, v]) => (
                <div key={k} className="p-3 rounded bg-white/5 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">{formatKey(k)}</div>
                  <div className="text-sm text-white break-all">
                    <ValueView value={v} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    if (typeof value === 'number') return <span className="font-mono">{value.toFixed(6)}</span>
    return <span className="font-mono">{String(value)}</span>
  }

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
      const response = await fetch('/api/ml/sih', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequences,
          sequenceType,
        }),
      })

      const data: AnalysisResponse = await response.json()
      setResults(data)

      if (data.success) {
        toast.success(`Analysis complete! Processed ${data.total_sequences} sequences`)
      } else {
        toast.error(data.message || "Analysis failed")
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("Failed to connect to SIH analysis service")
      setResults({
        success: false,
        error: "Connection failed",
        message: "Could not connect to the SIH analysis service. Ensure Python is available and dependencies are installed."
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const downloadResults = () => {
    if (!results?.predictions) return

    // Collect dynamic headers from all prediction keys (top-level only)
    const headersSet = new Set<string>()
    for (const p of results.predictions as unknown as Record<string, unknown>[]) {
      Object.keys(p).forEach(k => headersSet.add(k))
    }
    const headers = Array.from(headersSet)
    const csvRows = [headers.join(',')]
    for (const p of results.predictions as unknown as Record<string, unknown>[]) {
      const row = headers.map(h => {
        const v = (p as any)[h]
        if (v === null || v === undefined) return ''
        if (typeof v === 'number') return v.toString()
        if (typeof v === 'string') return `"${v.replace(/"/g, '""')}"`
        // For arrays/objects, stringify so NOTHING is lost
        return `"${JSON.stringify(v).replace(/"/g, '""')}"`
      }).join(',')
      csvRows.push(row)
    }
    const csvContent = csvRows.join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gene_analysis_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Results downloaded")
  }

  const downloadJson = () => {
    if (!results) return
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gene_analysis_full_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Full JSON downloaded")
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mr-4 backdrop-blur-md border border-emerald-400/30">
            <Dna className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gene Sequence Analyzer</h2>
            <p className="text-emerald-100">Upload DNA sequences for species identification</p>
          </div>
        </div>

        {/* Sequence Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Sequence Type</label>
          <select
            value={sequenceType}
            onChange={(e) => setSequenceType(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="COI">COI (Cytochrome c oxidase subunit I)</option>
            <option value="16S">16S rRNA</option>
            <option value="18S">18S rRNA</option>
            <option value="ITS">ITS (Internal Transcribed Spacer)</option>
            <option value="General">General DNA Sequence</option>
          </select>
        </div>

        {/* Sequence Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Add DNA Sequence</label>
          <div className="flex gap-3">
            <Textarea
              value={currentSequence}
              onChange={(e) => setCurrentSequence(e.target.value)}
              placeholder="Enter DNA sequence (A, T, G, C only)..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
              rows={3}
            />
            <Button
              onClick={handleAddSequence}
              disabled={!currentSequence.trim()}
              className="bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-400/30 text-emerald-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Or Upload File</label>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.fasta,.fa,.seq"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <span className="text-sm text-emerald-200 self-center">
              Supports .txt, .fasta, .fa, .seq files
            </span>
          </div>
        </div>

        {/* Sequence List */}
        {sequences.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Sequences to Analyze ({sequences.length})</h3>
              <Button
                onClick={() => setSequences([])}
                variant="outline"
                size="sm"
                className="bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-400/30"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sequences.map((seq, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => handleAddToWatchlist(seq, index)}
                    title="Click to add this DNA sequence to your watchlist"
                  >
                    <div className="text-sm text-white font-mono">
                      {seq.length > 60 ? `${seq.substring(0, 60)}...` : seq}
                    </div>
                    <div className="text-xs text-emerald-200">Length: {seq.length} bp</div>
                  </button>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      onClick={() => handleAddToWatchlist(seq, index)}
                      variant="outline"
                      size="icon"
                      className={
                        watchlistedIndexes.has(index)
                          ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-400"
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }
                      title={watchlistedIndexes.has(index) ? "Added to watchlist" : "Add to watchlist"}
                    >
                      <Star className={watchlistedIndexes.has(index) ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4"} />
                    </Button>
                    <Button
                      onClick={() => handleRemoveSequence(index)}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-400/30"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={sequences.length === 0 || isAnalyzing}
          className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-teal-400/30 text-emerald-400 py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Sequences...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze Sequences
            </>
          )}
        </Button>
      </GlassmorphismCard>

      {/* Results Section */}
      {results && (
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-4 backdrop-blur-md border border-blue-400/30">
                {results.success ? (
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                <p className="text-blue-100">
                  {results.success ? `${results.total_sequences} sequences analyzed` : "Analysis failed"}
                </p>
              </div>
            </div>
            {results.success && results.predictions && (
              <>
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-400/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button
                  onClick={downloadJson}
                  variant="outline"
                  className="bg-purple-500/20 border-purple-400/30 text-purple-400 hover:bg-purple-400/30"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Full JSON
                </Button>
              </>
            )}
          </div>

          {results.success && results.predictions ? (
            <div className="space-y-4">
              {results.predictions.map((prediction, index) => {
                const anyPred = prediction as unknown as Record<string, any>
                const displayId = (anyPred.id ?? prediction.sequence_id) as string
                const displaySpecies = (anyPred.species_pred_label ?? prediction.predicted_species) as string
                const displayConf = typeof anyPred.species_pred_conf === 'number' ? anyPred.species_pred_conf as number : prediction.confidence
                const displayLen = (anyPred.seq_len ?? prediction.sequence_length) as number
                return (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-emerald-500/20 border-emerald-400/30 text-emerald-400">
                        {displayId}
                      </Badge>
                      <span className="text-sm text-white/70">Length: {displayLen} bp</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/70">Confidence:</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {(displayConf * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-2">Taxonomy</h3>
                    {(() => {
                      // Dynamically detect taxonomy ranks from keys like `${rank}_pred_label` / `${rank}_pred_conf`
                      const entries: Array<{ rank: string; label: string; conf?: number }> = []
                      Object.entries(prediction as Record<string, unknown>).forEach(([k, v]) => {
                        const m = k.match(/^(.*)_pred_label$/)
                        if (m && typeof v === 'string') {
                          const rank = m[1]
                          const confKey = `${rank}_pred_conf`
                          const confVal = (prediction as any)[confKey]
                          entries.push({ rank, label: v, conf: typeof confVal === 'number' ? confVal : undefined })
                        }
                      })
                      // Always include species/confidence if present
                      if (typeof (anyPred.species_pred_label ?? prediction.predicted_species) === 'string') {
                        entries.push({ rank: 'species', label: (anyPred.species_pred_label ?? prediction.predicted_species) as string, conf: (typeof anyPred.species_pred_conf === 'number' ? anyPred.species_pred_conf : prediction.confidence) as number })
                      }
                      if (entries.length === 0) return null
                      // Sort ranks alphabetically to avoid hardcoding order
                      entries.sort((a, b) => a.rank.localeCompare(b.rank))
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {entries.map((e) => (
                            <div key={e.rank} className="p-3 rounded bg-white/5 border border-white/10">
                              <div className="text-xs text-white/60 mb-1">{formatKey(e.rank)}</div>
                              <div className="text-lg font-bold text-emerald-400">{e.label || '—'}</div>
                              {typeof e.conf === 'number' && (
                                <Progress value={e.conf * 100} className="h-2 mt-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-white mb-2">Sequence Preview</h4>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-black/20 rounded text-emerald-300 text-sm font-mono">
                        {(anyPred.sequence_preview ?? anyPred.seq_preview ?? prediction.sequence_preview) as string}
                      </code>
                      <Button
                        onClick={() => copyToClipboard((anyPred.sequence_preview ?? anyPred.seq_preview ?? prediction.sequence_preview) as string)}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Dynamic details renderer: show ALL fields from backend predictions */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">Details</h4>
                      <Button
                        onClick={() => toggleRow(index)}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        {expandedRows[index] ? 'Hide' : 'Show'} All Fields
                      </Button>
                    </div>
                    {expandedRows[index] && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(prediction as Record<string, unknown>).map(([key, value]) => (
                          <div key={key} className="p-3 rounded border border-white/10 bg-white/5">
                            <div className="text-xs text-white/60 mb-1">{formatKey(key)}</div>
                            <div className="text-sm text-white font-mono break-all">
                              {Array.isArray(value)
                                ? `[${(value as any[]).slice(0, 10).map(v => typeof v === 'number' ? v.toFixed(4) : String(v)).join(', ')}${(value as any[]).length > 10 ? ', ...' : ''}]`
                                : typeof value === 'number'
                                  ? (value as number).toFixed(6)
                                  : value === null || value === undefined
                                    ? '—'
                                    : String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <Alert className="bg-red-500/10 border-red-400/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {results.message || results.error || "Analysis failed"}
              </AlertDescription>
            </Alert>
          )}
        </GlassmorphismCard>
      )}
    </div>
  )
}