/* =========================================================================
   RPM Móviles — Lógica de la aplicación
   Depende de: config.js (CONFIG, formatPrice, formatKm) y data.js (VEHICLES)
   Responsabilidades:
     - Render del catálogo + filtros + orden
     - Buscador rápido del hero
     - Modal de detalle con galería
     - Formularios → WhatsApp (hook para CRM)
     - Header mobile, FAQ, tabs "cómo funciona", datos de contacto, reveal
   ========================================================================= */
(function () {
  "use strict";

  const PLACEHOLDER_IMG = "assets/placeholder-car.svg";
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Utilidades WhatsApp ---------- */
  function waLink(message) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  function openWhatsApp(message) {
    window.open(waLink(message), "_blank", "noopener");
  }

  /* Hook opcional para integrar con un CRM.
     Reemplazar el cuerpo por un fetch() a tu endpoint cuando esté disponible. */
  function sendToCRM(payload) {
    // Ejemplo:
    // fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    console.info("[CRM lead]", payload);
  }

  /* ---------- Estado de filtros ---------- */
  const state = {
    marca: "", modelo: "", tipo: "",
    anioMin: "", anioMax: "", kmMax: "",
    precioMin: "", precioMax: "", soloFin: false,
    sort: "relevancia",
  };

  /* =====================================================================
     1. POBLAR SELECTS dinámicamente desde los datos
     ===================================================================== */
  function uniqueSorted(key, numericDesc) {
    const set = [...new Set(VEHICLES.map((v) => v[key]))];
    return numericDesc ? set.sort((a, b) => b - a) : set.sort();
  }

  function fillSelect(el, values, { placeholder } = {}) {
    if (!el) return;
    const first = placeholder != null ? `<option value="">${placeholder}</option>` : "";
    el.innerHTML = first + values.map((v) => `<option value="${v}">${v}</option>`).join("");
  }

  function populateSelectors() {
    const marcas = uniqueSorted("marca");
    const tipos  = uniqueSorted("tipo");
    const anios  = uniqueSorted("anio", true);

    // Hero
    fillSelect($("#qs-marca"), marcas, { placeholder: "Todas" });
    fillSelect($("#qs-anio"),  anios,  { placeholder: "Cualquiera" });
    // Filtros
    fillSelect($("#f-marca"), marcas, { placeholder: "Todas" });
    fillSelect($("#f-tipo"),  tipos,  { placeholder: "Todos" });
    fillSelect($("#f-anio-min"), anios, { placeholder: "Desde" });
    fillSelect($("#f-anio-max"), anios, { placeholder: "Hasta" });
  }

  /* =====================================================================
     2. FILTRAR + ORDENAR
     ===================================================================== */
  function applyFilters() {
    let list = VEHICLES.filter((v) => {
      if (state.marca && v.marca !== state.marca) return false;
      if (state.tipo && v.tipo !== state.tipo) return false;
      if (state.modelo && !`${v.marca} ${v.modelo}`.toLowerCase().includes(state.modelo.toLowerCase())) return false;
      if (state.anioMin && v.anio < +state.anioMin) return false;
      if (state.anioMax && v.anio > +state.anioMax) return false;
      if (state.kmMax && v.km > +state.kmMax) return false;
      if (state.precioMin && v.precio < +state.precioMin) return false;
      if (state.precioMax && v.precio > +state.precioMax) return false;
      if (state.soloFin && !v.financiacion) return false;
      return true;
    });

    switch (state.sort) {
      case "precio-asc":  list.sort((a, b) => a.precio - b.precio); break;
      case "precio-desc": list.sort((a, b) => b.precio - a.precio); break;
      case "anio-desc":   list.sort((a, b) => b.anio - a.anio); break;
      case "km-asc":      list.sort((a, b) => a.km - b.km); break;
      default:            list.sort((a, b) => (b.destacado === true) - (a.destacado === true));
    }
    return list;
  }

  /* =====================================================================
     3. RENDER de cards
     ===================================================================== */
  function carImage(v) {
    return v.imagenes && v.imagenes.length ? v.imagenes[0] : PLACEHOLDER_IMG;
  }

  function cardTemplate(v) {
    return `
      <article class="card reveal">
        <div class="card__media">
          ${v.destacado ? '<span class="badge">Destacado</span>' : ""}
          ${v.financiacion ? '<span class="badge badge--fin">Financiación</span>' : ""}
          <img src="${carImage(v)}" alt="${v.marca} ${v.modelo} ${v.anio}" loading="lazy"
               onerror="this.src='${PLACEHOLDER_IMG}'" />
        </div>
        <div class="card__body">
          <h3 class="card__title">${v.marca} ${v.modelo}</h3>
          <div class="card__meta">
            <span>📅 ${v.anio}</span>
            <span>🛣️ ${formatKm(v.km)}</span>
            <span>⚙️ ${v.transmision}</span>
          </div>
          <div class="card__price">${formatPrice(v.precio)}</div>
          <div class="card__state">● ${v.estado}</div>
          <div class="card__actions">
            <button class="btn btn--ghost btn--sm" data-detail="${v.id}">Ver detalle</button>
            <button class="btn btn--wa btn--sm" data-car-wa="${v.id}">Consultar</button>
          </div>
        </div>
      </article>`;
  }

  function renderCatalog() {
    const list = applyFilters();
    const cards = $("#cards");
    const count = $("#resultCount");

    if (!list.length) {
      cards.innerHTML = `<div class="empty">
        <p>😕 No encontramos autos con esos filtros.</p>
        <button class="btn btn--primary btn--sm" id="emptyReset" style="margin-top:12px">Limpiar filtros</button>
      </div>`;
      count.innerHTML = `0 autos <span>encontrados</span>`;
      $("#emptyReset").addEventListener("click", resetFilters);
      return;
    }

    cards.innerHTML = list.map(cardTemplate).join("");
    count.innerHTML = `${list.length} ${list.length === 1 ? "auto" : "autos"} <span>disponibles</span>`;
    observeReveals();
  }

  /* =====================================================================
     4. MODAL DE DETALLE
     ===================================================================== */
  const modal = $("#modal");

  function specRow(label, value) {
    return `<div class="spec"><div class="spec__label">${label}</div><div class="spec__value">${value}</div></div>`;
  }

  function openDetail(id) {
    const v = VEHICLES.find((x) => x.id === id);
    if (!v) return;

    const imgs = v.imagenes && v.imagenes.length ? v.imagenes : [PLACEHOLDER_IMG];
    const thumbs = imgs.map((src, i) =>
      `<img src="${src}" alt="Vista ${i + 1}" class="${i === 0 ? "active" : ""}"
            data-thumb="${src}" onerror="this.src='${PLACEHOLDER_IMG}'" />`).join("");

    $("#modalDialog").innerHTML = `
      <button class="modal__close" data-close aria-label="Cerrar">×</button>
      <div class="gallery">
        <div class="gallery__main"><img id="galleryMain" src="${imgs[0]}" alt="${v.marca} ${v.modelo}" onerror="this.src='${PLACEHOLDER_IMG}'" /></div>
        ${imgs.length > 1 ? `<div class="gallery__thumbs">${thumbs}</div>` : ""}
      </div>

      <div class="detail">
        <div class="detail__grid">
          <div>
            <h2 class="detail__title" id="modalTitle">${v.marca} ${v.modelo}</h2>
            <div class="detail__price">${formatPrice(v.precio)}</div>
            <div class="detail__tags">
              <span class="tag">${v.anio}</span>
              <span class="tag">${formatKm(v.km)}</span>
              <span class="tag">${v.tipo}</span>
              <span class="tag">● ${v.estado}</span>
              ${v.financiacion ? '<span class="tag tag--fin">Con financiación</span>' : ""}
            </div>

            <h4>Ficha técnica</h4>
            <div class="specs">
              ${specRow("Año", v.anio)}
              ${specRow("Kilometraje", formatKm(v.km))}
              ${specRow("Motor", v.motor)}
              ${specRow("Transmisión", v.transmision)}
              ${specRow("Combustible", v.combustible)}
              ${specRow("Tipo", v.tipo)}
            </div>

            <h4>Estado y documentación</h4>
            <p>Estado general: <strong>${v.estado}</strong>. ${v.documentacion || "Documentación al día y verificada."}</p>
          </div>
        </div>
      </div>

      <div class="detail__bar">
        <button class="btn btn--ghost" data-visit="${v.id}">Coordinar visita</button>
        <button class="btn btn--wa" data-car-wa="${v.id}">Consultar por este auto</button>
      </div>`;

    // Galería: cambiar imagen principal al clickear thumbnail
    $$("[data-thumb]", modal).forEach((t) =>
      t.addEventListener("click", () => {
        $("#galleryMain").src = t.dataset.thumb;
        $$("[data-thumb]", modal).forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
      })
    );

    openModal();
  }

  function openModal() {
    modal.classList.add("open");
    document.body.classList.add("no-scroll");
  }
  function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  /* =====================================================================
     5. FORMULARIO "VENDÉ TU AUTO" → WhatsApp + CRM
     ===================================================================== */
  function handleSellForm(e) {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }

    const data = {
      nombre: f.nombre.value.trim(),
      telefono: f.telefono.value.trim(),
      marca: f.marca.value.trim(),
      modelo: f.modelo.value.trim(),
      anio: f.anio.value.trim(),
      km: f.km.value.trim(),
      estado: f.estado.value,
    };

    sendToCRM({ tipo: "venta", ...data });

    const msg =
      `¡Hola RPM! Quiero cotizar mi auto para venderlo:%0A` +
      `• Nombre: ${data.nombre}%0A` +
      `• Teléfono: ${data.telefono}%0A` +
      `• Vehículo: ${data.marca} ${data.modelo} ${data.anio}%0A` +
      `• Kilómetros: ${data.km || "a confirmar"}%0A` +
      `• Estado: ${data.estado}`;

    openWhatsApp(decodeURIComponent(msg));
    showToast("¡Listo! Te abrimos WhatsApp para enviar tu cotización 🚗");
    f.reset();
  }

  /* =====================================================================
     6. UI helpers: toast, header, FAQ, tabs, contacto, reveal
     ===================================================================== */
  let toastTimer;
  function showToast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }

  function initHeader() {
    const burger = $("#burger");
    const menu = $("#mobileMenu");
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    // Cerrar menú al navegar
    $$("#mobileMenu a").forEach((a) =>
      a.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  function initFAQ() {
    $$(".faq__item").forEach((item) => {
      const q = $(".faq__q", item);
      const a = $(".faq__a", item);
      q.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", String(open));
        a.style.maxHeight = open ? a.scrollHeight + "px" : null;
      });
    });
  }

  function initTabs() {
    $$(".tab").forEach((tab) =>
      tab.addEventListener("click", () => {
        $$(".tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        $$(".howto").forEach((h) => h.classList.remove("active"));
        $(`#howto-${tab.dataset.tab}`).classList.add("active");
      })
    );
  }

  function initFiltersToggle() {
    $("#filtersToggle").addEventListener("click", function () {
      const f = $("#filters");
      const open = f.classList.toggle("open");
      this.textContent = open ? "✕ Ocultar filtros" : "⚙️ Mostrar filtros";
    });
  }

  // Inyecta los datos de contacto desde CONFIG (placeholders editables)
  function initContactData() {
    $("#year").textContent = new Date().getFullYear();
    $("#footAddress").textContent = CONFIG.address;
    const phone = $("#footPhone"); phone.textContent = CONFIG.phone; phone.href = `tel:${CONFIG.phone.replace(/\s/g, "")}`;
    const email = $("#footEmail"); email.textContent = CONFIG.email; email.href = `mailto:${CONFIG.email}`;
    $("#footHours").textContent = CONFIG.hours.map((h) => `${h.day}: ${h.time}`).join(" · ");
    const ig = $("#footInstagram"); ig.href = CONFIG.instagram; ig.textContent = CONFIG.instagramHandle;

    // Métricas de confianza
    $("#stats").innerHTML = `
      <div class="stat"><div class="stat__num">${CONFIG.clientsCount}</div><div class="stat__label">Clientes satisfechos</div></div>
      <div class="stat"><div class="stat__num">${CONFIG.yearsInMarket}</div><div class="stat__label">Años de experiencia</div></div>
      <div class="stat"><div class="stat__num">100%</div><div class="stat__label">Autos verificados</div></div>
      <div class="stat"><div class="stat__num">24h</div><div class="stat__label">Respuesta promedio</div></div>`;
  }

  // Animación de aparición al hacer scroll
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("in")); return;
    }
    io = io || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
  }

  /* =====================================================================
     7. BINDINGS de filtros y buscador
     ===================================================================== */
  function bindFilters() {
    const map = {
      "#f-marca": "marca", "#f-modelo": "modelo", "#f-tipo": "tipo",
      "#f-anio-min": "anioMin", "#f-anio-max": "anioMax", "#f-km": "kmMax",
      "#f-precio-min": "precioMin", "#f-precio-max": "precioMax",
    };
    Object.entries(map).forEach(([sel, key]) => {
      const el = $(sel);
      const evt = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(evt, () => { state[key] = el.value; renderCatalog(); });
    });
    $("#f-fin").addEventListener("change", (e) => { state.soloFin = e.target.checked; renderCatalog(); });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderCatalog(); });
    $("#resetFilters").addEventListener("click", resetFilters);
  }

  function resetFilters() {
    Object.assign(state, {
      marca: "", modelo: "", tipo: "", anioMin: "", anioMax: "",
      kmMax: "", precioMin: "", precioMax: "", soloFin: false, sort: "relevancia",
    });
    ["#f-marca","#f-modelo","#f-tipo","#f-anio-min","#f-anio-max","#f-km","#f-precio-min","#f-precio-max","#sort"]
      .forEach((s) => { if ($(s)) $(s).value = ""; });
    $("#f-fin").checked = false;
    $("#sort").value = "relevancia";
    renderCatalog();
  }

  // Buscador rápido del hero → vuelca al panel de filtros y scrollea al catálogo
  function bindQuickSearch() {
    $("#quickSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      state.marca = $("#qs-marca").value;
      state.modelo = $("#qs-modelo").value;
      state.anioMin = $("#qs-anio").value;
      const tope = $("#qs-precio").value;
      state.precioMax = tope && tope !== "999999" ? tope : "";
      state.precioMin = tope === "999999" ? "35000" : "";

      // Reflejar en el panel de filtros
      $("#f-marca").value = state.marca;
      $("#f-modelo").value = state.modelo;
      $("#f-anio-min").value = state.anioMin;
      $("#f-precio-max").value = state.precioMax;
      $("#f-precio-min").value = state.precioMin;

      renderCatalog();
      $("#catalogo").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* =====================================================================
     8. Delegación de eventos globales (botones WhatsApp, detalle, modal)
     ===================================================================== */
  function bindGlobalClicks() {
    document.addEventListener("click", (e) => {
      const wa = e.target.closest("[data-wa]");
      if (wa) { e.preventDefault(); openWhatsApp(CONFIG.waMessages[wa.dataset.wa] || CONFIG.waMessages.general); return; }

      const detail = e.target.closest("[data-detail]");
      if (detail) { openDetail(detail.dataset.detail); return; }

      const carWa = e.target.closest("[data-car-wa]");
      if (carWa) {
        const v = VEHICLES.find((x) => x.id === carWa.dataset.carWa);
        if (v) openWhatsApp(CONFIG.waMessages.car(v));
        return;
      }

      const visit = e.target.closest("[data-visit]");
      if (visit) {
        const v = VEHICLES.find((x) => x.id === visit.dataset.visit);
        if (v) openWhatsApp(`¡Hola RPM! Quiero coordinar una visita para ver el ${v.marca} ${v.modelo} ${v.anio}. ¿Qué horarios tienen?`);
        return;
      }

      if (e.target.closest("[data-close]")) closeModal();
    });

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* =====================================================================
     INIT
     ===================================================================== */
  function init() {
    populateSelectors();
    bindFilters();
    bindQuickSearch();
    bindGlobalClicks();
    initHeader();
    initFAQ();
    initTabs();
    initFiltersToggle();
    initContactData();
    renderCatalog();
    observeReveals();
    $("#sellForm").addEventListener("submit", handleSellForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
