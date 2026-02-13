# KAVACH

KAVACH is an AI honeypot API for scam engagement, language-aware responses, and intelligence extraction.

## Endpoints
- `POST /api/honeypot`
- `GET /api/shield-report?caseId=...`
- `GET /api/health`
- `GET /api/metrics`

## Setup
1. `npm install`
2. Copy `.env.example` to `.env`
3. Set `ANTHROPIC_API_KEY` and `API_KEY`
4. Deploy to Vercel

## Test
`npm test`
