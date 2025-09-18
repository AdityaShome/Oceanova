import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { BubbleCursor } from "@/components/bubble-cursor"

import { DeepSeaBackground } from "@/components/deep-sea-background"
import { Chatbot } from "@/components/chatbot"

import "./globals.css"

export const metadata: Metadata = {
  title: "OCEANOVA",
  description:
    "Advanced AI-powered platform for deep-sea marine species identification, environmental threat assessment, water quality monitoring, and conservation insights using cutting-edge machine learning and environmental DNA analysis.",
  keywords:
    "marine biodiversity, deep sea research, species identification, AI, environmental DNA, water quality, conservation, marine biology",
  authors: [{ name: "AI-Driven Biodiversity Research Team" }],
  openGraph: {
    title: "AI-Driven Deep Sea Biodiversity Platform",
    description: "Revolutionary AI platform for marine conservation and species discovery",
    type: "website",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <DeepSeaBackground />
        <BubbleCursor />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>

        <Chatbot />

        <Analytics />
      </body>
    </html>
  )
}