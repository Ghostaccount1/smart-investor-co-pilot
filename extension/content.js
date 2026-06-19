(() => {
  if (window.top !== window || document.documentElement.dataset.smartInvestorLoaded) return;
  document.documentElement.dataset.smartInvestorLoaded = "true";
  const ext = globalThis.browser ?? globalThis.chrome;
  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;right:20px;bottom:20px";
  const root = host.attachShadow({ mode: "closed" });
  document.documentElement.append(host);
  root.innerHTML = `<style>
    *{box-sizing:border-box}.panel{width:360px;height:520px;display:grid;grid-template-rows:auto auto 1fr auto;overflow:hidden;border:1px solid #ffffff1c;border-radius:22px;background:#0b1713;color:#f2f7f4;box-shadow:0 28px 90px #0007;font:14px/1.45 Inter,system-ui,sans-serif}.panel.min{width:60px;height:60px;border-radius:19px;grid-template-rows:1fr}.panel.min>:not(header),.panel.min header>:not(.mark){display:none}header{display:flex;min-height:60px;align-items:center;gap:10px;padding:11px 13px;background:#0e1d18;cursor:grab;user-select:none;touch-action:none}.mark{display:grid;width:38px;height:38px;flex:none;place-items:center;border-radius:13px;background:#d5ff63;color:#102018;font-weight:900;letter-spacing:-.08em;cursor:pointer}.title{flex:1}.title b,.title small{display:block}.title b{font-size:13px}.title small{color:#71857a;font-size:9px}.icon{width:30px;height:30px;border:0;border-radius:9px;background:#172820;color:#8da097;cursor:pointer}.context{display:flex;align-items:center;gap:9px;border-block:1px solid #ffffff12;padding:9px 13px}.context span{flex:1;overflow:hidden;color:#74877d;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.toggle{position:relative;width:36px;height:20px;border:0;border-radius:20px;background:#263832;cursor:pointer}.toggle:after{content:'';position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#93a39b;transition:.18s}.toggle.on{background:#d5ff63}.toggle.on:after{transform:translateX(16px);background:#102018}.messages{overflow:auto;padding:14px 13px;display:flex;flex-direction:column;gap:11px;scrollbar-color:#294037 transparent}.welcome,.msg{padding:11px 12px;border-radius:14px;background:#12241d;color:#d8e3dd}.welcome{border:1px solid #233a30}.welcome b{display:block;color:#f3f7f5;font-size:15px;margin-bottom:4px}.welcome p{margin:0;color:#91a098;font-size:11px;line-height:1.55}.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px}.chip{padding:6px 8px;border:1px solid #2a4338;border-radius:99px;background:transparent;color:#bdcdc5;font:inherit;font-size:10px;cursor:pointer}.msg{max-width:91%;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.55}.user{align-self:flex-end;background:#d5ff63;color:#102018;border-bottom-right-radius:4px}.assistant{align-self:flex-start;border-bottom-left-radius:4px}.loading{color:#81958b;animation:pulse 1s infinite alternate}form{display:grid;grid-template-columns:1fr 39px;gap:8px;border-top:1px solid #ffffff12;padding:10px;background:#091510}textarea{min-height:42px;max-height:90px;resize:none;border:1px solid #294037;border-radius:12px;outline:none;background:#10211b;color:white;padding:10px;font:inherit;font-size:12px}textarea:focus{border-color:#d5ff63}.send{border:0;border-radius:12px;background:#d5ff63;color:#102018;font-size:17px;font-weight:900;cursor:pointer}.disclaimer{position:absolute;bottom:2px;left:0;right:0;text-align:center;color:#7f9288;font-size:8px;pointer-events:none}@keyframes pulse{to{opacity:.45}}@media(max-width:480px){.panel{width:min(360px,calc(100vw - 16px));height:min(520px,calc(100vh - 16px))}}
  </style><section class="panel" aria-label="Smart Investor Copilot"><header><div class="mark">SI</div><div class="title"><b>Smart Investor</b><small>Evidence before confidence</small></div><button class="icon minimize" title="Minimize">—</button></header><div class="context"><button class="toggle" role="switch" aria-checked="false"></button><span>Page context off for this site</span></div><div class="messages" aria-live="polite"><div class="welcome"><b>Your second set of eyes.</b><p>Approve this site, then ask about the company, chart, or thesis on screen.</p><div class="chips"><button class="chip">Analyze this page</button><button class="chip">What are the key risks?</button><button class="chip">Build a bull / bear case</button></div></div></div><form><textarea rows="1" aria-label="Ask Smart Investor" placeholder="Ask about this company or market…"></textarea><button class="send" title="Send">↑</button></form></section>`;
  const panel = root.querySelector(".panel"),
    header = root.querySelector("header"),
    messages = root.querySelector(".messages"),
    textarea = root.querySelector("textarea"),
    toggle = root.querySelector(".toggle"),
    label = root.querySelector(".context span");
  const permissionKey = `context:${location.origin}`;
  let allowed = false,
    conversationId = null,
    drag = null;
  const clean = (element) =>
    (element?.innerText || element?.textContent || "").replace(/\s+/g, " ").trim();
  function pageContext() {
    if (!allowed) return null;
    const main = document.querySelector('main,article,[role="main"]') || document.body;
    return {
      url: location.href,
      title: document.title,
      selected: String(getSelection?.() || "").slice(0, 4000),
      headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 24).map(clean).filter(Boolean),
      tables: [...document.querySelectorAll("table")].slice(0, 4).map((t) =>
        [...t.querySelectorAll("tr")]
          .slice(0, 20)
          .map((r) => [...r.cells].map(clean).join(" | "))
          .join("\n"),
      ),
      bodyText: clean(main).slice(0, 12000),
    };
  }
  function add(role, text, isLoading = false) {
    const node = document.createElement("div");
    node.className = `msg ${role}${isLoading ? " loading" : ""}`;
    node.textContent = text;
    messages.append(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }
  async function ask(value) {
    const question = value.trim();
    if (!question) return;
    add("user", question);
    textarea.value = "";
    const pending = add("assistant", "Checking the evidence…", true);
    try {
      const result = await ext.runtime.sendMessage({
        type: "COPILOT_CHAT",
        payload: { question, surface: "extension", conversationId, pageContext: pageContext() },
      });
      pending.classList.remove("loading");
      if (result.error) throw new Error(result.error);
      pending.textContent = result.answer;
      conversationId = result.conversationId || conversationId;
    } catch (error) {
      pending.classList.remove("loading");
      pending.textContent = `I couldn't complete that: ${error.message}`;
    }
  }
  root.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    ask(textarea.value);
  });
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask(textarea.value);
    }
  });
  root
    .querySelectorAll(".chip")
    .forEach((chip) => chip.addEventListener("click", () => ask(chip.textContent)));
  root.querySelector(".minimize").addEventListener("click", (event) => {
    event.stopPropagation();
    panel.classList.add("min");
  });
  root.querySelector(".mark").addEventListener("click", () => panel.classList.toggle("min"));
  function renderPermission() {
    toggle.classList.toggle("on", allowed);
    toggle.setAttribute("aria-checked", String(allowed));
    label.textContent = allowed
      ? `Reading ${location.hostname} with permission`
      : "Page context off for this site";
  }
  toggle.addEventListener("click", async () => {
    allowed = !allowed;
    await ext.storage.local.set({ [permissionKey]: allowed });
    renderPermission();
  });
  ext.storage.local.get({ [permissionKey]: false }).then((result) => {
    allowed = result[permissionKey];
    renderPermission();
  });
  header.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    const rect = host.getBoundingClientRect();
    drag = { dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    header.setPointerCapture(event.pointerId);
  });
  header.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const x = Math.max(8, Math.min(innerWidth - host.offsetWidth - 8, event.clientX - drag.dx)),
      y = Math.max(8, Math.min(innerHeight - host.offsetHeight - 8, event.clientY - drag.dy));
    Object.assign(host.style, { left: `${x}px`, top: `${y}px`, right: "auto", bottom: "auto" });
  });
  header.addEventListener("pointerup", () => {
    drag = null;
  });
})();
