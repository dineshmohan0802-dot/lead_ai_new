# LeadPulse — B2B Lead Intelligence SaaS MVP

AI-powered B2B lead intelligence platform that monitors social signals from Reddit, Twitter/X, and LinkedIn, enriches them with AI-driven sentiment analysis and intent scoring, and generates personalized outreach drafts.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Supabase** project ([create one free](https://supabase.com))
- **AI API Key** — at least one of:
  - [Google Gemini API Key](https://aistudio.google.com/apikey) (free tier available)
  - [OpenRouter API Key](https://openrouter.ai) (free models available)

### 1. Setup Supabase

1. Create a new Supabase project
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. In **Authentication > Settings**, ensure email/password sign-up is enabled
4. Copy your project URL, anon key, and service role key from **Settings > API**

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Install Dependencies

```bash
npm run install:all
```

### 4. Run Development

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
cd client && npm run dev

# Or both together:
npm run dev
```

### 5. First Use

1. Open `http://localhost:5173`
2. Register a new account
3. Go to **Settings > Keywords** and add keywords like "lead generation", "alternative to Apollo"
4. Go to **Settings > Competitors** and add competitor names
5. Click **"Sync Signals"** in the top bar to trigger ingestion
6. View enriched signals on the **Signals** page and scored leads on the **Leads** page

---

## 📁 Architecture

```
├── client/          React + Vite + TypeScript + Tailwind
│   └── src/
│       ├── pages/   Login, Register, Dashboard, Leads, Signals, Settings
│       ├── components/  Layout, UI components
│       ├── hooks/   useAuth
│       ├── lib/     Supabase client, API client
│       └── stores/  Zustand state
│
├── server/          Express + TypeScript
│   └── src/
│       ├── services/ai/       AI abstraction (Gemini + OpenRouter)
│       ├── services/sources/  Reddit (real), Twitter (mock), LinkedIn (mock)
│       ├── services/enrichment/ Scoring + enrichment engine
│       ├── services/pipeline/   Ingestion → normalize → store orchestrator
│       ├── jobs/              Scheduler, ingest job, enrich job
│       ├── routes/            REST API endpoints
│       └── middleware/        Auth (Supabase JWT)
│
└── supabase/        Database migrations
```

## 🔄 Pipeline Flow

```
Source Adapters → Raw Events → Normalize → Signals → AI Enrich → Score → Store → Dashboard
     ↓                                                    ↓
  Reddit (real)                                    Gemini / OpenRouter
  Twitter (mock)                                   - Sentiment analysis
  LinkedIn (mock)                                  - Intent scoring
                                                   - Summary generation
                                                   - Outreach drafts
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/dashboard/stats` | GET | Overview statistics |
| `/api/signals` | GET | List signals (paginated, filterable) |
| `/api/leads` | GET | List leads (sortable, filterable) |
| `/api/leads/:id` | PATCH | Update lead status |
| `/api/leads/:id/outreach` | POST | Generate AI outreach |
| `/api/settings` | GET/PUT | Workspace settings |
| `/api/settings/rules` | GET/POST/DELETE | Monitoring rules CRUD |
| `/api/ingestion/trigger` | POST | Manual ingestion trigger |

---

## 🔧 Known Limitations (Phase 1 MVP)

- Twitter and LinkedIn use **mock data** (realistic but not live)
- No real-time WebSocket updates (polling-based refresh)
- No email/LinkedIn sending for outreach (copy-to-clipboard only)
- Single workspace per user
- In-memory job queue (not persistent across restarts)
- No rate limiting on API routes
- Reddit uses public JSON API (~10 req/min limit)

## 🛣️ Phase 2 Roadmap

<!-- TODO Phase 2 -->
- [ ] Real Twitter/X integration via API or Apify
- [ ] LinkedIn integration via Apify/Phantombuster
- [ ] BullMQ + Redis for persistent job queue
- [ ] Real-time updates via Supabase Realtime
- [ ] Email/LinkedIn outreach sending
- [ ] Multi-workspace & team support
- [ ] Webhook integrations (Slack, CRM)
- [ ] Usage analytics & billing
- [ ] Advanced ICP matching with company data enrichment
- [ ] Reddit OAuth for higher rate limits
- [ ] Chrome extension for manual signal capture
