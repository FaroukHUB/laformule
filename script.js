/* ===== Recherche, onglets, sliders et carte — vanilla JS =====
   Le ticket de commande (configurateur tacos / kapsalon, envoi WhatsApp)
   vit dans snack-runtime.js. ===== */
"use strict";

/* Helpers */
const $  = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

/* ===== Recherche intelligente (smart-search) ===== */
document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("smart-search");
  if (!form) return;

  const input         = form.querySelector("input[name='q'], #q");
  const resultsSection= document.getElementById("search-results");
  const resultsTitle  = document.getElementById("search-results-title");
  const resultsTrack  = document.getElementById("search-results-track");
  const resetBtn      = document.getElementById("reset-search");

  if (!input || !resultsSection || !resultsTrack) return;

  function normalise(str){
    return (str||"")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\s]/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  function getKeywords(card){
    const data = card.getAttribute("data-keywords") || "";
    const title= card.querySelector(".card-title")?.textContent || "";
    const desc = card.querySelector("p")?.textContent || "";
    return normalise(data+" "+title+" "+desc);
  }

  function doSearch(queryRaw){
    const query = normalise(queryRaw);
    const allCards = $$("[data-item]"); // <-- on récupère les cartes AU MOMENT de la recherche
    if (!query || !allCards.length){
      resultsSection.classList.add("hidden");
      resultsTrack.innerHTML = "";
      return;
    }

    const matches = [];
    allCards.forEach(card=>{
      const kw = getKeywords(card);
      if (kw && kw.includes(query)){
        matches.push(card);
      }
    });

    resultsTrack.innerHTML = "";
    if (!matches.length){
      resultsSection.classList.remove("hidden");
      if (resultsTitle){
        resultsTitle.textContent = `Aucun résultat pour « ${queryRaw} »`;
      }
      return;
    }

    resultsSection.classList.remove("hidden");
    if (resultsTitle){
      resultsTitle.textContent = `Résultats pour « ${queryRaw} » (${matches.length})`;
    }

    matches.forEach(card=>{
      const clone = card.cloneNode(true);
      resultsTrack.appendChild(clone);
    });

    resultsSection.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    doSearch(input.value);
  });

  if (resetBtn){
    resetBtn.addEventListener("click", ()=>{
      input.value = "";
      resultsSection.classList.add("hidden");
      resultsTrack.innerHTML = "";
    });
  }
});

/* ==== Tabs & sliders — en délégation (compatible DOM généré après) ==== */
document.addEventListener("DOMContentLoaded", ()=>{
  /* --- Tabs : on écoute les clics sur le conteneur, pas sur les boutons eux-mêmes --- */
  const tabsContainer = document.querySelector(".category-tabs");
  if (tabsContainer){
    tabsContainer.addEventListener("click", (e)=>{
      const btn = e.target.closest(".tab-btn");
      if (!btn) return;
      const targetSelector = btn.dataset.target;
      if (!targetSelector) return;

      const panels  = $$(".tab-panel");
      const tabBtns = $$(".tab-btn");

      const target = $(targetSelector);
      if (!target) return;

      panels.forEach(p=>p.removeAttribute("data-active"));
      target.setAttribute("data-active","true");

      tabBtns.forEach(b=>b.setAttribute("aria-selected","false"));
      btn.setAttribute("aria-selected","true");
    });
  }

  /* --- Sliders : on écoute les clics sur document, et on remonte vers .slider .arrow --- */
  document.addEventListener("click", (e)=>{
    const arrow = e.target.closest(".slider .arrow");
    if (!arrow) return;

    const slider = arrow.closest(".slider");
    if (!slider) return;
    const track = slider.querySelector(".track,[data-track]");
    if (!track) return;

    const dir = arrow.classList.contains("left") ? -1 : 1;
    track.scrollBy({
      left: dir * track.clientWidth,
      behavior:"smooth"
    });
  });
});

/* ==== Carte interactive ==== */
document.addEventListener("DOMContentLoaded", ()=>{
  const btn   = document.getElementById("loadMap");
  const img   = document.getElementById("map-static");
  const cont  = document.getElementById("map-container");
  if (!btn || !img || !cont) return;

  let loaded = false;
  btn.addEventListener("click", ()=>{
    if (loaded) return;
    loaded = true;

    const addr = btn.getAttribute("data-address") || img.alt || "";
    const q    = encodeURIComponent(addr);
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${q}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.className = "w-full h-64 md:h-80 border-0";

    cont.innerHTML = "";
    cont.appendChild(iframe);
  });
});

/* ==== Bouton retour aux catégories (pour résultats recherche) ==== */
document.addEventListener("DOMContentLoaded", ()=>{
  const section = document.getElementById("search-results");
  const track   = document.getElementById("search-results-track");
  if (!section || !track) return;

  function findTabsBar(){
    return document.querySelector(".category-tabs");
  }

  function scrollToWithOffset(target, offset){
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.scrollY - offset;
    window.scrollTo({ top:y, behavior:"smooth" });
  }

  section.addEventListener("transitionend", ()=>{
    const existing = track.querySelector(".grid-return");
    if (existing) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "grid-return";
    btn.innerHTML = `↑ <span>Retour aux catégories</span>`;
    btn.addEventListener("click", () => {
      const tabs = findTabsBar();
      if (tabs) {
        scrollToWithOffset(tabs, 80);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    track.appendChild(btn);
  });
});
