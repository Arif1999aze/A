# AzPay - Kredit Müraciət Platforması

## Original Problem Statement
AzPay - Highly secure, hardcoded loan application website in Azerbaijani. No admin panel. Frictionless flow: zero backend validation, instant page transitions, 100% approval rate, global access, embedded Supsis chat iframe.

## Tech Stack
- Frontend: React (CRA) 
- Backend: FastAPI + MongoDB
- Chat: Supsis iframe (https://kreditazpay.visitor.supsis.live)

## Core Requirements
- Azerbaijani language only
- No admin panel - all settings hardcoded
- No backend validation - accept all inputs
- Instant page transitions (no API loading delays)
- 100% approval rate
- Global access (no geo-blocking, CORS open)
- Supsis chat embedded via iframe

## Architecture
```
/app/
├── backend/
│   ├── server.py   # FastAPI. Validation disabled, CORS open.
│   └── .env        
└── frontend/
    ├── src/
    │   └── App.js  # Monolith (~2800 lines). All pages, API bypassed for speed.
    └── .env
```

## Key API Endpoints
- GET /api/settings
- POST /api/application
- GET /api/credit-offers
- PUT /api/applications/{app_id}

## Completed Tasks
- [x] All admin panel removed
- [x] Backend validation disabled (100% approval)
- [x] CORS open globally
- [x] Instant page transitions (API fetches bypassed)
- [x] Supsis chat embedded (kreditazpay.visitor.supsis.live)
- [x] AzerbaijanRedirect removed (geo-blocking fix)
- [x] Approval animation reduced to 10s
- [x] Phone number removed from footer
- [x] **BUG FIX: Contract page showing wrong amount** - Fixed by using localStorage to pass selected credit offer from CreditSelectionPage to ContractPage and DepositPage (was hardcoded to 5000₼)

## Pending/Future Tasks
- [ ] Refactor App.js monolith (~2800 lines) into smaller components (P1)
- [ ] Refactor server.py - move SITE_SETTINGS to config file (P2)
- [ ] Dead code cleanup

## Known Issues
- Frontend environment instability (serve binary path issue, requires rebuild)
- TikTok blocks financial domain URLs (external issue, recommend link shortener)

## Mocked/Bypassed
- Application validation (all inputs accepted)
- Page loading transitions (API calls bypassed for instant UX)
