# Deep Sea Research Institute - Marine Species Tracker

A real-time marine species abundance monitoring system focused on deep sea research.

## Features

- **Real-time Deep Sea Data**: Live species tracking from Ocean Networks Canada and OBIS databases
- **AI-Powered Search**: Groq-powered intelligent species search with typo correction
- **Interactive Research Dashboard**: Professional interface with live statistics and data visualization
- **Species-Specific Tracking**: Focus on individual species distribution and abundance
- **Depth Zone Analysis**: Comprehensive ocean depth zone classification (Epipelagic to Hadal)

## API Keys Required

### 1. Groq API (Required for AI Search)
- **Website**: https://console.groq.com/
- **How to get**: Sign up → Create API key → Copy to `.env.local`
- **Used for**: Intelligent species search suggestions with typo handling

### 2. Ocean Networks Canada API (Recommended for Best Data)
- **Website**: https://data.oceannetworks.ca/
- **How to get**: Register account → Go to API section → Generate token
- **Used for**: Real-time deep sea species data from Pacific, Arctic, and Atlantic oceans

## Environment Setup

1. Copy `.env.local` file and add your API keys:
\`\`\`bash
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_ONC_API_KEY=your_onc_api_key_here
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Data Sources

- **Primary**: Ocean Networks Canada (ONC) - Real-time deep sea observatory data
- **Fallback**: Ocean Biodiversity Information System (OBIS) - Marine species occurrence records
- **Focus**: Deep sea species (200m+ depth) with emphasis on abyssal and bathyal zones

## Research Features

- Interactive dashboard with live statistics
- Species abundance visualization by depth zones
- Real-time data updates from research observatories
- Professional research institute styling
- Export capabilities for research data

Built for marine researchers, oceanographers, and deep sea exploration teams.
