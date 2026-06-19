import { DASHBOARD_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config.js";

const ext = globalThis.browser ?? globalThis.chrome;
const signedOut = document.querySelector("#signedOut");
const signedIn = document.querySelector("#signedIn");

async function render() {
  const { session } = await ext.storage.local.get("session");
  signedOut.hidden = Boolean(session);
  signedIn.hidden = !session;
  if (session) document.querySelector("#identity").textContent = session.user?.email || "Signed in";
}

document.querySelector("#dashboard").href = DASHBOARD_URL;
document.querySelector("#login").addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.querySelector("#error");
  error.textContent = "";
  if (SUPABASE_PUBLISHABLE_KEY.startsWith("__")) {
    error.textContent = "This beta build is missing its cloud key.";
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    error.textContent = payload.error_description || payload.msg || "Sign-in failed.";
    return;
  }
  payload.expires_at = Math.floor(Date.now() / 1000) + payload.expires_in;
  await ext.storage.local.set({ session: payload });
  render();
});
document.querySelector("#signOut").addEventListener("click", async () => {
  await ext.runtime.sendMessage({ type: "SIGN_OUT" });
  render();
});
render();
