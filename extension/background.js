import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config.js";

const ext = globalThis.browser ?? globalThis.chrome;

async function refreshSession(session) {
  if (!session?.refresh_token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) {
    await ext.storage.local.remove("session");
    return null;
  }
  const next = await response.json();
  next.expires_at = Math.floor(Date.now() / 1000) + next.expires_in;
  await ext.storage.local.set({ session: next });
  return next;
}

async function accessToken() {
  const { session } = await ext.storage.local.get("session");
  if (!session) return null;
  if ((session.expires_at || 0) > Math.floor(Date.now() / 1000) + 60) return session.access_token;
  return (await refreshSession(session))?.access_token || null;
}

ext.runtime.onMessage.addListener((message) => {
  if (message?.type === "GET_ACCESS_TOKEN") return accessToken().then((token) => ({ token }));
  if (message?.type === "SIGN_OUT")
    return ext.storage.local.remove("session").then(() => ({ ok: true }));
  if (message?.type === "COPILOT_CHAT")
    return (async () => {
      const token = await accessToken();
      if (!token) return { error: "Sign in from the extension menu first." };
      const response = await fetch(`${SUPABASE_URL}/functions/v1/copilot-chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message.payload),
      });
      const body = await response.json().catch(() => ({}));
      return response.ok ? body : { error: body.error || `Service error ${response.status}` };
    })();
});
