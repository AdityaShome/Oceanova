# Development Scripts

This directory contains scripts to help with development setup.

## Running the Full Application

To run both the Next.js frontend and the Python Flask backend simultaneously:

```bash
npm run dev:all
```

This will start:
- Next.js development server on `http://localhost:3000`
- Python Flask API server on `http://localhost:5000`

## Individual Services

### Next.js Frontend Only
```bash
npm run dev
```

### Python Flask Backend Only
```bash
npm run flask
```

## Python Dependencies

Make sure you have the required Python packages installed:

```bash
cd public/Ocean_details
pip install -r requirements.txt
```

## Environment Variables

The Flask app may require environment variables for external API access. Create a `.env` file in the `public/Ocean_details` directory if needed.

## Troubleshooting

- If Python is not found, make sure Python is installed and in your PATH
- If Flask dependencies are missing, run `pip install -r requirements.txt` in the `public/Ocean_details` directory
- If ports are already in use, you may need to stop other services or change the ports in the configuration
