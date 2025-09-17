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
      toast.error("Please add