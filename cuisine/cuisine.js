/* Page cuisine – suivi des commandes en direct (polling toutes les 5 s) */
(function () {
  "use strict";
  const cfg = window.SNACK_CONFIG || {};
  const API = (cfg.ordering && cfg.ordering.apiUrl) || "/api/orders.php";
  const POLL_MS = 5000;

  const $ = (s, r = document) => r.querySelector(s);
  const STATUS = {
    recue: "Reçue", preparation: "En préparation", prete: "Prête",
    en_route: "En route", terminee: "Terminée", annulee: "Annulée",
  };
  const MODE = { "sur-place": "🍽️ Sur place", emporter: "🥡 À emporter", livraison: "🛵 Livraison" };
  const ACTIVE = ["recue", "preparation", "prete", "en_route"];

  let pin = sessionStorage.getItem("kitchen_pin") || "";
  let orders = [];
  let knownIds = null;
  let tab = "active";
  let timer = null;
  let soundOn = localStorage.getItem("kitchen_sound") !== "off";
  let audioCtx = null;
  let etaChoice = {};

  if (cfg.name) $("#brand").textContent = `Cuisine · ${cfg.name}`;
  if (cfg.theme && cfg.theme.colors && cfg.theme.colors.brand) {
    document.documentElement.style.setProperty("--brand", cfg.theme.colors.brand);
  }

  // ------------------------------------------------------------------ utils
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function euro(n) { return (Number(n) || 0).toFixed(2).replace(".", ",") + " €"; }
  function hhmm(ts) { const d = new Date(ts * 1000); return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
  function ago(ts) {
    const m = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60));
    if (m < 1) return "à l'instant";
    if (m < 60) return `il y a ${m} min`;
    return `il y a ${Math.floor(m / 60)} h ${m % 60} min`;
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
  function beep() {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [0, 0.18, 0.36].forEach((t, i) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o.type = "sine"; o.frequency.value = i === 2 ? 1046 : 880;
        g.gain.setValueAtTime(0.0001, now + t); g.gain.exponentialRampToValueAtTime(0.5, now + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.16);
        o.connect(g); g.connect(audioCtx.destination); o.start(now + t); o.stop(now + t + 0.18);
      });
    } catch (e) { /* audio indisponible */ }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }

  // -------------------------------------------------------------------- api
  async function api(action, opts = {}) {
    const url = `${API}?action=${action}${opts.query ? "&" + opts.query : ""}`;
    const r = await fetch(url, opts.body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts.body) } : { cache: "no-store" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error || "Erreur"), { status: r.status });
    return data;
  }

  async function load() {
    try {
      const data = await api("list", { query: "pin=" + encodeURIComponent(pin) });
      $("#netdot").classList.remove("off");
      orders = data.orders || [];
      const ids = new Set(orders.map((o) => o.id));
      if (knownIds) {
        const fresh = orders.filter((o) => !knownIds.has(o.id));
        if (fresh.length) {
          beep();
          document.title = `(${fresh.length}) Nouvelle commande !`;
          setTimeout(() => (document.title = "Cuisine · Commandes en direct"), 4000);
          toast(`🔔 ${fresh.length} nouvelle${fresh.length > 1 ? "s" : ""} commande${fresh.length > 1 ? "s" : ""}`);
        }
      }
      knownIds = ids;
      render();
    } catch (e) {
      $("#netdot").classList.add("off");
      if (e.status === 401) logout("Code invalide");
    }
  }

  async function setStatus(id, status) {
    const body = { pin, id, status };
    if (status === "preparation" && etaChoice[id]) body.eta = etaChoice[id];
    try {
      await api("update", { body });
      toast(`${id} → ${STATUS[status]}`);
      await load();
    } catch (e) {
      toast("Erreur : " + e.message);
    }
  }

  // ----------------------------------------------------------------- render
  function nextActions(o) {
    const d = o.mode === "livraison";
    switch (o.status) {
      case "recue":
        return `
          <div class="eta">⏱️ Prête dans :
            ${[10, 20, 30, 45].map((m) => `<button type="button" data-eta="${m}" data-id="${o.id}" class="${(etaChoice[o.id] || 20) === m ? "on" : ""}">${m} min</button>`).join("")}
          </div>
          <button class="btn primary" data-status="preparation" data-id="${o.id}" type="button">👨‍🍳 Commencer la préparation</button>
          <button class="btn ghost" data-status="annulee" data-id="${o.id}" type="button">Annuler</button>`;
      case "preparation":
        return `<button class="btn ok" data-status="${d ? "en_route" : "prete"}" data-id="${o.id}" type="button">${d ? "🛵 Partie en livraison" : "✅ Commande prête"}</button>
                <button class="btn ghost" data-status="annulee" data-id="${o.id}" type="button">Annuler</button>`;
      case "prete":
      case "en_route":
        return `<button class="btn" data-status="terminee" data-id="${o.id}" type="button">🏁 ${d ? "Livrée" : "Remise au client"}</button>`;
      default:
        return `<button class="btn ghost" data-status="recue" data-id="${o.id}" type="button">↩︎ Réouvrir</button>`;
    }
  }

  function card(o) {
    const wa = (o.phone || "").replace(/\D/g, "").replace(/^0/, "33");
    return `
      <article class="card ${esc(o.status)}" data-id="${esc(o.id)}">
        <div class="top">
          <div>
            <div class="id">${esc(o.id)}</div>
            <div class="meta">${hhmm(o.createdAt)} · ${ago(o.createdAt)}</div>
            <div style="margin-top:.4rem">
              <span class="badge ${esc(o.mode)}">${MODE[o.mode] || esc(o.mode)}</span>
              <span class="badge">🕒 ${esc(o.time || "Dès que possible")}</span>
            </div>
          </div>
          <div class="status">${STATUS[o.status] || esc(o.status)}
            ${o.eta && ACTIVE.includes(o.status) ? `<span>prête vers ${hhmm(o.eta)}</span>` : ""}
          </div>
        </div>
        <div class="client">
          <strong>${esc(o.name)}</strong>
          <a href="tel:${esc(o.phone)}">📞 ${esc(o.phone)}</a>
          ${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">💬 WhatsApp</a>` : ""}
        </div>
        ${o.address ? `<div class="addr">📍 ${esc(o.address)}</div>` : ""}
        <ul class="lines">
          ${(o.lines || []).map((l) => `
            <li><span class="q">${l.qty > 1 ? l.qty + "×" : "1×"}</span>
                <span><strong>${esc(l.name)}</strong>${l.variant === "menu" ? " <em>(menu)</em>" : ""}${l.details ? `<span class="d">${esc(l.details)}</span>` : ""}</span>
                <span class="p">${euro(l.total)}</span></li>`).join("")}
        </ul>
        ${o.message ? `<div class="msg">💬 ${esc(o.message)}</div>` : ""}
        <div class="total"><span>Total${o.fee ? ` (dont livraison ${euro(o.fee)})` : ""}</span><span>${euro(o.total)}</span></div>
        <div class="actions">${nextActions(o)}</div>
      </article>`;
  }

  function render() {
    const active = orders.filter((o) => ACTIVE.includes(o.status)).sort((a, b) => a.createdAt - b.createdAt);
    const done = orders.filter((o) => !ACTIVE.includes(o.status));
    $("#nActive").textContent = active.length;
    $("#nDone").textContent = done.length;
    const list = tab === "active" ? active : done;
    $("#list").innerHTML = list.length
      ? list.map(card).join("")
      : `<div class="empty">${tab === "active" ? "Aucune commande en attente. 🍔<br><small>Cette page se met à jour toute seule.</small>" : "Aucune commande terminée aujourd'hui."}</div>`;
  }

  // ------------------------------------------------------------------ login
  function login(code) {
    pin = code;
    sessionStorage.setItem("kitchen_pin", pin);
    $("#login").classList.add("hidden");
    $("#board").classList.remove("hidden");
    $("#logoutBtn").classList.remove("hidden");
    knownIds = null;
    load();
    clearInterval(timer);
    timer = setInterval(() => { if (document.visibilityState === "visible") load(); }, POLL_MS);
  }
  function logout(msg) {
    clearInterval(timer);
    pin = "";
    sessionStorage.removeItem("kitchen_pin");
    $("#board").classList.add("hidden");
    $("#logoutBtn").classList.add("hidden");
    $("#login").classList.remove("hidden");
    $("#loginErr").textContent = msg || "";
  }

  $("#loginBtn").addEventListener("click", () => {
    const code = $("#pin").value.trim();
    if (!code) return;
    beep(); // débloque l'audio sur mobile grâce au geste utilisateur
    login(code);
  });
  $("#pin").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#loginBtn").click(); });
  $("#logoutBtn").addEventListener("click", () => logout(""));
  $("#refreshBtn").addEventListener("click", load);
  $("#soundBtn").addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem("kitchen_sound", soundOn ? "on" : "off");
    $("#soundBtn").classList.toggle("on", soundOn);
    if (soundOn) beep();
  });
  $("#soundBtn").classList.toggle("on", soundOn);

  document.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => {
      tab = b.dataset.tab;
      document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === b));
      render();
    })
  );

  $("#list").addEventListener("click", (e) => {
    const eta = e.target.closest("[data-eta]");
    if (eta) { etaChoice[eta.dataset.id] = parseInt(eta.dataset.eta, 10); render(); return; }
    const btn = e.target.closest("[data-status]");
    if (!btn) return;
    if (btn.dataset.status === "annulee" && !confirm(`Annuler la commande ${btn.dataset.id} ?`)) return;
    setStatus(btn.dataset.id, btn.dataset.status);
  });

  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && pin) load(); });

  if (pin) login(pin);
})();
