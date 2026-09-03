// ============================================================================
// SNACK RUNTIME – VERSION FINALE
// 100% générique · 0% Formule · Full data-driven via SNACK_CONFIG
// Remplit automatiquement tout le template (HTML/CSS/JS) via le config du snack
// ============================================================================

console.log("🚀 [INIT] snack-runtime.js is loading...");

(function () {
  console.log("🔍 [INIT] IIFE started");
  const cfg = window.SNACK_CONFIG;
  console.log("🔍 [INIT] SNACK_CONFIG:", cfg ? "EXISTS" : "MISSING");
  if (!cfg) {
    console.error("❌ SNACK_RUNTIME : SNACK_CONFIG manquant.");
    return;
  }
  console.log("✅ [INIT] SNACK_CONFIG loaded successfully");

  document.addEventListener("DOMContentLoaded", initSnackRuntime);

  // ==========================================================================
  // HELPERS GÉNÉRAUX
  // ==========================================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const snackName = cfg.name || cfg.legalName || "Snack";
  const fullAddress = [
    cfg.location?.addressLine1,
    cfg.location?.postalCode,
    cfg.location?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const phoneRaw = cfg.contact?.phone || "";
  const phoneDisplay = cfg.contact?.displayPhone || phoneRaw;
  const phoneHref = phoneRaw ? `tel:${phoneRaw.replace(/\s+/g, "")}` : "#";

  // ==========================================================================
  // INIT PRINCIPAL
  // ==========================================================================
  function initSnackRuntime() {
    document.body.setAttribute("data-snack", cfg.id || "snack");

    applyTheme();
    applyHeader();
    applyHero();
    // Ordre: header > hero > recherche (dans menu) > menu > préférés > plateformes > avis > maps > faq
    applyMenu();
    applyFeatured();
    applyDeliverySection(); // Plateformes (Uber Eats, Deliveroo)
    applyReviews(); // Avis clients
    applyMap(); // Carte Google Maps
    applyFaq(); // FAQ
    applyFooter();
    applyDrawer();
    applyFloatingCall();
    applySeo();
    applyOpenStatus();
    initPwa();
    restoreTicketState();
    applyHeroActions();
  }

  // ==========================================================================
  // 1. THEME (couleurs)
  // ==========================================================================
  function applyTheme() {
    if (!cfg.theme?.colors) return;

    const c = cfg.theme.colors;
    const root = document.documentElement;

    const accent =
      c.accent ||
      c.brand ||
      "#e11b22";

    const text =
      c.text ||
      c.headerText ||
      "#111827";

    const background =
      c.background ||
      c.surface ||
      c.surfaceAlt ||
      "#ffffff";

    if (accent) {
      root.style.setProperty("--brand", accent);
      root.style.setProperty("--ring", hexToRgba(accent, 0.3));
    }
    if (text) {
      root.style.setProperty("--ink", text);
    }
    if (background) {
      root.style.setProperty("--paper", background);
    }

    const b = (cfg.theme && cfg.theme.badges) || {};
    const soloBg   = b.soloBg   || "#111111";
    const soloText = b.soloText || "#ffffff";  // ✅ Blanc au lieu de accent
    const menuBg   = b.menuBg   || accent;
    const menuText = b.menuText || "#ffffff";  // ✅ Blanc au lieu de noir

    const s = document.createElement("style");
    s.textContent = `
      #navBtn {
        background: var(--brand);
        color: #fff;
        border-color: var(--brand);
      }
      #navBtn:hover { filter: brightness(1.05); }

      .btn-brand {
        background: var(--brand) !important;
        border-color: var(--brand) !important;
        color: #fff !important;
      }

      .text-brand { color: var(--brand); }
      .bg-brand { background: var(--brand); }

      .price-chip-solo {
        background: ${soloBg};
        color: ${soloText};
      }
      .price-chip-menu {
        background: ${menuBg};
        color: ${menuText};
      }

      .agency-link {
        color: ${accent} !important;
        font-weight: 600;
      }
      .agency-link:hover {
        opacity: 0.85;
      }

      .price-badge,
      .badge-menu {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        min-width: 9rem;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        font-size: 0.95rem;
        font-weight: 700;
        border: none;
        cursor: pointer;
        white-space: nowrap;
      }

      .price-badge {
        background: ${soloBg};
        color: ${soloText};
      }

      .badge-menu {
        background: ${menuBg};
        color: ${menuText};
      }

      .price-plus {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.25);  /* Plus clair pour mieux voir le + */
        color: #ffffff;  /* ✅ + en blanc */
        font-size: 1.1rem;
        font-weight: 800;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(s);
  }

  // ==========================================================================
  // 2. HEADER
  // ==========================================================================
  function applyHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    const link = header.querySelector("a[href='#hero']");
    if (link) {
      const img = link.querySelector("img");
      const span = link.querySelector("span");

      if (img && cfg.assets?.logo) {
        img.src = cfg.assets.logo.dark || cfg.assets.logo.light || img.src;
        img.alt = cfg.assets.logo.alt || snackName;
      }

      if (cfg.id === "fabrik-burger" && span) {
        span.remove();
      }
    }

    const colors = cfg.theme?.colors || {};
    let bg;
    let ink;

    if (cfg.id === "fabrik-burger") {
      bg = colors.accent || colors.surfaceAlt || colors.surface || "#c58a3a";
      ink = colors.textOnDark || "#fdfbf7";
    } else {
      bg =
        colors.headerBackground || colors.surface || colors.surfaceAlt || null;
      ink = colors.headerText || colors.text || "#111111";
    }

    if (!bg) return;

    header.style.backgroundColor = bg;
    header.style.color = ink;

    header.querySelectorAll("nav a, #navBtn").forEach((el) => {
      el.style.color = ink;
    });

    const parent = header.parentElement;
    if (parent && parent.tagName !== "BODY" && parent.tagName !== "HTML") {
      parent.style.backgroundColor = bg;
      parent.style.color = ink;
    }
  }

  // ==========================================================================
  // 3. HERO
  // ==========================================================================
  function applyHero() {
    const hero = $("#hero");
    if (!hero) return;

    const heroImg = $("img", hero);
    if (heroImg && cfg.assets?.hero) {
      heroImg.src = cfg.assets.hero.image || heroImg.src;
      heroImg.alt = cfg.assets.hero.alt || `${snackName}`;
    }

    const kicker = hero.querySelector(".section-kicker");
    if (kicker) {
      const city = cfg.location?.city ? ` · ${cfg.location.city}` : "";
      kicker.textContent = `${snackName}${city}`;
    }

    const title = hero.querySelector("h1.section-title");
    if (title && cfg.heroTitle) {
      title.textContent = cfg.heroTitle;
    }

    const badgesRow = hero.querySelector(
      ".text-slate-600.text-sm.md\\:text-base.mt-2.flex.items-center.gap-2.flex-wrap"
    );

    if (badgesRow) {
      badgesRow.innerHTML = "";
      const list = [];

      if (cfg.google?.rating && cfg.google?.reviewCount) {
        list.push(
          `⭐ ${cfg.google.rating
            .toString()
            .replace(".", ",")}/5 · ${cfg.google.reviewCount}+ avis Google`
        );
      } else if (cfg.uber?.rating && cfg.uber?.reviewCount) {
        list.push(
          `⭐ ${cfg.uber.rating
            .toString()
            .replace(".", ",")}/5 · ${cfg.uber.reviewCount}+ avis Uber Eats`
        );
      }

      if (cfg.priceRange) list.push(`💶 ${cfg.priceRange}`);

      if (cfg.google?.cuisine?.length) {
        list.push(`🍽️ ${cfg.google.cuisine.join(" · ")}`);
      }

      if (cfg.isHalal) list.push("✅ Halal");

      list.forEach((txt) => {
        const span = document.createElement("span");
        span.className = "inline-flex items-center gap-1 text-slate-500";
        span.textContent = txt;
        badgesRow.appendChild(span);
      });
    }
  }

  // ==========================================================================
  // 4. MAP (iframe prioritaire via cfg.urls.googleMapsEmbed)
  // ==========================================================================
  function applyMap() {
    const carte = $("#carte");
    if (!carte) return;

    const addrText = carte.querySelector("p.mt-1");
    if (addrText) addrText.textContent = fullAddress;

    const itin = carte.querySelector("a[href*='maps']");
    if (itin) {
      const url =
        cfg.urls?.googleMaps ||
        (fullAddress
          ? "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(fullAddress)
          : "https://www.google.com/maps");
      itin.href = url;
    }

    const mapContainer = $("#map-container", carte);

    if (mapContainer && cfg.urls?.googleMapsEmbed) {
      mapContainer.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.src = cfg.urls.googleMapsEmbed;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.className = "w-full h-64 md:h-80 border-0";
      iframe.setAttribute("allowfullscreen", "");

      mapContainer.appendChild(iframe);
      return;
    }

    const mapImg = $("#map-static", carte);
    if (mapImg && fullAddress) {
      const q = encodeURIComponent(fullAddress);
      mapImg.src =
        "https://maps.googleapis.com/maps/api/staticmap?center=" +
        q +
        "&zoom=15&size=640x400&markers=color:red|" +
        q +
        "&key=YOUR_API_KEY";
      mapImg.alt = `Plan d'accès à ${snackName}`;
    }

    const loadBtn = $("#loadMap", carte);
    if (loadBtn) {
      loadBtn.dataset.address = fullAddress || "";
    }
  }

  // ==========================================================================
  // 4 BIS. PRÉFÉRÉS CLIENTS
  // ==========================================================================
  function applyFeatured() {
    if (!cfg.featured || !cfg.featured.enabled || !cfg.featured.items || cfg.featured.items.length === 0) {
      return; // Pas de section featured configurée
    }

    // Trouver ou créer la section featured dans le HTML
    const menuSection = $("#menu");
    if (!menuSection) return;

    // Créer la section featured APRÈS le menu
    let featuredSection = $("#featured");
    if (!featuredSection) {
      featuredSection = document.createElement("section");
      featuredSection.id = "featured";
      featuredSection.className = "max-w-6xl mx-auto px-4 pt-8 mb-8";
      // Insérer APRÈS le menu
      if (menuSection.nextSibling) {
        menuSection.parentNode.insertBefore(featuredSection, menuSection.nextSibling);
      } else {
        menuSection.parentNode.appendChild(featuredSection);
      }
    }

    // Titre et sous-titre
    featuredSection.innerHTML = `
      <div class="text-center mb-6">
        <h2 class="section-title text-2xl md:text-3xl mb-2">${cfg.featured.title || "Nos préférés"}</h2>
        ${cfg.featured.subtitle ? `<p class="text-slate-600">${cfg.featured.subtitle}</p>` : ""}
      </div>
    `;

    // Slider container (même structure que le menu)
    const slider = document.createElement("div");
    slider.className = "slider";

    const left = document.createElement("button");
    left.className = "arrow left";
    left.textContent = "‹";

    const right = document.createElement("button");
    right.className = "arrow right";
    right.textContent = "›";

    const track = document.createElement("div");
    track.className = "track";
    track.dataset.track = "";
    track.id = "featured-track";

    // Parcourir toutes les catégories pour trouver les produits
    const allItems = [];
    if (cfg.menu && cfg.menu.categories) {
      cfg.menu.categories.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
          cat.items.forEach(item => {
            if (cfg.featured.items.includes(item.id)) {
              allItems.push({ ...item, categoryId: cat.id, categoryName: cat.name });
            }
          });
        }
      });
    }

    // Créer les cartes featured (EXACTEMENT comme dans le menu)
    allItems.forEach(item => {
      const card = document.createElement("article");
      card.className = "card bg-white border rounded-3xl elev p-5";

      card.dataset.item =
        item.id ||
        (item.name || "").toLowerCase().replace(/\s+/g, "-");

      const kwParts = [
        item.name,
        item.description,
        Array.isArray(item.tags) ? item.tags.join(" ") : "",
      ];
      card.dataset.keywords = kwParts.filter(Boolean).join(" ");

      // Badge "PRÉFÉRÉ" en haut à droite
      const badge = document.createElement("div");
      badge.className = "absolute top-2 right-2 z-10 bg-brand text-white px-2 py-1 rounded-full text-xs font-bold";
      badge.textContent = "⭐ PRÉFÉRÉ";
      badge.style.position = "absolute";
      card.style.position = "relative";
      card.appendChild(badge);

      // Image du produit (même code que le menu)
      const imgSrc = item.image || (item.imageKey && cfg.assets?.menuImages?.[item.imageKey]);
      if (imgSrc) {
        const img = document.createElement("img");
        img.className = "food-img";
        img.src = imgSrc;
        img.alt = item.name;
        card.appendChild(img);
      }

      const h4 = document.createElement("h4");
      h4.className = "card-title mt-3";
      h4.textContent = item.name;
      card.appendChild(h4);

      if (item.description) {
        const p = document.createElement("p");
        p.className = "text-sm text-slate-600";
        p.textContent = item.description;
        card.appendChild(p);
      }

      const priceBox = document.createElement("div");
      priceBox.className = "mt-2 flex flex-col gap-2";

      const soloPrice = item.priceSolo ?? item.price;
      if (soloPrice != null) {
        const soloBtn = document.createElement("button");
        soloBtn.type = "button";

        soloBtn.className = "price-badge flex items-center justify-between";
        soloBtn.dataset.productId = item.id;
        soloBtn.dataset.variant = "solo";

        soloBtn.innerHTML = `
          <span>${soloPrice} € </span>
          <span class="price-plus">+</span>
        `;

        soloBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (typeof openTicketBuilder === "function") {
            openTicketBuilder(item.id, "solo");
          }
        });

        priceBox.appendChild(soloBtn);
      }

      if (item.priceMenu != null) {
        const btnMenu = document.createElement("button");
        btnMenu.type = "button";
        btnMenu.className =
          "badge-menu flex items-center justify-between";
        btnMenu.dataset.productId = item.id;
        btnMenu.dataset.variant = "menu";

        btnMenu.innerHTML = `
          <span>${item.priceMenu} € en menu</span>
          <span class="price-plus">+</span>
        `;

        btnMenu.addEventListener("click", (e) => {
          e.stopPropagation();
          if (typeof openTicketBuilder === "function") {
            openTicketBuilder(item.id, "menu");
          }
        });

        priceBox.appendChild(btnMenu);
      }

      card.appendChild(priceBox);

      track.appendChild(card);
    });

    slider.appendChild(left);
    slider.appendChild(right);
    slider.appendChild(track);

    featuredSection.appendChild(slider);
  }

  // ==========================================================================
  // 5. MENU
  // ==========================================================================
  function applyMenu() {
    const menu = $("#menu");
    if (!menu || !cfg.menu?.categories) return;

    const tabs = menu.querySelector(".category-tabs");
    const panels =
      menu.querySelector(".panels-wrapper") ||
      menu.querySelector(".mt-6.space-y-10");

    if (!tabs || !panels) return;

    tabs.innerHTML = "";
    panels.innerHTML = "";

    cfg.menu.categories.forEach((cat, i) => {
      const cid = cat.id || `cat-${i}`;
      const tabId = `tab-${cid}`;

      const btn = document.createElement("button");
      btn.className =
        "tab-btn px-3 py-2 rounded-xl whitespace-nowrap flex flex-col items-center gap-1 text-sm";
      btn.dataset.target = `#${tabId}`;
      btn.setAttribute("aria-controls", tabId);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.innerHTML = `${pickIcon(cat.id, cat.name)}<span>${
        cat.name || "Catégorie"
      }</span>`;
      tabs.appendChild(btn);

      const panel = document.createElement("section");
      panel.id = tabId;
      panel.className = "tab-panel";
      if (i === 0) panel.dataset.active = "true";

      const header = document.createElement("div");
      header.className = "flex items-center justify-between mb-3";

      const h3 = document.createElement("h3");
      h3.className = "section-title text-xl md:text-2xl";
      h3.textContent = cat.name || "Catégorie";
      header.appendChild(h3);

      if (cat.description) {
        const p = document.createElement("p");
        p.className = "text-sm text-slate-500";
        p.textContent = cat.description;
        header.appendChild(p);
      }

      panel.appendChild(header);

      const slider = document.createElement("div");
      slider.className = "slider";

      const left = document.createElement("button");
      left.className = "arrow left";
      left.textContent = "‹";

      const right = document.createElement("button");
      right.className = "arrow right";
      right.textContent = "›";

      const track = document.createElement("div");
      track.className = "track";
      track.dataset.track = "";
      track.id = `${cid}-track`;

      (cat.items || []).forEach((item) => {
        const card = document.createElement("article");
        card.className = "card bg-white border rounded-3xl elev p-5";

        card.dataset.item =
          item.id ||
          (item.name || "").toLowerCase().replace(/\s+/g, "-");

        const kwParts = [
          item.name,
          item.description,
          cat.name,
          Array.isArray(item.tags) ? item.tags.join(" ") : "",
        ];
        card.dataset.keywords = kwParts.filter(Boolean).join(" ");

        // Image du produit (nouveau: item.image, ancien: cfg.assets.menuImages[item.imageKey])
        const imgSrc = item.image || (item.imageKey && cfg.assets?.menuImages?.[item.imageKey]);
        if (imgSrc) {
          const img = document.createElement("img");
          img.className = "food-img";
          img.src = imgSrc;
          img.alt = item.name;
          card.appendChild(img);
        }

        const h4 = document.createElement("h4");
        h4.className = "card-title mt-3";
        h4.textContent = item.name;
        card.appendChild(h4);

        if (item.description) {
          const p = document.createElement("p");
          p.className = "text-sm text-slate-600";
          p.textContent = item.description;
          card.appendChild(p);
        }

        const priceBox = document.createElement("div");
        priceBox.className = "mt-2 flex flex-col gap-2";

        const soloPrice = item.priceSolo ?? item.price;
        if (soloPrice != null) {
          const soloBtn = document.createElement("button");
          soloBtn.type = "button";

          soloBtn.className = "price-badge flex items-center justify-between";
          soloBtn.dataset.productId = item.id;
          soloBtn.dataset.variant = "solo";

          soloBtn.innerHTML = `
            <span>${soloPrice} € </span>
            <span class="price-plus">+</span>
          `;

          soloBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof openTicketBuilder === "function") {
              openTicketBuilder(item.id, "solo");
            }
          });

          priceBox.appendChild(soloBtn);
        }

        if (item.priceMenu != null) {
          const btnMenu = document.createElement("button");
          btnMenu.type = "button";
          btnMenu.className =
            "badge-menu flex items-center justify-between";
          btnMenu.dataset.productId = item.id;
          btnMenu.dataset.variant = "menu";

          btnMenu.innerHTML = `
            <span>${item.priceMenu} € en menu</span>
            <span class="price-plus">+</span>
          `;

          btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof openTicketBuilder === "function") {
              openTicketBuilder(item.id, "menu");
            }
          });

          priceBox.appendChild(btnMenu);
        }

        card.appendChild(priceBox);

        track.appendChild(card);
      });

      slider.appendChild(left);
      slider.appendChild(right);
      slider.appendChild(track);
      panel.appendChild(slider);

      const backBtn = document.createElement("button");
      backBtn.className =
        "mt-6 mx-auto block px-4 py-2 rounded-lg text-sm font-semibold btn-brand";
      backBtn.textContent = "↑ Retour au menu";
      backBtn.addEventListener("click", () => {
        const tabsRow = document.querySelector("#menu .category-tabs");
        if (!tabsRow) return;

        const headerEl = document.querySelector("header");
        const headerHeight = headerEl ? headerEl.offsetHeight : 80;

        const rect = tabsRow.getBoundingClientRect();
        const targetTop = rect.top + window.scrollY - headerHeight - 8;

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      });

      panel.appendChild(backBtn);
      panels.appendChild(panel);
    });
  }

  // ==========================================================================
  // 6. AVIS
  // ==========================================================================
  function applyReviews() {
    console.log("🔍 [REVIEWS] applyReviews() called");
    const sec = $("#avis");
    if (!sec) {
      console.error("❌ [REVIEWS] Section #avis not found!");
      return;
    }
    console.log("✅ [REVIEWS] Section #avis found");

    const title = $("h2.section-title", sec);
    const ratingBox = sec.querySelector(".flex.items-center.gap-2.mt-2 .flex.items-center.gap-2.text-sm");
    const starsContainer = ratingBox?.querySelector(".flex.text-yellow-500");
    const reviewsCountSpan = ratingBox?.querySelector("span.text-slate-500");

    let rating = null;
    let reviewCount = null;
    let sourceUrl = null;
    let sourceLabel = null;

    if (cfg.google?.rating && cfg.google?.reviewCount) {
      rating = cfg.google.rating;
      reviewCount = cfg.google.reviewCount;
      sourceUrl = cfg.google.url;
      sourceLabel = "Google";
    } else if (cfg.uber?.rating && cfg.uber?.reviewCount) {
      rating = cfg.uber.rating;
      reviewCount = cfg.uber.reviewCount;
      sourceUrl = cfg.uber.url;
      sourceLabel = "Uber Eats";
    } else {
      sec.classList.add("hidden");
      return;
    }

    if (ratingBox) {
      const ratingEl = ratingBox.querySelector(".font-semibold");
      if (ratingEl) {
        ratingEl.textContent = rating.toString().replace(".", ",");
      }
    }

    if (starsContainer) {
      const rounded = Math.round(rating);
      const stars = starsContainer.querySelectorAll("svg");
      stars.forEach((s, i) => {
        s.style.opacity = i < rounded ? "1" : "0.5";
      });
    }

    if (reviewsCountSpan) {
      reviewsCountSpan.textContent = `· ${reviewCount}+ avis ${sourceLabel}`;
    }

    const allReviewsLink = $("#all-reviews-link", sec);
    if (allReviewsLink && sourceUrl) {
      allReviewsLink.href = sourceUrl;
      allReviewsLink.textContent = `Voir tous les avis ${sourceLabel}`;
    }

    // Générer les cartes d'avis individuels
    const reviewsTrack = $("#reviews-track", sec);
    if (reviewsTrack && cfg.reviews && Array.isArray(cfg.reviews) && cfg.reviews.length > 0) {
      reviewsTrack.innerHTML = "";

      cfg.reviews.forEach((review) => {
        const figure = document.createElement("figure");

        // Header avec nom et étoiles
        const header = document.createElement("div");
        header.className = "flex items-start justify-between mb-3";

        const authorDiv = document.createElement("div");
        const authorName = document.createElement("div");
        authorName.className = "font-semibold text-sm";
        authorName.textContent = review.author;
        authorDiv.appendChild(authorName);

        if (review.relativeTime) {
          const timeSpan = document.createElement("div");
          timeSpan.className = "text-xs text-slate-500 mt-0.5";
          timeSpan.textContent = review.relativeTime;
          authorDiv.appendChild(timeSpan);
        }

        // Étoiles
        const starsDiv = document.createElement("div");
        starsDiv.className = "flex text-yellow-500 text-sm";
        for (let i = 0; i < 5; i++) {
          const star = document.createElement("span");
          star.textContent = i < review.rating ? "★" : "☆";
          starsDiv.appendChild(star);
        }

        header.appendChild(authorDiv);
        header.appendChild(starsDiv);
        figure.appendChild(header);

        // Context
        if (review.context) {
          const contextP = document.createElement("p");
          contextP.className = "text-xs text-slate-500 mb-2";
          contextP.textContent = review.context;
          figure.appendChild(contextP);
        }

        // Texte de l'avis
        if (review.text) {
          const blockquote = document.createElement("blockquote");
          blockquote.className = "text-sm text-slate-700";
          blockquote.textContent = review.text;
          figure.appendChild(blockquote);
        }

        // Aspects (cuisine, service, ambiance)
        if (review.aspects) {
          const aspectsDiv = document.createElement("div");
          aspectsDiv.className = "mt-3 flex gap-3 text-xs";

          Object.entries(review.aspects).forEach(([key, value]) => {
            if (value !== null) {
              const badge = document.createElement("span");
              badge.className = "px-2 py-1 bg-slate-100 rounded-full";
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              badge.textContent = `${label}: ${value}/5`;
              aspectsDiv.appendChild(badge);
            }
          });

          if (aspectsDiv.children.length > 0) {
            figure.appendChild(aspectsDiv);
          }
        }

        reviewsTrack.appendChild(figure);
      });
    }

    // Initialiser le slider d'avis - EN DEHORS du bloc if et avec un délai
    console.log("🕐 [REVIEWS] Scheduling slider initialization in 200ms...");
    setTimeout(() => {
      const prev = document.getElementById("r-prev");
      const next = document.getElementById("r-next");
      const track = document.getElementById("reviews-track");

      console.log("🔍 [SLIDER] Initializing...", {
        prev: !!prev,
        next: !!next,
        track: !!track,
        trackChildren: track ? track.children.length : 0
      });

      if (!prev || !next || !track) {
        console.error("❌ [SLIDER] Elements not found!");
        return;
      }

      let items = Array.from(track.children);
      if (items.length === 0) {
        console.warn("⚠️ [SLIDER] No review items found");
        return;
      }

      let index = 0;

      function updateSlider() {
        items = Array.from(track.children);
        if (items.length === 0) return;

        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;
        console.log("🎯 [SLIDER] Updated:", { index, offset, totalItems: items.length });
      }

      // Handler avec stopPropagation pour empêcher script.js d'interférer
      const handlePrev = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("⬅️ [SLIDER] Prev clicked, current index:", index);
        index = (index - 1 + items.length) % items.length;
        updateSlider();
      };

      const handleNext = (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("➡️ [SLIDER] Next clicked, current index:", index);
        index = (index + 1) % items.length;
        updateSlider();
      };

      // Utiliser la phase de capture (true) pour intercepter AVANT script.js
      prev.addEventListener("click", handlePrev, true);
      next.addEventListener("click", handleNext, true);

      console.log("✅ [SLIDER] Event listeners attached");

      // Auto-play toutes les 8 secondes
      let autoSlide = setInterval(() => {
        index = (index + 1) % items.length;
        updateSlider();
      }, 8000);

      // Pause au survol des flèches
      [prev, next].forEach((btn) => {
        if (!btn) return;
        btn.addEventListener("mouseenter", () => clearInterval(autoSlide));
        btn.addEventListener("mouseleave", () => {
          autoSlide = setInterval(() => {
            index = (index + 1) % items.length;
            updateSlider();
          }, 8000);
        });
      });

      console.log("✅ [SLIDER] Fully initialized with", items.length, "items");
    }, 200); // Délai pour s'assurer que tout est dans le DOM
  }

  // ==========================================================================
  // 6 BIS. FAQ
  // ==========================================================================
  function applyFaq() {
    // 🔧 CORRECTION : Sélecteurs multiples pour trouver la section FAQ
    const sec =
      document.querySelector("#faq") ||
      document.querySelector("section#faq") ||
      document.querySelector('[data-section="faq"]') ||
      Array.from(document.querySelectorAll("section")).find(s =>
        s.querySelector("h2")?.textContent.toLowerCase().includes("faq") ||
        s.querySelector("h2")?.textContent.toLowerCase().includes("questions")
      );

    if (!sec) {
      console.warn("⚠️ Section FAQ introuvable dans le HTML");
      return;
    }

    const faqCfg = cfg.faq;

    if (
      !faqCfg ||
      faqCfg.enabled === false ||
      !Array.isArray(faqCfg.items) ||
      !faqCfg.items.length
    ) {
      sec.classList.add("hidden");
      return;
    }

    let list =
      sec.querySelector("[data-faq-list]") ||
      sec.querySelector("dl") ||
      sec.querySelector(".faq-list") ||
      sec.querySelector(".space-y-4");

    if (!list) {
      list = document.createElement("div");
      list.className = "space-y-3 mt-6";
      sec.appendChild(list);
    } else {
      list.innerHTML = "";
    }

    // 🎨 Récupération des couleurs du thème
    const brandColor = cfg.theme?.colors?.brand || "#e11b22";
    const brandSoft = cfg.theme?.colors?.brandSoft || "#fee2e2";

    faqCfg.items.forEach((item, index) => {
      const q = (item && item.question) || "";
      const a = (item && item.answer) || "";

      if (!q && !a) return;

      // Wrapper de l'item accordéon
      const wrapper = document.createElement("div");
      wrapper.className = "faq-item border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md";
      wrapper.style.backgroundColor = "#ffffff";

      // Bouton question (cliquable)
      const button = document.createElement("button");
      button.className = "faq-question w-full px-5 py-4 flex items-center justify-between text-left transition-colors duration-200";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", `faq-answer-${index}`);

      const questionText = document.createElement("span");
      questionText.className = "font-semibold text-base text-gray-900 pr-4 flex-1";
      questionText.textContent = q;

      // Icône + / -
      const icon = document.createElement("span");
      icon.className = "faq-icon flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 font-bold text-lg";
      icon.style.backgroundColor = brandColor;
      icon.style.color = "#ffffff";
      icon.textContent = "+";

      button.appendChild(questionText);
      button.appendChild(icon);

      // Conteneur de la réponse (masqué par défaut)
      const answerWrapper = document.createElement("div");
      answerWrapper.id = `faq-answer-${index}`;
      answerWrapper.className = "faq-answer overflow-hidden transition-all duration-300 ease-in-out";
      answerWrapper.style.maxHeight = "0";
      answerWrapper.style.opacity = "0";

      const answer = document.createElement("div");
      answer.className = "px-5 pb-4 pt-0 text-sm text-gray-700 leading-relaxed";
      answer.style.backgroundColor = brandSoft;
      answer.textContent = a;

      answerWrapper.appendChild(answer);

      // 🎯 Gestion du clic pour ouvrir/fermer
      button.addEventListener("click", function() {
        const isOpen = button.getAttribute("aria-expanded") === "true";

        if (isOpen) {
          // Fermer
          button.setAttribute("aria-expanded", "false");
          answerWrapper.style.maxHeight = "0";
          answerWrapper.style.opacity = "0";
          icon.textContent = "+";
          icon.style.transform = "rotate(0deg)";
          button.style.backgroundColor = "transparent";
        } else {
          // Ouvrir
          button.setAttribute("aria-expanded", "true");
          answerWrapper.style.maxHeight = answerWrapper.scrollHeight + "px";
          answerWrapper.style.opacity = "1";
          icon.textContent = "−";
          icon.style.transform = "rotate(90deg)";
          button.style.backgroundColor = brandSoft;
        }
      });

      wrapper.appendChild(button);
      wrapper.appendChild(answerWrapper);
      list.appendChild(wrapper);
    });

    sec.classList.remove("hidden");
  }

  // ==========================================================================
  // 7. FOOTER
  // ==========================================================================
  function applyFooter() {
    const footer = $("footer");
    if (!footer) return;

    const cols = $$(".max-w-7xl.mx-auto.px-4 > div", footer);
    const identCol = cols[0];
    const horairesCol = cols[1];
    const contactCol = cols[2];
    const linksCol = cols[3];

    if (identCol) {
      const logo = identCol.querySelector("img");
      if (logo && cfg.assets?.logo) {
        logo.src =
          cfg.assets.logo.dark || cfg.assets.logo.light || logo.src;
        logo.alt = cfg.assets.logo.alt || snackName;
        logo.classList.add("footer-logo");

        const bg =
          cfg.theme?.footerLogoBackground ||
          cfg.theme?.colors?.surfaceAlt || null;

        if (
          bg &&
          !logo.parentElement.classList.contains("footer-logo-wrapper")
        ) {
          const wrap = document.createElement("div");
          wrap.className = "footer-logo-wrapper";
          wrap.style.background = bg;
          wrap.style.padding = "16px 28px";
          wrap.style.borderRadius = "14px";
          wrap.style.display = "inline-flex";
          wrap.style.alignItems = "center";
          wrap.style.justifyContent = "center";

          logo.parentNode.insertBefore(wrap, logo);
          wrap.appendChild(logo);
        }
      }

      const p = identCol.querySelector("p.text-slate-600");
      if (cfg.hideFooterAddress) {
        if (p) p.remove();
      } else if (p && fullAddress) {
        p.textContent = fullAddress;
      }
    }

    if (horairesCol && Array.isArray(cfg.openingHours)) {
      const box =
        horairesCol.querySelector(".bg-slate-50") || horairesCol;
      box.innerHTML = "";
      cfg.openingHours.forEach((h) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${capitalize(
          h.day
        )} :</strong> ${h.opens}–${h.closes}`;
        box.appendChild(p);
      });
    }

    if (contactCol) {
      const addr = contactCol.querySelector("p.text-slate-600");
      if (addr) addr.textContent = fullAddress;

      const telLink =
        contactCol.querySelector("a[href^='tel']") ||
        contactCol.querySelector("a.mt-1.block");
      if (telLink) {
        telLink.href = phoneHref;
        telLink.textContent = phoneDisplay;
      }

      const socialBox =
        contactCol.querySelector(".footer-social") ||
        contactCol.querySelector(".flex.gap-3.mt-4.items-center");
      if (socialBox) {
        socialBox.innerHTML = "";
        fillSocialIcons(socialBox, cfg.social || {}, "footer");
      }
    }

    if (linksCol && Array.isArray(cfg.platforms) && cfg.platforms.length) {
      const platList =
        linksCol.querySelector("ul.space-y-1") ||
        linksCol.querySelector("ul");
      if (platList) {
        platList.innerHTML = "";
        cfg.platforms.forEach((p) => {
          platList.appendChild(createPlatformItemFooter(p));
        });
      }
    }

    const agency = cfg.agency;
    if (agency?.whatsapp && agency?.name) {
      const creditP = Array.from(footer.querySelectorAll("p")).find((p) =>
        p.textContent.toLowerCase().includes("propulsé par")
      );

      if (creditP) {
        creditP.innerHTML = `
          Propulsé par
          <a href="${agency.whatsapp}" target="_blank" rel="noopener" class="agency-link">
            ${agency.name}
          </a>
        `;
      }
    }
  }

  // ==========================================================================
  // 8. DRAWER (menu mobile)
  // ==========================================================================
  function applyDrawer() {
    const drawer = $("#drawer");
    const navBtn = $("#navBtn");
    const closeBtn = $("#closeNav");
    if (!drawer || !navBtn) return;

    const overlay = drawer.firstElementChild;
    const panel = drawer.lastElementChild;

    if (panel && cfg.theme?.colors) {
      const colors = cfg.theme.colors;
      const drawerBg =
        colors.drawerBackground ||
        colors.surfaceAlt ||
        colors.surface ||
        "#5b4330";
      const drawerText =
        colors.drawerText || colors.textOnDark || "#fdfbf7";

      panel.style.backgroundColor = drawerBg;
      panel.style.color = drawerText;
      panel.style.borderColor = drawerBg;
    }

    if (overlay) {
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      overlay.style.background = "transparent";
    }

    const openDrawer = (e) => {
      if (e) e.preventDefault();
      drawer.classList.add("open");
      document.body.classList.add("navlock");
      if (panel) panel.style.transform = "translateX(0)";
    };
    const closeDrawer = () => {
      drawer.classList.remove("open");
      document.body.classList.remove("navlock");
      if (panel) panel.style.transform = "translateX(100%)";
    };

    navBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    $$(".drawer-link", drawer).forEach((link) =>
      link.addEventListener("click", closeDrawer)
    );

    const header = drawer.querySelector(".p-4 .flex.items-center.gap-2");
    if (header) {
      const img = header.querySelector("img");
      const nameEl = header.querySelector("p.font-semibold");
      const addrEl = header.querySelector("p.text-xs");
      if (img && cfg.assets?.logo) {
        img.src = cfg.assets.logo.dark || cfg.assets.logo.light || img.src;
        img.alt = cfg.assets.logo.alt || snackName;
      }
      if (nameEl) nameEl.textContent = snackName;
      if (addrEl) addrEl.textContent = fullAddress;
    }

    const coordSection = Array.from(drawer.querySelectorAll("section")).find(
      (sec) => sec.textContent.toLowerCase().includes("coordonnées")
    );
    if (coordSection) {
      const telBadge =
        coordSection.querySelector("a[href^='tel']") ||
        coordSection.querySelector("a.inline-flex");
      if (telBadge) {
        telBadge.href = phoneHref;
        const spanNum = telBadge.querySelector("span:last-child");
        if (spanNum) spanNum.textContent = phoneDisplay;
      }
      const addrSpan = coordSection.querySelector("p span:last-child");
      if (addrSpan) addrSpan.textContent = fullAddress;
    }

    const hoursSection = Array.from(drawer.querySelectorAll("section")).find(
      (sec) => sec.textContent.toLowerCase().includes("horaires")
    );
    if (hoursSection && Array.isArray(cfg.openingHours)) {
      hoursSection.innerHTML = "";
      cfg.openingHours.forEach((h) => {
        const p = document.createElement("p");
        p.textContent = `${capitalize(h.day)} : ${h.opens}–${h.closes}`;
        p.className = "text-sm";
        hoursSection.appendChild(p);
      });
    }

    const platsSection = Array.from(drawer.querySelectorAll("section")).find(
      (sec) => sec.textContent.toLowerCase().includes("livraison")
    );
    if (platsSection && Array.isArray(cfg.platforms) && cfg.platforms.length) {
      let grid = platsSection.querySelector(".grid");
      if (!grid) {
        grid = document.createElement("div");
        grid.className = "grid grid-cols-1 gap-2";
        platsSection.appendChild(grid);
      }
      grid.innerHTML = "";
      cfg.platforms.forEach((p) => {
        grid.appendChild(createPlatformCardDrawer(p));
      });
    }

    const socialSection = Array.from(drawer.querySelectorAll("section")).find(
      (sec) => sec.textContent.toLowerCase().includes("réseaux")
    );
    if (socialSection) {
      const box =
        socialSection.querySelector(".flex") ||
        socialSection.querySelector("div");
      if (box) {
        box.innerHTML = "";
        fillSocialIcons(box, cfg.social || {}, "drawer");
      }
    }
  }

  // ==========================================================================
  // 9. BOUTON FLOTTANT APPEL
  // ==========================================================================
  function applyFloatingCall() {
    const callBtn =
      document.querySelector("a[aria-label^='Appeler']") ||
      document.querySelector(".floating-call");
    if (!callBtn) return;
    callBtn.href = phoneHref;
    callBtn.setAttribute("aria-label", `Appeler ${snackName}`);
  }

  // ==========================================================================
  // 10. SEO & JSON-LD
  // ==========================================================================
  function applySeo() {
    if (cfg.seo?.title) document.title = cfg.seo.title;

    if (cfg.seo?.description) {
      let m = $("meta[name='description']");
      if (!m) {
        m = document.createElement("meta");
        m.name = "description";
        document.head.appendChild(m);
      }
      m.content = cfg.seo.description;
    }

    if (cfg.urls?.website) {
      let c = $("link[rel='canonical']");
      if (!c) {
        c = document.createElement("link");
        c.rel = "canonical";
        document.head.appendChild(c);
      }
      c.href = cfg.urls.website;
    }

    const sameAs = [];
    if (cfg.social?.instagram) sameAs.push(cfg.social.instagram);
    if (cfg.social?.facebook) sameAs.push(cfg.social.facebook);
    if (cfg.social?.tiktok) sameAs.push(cfg.social.tiktok);
    if (cfg.social?.snapchat) sameAs.push(cfg.social.snapchat);
    if (cfg.social?.snap) sameAs.push(cfg.social.snap);

    const ld = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: snackName,
      telephone: phoneRaw || undefined,
      image: cfg.assets?.hero?.image || undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: cfg.location?.addressLine1,
        postalCode: cfg.location?.postalCode,
        addressLocality: cfg.location?.city,
        addressCountry: cfg.location?.countryCode || "FR",
      },
      url: cfg.urls?.website || undefined,
      priceRange: cfg.priceRange || undefined,
      servesCuisine: cfg.google?.cuisine || undefined,
      sameAs: sameAs,
    };

    if (cfg.google?.rating && cfg.google?.reviewCount) {
      ld.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: cfg.google.rating,
        ratingCount: cfg.google.reviewCount,
      };
    }

    // Si index.html porte déjà un JSON-LD statique complet, on ne le duplique pas
    if ($("script[type='application/ld+json'][data-static]")) return;

    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.innerHTML = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  // ==========================================================================
  // SECTION "COMMANDEZ EN LIVRAISON"
  // ==========================================================================
  function applyDeliverySection() {
    const section = $("#delivery");
    if (!section) return;

    const grid = $("#delivery-grid", section);
    if (!grid) return;

    if (!Array.isArray(cfg.platforms) || !cfg.platforms.length) {
      section.style.display = "none";
      return;
    }

    grid.innerHTML = "";

    cfg.platforms.forEach((p) => {
      grid.appendChild(createPlatformCardMain(p));
    });
  }

  // ==========================================================================
  // TICKET BUILDER – panier multi-produits
  // ==========================================================================
  var ticketLines = [];
  var activeLine = null;
  var ticketPanel = null;
  var ticketToggle = null;

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function ensureTicketShell() {
    if (ticketPanel && ticketToggle) return;

    ticketToggle = document.createElement("button");
    ticketToggle.id = "ticket-toggle";
    ticketToggle.type = "button";
    ticketToggle.className =
      "fixed left-4 bottom-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-brand text-white shadow-lg text-sm font-semibold";
    ticketToggle.innerHTML = `<span class="text-lg">🎟️</span><span>Ticket</span><span id="ticket-count" class="ticket-count hidden">0</span>`;

    ticketPanel = document.createElement("aside");
    ticketPanel.id = "ticket-panel";
    ticketPanel.className =
      "fixed inset-x-0 bottom-0 z-[9999] md:left-4 md:right-auto md:bottom-20 md:w-80 max-h-[95vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden hidden";

    ticketPanel.innerHTML = `
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <div class="flex items-center gap-2">
          <span class="text-lg">🎟️</span>
          <p class="font-semibold text-sm">Ticket</p>
        </div>
        <button type="button" class="text-slate-500 text-xl leading-none" data-ticket-action="close">&times;</button>
      </div>

      <div id="ticket-body" class="p-4 flex-1 overflow-y-auto space-y-4 text-sm"></div>

      <div class="px-4 pb-4 pt-2 border-t space-y-3 bg-slate-50/80">
        <div class="space-y-1">
          <p class="text-xs text-slate-500">Mode de commande</p>
          <div id="ticket-mode-buttons" class="flex gap-1"></div>
          <p id="ticket-mode-note" class="hidden text-[11px] text-slate-500"></p>
        </div>

        <div id="ticket-delivery" class="hidden space-y-1">
          <label for="ticket-address" class="text-xs text-slate-500">Adresse de livraison <span class="text-red-500">*</span></label>
          <input id="ticket-address" type="text" autocomplete="street-address"
                 class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                 placeholder="N°, rue, ville (et étage / code si besoin)" />
          <p id="ticket-delivery-info" class="text-[11px] text-slate-500"></p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="ticket-time" class="text-xs text-slate-500">Heure souhaitée</label>
          <select id="ticket-time"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
            <option value="">Dès que possible</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="ticket-name" class="text-xs text-slate-500">Prénom <span class="text-red-500">*</span></label>
          <input id="ticket-name" type="text"
                 class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                 placeholder="Votre prénom" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="ticket-phone" class="text-xs text-slate-500">Téléphone <span class="text-red-500">*</span></label>
          <input id="ticket-phone" type="tel"
                 class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                 placeholder="Votre numéro" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="ticket-message" class="text-xs text-slate-500">Message (optionnel)</label>
          <textarea id="ticket-message" rows="2"
                    class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    placeholder="Précision, heure souhaitée, etc."></textarea>
        </div>

        <div class="space-y-1">
          <div id="ticket-subtotal-row" class="hidden flex items-center justify-between text-xs text-slate-500">
            <span>Sous-total</span>
            <span id="ticket-subtotal">0,00 €</span>
          </div>
          <div id="ticket-fee-row" class="hidden flex items-center justify-between text-xs text-slate-500">
            <span>Frais de livraison</span>
            <span id="ticket-fee">0,00 €</span>
          </div>
          <div class="flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span id="ticket-total">0,00 €</span>
          </div>
          <p id="ticket-minimum-warning" class="hidden text-[11px] text-red-600 font-semibold"></p>
        </div>

        <button id="ticket-share-restaurant" type="button"
                class="w-full btn-brand rounded-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <span>Envoyer la commande sur WhatsApp</span>
        </button>

        <button id="ticket-share" type="button"
                class="w-full rounded-full py-2 text-sm font-semibold flex items-center justify-center gap-2 border border-slate-300 text-slate-700 bg-white">
          <span>Partager le ticket</span>
        </button>
      </div>
    `;

    document.body.appendChild(ticketToggle);
    document.body.appendChild(ticketPanel);

    ticketToggle.addEventListener("click", () => {
      ticketPanel.classList.toggle("hidden");
    });

    ticketPanel.addEventListener("click", (e) => {
      const actionEl = e.target.closest("[data-ticket-action]");
      if (!actionEl) return;
      handleTicketAction(actionEl.dataset.ticketAction, actionEl);
    });

    // Sauvegarde locale des champs saisis
    ["#ticket-name", "#ticket-phone", "#ticket-message", "#ticket-address"].forEach(
      (sel) => {
        const el = ticketPanel.querySelector(sel);
        if (!el) return;
        el.addEventListener("input", () => {
          if (sel === "#ticket-address") orderMeta.address = el.value.trim();
          saveTicketState();
        });
      }
    );
    const timeSelect = ticketPanel.querySelector("#ticket-time");
    if (timeSelect) {
      timeSelect.addEventListener("change", () => {
        orderMeta.time = timeSelect.value || "";
        saveTicketState();
      });
      timeSelect.addEventListener("focus", renderTimeSelect);
    }

    const shareBtn = ticketPanel.querySelector("#ticket-share");
    if (shareBtn) {
      shareBtn.addEventListener("click", shareTicket);
    }

    const shareRestaurantBtn = ticketPanel.querySelector(
      "#ticket-share-restaurant"
    );
    if (shareRestaurantBtn) {
      shareRestaurantBtn.addEventListener("click", shareTicketToRestaurant);
    }
  }

  // Actions partagées entre le panneau ticket et l'assistant par étapes
  function handleTicketAction(action, actionEl) {

    if (action === "close") {
      ticketPanel.classList.add("hidden");
    }

    if (action === "add-active-line") {
      addActiveLineToTicket();
    }

    if (action === "remove-line") {
      const id = actionEl.dataset.lineId;
      removeTicketLine(id);
    }

    if (action === "toggle-supp") {
      const sid = actionEl.dataset.suppId;
      toggleSupplementOnActive(sid);
    }

    if (action === "toggle-ingredient") {
      const ing = actionEl.dataset.ingredient;
      toggleRemovedIngredientOnActive(ing);
    }

    if (action === "set-kids-plate") {
      const plateId = actionEl.dataset.plateId;
      if (activeLine && activeLine.categoryId === "menu-enfant") {
        activeLine.kidsChoice = plateId;
        renderTicketPanel();
      }
    }

    if (action === "set-drink") {
      const drinkId = actionEl.dataset.drinkId;
      if (activeLine) {
        activeLine.drinkChoice = drinkId;
        renderTicketPanel();
      }
    }

    if (action === "set-tacos-base") {
      const baseId = actionEl.dataset.baseId;
      setTacosBase(baseId);
    }

    if (action === "toggle-tacos-meat") {
      const meat = actionEl.dataset.meatName;
      toggleTacosMeat(meat);
    }

    if (action === "toggle-tacos-sauce") {
      const sauce = actionEl.dataset.sauceName;
      toggleTacosSauce(sauce);
    }

    if (action === "toggle-tacos-veg") {
      const veg = actionEl.dataset.veggie;
      toggleTacosVeg(veg);
    }

    // 🆕 KAPSALOON ACTIONS
    if (action === "set-kapsaloon-base") {
      const baseId = actionEl.dataset.baseId;
      setKapsaloonBase(baseId);
    }

    if (action === "toggle-kapsaloon-meat") {
      const meat = actionEl.dataset.meatName;
      toggleKapsaloonMeat(meat);
    }

    if (action === "toggle-kapsaloon-sauce") {
      const sauce = actionEl.dataset.sauceName;
      toggleKapsaloonSauce(sauce);
    }

    if (action === "inc-qty") {
      const id = actionEl.dataset.lineId;
      incrementLineQuantity(id);
    }

    if (action === "dec-qty") {
      const id = actionEl.dataset.lineId;
      decrementLineQuantity(id);
    }

    if (action === "set-main-sauce") {
      const sauce = actionEl.dataset.sauceName;
      if (sauce) {
        setMainSauce(sauce);
      }
    }

    if (action === "set-mode") {
      setOrderMode(actionEl.dataset.modeId);
    }

    if (action === "reorder-last") {
      reorderLastOrder();
    }

    if (action === "new-order") {
      startNewOrder();
    }

    if (action === "set-variant") {
      setLineVariant(actionEl.dataset.variant);
    }

    if (action === "enable-notifications") {
      enableNotifications();
    }

    if (action === "open-status") {
      openStatusSheet();
    }
  }

  function findProductById(productId) {
    if (!cfg.menu?.categories) return null;
    for (const cat of cfg.menu.categories) {
      for (const item of cat.items || []) {
        if (item.id === productId) {
          return { categoryId: cat.id, categoryName: cat.name, item };
        }
      }
    }
    return null;
  }

  // ==========================================================================
  // FONCTIONS TACOS
  // ==========================================================================

  function getTacosBaseForLine(line) {
    if (!line || !line.productId) return null;

    const product = findProductById(line.productId)?.item;
    if (
      !product ||
      !product.tacosConfig ||
      !Array.isArray(product.tacosConfig.bases)
    ) {
      return null;
    }

    return (
      product.tacosConfig.bases.find((base) => base.id === line.tacosBaseId) ||
      null
    );
  }

  function getTacosMaxMeatsForLine(line) {
    const base = getTacosBaseForLine(line);
    if (!base || typeof base.meats !== "number") return 1;
    return base.meats;
  }

  function setTacosBase(baseId) {
    if (!activeLine) return;

    const product = findProductById(activeLine.productId)?.item;
    if (!product?.tacosConfig) return;

    const base = product.tacosConfig.bases.find((b) => b.id === baseId);
    if (!base) return;

    const menuUpcharge = (cfg.tacos && cfg.tacos.menuUpcharge) || 2;

    const basePrice =
      activeLine.variant === "menu"
        ? base.price + menuUpcharge
        : base.price;

    activeLine.tacosBaseId = baseId;
    activeLine.basePrice = basePrice;
    activeLine.lineTotal = basePrice + calculateTacosExtras(activeLine);

    renderTicketPanel();
  }

  function toggleTacosMeat(meat) {
    if (!activeLine || activeLine.categoryId !== "tacos") return;

    const maxMeats = getTacosMaxMeatsForLine(activeLine);
    let meats = Array.isArray(activeLine.tacosMeats)
      ? activeLine.tacosMeats.slice()
      : [];

    const idx = meats.indexOf(meat);

    if (idx >= 0) {
      meats.splice(idx, 1);
    } else {
      if (meats.length >= maxMeats) return;
      meats.push(meat);
    }

    activeLine.tacosMeats = meats;
    activeLine.lineTotal = activeLine.basePrice + calculateTacosExtras(activeLine);

    renderTicketPanel();
  }

  function toggleTacosSauce(sauce) {
    if (!activeLine || activeLine.categoryId !== "tacos") return;

    let sauces = Array.isArray(activeLine.tacosSauces)
      ? activeLine.tacosSauces.slice()
      : [];

    const idx = sauces.indexOf(sauce);

    if (idx >= 0) {
      sauces.splice(idx, 1);
    } else {
      if (sauces.length >= 2) return;
      sauces.push(sauce);
    }

    activeLine.tacosSauces = sauces;
    renderTicketPanel();
  }

  function toggleTacosVeg(veg) {
    if (!activeLine) return;

    let veggies = Array.isArray(activeLine.tacosVeggies)
      ? activeLine.tacosVeggies.slice()
      : [];

    const idx = veggies.indexOf(veg);

    if (idx >= 0) {
      veggies.splice(idx, 1);
    } else {
      veggies.push(veg);
    }

    activeLine.tacosVeggies = veggies;
    renderTicketPanel();
  }

  function calculateTacosExtras(line) {
    let total = 0;
    const supps = asArray(line.supplements);

    for (const sid of supps) {
      const def = cfg.supplements?.catalog?.[sid];
      if (def && typeof def.price === "number") {
        total += def.price;
      }
    }
    return total;
  }

  // ==========================================================================
  // 🆕 FONCTIONS KAPSALOON (copie tacos sans crudités)
  // ==========================================================================

  function getKapsaloonBaseForLine(line) {
    if (!line || !line.productId) return null;

    const product = findProductById(line.productId)?.item;
    if (
      !product ||
      !product.kapsaloonConfig ||
      !Array.isArray(product.kapsaloonConfig.bases)
    ) {
      return null;
    }

    return (
      product.kapsaloonConfig.bases.find((base) => base.id === line.kapsaloonBaseId) ||
      null
    );
  }

  function getKapsaloonMaxMeatsForLine(line) {
    const base = getKapsaloonBaseForLine(line);
    if (!base || typeof base.meats !== "number") return 1;
    return base.meats;
  }

  function setKapsaloonBase(baseId) {
    if (!activeLine) return;

    const product = findProductById(activeLine.productId)?.item;
    if (!product?.kapsaloonConfig) return;

    const base = product.kapsaloonConfig.bases.find((b) => b.id === baseId);
    if (!base) return;

    activeLine.kapsaloonBaseId = baseId;
    activeLine.basePrice = base.price;
    activeLine.lineTotal = base.price + calculateKapsaloonExtras(activeLine);

    renderTicketPanel();
  }

  function toggleKapsaloonMeat(meat) {
    if (!activeLine || activeLine.categoryId !== "kapsaloon") return;

    const maxMeats = getKapsaloonMaxMeatsForLine(activeLine);
    let meats = Array.isArray(activeLine.kapsaloonMeats)
      ? activeLine.kapsaloonMeats.slice()
      : [];

    const idx = meats.indexOf(meat);

    if (idx >= 0) {
      meats.splice(idx, 1);
    } else {
      if (meats.length >= maxMeats) return;
      meats.push(meat);
    }

    activeLine.kapsaloonMeats = meats;
    activeLine.lineTotal = activeLine.basePrice + calculateKapsaloonExtras(activeLine);

    renderTicketPanel();
  }

  function toggleKapsaloonSauce(sauce) {
    if (!activeLine || activeLine.categoryId !== "kapsaloon") return;

    let sauces = Array.isArray(activeLine.kapsaloonSauces)
      ? activeLine.kapsaloonSauces.slice()
      : [];

    const idx = sauces.indexOf(sauce);

    if (idx >= 0) {
      sauces.splice(idx, 1);
    } else {
      if (sauces.length >= 2) return;
      sauces.push(sauce);
    }

    activeLine.kapsaloonSauces = sauces;
    renderTicketPanel();
  }

  function calculateKapsaloonExtras(line) {
    let total = 0;
    const supps = asArray(line.supplements);

    for (const sid of supps) {
      const def = cfg.supplements?.catalog?.[sid];
      if (def && typeof def.price === "number") {
        total += def.price;
      }
    }
    return total;
  }

  // ==========================================================================
  // FONCTION SAUCE PRINCIPALE
  // ==========================================================================

  function setMainSauce(sauceName) {
    if (!activeLine) return;

    const sauceCategories = [
      "burgers",
      "sandwichs",
      "paninis",
      "signatures",
      "galettes",
    ];

    if (!sauceCategories.includes(activeLine.categoryId)) return;
    if (!sauceName) return;

    let sauces = Array.isArray(activeLine.mainSauce)
      ? [...activeLine.mainSauce]
      : activeLine.mainSauce
      ? [activeLine.mainSauce]
      : [];

    const idx = sauces.indexOf(sauceName);

    if (idx >= 0) {
      sauces.splice(idx, 1);
    } else {
      if (sauces.length >= 2) return;
      sauces.push(sauceName);
    }

    activeLine.mainSauce = sauces.length === 1 ? sauces[0] : sauces;

    renderTicketPanel();
  }

  // ==========================================================================
  // HELPERS SUPPLÉMENTS & INGRÉDIENTS
  // ==========================================================================

  function getDefaultSuppForCategory(categoryId) {
    if (categoryId && categoryId.toLowerCase().includes("menu-enfant")) {
      return [];
    }

    const sup = cfg.supplements;
    if (!sup || !sup.catalog) return [];

    const ids = sup.defaultForCategories?.[categoryId];
    if (!Array.isArray(ids) || !ids.length) {
      return [];
    }

    return ids.map((id) => sup.catalog[id]).filter(Boolean);
  }

  function getMenuDrinks() {
    if (!cfg.menu?.categories) return [];

    const drinkCat = cfg.menu.categories.find((cat) => {
      const id = (cat.id || "").toLowerCase();
      const name = (cat.name || "").toLowerCase();
      return id === "boissons" || name.includes("boisson");
    });

    return drinkCat?.items || [];
  }

  // ==========================================================================
  // OUVERTURE DU TICKET BUILDER
  // ==========================================================================
  function openTicketBuilder(productId, variant) {
    ensureTicketShell();

    const found = findProductById(productId);
    if (!found) return;
    const { categoryId, item } = found;

    const isMenu = variant === "menu";

    const drinksCat =
      cfg.menu &&
      cfg.menu.categories &&
      cfg.menu.categories.find(
        (c) =>
          c.id === "boissons" ||
          (c.name || "").toLowerCase().includes("boisson")
      );
    const drinkItems = drinksCat ? drinksCat.items || [] : [];

    const sauceCategories = [
      "burgers",
      "sandwichs",
      "paninis",
      "signatures",
      "galettes",
    ];
    const globalSauces = Array.isArray(cfg.sauces) ? cfg.sauces : [];

    let basePrice;

    // 🆕 CAS KAPSALOON (avant tacos pour vérifier en priorité)
    if (
      categoryId === "kapsaloon" &&
      item.kapsaloonConfig &&
      Array.isArray(item.kapsaloonConfig.bases) &&
      item.kapsaloonConfig.bases.length
    ) {
      const bases = item.kapsaloonConfig.bases;
      const firstBase = bases[0];

      basePrice = firstBase.price;

      activeLine = {
        id: "line_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        productId: item.id,
        productName: item.name,
        categoryId,
        variant: "solo",
        basePrice,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        baseIngredients: [],
        drinkChoice: null,
        forbiddenSupp: [],
        availableDrinks: [],
        lineTotal: basePrice,
        kapsaloonBaseId: firstBase.id,
        kapsaloonMeats: [],
        kapsaloonSauces: []
      };

      openWizard();
      return;
    }

    // CAS TACOS
    if (
      categoryId === "tacos" &&
      item.tacosConfig &&
      Array.isArray(item.tacosConfig.bases) &&
      item.tacosConfig.bases.length
    ) {
      const bases = item.tacosConfig.bases;
      const firstBase = bases[0];

      const menuUpcharge =
        (window.SNACK_CONFIG &&
          window.SNACK_CONFIG.tacos &&
          window.SNACK_CONFIG.tacos.menuUpcharge) ||
        2;

      basePrice = isMenu ? firstBase.price + menuUpcharge : firstBase.price;

      activeLine = {
        id: "line_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        productId: item.id,
        productName: item.name,
        categoryId,
        variant,
        basePrice,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        baseIngredients: asArray(item.baseIngredients),
        drinkChoice: null,
        forbiddenSupp: isMenu ? [] : ["cheddar_frites", "boisson_menu"],
        availableDrinks: isMenu ? drinkItems : [],
        lineTotal: basePrice,
        tacosBaseId: firstBase.id,
        tacosMeats: [],
        tacosSauces: [],
        tacosVeggies: [],
      };
    } else {
      // CAS STANDARD
      basePrice =
        variant === "menu" ? item.priceMenu : item.priceSolo ?? item.price;

      if (basePrice == null) return;

      const canChooseSauce = sauceCategories.includes(categoryId);

      activeLine = {
        id: "line_" + Date.now() + "_" + Math.random().toString(16).slice(2),
        productId: item.id,
        productName: item.name,
        categoryId,
        variant,
        basePrice,
        quantity: 1,
        supplements: [],
        removedIngredients: [],
        baseIngredients: asArray(item.baseIngredients),
        drinkChoice: null,
        lineTotal: basePrice,
        forbiddenSupp: isMenu ? [] : ["cheddar_frites", "boisson_menu"],
        availableDrinks: isMenu ? drinkItems : [],
        mainSauce: null,
        availableSauces: canChooseSauce ? globalSauces : [],
      };
    }

    openWizard();
  }
  // ==========================================================================
  // GESTION DES LIGNES DU TICKET
  // ==========================================================================

  function isSameLineConfig(a, b) {
    if (!a || !b) return false;
    if (a.productId !== b.productId) return false;
    if (a.variant !== b.variant) return false;
    if ((a.basePrice || 0) !== (b.basePrice || 0)) return false;

    const norm = (arr) => asArray(arr).slice().sort();
    const aSupp = norm(a.supplements);
    const bSupp = norm(b.supplements);
    const aRem = norm(a.removedIngredients);
    const bRem = norm(b.removedIngredients);

    if (aSupp.length !== bSupp.length) return false;
    for (let i = 0; i < aSupp.length; i++) {
      if (aSupp[i] !== bSupp[i]) return false;
    }

    if (aRem.length !== bRem.length) return false;
    for (let i = 0; i < aRem.length; i++) {
      if (aRem[i] !== bRem[i]) return false;
    }

    return true;
  }

  function addActiveLineToTicket() {
    if (!activeLine) return;

    if (
      activeLine.categoryId === "tacos" &&
      !asArray(activeLine.tacosMeats).length
    ) {
      alert("Choisissez au moins une viande pour votre tacos.");
      return;
    }
    if (
      activeLine.categoryId === "kapsaloon" &&
      !asArray(activeLine.kapsaloonMeats).length
    ) {
      alert("Choisissez au moins une viande pour votre kapsalon.");
      return;
    }
    if (!Array.isArray(ticketLines)) ticketLines = [];

    const unitPrice = activeLine.lineTotal || activeLine.basePrice || 0;

    const qty = activeLine.quantity > 0 ? activeLine.quantity : 1;
    const newLine = {
      ...activeLine,
      quantity: qty,
      lineTotal: unitPrice * qty,
    };

    const existing = ticketLines.find((l) => isSameLineConfig(l, newLine));

    if (existing) {
      const prevQty = existing.quantity > 0 ? existing.quantity : 1;
      const prevUnit = prevQty > 0 ? existing.lineTotal / prevQty : unitPrice;
      const newQty = prevQty + newLine.quantity;

      existing.quantity = newQty;
      existing.lineTotal = prevUnit * newQty;
    } else {
      ticketLines.push(newLine);
    }

    activeLine = null;
    renderTicketPanel();
  }

  function removeTicketLine(lineId) {
    ticketLines = ticketLines.filter((l) => l.id !== lineId);
    renderTicketPanel();
  }

  function incrementLineQuantity(lineId) {
    const line = ticketLines.find((l) => l.id === lineId);
    if (!line) return;

    const currentQty = line.quantity > 0 ? line.quantity : 1;
    const unitPrice =
      currentQty > 0 ? line.lineTotal / currentQty : line.basePrice;

    const newQty = currentQty + 1;
    line.quantity = newQty;
    line.lineTotal = unitPrice * newQty;

    renderTicketPanel();
  }

  function decrementLineQuantity(lineId) {
    const line = ticketLines.find((l) => l.id === lineId);
    if (!line) return;

    const currentQty = line.quantity > 0 ? line.quantity : 1;

    if (currentQty <= 1) {
      removeTicketLine(lineId);
      return;
    }

    const unitPrice = line.lineTotal / currentQty;
    const newQty = currentQty - 1;

    line.quantity = newQty;
    line.lineTotal = unitPrice * newQty;

    renderTicketPanel();
  }

  function toggleSupplementOnActive(suppId) {
    if (!activeLine) return;

    const supCfg = cfg.supplements?.catalog?.[suppId];
    if (!supCfg) return;

    const allowed = getDefaultSuppForCategory(activeLine.categoryId).map(
      (s) => s.id
    );
    if (!allowed.includes(suppId)) return;

    if (activeLine && activeLine.productId === "menu-enfant") {
      return;
    }

    activeLine.supplements = asArray(activeLine.supplements);

    const idx = activeLine.supplements.indexOf(suppId);

    if (idx === -1) {
      activeLine.supplements.push(suppId);
      activeLine.lineTotal += supCfg.price || 0;
    } else {
      activeLine.supplements.splice(idx, 1);
      activeLine.lineTotal -= supCfg.price || 0;
    }

    renderTicketPanel();
  }

  function toggleRemovedIngredientOnActive(ingredient) {
    if (!activeLine) return;

    activeLine.removedIngredients = asArray(activeLine.removedIngredients);

    const idx = activeLine.removedIngredients.indexOf(ingredient);

    if (idx === -1) {
      activeLine.removedIngredients.push(ingredient);
    } else {
      activeLine.removedIngredients.splice(idx, 1);
    }

    renderTicketPanel();
  }

  // ==========================================================================
  // RENDU DU TICKET
  // ==========================================================================

  function renderTicketPanel() {
    if (!ticketPanel) return;
    const body = ticketPanel.querySelector("#ticket-body");
    const totalEl = ticketPanel.querySelector("#ticket-total");
    if (!body || !totalEl) return;

    body.innerHTML = "";

    const safeLines = asArray(ticketLines);

    if (ticketSent) {
      const sent = document.createElement("div");
      sent.className = "sent-card";
      const head = statusHeadline();
      sent.innerHTML = `
        <div class="sent-card-top">
          <span class="sent-card-emoji">${head.emoji}</span>
          <div class="min-w-0">
            <p class="sent-card-title">${tracking ? `Commande n° ${tracking.id}` : "Commande envoyée"}</p>
            <p class="sent-card-sub">${tracking ? STATUS_LABELS[tracking.status] || tracking.status : "sur WhatsApp"}${tracking && tracking.eta && tracking.status === "preparation" ? ` · prête vers ${fmtTime(tracking.eta)}` : ""}</p>
          </div>
        </div>
        <div class="sent-card-actions">
          <button type="button" class="sent-card-btn primary" data-ticket-action="open-status">📍 Voir le suivi</button>
          <button type="button" class="sent-card-btn" data-ticket-action="new-order">🧾 Nouvelle commande</button>
        </div>
      `;
      body.appendChild(sent);
    }

    if (safeLines.length) {
      const blockList = document.createElement("div");
      blockList.innerHTML = `
        <p class="text-xs uppercase tracking-wide text-slate-500 mb-1">Produits du ticket</p>
        <ul class="space-y-2" id="ticket-lines-list"></ul>
      `;
      body.appendChild(blockList);

      const ul = blockList.querySelector("#ticket-lines-list");

      safeLines.forEach((line) => {
        const li = document.createElement("li");
        li.className =
          "flex items-start justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs";

        const variantLabel = line.variant === "menu" ? "menu" : "seul";

        const supplements = asArray(line.supplements);
        const removedIngredients = asArray(line.removedIngredients);
        const details = [];

        const qty = line.quantity && line.quantity > 0 ? line.quantity : 1;

        // 🆕 CAS KAPSALOON
        if (line.categoryId === "kapsaloon") {
          const base =
            typeof getKapsaloonBaseForLine === "function"
              ? getKapsaloonBaseForLine(line)
              : null;
          if (base && base.label) {
            details.push(`<strong>Taille :</strong> ${base.label}`);
          }

          const meats = asArray(line.kapsaloonMeats);
          if (meats.length) {
            details.push(`<strong>Viandes :</strong> ${meats.join(", ")}`);
          }

          const sauces = asArray(line.kapsaloonSauces);
          if (sauces.length) {
            details.push(`<strong>Sauces :</strong> ${sauces.join(", ")}`);
          }

          if (supplements.length && cfg.supplements?.catalog) {
            const names = supplements
              .map((id) => cfg.supplements.catalog[id]?.name)
              .filter(Boolean);
            if (names.length) {
              details.push(`<strong>Suppléments :</strong> ${names.join(", ")}`);
            }
          }
        } else if (line.categoryId === "tacos") {
          const base =
            typeof getTacosBaseForLine === "function"
              ? getTacosBaseForLine(line)
              : null;
          if (base && base.label) {
            details.push(`<strong>Taille :</strong> ${base.label}`);
          }

          const meats = asArray(line.tacosMeats);
          if (meats.length) {
            details.push(`<strong>Viandes :</strong> ${meats.join(", ")}`);
          }

          const sauces = asArray(line.tacosSauces);
          if (sauces.length) {
            details.push(`<strong>Sauces :</strong> ${sauces.join(", ")}`);
          }

          const veggies = asArray(line.tacosVeggies);
          if (veggies.length) {
            details.push(`<strong>Crudités :</strong> ${veggies.join(", ")}`);
          }

          if (supplements.length && cfg.supplements?.catalog) {
            const names = supplements
              .map((id) => cfg.supplements.catalog[id]?.name)
              .filter(Boolean);
            if (names.length) {
              details.push(`<strong>Suppléments :</strong> ${names.join(", ")}`);
            }
          }

          if (removedIngredients.length) {
            details.push(
              `<strong>Sans :</strong> ${removedIngredients.join(", ")}`
            );
          }
        } else {
          if (line.categoryId === "menu-enfant" && line.kidsChoice) {
            const found = findProductById(line.productId);
            const kidsOpts = found?.item?.kidsOptions || [];
            const opt = kidsOpts.find((o) => o.id === line.kidsChoice);
            if (opt) {
              details.push(`<strong>Plat enfant :</strong> ${opt.name}`);
            }
          }

          if (line.variant === "menu" && line.drinkChoice) {
            const drinkCat = (cfg.menu.categories || []).find(
              (c) => c.id && c.id.toLowerCase().includes("boisson")
            );
            let drinkName = line.drinkChoice;
            if (drinkCat && Array.isArray(drinkCat.items)) {
              const foundDrink = drinkCat.items.find(
                (d) => d.id === line.drinkChoice
              );
              if (foundDrink) drinkName = foundDrink.name;
            }
            details.push(`<strong>Boisson :</strong> ${drinkName}`);
          }

          if (line.mainSauce) {
            let sauces = Array.isArray(line.mainSauce)
              ? line.mainSauce
              : [line.mainSauce];

            if (sauces.length === 1) {
              details.push(`<strong>Sauce :</strong> ${sauces[0]}`);
            } else if (sauces.length > 1) {
              details.push(`<strong>Sauces :</strong> ${sauces.join(", ")}`);
            }
          }

          if (supplements.length && cfg.supplements?.catalog) {
            const names = supplements
              .map((id) => cfg.supplements.catalog[id]?.name)
              .filter(Boolean);
            if (names.length) {
              details.push(`<strong>Suppléments :</strong> ${names.join(", ")}`);
            }
          }

          if (removedIngredients.length) {
            details.push(
              `<strong>Sans :</strong> ${removedIngredients.join(", ")}`
            );
          }
        }

        li.innerHTML = `
          <div>
            <p class="font-semibold text-[13px]">
              ${line.productName}
              <span class="text-slate-500">(${variantLabel})</span>
            </p>
            ${
              details.length
                ? `<p class="text-[11px] text-slate-500 mt-1">${details.join(
                    " · "
                  )}</p>`
                : ""
            }
          </div>

          <div class="flex flex-col items-end gap-1">
            <div class="flex items-center gap-2 text-[11px]">
              <button type="button"
                      class="px-2 py-0.5 rounded-full border border-slate-300"
                      data-ticket-action="dec-qty"
                      data-line-id="${line.id}">
                -
              </button>
              <span>x${qty}</span>
              <button type="button"
                      class="px-2 py-0.5 rounded-full border border-slate-300"
                      data-ticket-action="inc-qty"
                      data-line-id="${line.id}">
                +
              </button>
            </div>
            <span class="text-[13px] font-semibold">${(
              line.lineTotal || 0
            ).toFixed(2)} €</span>
            <button type="button"
                    class="text-[11px] text-red-500"
                    data-ticket-action="remove-line"
                    data-line-id="${line.id}">
              Retirer
            </button>
          </div>
        `;

        ul.appendChild(li);
      });
    }


    if (!safeLines.length && !activeLine) {
      const empty = document.createElement("div");
      empty.className = "text-xs text-slate-500 space-y-2";
      empty.innerHTML = `
        <p>Votre ticket est vide. Ajoutez un produit avec le bouton +.</p>
        ${
          lastOrder
            ? `<button type="button"
                       class="w-full px-3 py-2 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold text-xs"
                       data-ticket-action="reorder-last">
                 🔁 Recommander ma dernière commande
                 <span class="text-slate-400 font-normal">(${describeLastOrder()})</span>
               </button>`
            : ""
        }
      `;
      body.appendChild(empty);
    }

    renderOrderMeta();
    saveTicketState();

    const count = safeLines.reduce((n, l) => n + (l.quantity > 0 ? l.quantity : 1), 0);
    const badge = ticketToggle ? ticketToggle.querySelector("#ticket-count") : null;
    if (badge) {
      badge.textContent = String(count);
      badge.classList.toggle("hidden", count === 0);
    }

    if (wizardOpen) renderWizard();
    if (statusOpen) renderStatusSheet();
  }

  // ==========================================================================
  // HORAIRES – STATUT OUVERT / FERMÉ ET CRÉNEAUX
  // ==========================================================================
  const DAY_NAMES = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  function toMinutes(hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || "").trim());
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  function fromMinutes(min) {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Transforme cfg.openingHours (liste avec day: "" = suite du jour précédent)
  // en tableau indexé par jour (0 = dimanche) de créneaux en minutes.
  function getWeeklyHours() {
    const week = [[], [], [], [], [], [], []];
    let current = null;
    asArray(cfg.openingHours).forEach((h) => {
      const dayName = (h.day || "").trim().toLowerCase();
      if (dayName) {
        const idx = DAY_NAMES.indexOf(dayName);
        current = idx >= 0 ? idx : null;
      }
      if (current == null) return;
      const opens = toMinutes(h.opens);
      const closes = toMinutes(h.closes);
      if (opens == null || closes == null) return;
      week[current].push({
        opens,
        closes: closes <= opens ? closes + 1440 : closes,
      });
    });
    week.forEach((d) => d.sort((a, b) => a.opens - b.opens));
    return week;
  }

  // Heure courante à Paris (le client peut être dans un autre fuseau).
  function getParisNow() {
    try {
      const parts = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const get = (t) => (parts.find((p) => p.type === t) || {}).value;
      const day = DAY_NAMES.indexOf((get("weekday") || "").toLowerCase());
      const hour = parseInt(get("hour"), 10) % 24;
      const minute = parseInt(get("minute"), 10);
      if (day >= 0 && !isNaN(hour) && !isNaN(minute)) {
        return { day, minutes: hour * 60 + minute };
      }
    } catch (e) {
      /* fallback local */
    }
    const d = new Date();
    return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }

  function describeNextOpen(offset, day, opensAt) {
    if (offset === 0) return `ouvre à ${opensAt}`;
    if (offset === 1) return `ouvre demain à ${opensAt}`;
    return `ouvre ${DAY_NAMES[day]} à ${opensAt}`;
  }

  function getOpeningStatus(now = getParisNow()) {
    const week = getWeeklyHours();
    if (!week.some((d) => d.length)) return null;

    // Créneau de la veille qui déborde après minuit
    const prev = week[(now.day + 6) % 7].find(
      (s) => s.closes > 1440 && now.minutes < s.closes - 1440
    );
    if (prev) {
      return {
        isOpen: true,
        closesAt: fromMinutes(prev.closes - 1440),
        closesInMinutes: prev.closes - 1440 - now.minutes,
      };
    }

    for (const s of week[now.day]) {
      if (now.minutes >= s.opens && now.minutes < s.closes) {
        return {
          isOpen: true,
          closesAt: fromMinutes(s.closes),
          closesInMinutes: s.closes - now.minutes,
        };
      }
    }

    for (let offset = 0; offset < 8; offset++) {
      const day = (now.day + offset) % 7;
      const slot = week[day].find((s) => offset > 0 || s.opens > now.minutes);
      if (slot) {
        const opensAt = fromMinutes(slot.opens);
        return {
          isOpen: false,
          nextOpen: {
            dayOffset: offset,
            day,
            opensAt,
            label: describeNextOpen(offset, day, opensAt),
          },
        };
      }
    }
    return { isOpen: false, nextOpen: null };
  }

  function openStatusHtml(status, compact) {
    if (!status) return "";
    if (status.isOpen) {
      const soon = status.closesInMinutes <= 30;
      const txt = soon
        ? `Ouvert · ferme dans ${status.closesInMinutes} min`
        : `Ouvert · ferme à ${status.closesAt}`;
      return `<span class="open-pill ${soon ? "soon" : "open"}"><span class="dot"></span>${txt}</span>`;
    }
    const next = status.nextOpen
      ? status.nextOpen.label
      : "voir les horaires";
    return `<span class="open-pill closed"><span class="dot"></span>Fermé · ${next}</span>`;
  }

  function applyOpenStatus() {
    const hero = $("#hero");
    if (!hero) return;
    const kicker = hero.querySelector(".section-kicker");
    if (!kicker) return;

    let badge = $("#open-status");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "open-status";
      badge.className = "mb-2";
      badge.setAttribute("aria-live", "polite");
      kicker.parentNode.insertBefore(badge, kicker);
    }

    const paint = () => {
      const st = getOpeningStatus();
      if (!st) {
        badge.remove();
        return;
      }
      badge.innerHTML = openStatusHtml(st);
    };
    paint();
    setInterval(paint, 60 * 1000);
  }

  // Créneaux horaires proposés dans le ticket (aujourd'hui + prochain jour ouvert)
  function buildTimeSlots() {
    const step = (cfg.ordering && cfg.ordering.slotStepMinutes) || 15;
    const lead = (cfg.ordering && cfg.ordering.minLeadMinutes) || 15;
    const now = getParisNow();
    const week = getWeeklyHours();
    const slots = [];
    const MAX = 48;

    for (let offset = 0; offset < 8 && slots.length < MAX; offset++) {
      const day = (now.day + offset) % 7;
      let addedForDay = false;
      for (const s of week[day]) {
        let start = s.opens;
        if (offset === 0) {
          const earliest = now.minutes + lead;
          if (earliest >= s.closes) continue;
          start = Math.max(s.opens, Math.ceil(earliest / step) * step);
        }
        for (let t = start; t < s.closes && slots.length < MAX; t += step) {
          const prefix =
            offset === 0 ? "aujourd'hui" : offset === 1 ? "demain" : DAY_NAMES[day];
          const label = `${capitalize(prefix)} ${fromMinutes(t)}`;
          slots.push({ value: label, label });
          addedForDay = true;
        }
      }
      if (addedForDay && offset >= 1) break;
    }
    return slots;
  }

  // ==========================================================================
  // MODE DE COMMANDE, LIVRAISON, SAUVEGARDE LOCALE
  // ==========================================================================
  const DEFAULT_ORDER_MODES = [
    { id: "sur-place", label: "Sur place", icon: "🍽️" },
    { id: "emporter", label: "À emporter", icon: "🥡" },
    { id: "livraison", label: "Livraison", icon: "🛵" },
  ];

  const STORAGE_PREFIX = `snackapp:${cfg.id || "snack"}:`;
  const TICKET_STATE_KEY = STORAGE_PREFIX + "ticket";
  const LAST_ORDER_KEY = STORAGE_PREFIX + "lastOrder";
  const TICKET_STATE_TTL = 24 * 60 * 60 * 1000;

  var orderMeta = { mode: null, address: "", time: "" };
  var ticketSent = null;
  var lastOrder = null;

  function getOrderModes() {
    const modes = cfg.ordering && Array.isArray(cfg.ordering.modes)
      ? cfg.ordering.modes.filter((m) => m && m.id)
      : [];
    return modes.length ? modes : DEFAULT_ORDER_MODES;
  }

  function getCurrentMode() {
    const modes = getOrderModes();
    const found = modes.find((m) => m.id === orderMeta.mode);
    if (found) return found;
    const def =
      modes.find((m) => m.id === (cfg.ordering && cfg.ordering.defaultMode)) ||
      modes[0];
    orderMeta.mode = def.id;
    return def;
  }

  function isDeliveryMode() {
    return getCurrentMode().id === "livraison";
  }

  function getDeliveryCfg() {
    return (cfg.ordering && cfg.ordering.delivery) || {};
  }

  function formatEuro(n) {
    return (Number(n) || 0).toFixed(2).replace(".", ",") + " €";
  }

  function computeTotals() {
    const subtotal = asArray(ticketLines).reduce(
      (sum, l) => sum + (l.lineTotal || 0),
      0
    );
    const d = getDeliveryCfg();
    const isDelivery = isDeliveryMode();
    let fee = 0;
    if (isDelivery && typeof d.fee === "number") {
      const free = typeof d.freeFrom === "number" && subtotal >= d.freeFrom;
      fee = free ? 0 : d.fee;
    }
    const minimumOrder =
      isDelivery && typeof d.minimumOrder === "number" ? d.minimumOrder : 0;
    const missing = Math.max(0, minimumOrder - subtotal);
    return {
      subtotal,
      fee,
      total: subtotal + fee,
      isDelivery,
      minimumOrder,
      missing,
      belowMinimum: isDelivery && missing > 0,
    };
  }

  function readTicketInputs() {
    if (!ticketPanel) return { name: "", phone: "", message: "" };
    const v = (sel) => {
      const el = ticketPanel.querySelector(sel);
      return el ? (el.value || "").trim() : "";
    };
    return {
      name: v("#ticket-name"),
      phone: v("#ticket-phone"),
      message: v("#ticket-message"),
    };
  }

  function saveTicketState() {
    try {
      const inputs = readTicketInputs();
      const state = {
        lines: asArray(ticketLines),
        activeLine: null,
        meta: orderMeta,
        sentAt: ticketSent ? ticketSent.at : null,
        tracking: tracking || null,
        name: inputs.name,
        phone: inputs.phone,
        message: inputs.message,
        savedAt: Date.now(),
      };
      localStorage.setItem(TICKET_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      /* stockage indisponible : on continue sans sauvegarde */
    }
  }

  function loadStoredJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function productStillExists(line) {
    return !!(line && line.productId && findProductById(line.productId));
  }

  // Restaure le ticket et la dernière commande au chargement de la page
  function restoreTicketState() {
    lastOrder = loadStoredJson(LAST_ORDER_KEY);
    if (lastOrder && !Array.isArray(lastOrder.lines)) lastOrder = null;

    const state = loadStoredJson(TICKET_STATE_KEY);
    const fresh =
      state && state.savedAt && Date.now() - state.savedAt < TICKET_STATE_TTL;

    if (fresh) {
      ticketLines = asArray(state.lines).filter(productStillExists);
      activeLine =
        state.activeLine && productStillExists(state.activeLine)
          ? state.activeLine
          : null;
      orderMeta = Object.assign(
        { mode: null, address: "", time: "" },
        state.meta || {}
      );
      ticketSent = state.sentAt ? { at: state.sentAt } : null;
      tracking = state.tracking && state.tracking.id && state.tracking.token ? state.tracking : null;
    } else if (state) {
      try {
        localStorage.removeItem(TICKET_STATE_KEY);
      } catch (e) {
        /* ignore */
      }
    }

    const hasSomething =
      ticketLines.length || activeLine || (fresh && (state.name || state.phone)) || lastOrder;
    if (!hasSomething) return;

    ensureTicketShell();
    if (fresh) {
      const set = (sel, val) => {
        const el = ticketPanel.querySelector(sel);
        if (el && val) el.value = val;
      };
      set("#ticket-name", state.name);
      set("#ticket-phone", state.phone);
      set("#ticket-message", state.message);
      set("#ticket-address", orderMeta.address);
    } else if (lastOrder) {
      const set = (sel, val) => {
        const el = ticketPanel.querySelector(sel);
        if (el && val) el.value = val;
      };
      set("#ticket-name", lastOrder.name);
      set("#ticket-phone", lastOrder.phone);
    }
    renderTicketPanel();
    if (tracking) startTrackingPoll();
    if (/[?&]open=ticket\b/.test(location.search)) {
      if (ticketSent) openStatusSheet();
      else ticketPanel.classList.remove("hidden");
    }
  }

  function markTicketSent() {
    const inputs = readTicketInputs();
    lastOrder = {
      lines: asArray(ticketLines).map((l) => Object.assign({}, l)),
      meta: Object.assign({}, orderMeta),
      name: inputs.name,
      phone: inputs.phone,
      sentAt: Date.now(),
    };
    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(lastOrder));
    } catch (e) {
      /* ignore */
    }
    ticketSent = { at: Date.now() };
    tracking = null;
    stopTrackingPoll();
    renderTicketPanel();
    applyHeroActions();
    if (pendingOrderId) {
      createTrackedOrder(pendingOrderId, inputs);
      pendingOrderId = null;
    }
  }

  function startNewOrder() {
    ticketLines = [];
    activeLine = null;
    ticketSent = null;
    tracking = null;
    stopTrackingPoll();
    renderTicketPanel();
    applyHeroActions();
  }

  function reorderLastOrder() {
    if (!lastOrder || !Array.isArray(lastOrder.lines)) return;
    ensureTicketShell();
    const lines = lastOrder.lines.filter(productStillExists).map((l) =>
      Object.assign({}, l, {
        id: "line_" + Date.now() + "_" + Math.random().toString(16).slice(2),
      })
    );
    if (!lines.length) {
      alert("Les produits de votre dernière commande ne sont plus à la carte.");
      return;
    }
    ticketLines = lines;
    activeLine = null;
    ticketSent = null;
    if (lastOrder.meta) {
      orderMeta = Object.assign({ mode: null, address: "", time: "" }, lastOrder.meta, { time: "" });
      const addr = ticketPanel.querySelector("#ticket-address");
      if (addr) addr.value = orderMeta.address || "";
    }
    const set = (sel, val) => {
      const el = ticketPanel.querySelector(sel);
      if (el && !el.value && val) el.value = val;
    };
    set("#ticket-name", lastOrder.name);
    set("#ticket-phone", lastOrder.phone);
    ticketPanel.classList.remove("hidden");
    renderTicketPanel();
  }

  function describeLastOrder() {
    if (!lastOrder) return "";
    const lines = asArray(lastOrder.lines);
    const count = lines.reduce((n, l) => n + (l.quantity > 0 ? l.quantity : 1), 0);
    const total = lines.reduce((s, l) => s + (l.lineTotal || 0), 0);
    return `${count} produit${count > 1 ? "s" : ""} · ${formatEuro(total)}`;
  }

  function applyReorderShortcut() {
    applyHeroActions();
  }

  function getReviewUrl() {
    return (
      (cfg.google && cfg.google.reviewUrl) ||
      (cfg.urls && cfg.urls.googleMaps) ||
      (cfg.google && cfg.google.url) ||
      ""
    );
  }

  function renderTimeSelect() {
    if (!ticketPanel) return;
    const select = ticketPanel.querySelector("#ticket-time");
    if (!select) return;
    const slots = buildTimeSlots();
    const current = orderMeta.time || "";
    const options = [`<option value="">Dès que possible</option>`].concat(
      slots.map(
        (s) =>
          `<option value="${s.value}"${s.value === current ? " selected" : ""}>${s.label}</option>`
      )
    );
    select.innerHTML = options.join("");
    if (current && !slots.some((s) => s.value === current)) {
      orderMeta.time = "";
    }
  }

  // Met à jour la partie « mode / livraison / totaux » du panneau sans toucher aux champs saisis
  function renderOrderMeta() {
    if (!ticketPanel) return;
    const mode = getCurrentMode();
    const modes = getOrderModes();

    const wrap = ticketPanel.querySelector("#ticket-mode-buttons");
    if (wrap) {
      wrap.innerHTML = modes
        .map((m) => {
          const on = m.id === mode.id;
          return `
            <button type="button"
                    data-ticket-action="set-mode"
                    data-mode-id="${m.id}"
                    class="flex-1 px-2 py-1.5 rounded-full border text-[11px] font-semibold ${
                      on
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-slate-700 border-slate-200"
                    }">
              ${m.icon ? m.icon + " " : ""}${m.label}
            </button>`;
        })
        .join("");
    }

    const totals = computeTotals();
    const d = getDeliveryCfg();

    const deliveryBlock = ticketPanel.querySelector("#ticket-delivery");
    if (deliveryBlock) {
      deliveryBlock.classList.toggle("hidden", !totals.isDelivery);
      const info = deliveryBlock.querySelector("#ticket-delivery-info");
      if (info) {
        const bits = [];
        if (typeof d.minimumOrder === "number") bits.push(`minimum ${formatEuro(d.minimumOrder)}`);
        if (typeof d.fee === "number") {
          bits.push(
            d.fee > 0
              ? `frais ${formatEuro(d.fee)}${typeof d.freeFrom === "number" ? ` (offerts dès ${formatEuro(d.freeFrom)})` : ""}`
              : "livraison offerte"
          );
        }
        if (d.estimatedTime) bits.push(d.estimatedTime);
        const zones = asArray(d.zones);
        info.innerHTML =
          (bits.length ? `<span>Livraison : ${bits.join(" · ")}.</span>` : "") +
          (zones.length
            ? `<br><span class="text-slate-400">Zones : ${zones.join(", ")}.</span>`
            : "");
      }
    }

    const note = ticketPanel.querySelector("#ticket-mode-note");
    if (note) {
      const parts = [];
      if (mode.id === "emporter" && cfg.ordering && cfg.ordering.pickupTime) {
        parts.push(`⏱️ Prêt en ${cfg.ordering.pickupTime} en général.`);
      }
      const st = getOpeningStatus();
      if (st && !st.isOpen) {
        parts.push(
          `🔴 Restaurant fermé pour le moment${st.nextOpen ? ` (${st.nextOpen.label})` : ""}. Votre commande sera traitée à l'ouverture.`
        );
      }
      note.textContent = parts.join(" ");
      note.classList.toggle("hidden", !parts.length);
    }

    const subRow = ticketPanel.querySelector("#ticket-subtotal-row");
    const feeRow = ticketPanel.querySelector("#ticket-fee-row");
    const subEl = ticketPanel.querySelector("#ticket-subtotal");
    const feeEl = ticketPanel.querySelector("#ticket-fee");
    const totalEl = ticketPanel.querySelector("#ticket-total");
    const showBreakdown = totals.isDelivery && typeof d.fee === "number";
    if (subRow) subRow.classList.toggle("hidden", !showBreakdown);
    if (feeRow) feeRow.classList.toggle("hidden", !showBreakdown);
    if (subEl) subEl.textContent = formatEuro(totals.subtotal);
    if (feeEl) feeEl.textContent = totals.fee > 0 ? formatEuro(totals.fee) : "offerts";
    if (totalEl) totalEl.textContent = formatEuro(totals.total);

    const warn = ticketPanel.querySelector("#ticket-minimum-warning");
    const sendBtn = ticketPanel.querySelector("#ticket-share-restaurant");
    if (warn) {
      if (totals.belowMinimum) {
        warn.textContent = `Minimum ${formatEuro(totals.minimumOrder)} pour la livraison : il manque ${formatEuro(totals.missing)}.`;
        warn.classList.remove("hidden");
      } else {
        warn.classList.add("hidden");
      }
    }
    if (sendBtn) {
      sendBtn.disabled = !!totals.belowMinimum;
      sendBtn.classList.toggle("opacity-50", !!totals.belowMinimum);
      sendBtn.classList.toggle("cursor-not-allowed", !!totals.belowMinimum);
    }

    renderTimeSelect();
  }

  function setOrderMode(modeId) {
    if (!getOrderModes().some((m) => m.id === modeId)) return;
    orderMeta.mode = modeId;
    renderOrderMeta();
    saveTicketState();
    if (modeId === "livraison" && ticketPanel) {
      const addr = ticketPanel.querySelector("#ticket-address");
      if (addr && !addr.value) addr.focus();
    }
  }

  // ==========================================================================
  // ASSISTANT DE PERSONNALISATION – parcours par étapes (façon borne)
  // ==========================================================================
  var wizardEl = null;
  var wizardStep = 0;
  var wizardSteps = [];
  var wizardOpen = false;

  const SAUCE_CATEGORIES = [
    "burgers",
    "sandwichs",
    "paninis",
    "signatures",
    "galettes",
  ];

  const MEAT_ICONS = [
    ["hach", "🥩"],
    ["poulet", "🍗"],
    ["chicken", "🍗"],
    ["kebab", "🥙"],
    ["tender", "🍗"],
    ["nugget", "🍗"],
    ["merguez", "🌭"],
    ["cordon", "🧀"],
    ["steak", "🥩"],
    ["fish", "🐟"],
    ["poisson", "🐟"],
  ];

  function iconFor(label) {
    const k = (label || "").toLowerCase();
    const hit = MEAT_ICONS.find(([key]) => k.includes(key));
    return hit ? hit[1] : "";
  }

  function getMaxSauces() {
    return (cfg.ordering && cfg.ordering.maxSauces) || 2;
  }

  function getLineItem(line) {
    const found = line ? findProductById(line.productId) : null;
    return found ? found.item : {};
  }

  function lineHasMenuOption(line) {
    const item = getLineItem(line);
    return (
      line.categoryId !== "menu-enfant" &&
      item.priceMenu != null &&
      (item.priceSolo ?? item.price) != null
    );
  }

  function buildWizardSteps(line) {
    const item = getLineItem(line);
    const cat = line.categoryId;
    const steps = [];

    if (lineHasMenuOption(line)) {
      steps.push({
        id: "variant",
        label: "Formule",
        title: "Seul ou en menu ?",
        subtitle: "Le menu comprend les frites et une boisson.",
      });
    }

    if (cat === "tacos" && item.tacosConfig) {
      steps.push({ id: "tacos-size", label: "Taille", title: "Choisis ta taille" });
      steps.push({ id: "tacos-meats", label: "Viandes", title: "Choisis tes viandes" });
      steps.push({ id: "tacos-sauces", label: "Sauces", title: "Choisis tes sauces" });
      if (asArray(item.tacosConfig.freeCrudites).length) {
        steps.push({
          id: "tacos-veg",
          label: "Crudités",
          title: "Tes crudités",
          subtitle: "Incluses. Décoche ce que tu ne veux pas.",
        });
      }
    } else if (cat === "kapsaloon" && item.kapsaloonConfig) {
      if (asArray(item.kapsaloonConfig.bases).length > 1) {
        steps.push({ id: "kaps-size", label: "Taille", title: "Choisis ta taille" });
      }
      steps.push({ id: "kaps-meats", label: "Viandes", title: "Choisis tes viandes" });
      steps.push({ id: "kaps-sauces", label: "Sauces", title: "Choisis tes sauces" });
    } else if (SAUCE_CATEGORIES.includes(cat) && asArray(line.availableSauces).length) {
      steps.push({
        id: "main-sauce",
        label: "Sauce",
        title: "Choisis ta sauce",
        subtitle: `Jusqu'à ${getMaxSauces()} sauces, ou aucune.`,
      });
    }

    if (cat === "menu-enfant" && asArray(item.kidsOptions).length) {
      steps.push({ id: "kids", label: "Plat", title: "Choisis le plat du menu" });
    }

    if (getDefaultSuppForCategory(cat).length) {
      steps.push({
        id: "supplements",
        label: "Extras",
        title: "Un petit extra ?",
        subtitle: "Optionnel.",
      });
    }

    const removable =
      cat === "tacos" || cat === "kapsaloon"
        ? []
        : asArray(line.baseIngredients).filter(isRemovableIngredient);
    if (removable.length) {
      steps.push({
        id: "remove",
        label: "Sans",
        title: "Quelque chose à enlever ?",
        subtitle: "Optionnel.",
      });
    }

    if (line.variant === "menu" && cat !== "menu-enfant" && getMenuDrinks().length) {
      steps.push({ id: "drink", label: "Boisson", title: "Ta boisson", subtitle: "Incluse dans le menu." });
    }

    steps.push({ id: "recap", label: "Récap", title: "On récapitule" });
    return steps;
  }

  function stepValidation(step) {
    if (!activeLine || !step) return { ok: false, hint: "" };
    switch (step.id) {
      case "tacos-meats": {
        const max = getTacosMaxMeatsForLine(activeLine);
        const n = asArray(activeLine.tacosMeats).length;
        return n ? { ok: true, hint: `${n}/${max} viande${max > 1 ? "s" : ""}` } : { ok: false, hint: "Choisis au moins une viande." };
      }
      case "kaps-meats": {
        const max = getKapsaloonMaxMeatsForLine(activeLine);
        const n = asArray(activeLine.kapsaloonMeats).length;
        return n ? { ok: true, hint: `${n}/${max} viande${max > 1 ? "s" : ""}` } : { ok: false, hint: "Choisis au moins une viande." };
      }
      case "kids":
        return activeLine.kidsChoice ? { ok: true, hint: "" } : { ok: false, hint: "Choisis un plat." };
      case "drink":
        return activeLine.drinkChoice ? { ok: true, hint: "" } : { ok: false, hint: "Choisis ta boisson incluse." };
      default:
        return { ok: true, hint: "" };
    }
  }

  function setLineVariant(variant) {
    if (!activeLine || !lineHasMenuOption(activeLine)) return;
    const item = getLineItem(activeLine);
    const wasMenu = activeLine.variant === "menu";
    activeLine.variant = variant;

    if (activeLine.categoryId === "tacos" && item.tacosConfig) {
      const base = getTacosBaseForLine(activeLine);
      const up = (cfg.tacos && cfg.tacos.menuUpcharge) || 2;
      activeLine.basePrice = base ? (variant === "menu" ? base.price + up : base.price) : activeLine.basePrice;
      activeLine.lineTotal = activeLine.basePrice + calculateTacosExtras(activeLine);
    } else {
      activeLine.basePrice = variant === "menu" ? item.priceMenu : item.priceSolo ?? item.price;
      activeLine.lineTotal = activeLine.basePrice + calculateTacosExtras(activeLine);
    }
    activeLine.forbiddenSupp = variant === "menu" ? [] : ["cheddar_frites", "boisson_menu"];
    activeLine.availableDrinks = variant === "menu" ? getMenuDrinks() : [];
    if (variant !== "menu") activeLine.drinkChoice = null;

    if (wasMenu !== (variant === "menu")) {
      wizardSteps = buildWizardSteps(activeLine);
      wizardStep = Math.min(wizardStep, wizardSteps.length - 1);
    }
    renderTicketPanel();
  }

  function ensureWizardShell() {
    if (wizardEl) return;
    wizardEl = document.createElement("div");
    wizardEl.id = "product-wizard";
    wizardEl.className = "wizard hidden";
    wizardEl.innerHTML = `
      <div class="wizard-backdrop" data-wizard-action="close"></div>
      <div class="wizard-sheet" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <header class="wizard-head">
          <img id="wizard-img" class="wizard-img" alt="" />
          <div class="min-w-0 flex-1">
            <p id="wizard-product" class="wizard-product"></p>
            <p id="wizard-variant" class="wizard-variant"></p>
          </div>
          <button type="button" class="wizard-close" data-wizard-action="close" aria-label="Fermer">×</button>
        </header>
        <ol id="wizard-progress" class="wizard-progress" aria-label="Étapes"></ol>
        <div id="wizard-body" class="wizard-body">
          <h3 id="wizard-title" class="wizard-title"></h3>
          <p id="wizard-subtitle" class="wizard-subtitle"></p>
          <div id="wizard-options" class="wizard-options"></div>
        </div>
        <footer class="wizard-foot">
          <p id="wizard-hint" class="wizard-hint"></p>
          <div class="wizard-foot-row">
            <div class="wizard-price">
              <span class="wizard-price-label">Sous-total</span>
              <strong id="wizard-price">0,00 €</strong>
            </div>
            <div class="wizard-buttons">
              <button type="button" id="wizard-back" class="wizard-btn secondary" data-wizard-action="back">Retour</button>
              <button type="button" id="wizard-next" class="wizard-btn primary" data-wizard-action="next">Suivant</button>
            </div>
          </div>
        </footer>
      </div>`;
    document.body.appendChild(wizardEl);

    wizardEl.addEventListener("click", (e) => {
      const w = e.target.closest("[data-wizard-action]");
      if (w) {
        const action = w.dataset.wizardAction;
        if (action === "close") closeWizard();
        if (action === "back") wizardGo(wizardStep - 1);
        if (action === "next") wizardNext();
        if (action === "goto") {
          const i = parseInt(w.dataset.step, 10);
          if (!isNaN(i) && i < wizardStep) wizardGo(i);
        }
        if (action === "qty-inc" && activeLine) {
          activeLine.quantity = (activeLine.quantity > 0 ? activeLine.quantity : 1) + 1;
          renderWizard();
        }
        if (action === "qty-dec" && activeLine) {
          activeLine.quantity = Math.max(1, (activeLine.quantity > 0 ? activeLine.quantity : 1) - 1);
          renderWizard();
        }
        return;
      }
      const a = e.target.closest("[data-ticket-action]");
      if (a) handleTicketAction(a.dataset.ticketAction, a);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wizardOpen) closeWizard();
    });
  }

  function openWizard() {
    if (!activeLine) return;
    ensureWizardShell();
    if (activeLine.categoryId === "tacos") {
      const item = getLineItem(activeLine);
      if (!asArray(activeLine.tacosVeggies).length && item.tacosConfig) {
        activeLine.tacosVeggies = asArray(item.tacosConfig.freeCrudites).slice();
      }
    }
    if (!(activeLine.quantity > 0)) activeLine.quantity = 1;
    wizardSteps = buildWizardSteps(activeLine);
    wizardStep = 0;
    wizardOpen = true;
    wizardEl.classList.remove("hidden");
    document.body.classList.add("wizard-lock");
    renderWizard();
  }

  function closeWizard() {
    if (!wizardEl) return;
    wizardOpen = false;
    wizardEl.classList.add("hidden");
    document.body.classList.remove("wizard-lock");
    activeLine = null;
    renderTicketPanel();
  }

  function wizardGo(i) {
    if (i < 0 || i >= wizardSteps.length) return;
    wizardStep = i;
    renderWizard(true);
  }

  function wizardNext() {
    const step = wizardSteps[wizardStep];
    const v = stepValidation(step);
    if (!v.ok) {
      const hint = wizardEl.querySelector("#wizard-hint");
      if (hint) {
        hint.textContent = v.hint;
        hint.classList.add("shake");
        setTimeout(() => hint.classList.remove("shake"), 400);
      }
      return;
    }
    if (wizardStep >= wizardSteps.length - 1) {
      const qty = activeLine.quantity > 0 ? activeLine.quantity : 1;
      const name = activeLine.productName;
      addActiveLineToTicket();
      if (activeLine) return; // validation refusée
      wizardOpen = false;
      wizardEl.classList.add("hidden");
      document.body.classList.remove("wizard-lock");
      showToast({
        icon: "🎟️",
        type: "success",
        title: "Ajouté au ticket",
        message: `${qty > 1 ? qty + " × " : ""}${name}`,
        duration: 2500,
      });
      if (ticketToggle) {
        ticketToggle.classList.add("bump");
        setTimeout(() => ticketToggle.classList.remove("bump"), 600);
      }
      return;
    }
    wizardStep += 1;
    renderWizard(true);
  }

  function optionCard(opts) {
    const { action, data, label, sub, price, on, off, icon } = opts;
    const attrs = Object.keys(data || {})
      .map((k) => `data-${k}="${String(data[k]).replace(/"/g, "&quot;")}"`)
      .join(" ");
    return `
      <button type="button"
              class="wizard-option${on ? " on" : ""}${off ? " off" : ""}"
              data-ticket-action="${action}" ${attrs}
              aria-pressed="${on ? "true" : "false"}">
        <span class="wizard-option-check" aria-hidden="true"></span>
        ${icon ? `<span class="wizard-option-icon">${icon}</span>` : ""}
        <span class="wizard-option-text">
          <span class="wizard-option-label">${label}</span>
          ${sub ? `<span class="wizard-option-sub">${sub}</span>` : ""}
        </span>
        ${price ? `<span class="wizard-option-price">${price}</span>` : ""}
      </button>`;
  }

  function lineDetailsForRecap(line) {
    const out = [];
    const item = getLineItem(line);
    if (line.categoryId === "tacos") {
      const base = getTacosBaseForLine(line);
      if (base) out.push(["Taille", base.label]);
      if (asArray(line.tacosMeats).length) out.push(["Viandes", line.tacosMeats.join(", ")]);
      out.push(["Sauces", asArray(line.tacosSauces).length ? line.tacosSauces.join(", ") : "sans sauce"]);
      if (asArray(item.tacosConfig && item.tacosConfig.freeCrudites).length) {
        out.push(["Crudités", asArray(line.tacosVeggies).length ? line.tacosVeggies.join(", ") : "aucune"]);
      }
    } else if (line.categoryId === "kapsaloon") {
      const base = getKapsaloonBaseForLine(line);
      if (base) out.push(["Taille", base.label]);
      if (asArray(line.kapsaloonMeats).length) out.push(["Viandes", line.kapsaloonMeats.join(", ")]);
      out.push(["Sauces", asArray(line.kapsaloonSauces).length ? line.kapsaloonSauces.join(", ") : "sans sauce"]);
    } else if (SAUCE_CATEGORIES.includes(line.categoryId) && asArray(line.availableSauces).length) {
      const s = Array.isArray(line.mainSauce) ? line.mainSauce : line.mainSauce ? [line.mainSauce] : [];
      out.push(["Sauce", s.length ? s.join(", ") : "sans sauce"]);
    }
    if (line.categoryId === "menu-enfant" && line.kidsChoice) {
      const opt = asArray(item.kidsOptions).find((o) => o.id === line.kidsChoice);
      if (opt) out.push(["Plat", opt.name]);
    }
    if (asArray(line.supplements).length && cfg.supplements && cfg.supplements.catalog) {
      const names = line.supplements.map((id) => cfg.supplements.catalog[id] && cfg.supplements.catalog[id].name).filter(Boolean);
      if (names.length) out.push(["Extras", names.join(", ")]);
    }
    if (asArray(line.removedIngredients).length) out.push(["Sans", line.removedIngredients.join(", ")]);
    if (line.variant === "menu" && line.drinkChoice) {
      const d = getMenuDrinks().find((x) => x.id === line.drinkChoice);
      out.push(["Boisson", d ? d.name : line.drinkChoice]);
    }
    return out;
  }

  function renderWizardOptions(step) {
    const line = activeLine;
    const item = getLineItem(line);
    const cards = [];

    switch (step.id) {
      case "variant": {
        const solo = item.priceSolo ?? item.price;
        cards.push(optionCard({ action: "set-variant", data: { variant: "solo" }, label: "Seul", sub: "Le produit uniquement", price: formatEuro(solo), on: line.variant !== "menu", icon: "🍔" }));
        cards.push(optionCard({ action: "set-variant", data: { variant: "menu" }, label: "En menu", sub: "Avec frites + boisson", price: formatEuro(item.priceMenu), on: line.variant === "menu", icon: "🍟" }));
        break;
      }
      case "tacos-size":
        asArray(item.tacosConfig.bases).forEach((b) =>
          cards.push(optionCard({ action: "set-tacos-base", data: { "base-id": b.id }, label: b.label, sub: `${b.meats} viande${b.meats > 1 ? "s" : ""}`, price: formatEuro(line.variant === "menu" ? b.price + ((cfg.tacos && cfg.tacos.menuUpcharge) || 2) : b.price), on: b.id === line.tacosBaseId }))
        );
        break;
      case "kaps-size":
        asArray(item.kapsaloonConfig.bases).forEach((b) =>
          cards.push(optionCard({ action: "set-kapsaloon-base", data: { "base-id": b.id }, label: b.label, price: formatEuro(b.price), on: b.id === line.kapsaloonBaseId }))
        );
        break;
      case "tacos-meats": {
        const max = getTacosMaxMeatsForLine(line);
        const sel = asArray(line.tacosMeats);
        asArray(item.tacosConfig.meats).forEach((m) =>
          cards.push(optionCard({ action: "toggle-tacos-meat", data: { "meat-name": m }, label: capitalize(m), on: sel.includes(m), off: !sel.includes(m) && sel.length >= max, icon: iconFor(m) }))
        );
        break;
      }
      case "kaps-meats": {
        const max = getKapsaloonMaxMeatsForLine(line);
        const sel = asArray(line.kapsaloonMeats);
        asArray(item.kapsaloonConfig.meats).forEach((m) =>
          cards.push(optionCard({ action: "toggle-kapsaloon-meat", data: { "meat-name": m }, label: capitalize(m), on: sel.includes(m), off: !sel.includes(m) && sel.length >= max, icon: iconFor(m) }))
        );
        break;
      }
      case "tacos-sauces": {
        const sel = asArray(line.tacosSauces);
        asArray(item.tacosConfig.sauces).forEach((s) =>
          cards.push(optionCard({ action: "toggle-tacos-sauce", data: { "sauce-name": s }, label: capitalize(s), on: sel.includes(s), off: !sel.includes(s) && sel.length >= getMaxSauces() }))
        );
        break;
      }
      case "kaps-sauces": {
        const sel = asArray(line.kapsaloonSauces);
        asArray(item.kapsaloonConfig.sauces).forEach((s) =>
          cards.push(optionCard({ action: "toggle-kapsaloon-sauce", data: { "sauce-name": s }, label: capitalize(s), on: sel.includes(s), off: !sel.includes(s) && sel.length >= getMaxSauces() }))
        );
        break;
      }
      case "tacos-veg": {
        const sel = asArray(line.tacosVeggies);
        asArray(item.tacosConfig.freeCrudites).forEach((v) =>
          cards.push(optionCard({ action: "toggle-tacos-veg", data: { veggie: v }, label: capitalize(v), on: sel.includes(v), price: "inclus" }))
        );
        break;
      }
      case "main-sauce": {
        const sel = Array.isArray(line.mainSauce) ? line.mainSauce : line.mainSauce ? [line.mainSauce] : [];
        asArray(line.availableSauces).forEach((s) =>
          cards.push(optionCard({ action: "set-main-sauce", data: { "sauce-name": s }, label: capitalize(s), on: sel.includes(s), off: !sel.includes(s) && sel.length >= getMaxSauces() }))
        );
        break;
      }
      case "kids":
        asArray(item.kidsOptions).forEach((o) =>
          cards.push(optionCard({ action: "set-kids-plate", data: { "plate-id": o.id }, label: o.name, on: line.kidsChoice === o.id, icon: iconFor(o.name) }))
        );
        break;
      case "supplements": {
        const sel = asArray(line.supplements);
        getDefaultSuppForCategory(line.categoryId).forEach((s) =>
          cards.push(optionCard({ action: "toggle-supp", data: { "supp-id": s.id }, label: s.name, price: "+" + formatEuro(s.price), on: sel.includes(s.id) }))
        );
        break;
      }
      case "remove": {
        const sel = asArray(line.removedIngredients);
        asArray(line.baseIngredients).filter(isRemovableIngredient).forEach((ing) =>
          cards.push(optionCard({ action: "toggle-ingredient", data: { ingredient: ing }, label: `Sans ${ing}`, on: sel.includes(ing) }))
        );
        break;
      }
      case "drink":
        getMenuDrinks().forEach((d) =>
          cards.push(optionCard({ action: "set-drink", data: { "drink-id": d.id }, label: d.name, price: "inclus", on: line.drinkChoice === d.id, icon: "🥤" }))
        );
        break;
      case "recap": {
        const qty = line.quantity > 0 ? line.quantity : 1;
        const details = lineDetailsForRecap(line);
        return `
          <div class="wizard-recap">
            <p class="wizard-recap-name">${line.productName} <span>(${line.variant === "menu" ? "menu" : "seul"})</span></p>
            ${
              details.length
                ? `<dl class="wizard-recap-list">${details
                    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
                    .join("")}</dl>`
                : `<p class="wizard-subtitle">Aucune option, c'est simple et rapide.</p>`
            }
            <div class="wizard-qty">
              <span>Quantité</span>
              <div class="wizard-qty-ctrl">
                <button type="button" data-wizard-action="qty-dec" aria-label="Moins">−</button>
                <strong>${qty}</strong>
                <button type="button" data-wizard-action="qty-inc" aria-label="Plus">+</button>
              </div>
            </div>
            <p class="wizard-recap-unit">${formatEuro(line.lineTotal)} l'unité</p>
          </div>`;
      }
      default:
        break;
    }
    return `<div class="wizard-grid">${cards.join("")}</div>`;
  }

  function renderWizard(animate) {
    if (!wizardEl || !wizardOpen || !activeLine) return;
    if (!wizardSteps.length) wizardSteps = buildWizardSteps(activeLine);
    if (wizardStep >= wizardSteps.length) wizardStep = wizardSteps.length - 1;
    const step = wizardSteps[wizardStep];
    const line = activeLine;
    const item = getLineItem(line);

    const img = wizardEl.querySelector("#wizard-img");
    if (img) {
      const src = item.image || (item.imageKey && cfg.assets && cfg.assets.menuImages && cfg.assets.menuImages[item.imageKey]);
      if (src) {
        img.src = src;
        img.alt = line.productName;
        img.style.display = "";
      } else {
        img.style.display = "none";
      }
    }
    wizardEl.querySelector("#wizard-product").textContent = line.productName;
    wizardEl.querySelector("#wizard-variant").textContent =
      (line.variant === "menu" ? "En menu" : "Seul") + " · " + formatEuro(line.basePrice) + " de base";

    const prog = wizardEl.querySelector("#wizard-progress");
    prog.innerHTML = wizardSteps
      .map((s, i) => {
        const state = i < wizardStep ? "done" : i === wizardStep ? "current" : "todo";
        return `<li class="${state}" ${i < wizardStep ? `data-wizard-action="goto" data-step="${i}" role="button" tabindex="0"` : ""}>
                  <span class="wizard-step-dot">${i < wizardStep ? "✓" : i + 1}</span>
                  <span class="wizard-step-label">${s.label}</span>
                </li>`;
      })
      .join("");

    const v = stepValidation(step);
    wizardEl.querySelector("#wizard-title").textContent = step.title;
    const sub = wizardEl.querySelector("#wizard-subtitle");
    let subtitle = step.subtitle || "";
    if (step.id === "tacos-meats") subtitle = `Jusqu'à ${getTacosMaxMeatsForLine(line)} viande${getTacosMaxMeatsForLine(line) > 1 ? "s" : ""} pour cette taille.`;
    if (step.id === "kaps-meats") subtitle = `Jusqu'à ${getKapsaloonMaxMeatsForLine(line)} viande${getKapsaloonMaxMeatsForLine(line) > 1 ? "s" : ""}.`;
    if (step.id === "tacos-sauces" || step.id === "kaps-sauces") subtitle = `Jusqu'à ${getMaxSauces()} sauces, ou aucune.`;
    sub.textContent = subtitle;
    sub.style.display = subtitle ? "" : "none";

    const body = wizardEl.querySelector("#wizard-body");
    const options = wizardEl.querySelector("#wizard-options");
    options.innerHTML = renderWizardOptions(step);
    if (animate) {
      body.classList.remove("wizard-anim");
      void body.offsetWidth;
      body.classList.add("wizard-anim");
      body.scrollTop = 0;
    }

    const hint = wizardEl.querySelector("#wizard-hint");
    hint.textContent = v.hint;
    hint.classList.toggle("ok", v.ok);

    const qty = line.quantity > 0 ? line.quantity : 1;
    wizardEl.querySelector("#wizard-price").textContent = formatEuro((line.lineTotal || 0) * qty);

    const back = wizardEl.querySelector("#wizard-back");
    const next = wizardEl.querySelector("#wizard-next");
    back.style.visibility = wizardStep === 0 ? "hidden" : "";
    const last = wizardStep === wizardSteps.length - 1;
    next.textContent = last ? `Ajouter au ticket · ${formatEuro((line.lineTotal || 0) * qty)}` : "Suivant";
    next.classList.toggle("disabled", !v.ok);
  }

  // ==========================================================================
  // SUIVI DE COMMANDE EN DIRECT (api/orders.php) + NOTIFICATIONS
  // ==========================================================================
  const API_URL = (cfg.ordering && cfg.ordering.apiUrl) || "/api/orders.php";
  const TRACKING_POLL_MS = 10 * 1000;
  const STATUS_LABELS = {
    recue: "Reçue",
    preparation: "En préparation",
    prete: "Prête",
    en_route: "En route",
    terminee: "Terminée",
    annulee: "Annulée",
  };

  var tracking = null; // { id, token, status, eta, mode, createdAt, updatedAt }
  var trackingTimer = null;
  var pendingOrderId = null;

  function makeOrderId() {
    return "LF-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  function trackingSteps(mode) {
    return mode === "livraison"
      ? ["recue", "preparation", "en_route", "terminee"]
      : ["recue", "preparation", "prete", "terminee"];
  }

  function isTerminalStatus(s) {
    return s === "terminee" || s === "annulee";
  }

  function lineToPayload(line) {
    const qty = line.quantity > 0 ? line.quantity : 1;
    return {
      name: line.productName,
      qty,
      variant: line.variant === "menu" ? "menu" : "solo",
      details: lineDetailsForRecap(line)
        .map(([k, v]) => `${k} : ${v}`)
        .join(" · "),
      total: line.lineTotal || 0,
    };
  }

  async function createTrackedOrder(id, inputs) {
    const totals = computeTotals();
    const payload = {
      id,
      name: inputs.name,
      phone: inputs.phone,
      mode: getCurrentMode().id,
      address: orderMeta.address || "",
      time: orderMeta.time || "Dès que possible",
      message: inputs.message || "",
      lines: asArray(ticketLines).map(lineToPayload),
      subtotal: totals.subtotal,
      fee: totals.fee,
      total: totals.total,
    };
    try {
      const r = await fetch(`${API_URL}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) return null;
      const data = await r.json();
      tracking = {
        id: data.id,
        token: data.token,
        status: data.status || "recue",
        eta: null,
        mode: payload.mode,
        createdAt: data.createdAt || Math.floor(Date.now() / 1000),
        updatedAt: data.createdAt || Math.floor(Date.now() / 1000),
        history: [{ status: "recue", at: data.createdAt || Math.floor(Date.now() / 1000) }],
      };
      saveTicketState();
      renderTicketPanel();
      applyHeroActions();
      startTrackingPoll();
      return tracking;
    } catch (e) {
      return null; // API absente (ex. hébergement sans PHP) : le ticket reste utilisable
    }
  }

  function stopTrackingPoll() {
    if (trackingTimer) clearInterval(trackingTimer);
    trackingTimer = null;
  }

  function startTrackingPoll() {
    stopTrackingPoll();
    if (!tracking || isTerminalStatus(tracking.status)) return;
    pollTracking();
    trackingTimer = setInterval(() => {
      if (document.visibilityState === "visible") pollTracking();
    }, TRACKING_POLL_MS);
  }

  async function pollTracking() {
    if (!tracking) return;
    try {
      const r = await fetch(
        `${API_URL}?action=status&id=${encodeURIComponent(tracking.id)}&token=${encodeURIComponent(tracking.token)}`,
        { cache: "no-store" }
      );
      if (r.status === 404 || r.status === 403) {
        stopTrackingPoll();
        return;
      }
      if (!r.ok) return;
      const data = await r.json();
      const prev = tracking.status;
      tracking.status = data.status || prev;
      tracking.eta = data.eta || null;
      tracking.updatedAt = data.updatedAt || tracking.updatedAt;
      if (Array.isArray(data.history)) tracking.history = data.history;
      if (prev !== tracking.status) {
        saveTicketState();
        renderTicketPanel();
        applyHeroActions();
        if (tracking.status === "prete" || tracking.status === "en_route") notifyReady();
        if (tracking.status === "annulee") {
          showToast({ icon: "⚠️", type: "warning", title: "Commande annulée", message: "Le restaurant a annulé votre commande. Appelez-nous pour en savoir plus.", duration: 8000 });
        }
      } else if (tracking.eta !== (data.eta || null)) {
        renderTicketPanel();
      }
      if (isTerminalStatus(tracking.status)) stopTrackingPoll();
    } catch (e) {
      /* réseau indisponible : on réessaiera */
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && tracking && !isTerminalStatus(tracking.status)) {
      startTrackingPoll();
    }
  });

  function canNotify() {
    return "Notification" in window;
  }

  async function enableNotifications() {
    if (!canNotify()) return;
    try {
      const p = await Notification.requestPermission();
      if (p === "granted") {
        showToast({ icon: "🔔", type: "success", title: "C'est noté", message: "On te prévient dès que c'est prêt.", duration: 3000 });
      }
    } catch (e) {
      /* ignore */
    }
    renderTicketPanel();
  }

  async function notifyReady() {
    if (!tracking) return;
    const body =
      tracking.mode === "livraison"
        ? "Votre commande est en route ! 🛵"
        : "Votre commande est prête ! 🎉 Bon appétit.";
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    showToast({ icon: tracking.mode === "livraison" ? "🛵" : "🎉", type: "success", title: `Commande ${tracking.id}`, message: body, duration: 8000 });
    if (!canNotify() || Notification.permission !== "granted") return;
    const options = {
      body,
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      tag: "order-" + tracking.id,
      data: { url: "/?open=ticket" },
      vibrate: [200, 100, 200],
    };
    try {
      const reg = navigator.serviceWorker ? await navigator.serviceWorker.getRegistration() : null;
      if (reg && reg.showNotification) {
        await reg.showNotification(snackName, options);
      } else {
        new Notification(snackName, options);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function trackingHtml() {
    if (!tracking) return "";
    const steps = trackingSteps(tracking.mode);
    const status = tracking.status;
    const cancelled = status === "annulee";
    let idx = steps.indexOf(status);
    if (idx < 0) idx = cancelled ? -1 : 0;

    const bar = steps
      .map((s, i) => {
        const state = cancelled ? "off" : i < idx ? "done" : i === idx ? "current" : "todo";
        return `<li class="track-step ${state}">
                  <span class="track-dot">${state === "done" ? "✓" : ""}</span>
                  <span class="track-label">${STATUS_LABELS[s]}</span>
                </li>`;
      })
      .join("");

    let line = "";
    if (cancelled) {
      line = `<p class="track-status danger">❌ Commande annulée par le restaurant. Appelez-nous au <a href="${phoneHref}">${phoneDisplay}</a>.</p>`;
    } else if (status === "recue") {
      line = `<p class="track-status">⏳ En attente de prise en charge par l'équipe.</p>`;
    } else if (status === "preparation") {
      const eta = tracking.eta ? ` · prête vers <strong>${new Date(tracking.eta * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</strong>` : "";
      line = `<p class="track-status">👨‍🍳 En préparation${eta}</p>`;
    } else if (status === "prete") {
      line = `<p class="track-status ok">🎉 C'est prêt ! À récupérer au comptoir.</p>`;
    } else if (status === "en_route") {
      line = `<p class="track-status ok">🛵 Le livreur est en route.</p>`;
    } else if (status === "terminee") {
      line = `<p class="track-status ok">🏁 Commande terminée. Bon appétit !</p>`;
    }

    const notifBtn =
      canNotify() && Notification.permission === "default" && !isTerminalStatus(status)
        ? `<button type="button" class="track-notify" data-ticket-action="enable-notifications">🔔 Me prévenir quand c'est prêt</button>`
        : "";

    return `
      <div class="track">
        <p class="track-title">Commande <strong>n° ${tracking.id}</strong> · suivi en direct</p>
        <ol class="track-bar">${bar}</ol>
        ${line}
        ${notifBtn}
      </div>`;
  }

  // ==========================================================================
  // ACTIONS DU HERO : installer l'appli, commande en cours, recommander
  // ==========================================================================
  var deferredInstall = null;

  function getHeroActions() {
    const hero = $("#hero");
    if (!hero) return null;
    let box = $("#hero-actions");
    if (!box) {
      box = document.createElement("div");
      box.id = "hero-actions";
      box.className = "hero-actions";
      const form = hero.querySelector("#smart-search");
      if (form && form.parentNode) form.parentNode.insertBefore(box, form.nextSibling);
      else hero.appendChild(box);
    }
    return box;
  }

  function isStandalone() {
    return (
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  }

  function applyHeroActions() {
    const box = getHeroActions();
    if (!box) return;
    box.innerHTML = "";

    if (tracking && !isTerminalStatus(tracking.status)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hero-chip tracking";
      b.innerHTML = `🧾 Commande ${tracking.id} · <strong>${STATUS_LABELS[tracking.status] || tracking.status}</strong> · voir le suivi`;
      b.addEventListener("click", openStatusSheet);
      box.appendChild(b);
    }

    if (!isStandalone() && (deferredInstall || isIos())) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = "pwa-install";
      b.className = "hero-chip install";
      b.innerHTML = `📲 Installer l'appli ${snackName}`;
      b.addEventListener("click", async () => {
        if (deferredInstall) {
          deferredInstall.prompt();
          try {
            await deferredInstall.userChoice;
          } catch (e) {
            /* ignore */
          }
          deferredInstall = null;
          applyHeroActions();
        } else {
          showToast({
            icon: "📲",
            type: "info",
            title: "Sur iPhone",
            message: "Appuie sur Partager (carré avec la flèche) puis « Sur l'écran d'accueil ».",
            duration: 9000,
          });
        }
      });
      box.appendChild(b);
    }

    if (lastOrder) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = "reorder-shortcut";
      b.className = "hero-chip";
      b.innerHTML = `🔁 Recommander ma dernière commande <span class="text-slate-400 font-normal">(${describeLastOrder()})</span>`;
      b.addEventListener("click", reorderLastOrder);
      box.appendChild(b);
    }

    box.classList.toggle("hidden", !box.children.length);
  }

  function initPwa() {
    const secure =
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if ("serviceWorker" in navigator && secure) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => null);
      });
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstall = e;
      applyHeroActions();
    });
    window.addEventListener("appinstalled", () => {
      deferredInstall = null;
      applyHeroActions();
      showToast({ icon: "🎉", type: "success", title: "Appli installée", message: `${snackName} est sur ton écran d'accueil.`, duration: 4000 });
    });
  }

  // ==========================================================================
  // CONFIRMATION D'ENVOI + ÉCRAN DE SUIVI DE COMMANDE (plein écran)
  // ==========================================================================
  var confirmEl = null;
  var statusEl = null;
  var statusOpen = false;
  var lastWaRetry = null;

  function ensureConfirmSheet() {
    if (confirmEl) return;
    confirmEl = document.createElement("div");
    confirmEl.id = "send-confirm";
    confirmEl.className = "wizard hidden";
    confirmEl.innerHTML = `
      <div class="wizard-backdrop"></div>
      <div class="wizard-sheet auto" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="confirm-body">
          <p class="confirm-icon">💬</p>
          <h3 id="confirm-title" class="wizard-title">Message envoyé sur WhatsApp ?</h3>
          <p class="wizard-subtitle">Le ticket a été préparé dans WhatsApp. Il faut appuyer sur <strong>Envoyer</strong> dans WhatsApp pour que le restaurant le reçoive.</p>
          <div class="confirm-buttons">
            <button type="button" class="wizard-btn primary" data-confirm="yes">✅ Oui, c'est envoyé</button>
            <button type="button" class="wizard-btn secondary" data-confirm="retry">↩︎ Réouvrir WhatsApp</button>
            <button type="button" class="confirm-cancel" data-confirm="no">Pas encore, je reviens au ticket</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(confirmEl);
    confirmEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-confirm]");
      if (!b) return;
      const what = b.dataset.confirm;
      if (what === "yes") {
        closeConfirmSheet();
        markTicketSent();
        openStatusSheet();
      } else if (what === "retry") {
        if (typeof lastWaRetry === "function") lastWaRetry();
      } else {
        closeConfirmSheet();
      }
    });
  }

  function openConfirmSheet(retry) {
    ensureConfirmSheet();
    lastWaRetry = retry || null;
    confirmEl.classList.remove("hidden");
    document.body.classList.add("wizard-lock");
  }

  function closeConfirmSheet() {
    if (!confirmEl) return;
    confirmEl.classList.add("hidden");
    if (!wizardOpen && !statusOpen) document.body.classList.remove("wizard-lock");
  }

  function ensureStatusSheet() {
    if (statusEl) return;
    statusEl = document.createElement("div");
    statusEl.id = "order-status";
    statusEl.className = "wizard hidden";
    statusEl.innerHTML = `
      <div class="wizard-backdrop" data-status-action="close"></div>
      <div class="wizard-sheet auto" role="dialog" aria-modal="true" aria-labelledby="status-title">
        <header class="wizard-head">
          <span class="status-emoji" id="status-emoji">🧾</span>
          <div class="min-w-0 flex-1">
            <p id="status-title" class="wizard-product">Commande</p>
            <p id="status-sub" class="wizard-variant"></p>
          </div>
          <button type="button" class="wizard-close" data-status-action="close" aria-label="Fermer">×</button>
        </header>
        <div id="status-body" class="wizard-body"></div>
        <footer class="wizard-foot" id="status-foot"></footer>
      </div>`;
    document.body.appendChild(statusEl);
    statusEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-status-action]");
      if (b) {
        const a = b.dataset.statusAction;
        if (a === "close") closeStatusSheet();
        if (a === "new-order") {
          closeStatusSheet();
          startNewOrder();
        }
        if (a === "notify") enableNotifications().then(renderStatusSheet);
        if (a === "ticket") {
          closeStatusSheet();
          ensureTicketShell();
          ticketPanel.classList.remove("hidden");
          renderTicketPanel();
        }
        if (a === "refresh") {
          pollTracking().then(renderStatusSheet);
        }
      }
    });
  }

  function openStatusSheet() {
    ensureStatusSheet();
    statusOpen = true;
    statusEl.classList.remove("hidden");
    document.body.classList.add("wizard-lock");
    renderStatusSheet();
  }

  function closeStatusSheet() {
    if (!statusEl) return;
    statusOpen = false;
    statusEl.classList.add("hidden");
    if (!wizardOpen) document.body.classList.remove("wizard-lock");
  }

  function fmtTime(ts) {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function statusHeadline() {
    if (!tracking) return { emoji: "✅", title: "Commande envoyée", sub: "Le restaurant vous rappelle pour confirmer." };
    const s = tracking.status;
    const mode = getCurrentMode();
    switch (s) {
      case "recue":
        return { emoji: "⏳", title: `Commande n° ${tracking.id}`, sub: "Reçue, en attente de prise en charge." };
      case "preparation":
        return { emoji: "👨‍🍳", title: `Commande n° ${tracking.id}`, sub: tracking.eta ? `En préparation · prête vers ${fmtTime(tracking.eta)}` : "En préparation." };
      case "prete":
        return { emoji: "🎉", title: "C'est prêt !", sub: mode.id === "sur-place" ? "À récupérer au comptoir." : "Venez la récupérer au comptoir." };
      case "en_route":
        return { emoji: "🛵", title: "En route !", sub: "Le livreur arrive." };
      case "terminee":
        return { emoji: "🏁", title: "Bon appétit !", sub: `Commande n° ${tracking.id} terminée.` };
      case "annulee":
        return { emoji: "❌", title: "Commande annulée", sub: "Le restaurant a annulé cette commande." };
      default:
        return { emoji: "🧾", title: `Commande n° ${tracking.id}`, sub: "" };
    }
  }

  function renderStatusSheet() {
    if (!statusEl || !statusOpen) return;
    const head = statusHeadline();
    statusEl.querySelector("#status-emoji").textContent = head.emoji;
    statusEl.querySelector("#status-title").textContent = head.title;
    statusEl.querySelector("#status-sub").textContent = head.sub;

    const body = statusEl.querySelector("#status-body");
    const mode = getCurrentMode();
    const lines = asArray(ticketLines);
    const totals = computeTotals();
    const reviewUrl = getReviewUrl();

    let timeline = "";
    if (tracking) {
      const steps = trackingSteps(tracking.mode);
      const cancelled = tracking.status === "annulee";
      let idx = steps.indexOf(tracking.status);
      if (idx < 0) idx = cancelled ? -1 : 0;
      const history = asArray(tracking.history);
      const timeOf = (st) => {
        const h = history.filter((x) => x.status === st).pop();
        return h ? fmtTime(h.at) : "";
      };
      timeline = `
        <ol class="timeline ${cancelled ? "cancelled" : ""}">
          ${steps
            .map((st, i) => {
              const state = cancelled ? "off" : i < idx ? "done" : i === idx ? "current" : "todo";
              let extra = "";
              if (st === "preparation" && state === "current" && tracking.eta) extra = `prête vers ${fmtTime(tracking.eta)}`;
              const t = state === "todo" || state === "off" ? "" : timeOf(st) || (i === 0 ? fmtTime(tracking.createdAt) : "");
              return `<li class="${state}">
                        <span class="tl-dot">${state === "done" ? "✓" : state === "current" ? "" : ""}</span>
                        <span class="tl-text"><span class="tl-label">${STATUS_LABELS[st]}</span>${extra ? `<span class="tl-extra">${extra}</span>` : ""}</span>
                        <span class="tl-time">${t}</span>
                      </li>`;
            })
            .join("")}
        </ol>
        ${cancelled ? `<p class="track-status danger">Appelez-nous au <a href="${phoneHref}">${phoneDisplay}</a> pour en savoir plus.</p>` : ""}
        ${
          canNotify() && Notification.permission === "default" && !isTerminalStatus(tracking.status)
            ? `<button type="button" class="track-notify" data-status-action="notify">🔔 Me prévenir quand c'est prêt</button>`
            : ""
        }
        <p class="status-refresh">Mise à jour automatique · <button type="button" data-status-action="refresh">actualiser</button></p>`;
    } else {
      timeline = `<p class="wizard-subtitle">Le suivi en direct n'est pas disponible pour cette commande. L'équipe vous rappelle pour confirmer.</p>`;
    }

    const summary = `
      <div class="status-summary">
        <div class="status-row"><span>${mode.icon || ""} ${mode.label}${totals.isDelivery && orderMeta.address ? ` · ${orderMeta.address}` : ""}</span></div>
        <div class="status-row"><span>🕒 ${orderMeta.time || "Dès que possible"}</span></div>
        ${
          lines.length
            ? `<ul class="status-lines">${lines
                .map((l) => `<li><span>${l.quantity > 1 ? l.quantity + " × " : ""}${l.productName}${l.variant === "menu" ? " (menu)" : ""}</span><span>${formatEuro(l.lineTotal)}</span></li>`)
                .join("")}</ul>
               <div class="status-total"><span>Total${totals.fee ? " (livraison incluse)" : ""}</span><span>${formatEuro(totals.total)}</span></div>`
            : ""
        }
      </div>`;

    body.innerHTML = timeline + summary;

    const foot = statusEl.querySelector("#status-foot");
    const done = !tracking || isTerminalStatus(tracking.status) || tracking.status === "prete";
    foot.innerHTML = `
      <div class="status-actions">
        ${done && reviewUrl && tracking && tracking.status !== "annulee" ? `<a class="wizard-btn secondary" href="${reviewUrl}" target="_blank" rel="noopener">⭐ Laisser un avis Google</a>` : ""}
        <a class="wizard-btn secondary" href="${phoneHref}">📞 Appeler</a>
        <button type="button" class="wizard-btn ${done ? "primary" : "secondary"}" data-status-action="new-order">🧾 Nouvelle commande</button>
      </div>`;
  }

  // ==========================================================================
  // PARTAGE DU TICKET
  // ==========================================================================

  function prepareTicketMessage() {
    if (!ticketPanel) return null;

    const nameInput = ticketPanel.querySelector("#ticket-name");
    const phoneInput = ticketPanel.querySelector("#ticket-phone");
    const msgInput = ticketPanel.querySelector("#ticket-message");

    if (!nameInput || !phoneInput || !msgInput) {
      return null;
    }

    const name = (nameInput.value || "").trim();
    const phone = (phoneInput.value || "").trim();

    nameInput.classList.remove("ring-2", "ring-red-400");
    phoneInput.classList.remove("ring-2", "ring-red-400");

    if (!name || !phone) {
      if (!name) {
        nameInput.classList.add("ring-2", "ring-red-400");
      }
      if (!phone) {
        phoneInput.classList.add("ring-2", "ring-red-400");
      }
      return null;
    }

    const safeLines = asArray(ticketLines);

    if (!safeLines.length) {
      alert("Ajoutez au moins un produit dans le ticket.");
      return null;
    }

    const mode = getCurrentMode();
    const totals = computeTotals();
    const addressInput = ticketPanel.querySelector("#ticket-address");
    if (addressInput) addressInput.classList.remove("ring-2", "ring-red-400");

    if (totals.isDelivery) {
      const address = addressInput ? addressInput.value.trim() : "";
      if (!address) {
        if (addressInput) {
          addressInput.classList.add("ring-2", "ring-red-400");
          addressInput.focus();
        }
        return null;
      }
      orderMeta.address = address;
      if (totals.belowMinimum) {
        alert(
          `Minimum ${formatEuro(totals.minimumOrder)} pour la livraison : il manque ${formatEuro(totals.missing)}.`
        );
        return null;
      }
    }

    const total = totals.total;

    const linesText = safeLines
      .map((line) => {
        const variantLabel = line.variant === "menu" ? "menu" : "seul";
        const supplements = asArray(line.supplements);
        const removedIngredients = asArray(line.removedIngredients);

        const qty = line.quantity && line.quantity > 0 ? line.quantity : 1;

        const categoryLabel = line.categoryId
          ? line.categoryId.charAt(0).toUpperCase() + line.categoryId.slice(1)
          : "Produit";

        const parts = [
          qty > 1
            ? `- [${categoryLabel}] ${line.productName} (${variantLabel}) x${qty}`
            : `- [${categoryLabel}] ${line.productName} (${variantLabel})`,
        ];

        if (line.categoryId === "tacos") {
          const base = getTacosBaseForLine(line);
          if (base && base.label) parts.push(`*TAILLE :* ${base.label}`);
          const meats = asArray(line.tacosMeats);
          if (meats.length) parts.push(`*VIANDES :* ${meats.join(", ")}`);
          const sauces = asArray(line.tacosSauces);
          if (sauces.length) parts.push(`*SAUCES :* ${sauces.join(", ")}`);
          const veggies = asArray(line.tacosVeggies);
          if (veggies.length) parts.push(`*CRUDITÉS :* ${veggies.join(", ")}`);
        }

        if (line.categoryId === "kapsaloon") {
          const base = getKapsaloonBaseForLine(line);
          if (base && base.label) parts.push(`*TAILLE :* ${base.label}`);
          const meats = asArray(line.kapsaloonMeats);
          if (meats.length) parts.push(`*VIANDES :* ${meats.join(", ")}`);
          const sauces = asArray(line.kapsaloonSauces);
          if (sauces.length) parts.push(`*SAUCES :* ${sauces.join(", ")}`);
        }

        const sauceCategories = [
          "burgers",
          "sandwichs",
          "paninis",
          "signatures",
          "galettes",
        ];

        if (sauceCategories.includes(line.categoryId) && line.mainSauce) {
          const sauces = Array.isArray(line.mainSauce)
            ? line.mainSauce
            : [line.mainSauce];

          if (sauces.length === 1) {
            parts.push(`*SAUCE :* ${sauces[0]}`);
          } else if (sauces.length > 1) {
            parts.push(`*SAUCES :* ${sauces.join(", ")}`);
          }
        }

        if (supplements.length && cfg.supplements?.catalog) {
          const names = supplements
            .map((id) => cfg.supplements.catalog[id]?.name)
            .filter(Boolean);
          if (names.length) {
            parts.push(`*SUPPLÉMENTS :* ${names.join(", ")}`);
          }
        }

        if (removedIngredients.length) {
          parts.push(`*SANS :* ${removedIngredients.join(", ")}`);
        }

        if (line.categoryId === "menu-enfant" && line.kidsChoice) {
          const kidsOpts = asArray(getLineItem(line).kidsOptions);
          const opt = kidsOpts.find((o) => o.id === line.kidsChoice);
          parts.push(`*PLAT ENFANT :* ${opt ? opt.name : line.kidsChoice}`);
        }

        if (line.variant === "menu" && line.drinkChoice) {
          const drink = getMenuDrinks().find((d) => d.id === line.drinkChoice);
          const drinkName = (drink && drink.name) || line.drinkChoice;
          parts.push(`*BOISSON :* ${drinkName} (incluse)`);
        }

        parts.push(`= ${(line.lineTotal || 0).toFixed(2)} €`);

        return parts.join(" | ");
      })
      .join("\n");

    const extra = (msgInput.value || "").trim();

    pendingOrderId = makeOrderId();
    const headerLines = [
      `Commande ${snackName} – ${name} (${phone})`,
      `N° ${pendingOrderId}`,
      `${mode.icon ? mode.icon + " " : ""}${mode.label}${
        totals.isDelivery && orderMeta.address ? ` – ${orderMeta.address}` : ""
      }`,
      `🕒 ${orderMeta.time ? orderMeta.time : "Dès que possible"}`,
    ];

    const totalLines = [];
    if (totals.isDelivery && typeof getDeliveryCfg().fee === "number") {
      totalLines.push(`Sous-total : ${totals.subtotal.toFixed(2)} €`);
      totalLines.push(
        `Frais de livraison : ${totals.fee > 0 ? totals.fee.toFixed(2) + " €" : "offerts"}`
      );
    }
    totalLines.push(`Total : ${total.toFixed(2)} €`);

    const txt =
      `${headerLines.join("\n")}\n\n` +
      `${linesText}\n\n` +
      totalLines.join("\n") +
      (extra ? `\n\nMessage : ${extra}` : "");

    const encoded = encodeURIComponent(txt);

    return { txt, encoded };
  }

  function shareTicket() {
    const payload = prepareTicketMessage();
    if (!payload) return;

    const { txt, encoded } = payload;

    const openGeneric = () => window.open(`https://wa.me/?text=${encoded}`, "_blank");
    if (navigator.share) {
      navigator
        .share({
          title: "Ticket commande",
          text: txt,
        })
        .then(() => openConfirmSheet(openGeneric))
        .catch(() => {
          openGeneric();
          openConfirmSheet(openGeneric);
        });
    } else {
      openGeneric();
      openConfirmSheet(openGeneric);
    }
  }

  function shareTicketToRestaurant() {
    const payload = prepareTicketMessage();
    if (!payload) return;

    const { encoded } = payload;

    const waNumber =
      cfg.contact?.allowWhatsAppOrders && cfg.contact?.whatsappOrdersNumber
        ? cfg.contact.whatsappOrdersNumber
        : null;

    if (!waNumber) {
      alert(
        "Ce restaurant n'a pas activé la réception des commandes par WhatsApp."
      );
      return;
    }

    const waUrl = `https://wa.me/${waNumber}?text=${encoded}`;
    const openWa = () => window.open(waUrl, "_blank");
    openWa();
    openConfirmSheet(openWa);
  }

  window.openTicketBuilder = openTicketBuilder;

  // ==========================================================================
  // UTILITAIRES
  // ==========================================================================

  function isRemovableIngredient(name = "") {
    const k = (name || "").toLowerCase();

    const protectedKeywords = [
      "viande",
      "steak",
      "kebab",
      "tenders",
      "nugget",
      "cordon",
      "escalope",
      "merguez",
      "fish",
      "poisson",
      "burger",
      "chicken",
      "kefta",
      "mexicanos",
      "brochette",
      "wings",
    ];

    return !protectedKeywords.some((word) => k.includes(word));
  }

  function pickIcon(id = "", label = "") {
    const k = (id || label || "").toLowerCase();

    if (k.includes("burger")) return "🍔";
    if (k.includes("tacos")) return "🌯";
    if (k.includes("kapsaloon") || k.includes("kapsalon")) return "🍟";
    if (k.includes("wrap")) return "🌯";
    if (k.includes("galette")) return "🫓";
    if (k.includes("pita") || k.includes("panini")) return "🥙";
    if (k.includes("assiette") || k.includes("plate")) return "🍽️";
    if (k.includes("menu-enfant") || k.includes("kid")) return "🍭";
    if (k.includes("dessert") || k.includes("sucré")) return "🍰";
    if (k.includes("boisson") || k.includes("drink") || k.includes("soda"))
      return "🥤";
    if (k.includes("texmex") || k.includes("tex-mex")) return "🍟";
    if (k.includes("frites") || k.includes("frite")) return "🍟";
    if (k.includes("salade") || k.includes("salad")) return "🥗";
    if (k.includes("pizza")) return "🍕";
    if (k.includes("poulet") || k.includes("chicken") || k.includes("wings"))
      return "🍗";
    if (k.includes("hot dog") || k.includes("hot-dog")) return "🌭";
    if (k.includes("snack") || k.includes("snacking")) return "🍽️";

    return "🍽️";
  }

  function fillSocialIcons(container, socialCfg, variant) {
    if (!container || !socialCfg) return;

    const map = [
      ["instagram", socialCfg.instagram],
      ["facebook", socialCfg.facebook],
      ["tiktok", socialCfg.tiktok],
      ["snapchat", socialCfg.snapchat || socialCfg.snap],
    ];

    map.forEach(([type, href]) => {
      if (!href) return;
      container.appendChild(createSocialIcon(type, href, variant));
    });
  }

  function createSocialIcon(type, href, variant) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";

    if (variant === "drawer") {
      a.className =
        "p-2 rounded-lg bg-white text-slate-900 inline-flex items-center justify-center";
    } else {
      a.className =
        "inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-slate-900 shadow";
    }

    let svg = "";
    if (type === "instagram") {
      svg = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
        </svg>
      `;
    } else if (type === "facebook") {
      svg = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.6v-3h2.6V9.5c0-2.6 1.6-4.1 4-4.1 1.2 0 2.4.2 2.4.2v2.7h-1.4c-1.3 0-1.7.8-1.7 1.6V12h3l-.5 3h-2.5v7A10 10 0 0 0 22 12z"/>
        </svg>
      `;
    } else if (type === "tiktok") {
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13 2h3c.2 1.9 1.6 3.4 3.5 3.7V9c-1.4.1-2.8-.3-3.9-1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1V7.2A8 8 0 0 0 9.5 7 5.5 5.5 0 0 0 4 12.5 5.5 5.5 0 0 0 9.5 18 5.5 5.5 0 0 0 15 12.5V2z"/>
        </svg>
      `;
    } else if (type === "snapchat") {
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2c2.5 0 4.5 1.8 4.7 4.2.1 1 .2 2 .4 3 0 0 .2 1.2 1.6 1.7.4.2.9.3 1.2.4.3.1.5.3.5.6 0 .3-.2.6-.5.8-.7.5-1.5.9-2.4 1 0 0 .3 1 .3 1.8 0 .4-.3.7-.7.7-.9 0-1.7-.4-2.5-.8-.8-.4-1.5-.8-2.3-.8s-1.5.4-2.3.8c-.8.4-1.6.8-2.5.8-.4 0-.7-.3-.7-.7 0-.8.3-1.8.3-1.8-.9-.1-1.7-.5-2.4-1-.3-.2-.5-.5-.5-.8 0-.3.2-.5.5-.6.4-.1.8-.2 1.2-.4 1.4-.5 1.6-1.7 1.6-1.7.2-1 .3-2 .4-3C7.5 3.8 9.5 2 12 2z"/>
        </svg>
      `;
    } else {
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
        </svg>
      `;
    }

    a.innerHTML = svg;
    return a;
  }

  function getPlatformMeta(p) {
    const id = (p.id || p.name || "").toLowerCase();

    let accent = p.accentColor || "#111827";
    let text = p.textColor || "#ffffff";
    let label = p.name || "";
    let svg = "";

    if (id.includes("uber")) {
      accent = p.accentColor || "#000000";
      text = p.textColor || "#22c55e";
      label = p.name || "Uber Eats";
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      `;
    } else if (id.includes("deliveroo")) {
      accent = p.accentColor || "#00CCBC";
      text = p.textColor || "#ffffff";
      label = p.name || "Deliveroo";
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="3"></rect>
        </svg>
      `;
    } else if (id.includes("justeat") || id.includes("just-eat")) {
      accent = p.accentColor || "#ff5a1f";
      text = p.textColor || "#ffffff";
      label = p.name || "Just Eat";
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 20L10 4h4l6 16z"></path>
        </svg>
      `;
    } else if (id.includes("deliver") && !id.includes("deliveroo")) {
      accent = p.accentColor || "#0f766e";
      text = p.textColor || "#ffffff";
      label = p.name || "Livraison";
      svg = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 7h13l5 5-5 5H3z"></path>
        </svg>
      `;
    }

    return { accent, text, label, svg };
  }

  function createPlatformCardDrawer(p) {
    const meta = getPlatformMeta(p);
    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className =
      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm";
    a.style.backgroundColor = meta.accent;
    a.style.color = meta.text;

    a.innerHTML = `
      ${meta.svg}
      <span>${meta.label}</span>
    `;
    return a;
  }

  function createPlatformItemFooter(p) {
    const meta = getPlatformMeta(p);
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "hover:text-slate-900 flex items-center gap-1";

    a.innerHTML = `
      ${meta.svg}
      <span>${meta.label}</span>
    `;

    li.appendChild(a);
    return li;
  }

  function createPlatformCardMain(p) {
    const meta = getPlatformMeta(p);

    const a = document.createElement("a");
    a.href = p.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "block rounded-3xl overflow-hidden elev bg-white";

    a.innerHTML = `
      <div class="px-6 py-6 flex items-center justify-between"
           style="background:${meta.accent};color:${meta.text}">
        <div class="flex items-center gap-3 text-xl font-semibold">
          ${meta.svg}
          <span>${meta.label}</span>
        </div>
      </div>
      <div class="px-6 py-4 text-sm text-slate-600">
        Commandez via ${meta.label}
      </div>
    `;

    return a;
  }

  function capitalize(str = "") {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function hexToRgba(hex, alpha = 1) {
    let h = (hex || "").replace("#", "");
    if (!h) return `rgba(0,0,0,${alpha})`;
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  // ==========================================================================
  // ONBOARDING POP-UP (PREMIÈRE VISITE)
  // ==========================================================================

  function openOnboardingPopup() {
    const popup = document.getElementById("onboarding-popup");
    const overlay = document.getElementById("onboarding-overlay");
    const modal = document.getElementById("onboarding-modal");

    if (!popup || !overlay || !modal) return;

    // Afficher la pop-up
    popup.classList.remove("hidden");
    popup.classList.add("flex");

    // Empêcher le scroll
    document.body.style.overflow = "hidden";

    // Remplacer le nom de la marque dynamiquement
    const brandNameElement = document.getElementById("onboarding-brand-name");
    if (brandNameElement && cfg.name) {
      brandNameElement.textContent = cfg.name;
    }

    // Animation fade in
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.classList.add("opacity-100");

      modal.classList.remove("opacity-0", "scale-95");
      modal.classList.add("opacity-100", "scale-100");
    });
  }

  function closeOnboardingPopup() {
    const popup = document.getElementById("onboarding-popup");
    const overlay = document.getElementById("onboarding-overlay");
    const modal = document.getElementById("onboarding-modal");

    if (!popup || !overlay || !modal) return;

    // Animation fade out
    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0");

    modal.classList.remove("opacity-100", "scale-100");
    modal.classList.add("opacity-0", "scale-95");

    // Attendre la fin de l'animation avant de masquer
    setTimeout(() => {
      popup.classList.remove("flex");
      popup.classList.add("hidden");
      document.body.style.overflow = "";
    }, 300);
  }

  // Initialiser la pop-up au chargement
  function initOnboarding() {
    const STORAGE_KEY = "snackapp_onboarding_seen";

    // Afficher le popup à chaque visite (pas seulement la première fois)
    setTimeout(() => {
      openOnboardingPopup();
    }, 500);

    // Bouton "OK, j'ai compris"
    const okBtn = document.getElementById("onboarding-ok");
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, "true");
        closeOnboardingPopup();
      });
    }

    // Bouton "Ne plus afficher"
    const neverBtn = document.getElementById("onboarding-never");
    if (neverBtn) {
      neverBtn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, "true");
        closeOnboardingPopup();
      });
    }

    // Fermer en cliquant sur l'overlay
    const overlay = document.getElementById("onboarding-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, "true");
        closeOnboardingPopup();
      });
    }
  }

  // ==========================================================================
  // SYSTÈME DE TOASTS / NOTIFICATIONS
  // ==========================================================================

  function showToast(options) {
    const {
      title = "",
      message = "",
      icon = "🎉",
      type = "info", // success, info, warning, error
      duration = 4000
    } = options;

    const container = document.getElementById("toast-container");
    if (!container) return;

    // Créer le toast
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ""}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Fermer">✕</button>
    `;

    // Ajouter au conteneur
    container.appendChild(toast);

    // Bouton fermer
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
      removeToast(toast);
    });

    // Auto-fermer après duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast);
      }, duration);
    }

    return toast;
  }

  function removeToast(toast) {
    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // ==========================================================================
  // BANDEAU DYNAMIQUE
  // ==========================================================================

  function updateBanner(state = "default") {
    const banner = document.getElementById("info-banner");
    const bannerText = document.getElementById("banner-text");

    if (!banner || !bannerText) return;

    const messages = {
      default: "Cliquez sur un produit pour le personnaliser et créer votre ticket.",
      added: "✅ Continuez vos choix ou envoyez votre ticket.",
      empty: "🛒 Votre ticket est vide, ajoutez des produits !"
    };

    bannerText.textContent = messages[state] || messages.default;

    // Animation subtile de changement
    banner.style.transform = "scale(1.02)";
    setTimeout(() => {
      banner.style.transform = "scale(1)";
    }, 200);
  }

  // ==========================================================================
  // DÉTECTION PREMIER AJOUT AU PANIER
  // ==========================================================================

 /* function initFirstAddDetection() {
    const FIRST_ADD_KEY = "snackapp_first_add_seen";

    // Observer les ajouts au panier (via mutation observer ou événements personnalisés)
    // Pour l'instant, on va hooker la fonction openTicketBuilder si elle existe

    if (typeof window.openTicketBuilder === "function") {
      const originalFunction = window.openTicketBuilder;

      window.openTicketBuilder = function(...args) {
        // Appeler la fonction originale
        const result = originalFunction.apply(this, args);

        // Vérifier si c'est le premier ajout
        if (!localStorage.getItem(FIRST_ADD_KEY)) {
          setTimeout(() => {
            showToast({
              title: "Produit ajouté !",
              message: "Votre ticket se construit automatiquement sans erreur.",
              icon: "🎉",
              type: "success",
              duration: 5000
            });

            localStorage.setItem(FIRST_ADD_KEY, "true");
            updateBanner("added");
          }, 500);
        } else {
          // Si ce n'est pas le premier, on met quand même à jour le bandeau
          updateBanner("added");
        }

        return result;
      };
    }
  }
  */

  // ==========================================================================
  // DÉTECTION ENVOI WHATSAPP
  // ==========================================================================

  function initWhatsAppDetection() {
    // Observer les clics sur les boutons WhatsApp
    document.addEventListener("click", (e) => {
      const target = e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]');

      if (target) {
        setTimeout(() => {
          showToast({
            title: "Ticket envoyé !",
            message: "Merci pour votre commande. Nous la préparerons avec soin.",
            icon: "📲",
            type: "success",
            duration: 6000
          });
        }, 500);
      }
    });
  }

  // ==========================================================================
  // INITIALISATION COMPLÈTE
  // ==========================================================================

  function initEnhancedFeatures() {
    // Initialiser toutes les fonctionnalités améliorées
    initWhatsAppDetection();

    // Vérifier périodiquement si le panier est vide
    setInterval(() => {
      // Cette logique dépend de votre implémentation du panier
      // Pour l'instant, on la laisse comme exemple
      const ticketItems = document.querySelectorAll("[data-ticket-item]");
      if (ticketItems.length === 0) {
        const banner = document.getElementById("info-banner");
        const bannerText = document.getElementById("banner-text");
        if (banner && bannerText && bannerText.textContent.includes("Continuez")) {
          updateBanner("empty");
        }
      }
    }, 3000);
  }

  // Appeler initOnboarding après le chargement du DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initOnboarding();
      initEnhancedFeatures();
    });
  } else {
    initOnboarding();
    initEnhancedFeatures();
  }
})();
