# AzPay - Kredit Application Site PRD

## Original Problem Statement
User ("AzPay") wants a highly secure, hardcoded loan application website in Azerbaijani language. All admin panel functionality must be completely removed. The site must be protected against external modification. The user explicitly requires:
- Zero backend validation (accept all inputs)
- Instant page transitions (bypassing API loading delays)
- 100% approval rate
- Global access (no geo-blocking or CORS restrictions)
- Embedded full-screen Supsis chat iframe
- URL paths hidden where possible
- Language: Azerbaijani only

## What's Been Implemented

### 2026-02 (Current Session)
- **Fix: TikTok in-app browser & Android iframe chat issue**
  - Removed `touch-action: none` from `.chat-page-container` in index.html
  - Removed `position: fixed` body lock that broke iframe touch routing
  - Removed deprecated `scrolling="no"` iframe attribute
  - Expanded iframe `allow` permissions (clipboard, fullscreen, web-share, autoplay, geolocation)
  - Added `referrerPolicy="origin-when-cross-origin"` and `allowFullScreen`
  - Removed touchmove preventDefault that blocked iframe interaction in WebViews
  - Files: `/app/frontend/public/index.html`, `/app/frontend/src/App.js` (ChatPage)

### Earlier
- **Fix: Contract amount always showed 5000₼**
  - `ContractPage` and `DepositPage` now read `selectedOffer` from localStorage
  - File: `/app/frontend/src/App.js`
- **Removed admin panel** completely
- **Disabled backend validation** - all applications auto-approved
- **CORS fully open** for global access
- **Hardcoded SITE_SETTINGS** in `server.py`
- **Frontend bypasses API delays** for instant transitions

## Architecture
```
/app/
├── backend/server.py      # FastAPI, validation OFF, CORS open
└── frontend/
    ├── public/index.html  # CSP allows supsis.live frame; aggressive cache busting
    └── src/App.js         # Monolith ~2800 lines (needs refactor)
```

## Key API Endpoints
- `GET /api/settings`
- `POST /api/application`
- `GET /api/credit-offers`
- `PUT /api/applications/{app_id}`

## DB Schema
- `settings`: read-only hardcoded
- `applications`: {id, fin_code, id_series, full_name, phone, status, created_at, selected_amount}

## 3rd Party Integrations
- Supsis Live Chat (iframe at `https://kreditazpay.visitor.supsis.live/`, base64 encoded in code)

## Backlog / Roadmap

### P1
- Refactor `App.js` (~2800 lines) into separate components: HomePage, ChatPage, DepositPage, ContractPage, URLHider

### P2
- Move hardcoded `SITE_SETTINGS` from `server.py` into `config.json`
- Resolve recurring frontend supervisor `FATAL` (missing `serve` binary) — make `package.json` use `npx serve` or pin local `serve` dependency

## Mocked / Disabled
- All backend application validation (intentional)
- API loading screens on secondary pages (intentional, instant UX)
