# Oceanova

AI-powered marine conservation platform built with Next.js. It provides species identification, gene sequence analysis, threat assessment, conservation recommendations, and water quality analytics, backed by a Python ML model server and MongoDB.

## Features
- Species identification with Gemini models
- Gene sequence analysis via a local Python model server (Flask)
- Threat assessment and conservation recommendations
- Interactive water-quality maps (Leaflet)
- Dashboard with charts and insights

## Tech Stack
- Next.js 14 (App Router), React 18, TypeScript
- UI: Radix UI, Tailwind CSS utilities, custom components
- Data: MongoDB
- AI: Google Gemini (`@google/generative-ai`)
- Maps: Leaflet, React-Leaflet
- Python ML service (Flask) for gene prediction

## Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)
- Python 3.8+ (for the ML model server)
- MongoDB instance (local or cloud)

## Quick Start
1) Install dependencies
```bash
npm install
# or: pnpm install
```

2) Configure environment variables (create `.env.local` in the repo root)
```bash
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://user:pass@host/dbname?retryWrites=true&w=majority
```

3) (Optional) Seed the database
```bash
node scripts/setup-database.js
node scripts/seed-sample-data.js
```

4) Start the ML model server (separate terminal)
- Windows (batch file):
```bash
scripts\start-model-server.bat
```
- Cross-platform (Python launcher):
```bash
python scripts/start-model-server.py
```
The server will run at `http://localhost:5000` if all model artifacts exist in `Model/`.

5) Run the web app
```bash
npm run dev
# open http://localhost:3000
```

## Environment Variables
- `GEMINI_API_KEY` (required): Used in `lib/gemini-client.ts` to initialize Gemini models.
- `MONGODB_URI` (required): Used in `lib/mongodb.ts` to connect to the database.

## Important Scripts
- `npm run dev`: Start Next.js dev server
- `npm run build`: Production build
- `npm run start`: Start production server (after build)
- `node scripts/setup-database.js`: Create indexes/config for MongoDB
- `node scripts/seed-sample-data.js`: Insert sample data
- `python scripts/start-model-server.py` or `scripts/start-model-server.bat`: Launch Python model server

## Project Structure (high-level)
```
app/                    Next.js App Router pages and API routes
  api/                  Serverless API endpoints (AI, ML, water-quality, dashboard)
components/             UI components and sections
lib/                    Clients, DB, utilities, model integration helpers
ml-models/              Python service code and requirements
Model/                  Pretrained model artifacts (*.pkl, *.npy, etc.)
scripts/                Setup, seed, and model server launch scripts
```

Key API routes (under `app/api/`):
- `ai/species-identification/route.ts`
- `ai/gene-sequence-analysis/route.ts`
- `ai/threat-assessment/route.ts`
- `ai/conservation-recommendations/route.ts`
- `ai/water-quality-analysis/route.ts`
- `ml/gene-prediction/route.ts`
- `dashboard-data/route.ts`
- `water-quality/route.ts`

## Python ML Model Server
Artifacts required in `Model/`:
- `stack_meta_clf.pkl`
- `stack_label_encoder.pkl`
- `lgb_models_list.pkl`
- `xgb_models_list.pkl`

Install Python dependencies once:
```bash
pip install -r ml-models/requirements.txt
```
Then run the server (see Quick Start). The launcher checks Python version, required files, installs deps, and starts Flask at `http://localhost:5000`.

## Development Notes
- Gemini client and models are created in `lib/gemini-client.ts`.
- MongoDB client with connection reuse is in `lib/mongodb.ts`.
- UI primitives live in `components/ui/`.

## Troubleshooting
- Missing `GEMINI_API_KEY` or `MONGODB_URI` will throw at startup.
- If model server fails to start, verify artifacts exist in `Model/` and Python 3.8+ is used.
- On Windows, prefer `scripts/start-model-server.bat` if Python launcher has path issues.

## License
Proprietary/Internal. Do not distribute without permission.