import { type NextRequest, NextResponse } from "next/server"
import { spawn } from 'child_process'
import path from 'path'

async function proxyToModelServer(sequences: string[]) {
  const baseUrl = process.env.MODEL_SERVER_URL || 'http://localhost:5000'
  const url = `${baseUrl.replace(/\/$/, '')}/predict`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sequences }),
  })
  const data = await res.json()
  return { status: res.status, data }
}

export async function POST(request: NextRequest) {
  try {
    const { sequences } = await request.json()

    const sequencesToProcess = Array.isArray(sequences) ? sequences : []
    if (!sequencesToProcess.length) {
      return NextResponse.json({ error: "DNA sequence(s) are required" }, { status: 400 })
    }

    const validSequences = sequencesToProcess.filter((seq: string) => {
      if (!seq || typeof seq !== 'string') return false
      const cleanSeq = seq.trim().toUpperCase()
      return cleanSeq.length > 0 && /^[ATGC]+$/.test(cleanSeq)
    })

    if (!validSequences.length) {
      return NextResponse.json({ 
        error: "No valid DNA sequences provided",
        message: "Sequences must contain only A, T, G, C characters"
      }, { status: 400 })
    }

    // Prefer external model server if available (returns full 54-field schema)
    try {
      const proxied = await proxyToModelServer(validSequences)
      // Return exactly what the model returns to avoid losing fields
      return NextResponse.json(proxied.data, { status: proxied.status })
    } catch (e) {
      // Fallback to local Python shim if model server is not available
      const pythonScript = path.join(process.cwd(), 'lib', 'sih-model-predictor.py')
      const pythonProcess = spawn('python', [pythonScript, '--sequences', ...validSequences], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const result = await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(stdout)
              resolve(parsedResult)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${stdout}`))
            }
          } else {
            reject(new Error(`Python script failed with code ${code}: ${stderr}`))
          }
        })
      }) as any

      return NextResponse.json(result, { status: 200 })
    }

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "SIH prediction failed",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Prefer model server health if available
    const baseUrl = process.env.MODEL_SERVER_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health`)
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    } catch {
      const pythonScript = path.join(process.cwd(), 'lib', 'sih-model-predictor.py')
      const pythonProcess = spawn('python', [pythonScript, '--info'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const result = await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(stdout)
              resolve(parsedResult)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${stdout}`))
            }
          } else {
            reject(new Error(`Python script failed with code ${code}: ${stderr}`))
          }
        })
      }) as any

      return NextResponse.json(result, { status: 200 })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      model_available: false,
      message: "Model not available",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}


