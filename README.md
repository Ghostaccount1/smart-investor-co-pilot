# Smart Investor

A user-ready Lovable app plus a cross-browser extension for context-aware market research. The web app handles onboarding, account identity, research conversations, watchlists, and memory controls. The extension carries the same identity and memory across approved websites.

## Architecture

- **Lovable / TanStack Start:** marketing site and authenticated research workspace
- **Lovable Cloud Supabase:** authentication, PostgreSQL, Row Level Security, conversation history, watchlists, and transparent memory
- **Supabase Edge Function:** authenticated OpenAI and market-data calls with secrets kept server-side
- **Manifest V3 extension:** movable page overlay for Chromium and Firefox

## Lovable Cloud setup

The repository is already linked to Supabase project `lfaziomdrpvodfctnwdm` in `supabase/config.toml`.

1. In Lovable, open **Cloud → Database** and apply `supabase/migrations/20260619190000_market_copilot.sql`.
2. Deploy the `copilot-chat` Edge Function from `supabase/functions/copilot-chat`.
3. In **Cloud → Secrets**, add:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional; defaults to `gpt-4.1-mini`)
   - `ALPHA_VANTAGE_API_KEY` (optional until a licensed production feed is selected)
4. Confirm the app environment contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Enable email/password authentication and configure the production redirect URL.

All product tables use Row Level Security. Anonymous database access is revoked; authenticated users can access only their own rows.

## Local development

```bash
bun install
bun run dev
```

Create `.env.local` from `.env.example` using the Lovable Cloud values. Do not place OpenAI or market-data secrets in `.env.local` with a `VITE_` prefix.

## Browser extension

Build a distributable extension after exporting the Supabase publishable key into your shell:

```bash
bun run build:extension
```

Load `extension/dist` as an unpacked extension in Chrome, Edge, or Brave. For Firefox, select `extension/dist/manifest.json` from `about:debugging`. Store signing and packaging remain release steps.

The extension:

- signs in with the same Supabase account as the dashboard;
- requires per-site permission before extracting visible page context;
- ignores forms and password fields;
- sends bounded text through the authenticated Edge Function;
- stores long-term conversations and memory in the user's RLS-protected cloud profile.

## Verification

```bash
bun run build
bun run lint
node --check extension/content.js
node --check extension/background.js
```

## Product boundary

Smart Investor provides research assistance, not individualized investment advice, brokerage services, or order execution. “Real-time” data must come from a licensed feed whose exchange, timestamp, delay, and redistribution terms are shown to users.
