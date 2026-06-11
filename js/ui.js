/* =========================================================================
   RPM Móviles — UI compartida (home + fichas de vehículo)
   Depende de: config.js (CONFIG, formatPrice...) y data.js (VEHICLES)
   Expone window.RPM con helpers reutilizables y arranca la UI común:
     - Header / menú mobile
     - Delegación de clicks de WhatsApp (general / por auto / visita)
     - Datos de contacto del footer + métricas
     - Galería (fichas)
     - Toast, reveal on scroll
     - Tracking (dataLayer / GTM-ready) para medir conversiones
   ========================================================================= */
(function () {
  "use strict";

  const PLACEHOLDER_IMG = "/assets/placeholder-car.svg";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- WhatsApp ---------- */
  function waLink(message) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  function openWhatsApp(message, meta) {
    track("whatsapp_click", meta || {});
    window.open(waLink(message), "_blank", "noopener");
  }

  /* ---------- Medición de conversiones (GTM / GA4 ready) ----------
     Cada evento se empuja a dataLayer. Para activar analítica real, instalar
     Google Tag Manager / GA4 y mapear estos eventos como conversiones. */
  function track(event, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event }, params || {}));
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(text) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }

  /* ---------- Header / menú mobile ---------- */
  function initHeader() {
    const burger = $("#burger");
    const menu = $("#mobileMenu");
    if (!burger || !menu) return;
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    $$("a", menu).forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Datos de contacto (footer) + métricas ---------- */
  function initContactData() {
    const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

    const addr = $("#footAddress"); if (addr) { addr.textContent = CONFIG.address; addr.href = CONFIG.mapsUrl; }
    const phone = $("#footPhone");
    if (phone) { phone.textContent = CONFIG.phone; phone.href = `tel:${CONFIG.phone.replace(/[^\d+]/g, "")}`; }
    const email = $("#footEmail");
    if (email) { email.textContent = CONFIG.email; email.href = `mailto:${CONFIG.email}`; }
    const hours = $("#footHours");
    if (hours) hours.textContent = CONFIG.hours.map((h) => `${h.day}: ${h.time}`).join(" · ");
    const ig = $("#footInstagram");
    if (ig) { ig.href = CONFIG.instagram; ig.textContent = CONFIG.instagramHandle; }

    const stats = $("#stats");
    if (stats) {
      stats.innerHTML = `
        <div class="stat"><div class="stat__num">${CONFIG.clientsCount}</div><div class="stat__label">Clientes satisfechos</div></div>
        <div class="stat"><div class="stat__num">${CONFIG.yearsInMarket}</div><div class="stat__label">Años de experiencia</div></div>
        <div class="stat"><div class="stat__num">100%</div><div class="stat__label">Autos verificados</div></div>
        <div class="stat"><div class="stat__num">24h</div><div class="stat__label">Respuesta promedio</div></div>`;
    }
  }

  /* ---------- Galería (ficha de vehículo) ---------- */
  function initGallery() {
    const main = $("#galleryMain");
    if (!main) return;
    $$("[data-thumb]").forEach((t) =>
      t.addEventListener("click", () => {
        main.src = t.dataset.thumb;
        $$("[data-thumb]").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
  }

  /* ---------- Delegación global de WhatsApp ---------- */
  function bindWhatsApp() {
    document.addEventListener("click", (e) => {
      const wa = e.target.closest("[data-wa]");
      if (wa) {
        e.preventDefault();
        openWhatsApp(CONFIG.waMessages[wa.dataset.wa] || CONFIG.waMessages.general, { source: wa.dataset.wa || "general" });
        return;
      }
      const carWa = e.target.closest("[data-car-wa]");
      if (carWa) {
        e.preventDefault();
        const v = VEHICLES.find((x) => x.id === carWa.dataset.carWa);
        if (v) openWhatsApp(CONFIG.waMessages.car(v), { source: "vehiculo", vehicle_id: v.id, value: v.precio });
        return;
      }
      const visit = e.target.closest("[data-visit]");
      if (visit) {
        e.preventDefault();
        const v = VEHICLES.find((x) => x.id === visit.dataset.visit);
        if (v) openWhatsApp(CONFIG.waMessages.visit(v), { source: "visita", vehicle_id: v.id });
        return;
      }
      const share = e.target.closest("[data-share]");
      if (share) {
        e.preventDefault();
        const url = location.href;
        const title = document.title;
        track("share_click", { url });
        if (navigator.share) {
          navigator.share({ title, url }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => showToast("🔗 Enlace copiado al portapapeles"));
        }
        return;
      }
    });
  }

  function init() {
    initHeader();
    initContactData();
    initGallery();
    bindWhatsApp();
    observeReveals();
  }

  // API pública para los demás scripts
  window.RPM = { openWhatsApp, waLink, showToast, track, observeReveals, PLACEHOLDER_IMG, $, $$ };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
