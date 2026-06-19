## Goal

Set up a clean foundation for your investor co-pilot so Codex (or any external tool synced via GitHub) can build on top of it. No product features yet — just the plumbing.

## Steps

1. **Keep the project blank**
   - Leave `src/routes/index.tsx` with a minimal placeholder landing ("Investor Co-Pilot — coming soon"). No business logic, no UI components, no AI calls yet.

2. **Enable Lovable Cloud**
   - Provision the backend (Postgres database, Auth, Storage, server functions, secrets). 
   - This also makes `LOVABLE_API_KEY` available later for AI features (Lovable AI Gateway), so when Codex adds an LLM-powered co-pilot it can use it without extra setup.
   - No tables, policies, or auth screens will be created at this stage — that's for the build phase.

3. **GitHub connection (manual, done by you)**
   - GitHub linking can't be triggered from chat — you need to do it from the UI:
     - Bottom-left **+** menu in the chat input → **GitHub** → **Connect project**
     - Authorize the Lovable GitHub App
     - Pick the account/org and click **Create Repository**
   - Once connected, sync is bidirectional: Codex pushes to GitHub → changes flow into Lovable, and vice versa.

4. **Confirmation**
   - I'll confirm Cloud is live and remind you to do the GitHub step. After that, the project is ready for Codex to start building features.

## Notes / open questions for later (not for this step)

When you're ready to build the co-pilot itself, decisions we'll need:
- Auth method (email+password, Google, both?)
- Data sources for "context" (uploaded PDFs/CSVs, portfolio holdings table, market data API, news?)
- Whether the co-pilot is chat-style or structured (e.g. "analyze this ticker" forms)

These don't block today's setup.
