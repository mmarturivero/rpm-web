/* =========================================================================
   RPM Móviles — Catálogo (solo home / index.html)
   Depende de: config.js, data.js, ui.js (window.RPM)
   Responsabilidades:
     - Render del catálogo + filtros + orden + buscador rápido
     - Formulario "Vendé tu auto" → WhatsApp (+ hook CRM + tracking)
     - Tabs "Cómo funciona", FAQ, toggle de filtros en mobile
   ========================================================================= */
(function () {
  "use strict";

  const { openWhatsApp, showToast, track, observeReveals, PLACEHOLDER_IMG, $, $$ } = window.RPM;

  /* Punto de integración con CRM (hoy: consola). Reemplazar por fetch(). */
  function sendToCRM(payload) {
    // fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    console.info("[CRM lead]", payload);
  }

  const state = {
    marca: "", modelo: "", tipo: "",
    anioMin: "", anioMax: "", kmMax: "",
    precioMin: "", precioMax: "", soloFin: false,
    sort: "relevancia",
  };

  /* ---------- Poblar selects ---------- */
  const uniqueSorted = (key, numericDesc) => {
    const set = [...new Set(VEHICLES.map((v) => v[key]))];
    return numericDesc ? set.sort((a, b) => b - a) : set.sort();
  };
  function fillSelect(el, values, placeholder) {
    if (!el) return;
    el.innerHTML = (placeholder != null ? `<option value="">${placeholder}</option>` : "") +
      values.map((v) => `<option value="${v}">${v}</option>`).join("");
  }
  function populateSelectors() {
    const marcas = uniqueSorted("marca"), tipos = uniqueSorted("tipo"), anios = uniqueSorted("anio", true);
    fillSelect($("#qs-marca"), marcas, "Todas");
    fillSelect($("#qs-anio"), anios, "Cualquiera");
    fillSelect($("#f-marca"), marcas, "Todas");
    fillSelect($("#f-tipo"), tipos, "Todos");
    fillSelect($("#f-anio-min"), anios, "Desde");
    fillSelect($("#f-anio-max"), anios, "Hasta");
  }

  /* ---------- Filtrar + ordenar ---------- */
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

  /* ---------- Render ---------- */
  const carImage = (v) => (v.imagenes && v.imagenes.length ? v.imagenes[0] : PLACEHOLDER_IMG);

  function cardTemplate(v) {
    const url = `/autos/${v.id}/`;
    return `
      <article class="card reveal">
        <a class="card__media" href="${url}" aria-label="Ver ${v.marca} ${v.modelo} ${v.anio}">
          ${v.destacado ? '<span class="badge">Destacado</span>' : ""}
          ${v.financiacion ? '<span class="badge badge--fin">Financiación</span>' : ""}
          <img src="${carImage(v)}" alt="${v.marca} ${v.modelo} ${v.anio} usado en venta" loading="lazy"
               onerror="this.src='${PLACEHOLDER_IMG}'" />
        </a>
        <div class="card__body">
          <a href="${url}"><h3 class="card__title">${v.marca} ${v.modelo}</h3></a>
          <div class="card__meta">
            <span>${ICONS.calendar} ${v.anio}</span>
            <span>${ICONS.gauge} ${formatKm(v.km)}</span>
            <span>${ICONS.gearbox} ${v.transmision}</span>
          </div>
          <div class="card__price">${formatPrice(v.precio)}</div>
          <div class="card__state">${v.estado}</div>
          <div class="card__actions">
            <a class="btn btn--ghost btn--sm" href="${url}">Ver detalle</a>
            <button class="btn btn--wa btn--sm" data-car-wa="${v.id}">Consultar</button>
          </div>
        </div>
      </article>`;
  }

  function renderCatalog() {
    const list = applyFilters();
    const cards = $("#cards"), count = $("#resultCount");
    if (!list.length) {
      cards.innerHTML = `<div class="empty">
        ${ICONS.search}
        <p>No encontramos autos con esos filtros.</p>
        <button class="btn btn--ghost btn--sm" id="emptyReset" style="margin-top:14px">Limpiar filtros</button>
      </div>`;
      count.innerHTML = `0 autos <span>encontrados</span>`;
      $("#emptyReset").addEventListener("click", resetFilters);
      return;
    }
    cards.innerHTML = list.map(cardTemplate).join("");
    count.innerHTML = `${list.length} ${list.length === 1 ? "auto" : "autos"} <span>disponibles</span>`;
    observeReveals();
  }

  /* ---------- Formulario "Vendé tu auto" ---------- */
  function handleSellForm(e) {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const data = {
      nombre: f.nombre.value.trim(), telefono: f.telefono.value.trim(),
      marca: f.marca.value.trim(), modelo: f.modelo.value.trim(),
      anio: f.anio.value.trim(), km: f.km.value.trim(), estado: f.estado.value,
    };
    sendToCRM({ tipo: "venta", ...data });
    track("lead_submit", { form: "vender", value: 1 });

    const msg =
      `¡Hola RPM! Quiero cotizar mi auto para venderlo:\n` +
      `• Nombre: ${data.nombre}\n` +
      `• Teléfono: ${data.telefono}\n` +
      `• Vehículo: ${data.marca} ${data.modelo} ${data.anio}\n` +
      `• Kilómetros: ${data.km || "a confirmar"}\n` +
      `• Estado: ${data.estado}`;
    openWhatsApp(msg, { source: "form_vender" });
    showToast("Listo. Te abrimos WhatsApp para enviar tu cotización.");
    f.reset();
  }

  /* ---------- Bindings de filtros / buscador ---------- */
  function bindFilters() {
    const map = {
      "#f-marca": "marca", "#f-modelo": "modelo", "#f-tipo": "tipo",
      "#f-anio-min": "anioMin", "#f-anio-max": "anioMax", "#f-km": "kmMax",
      "#f-precio-min": "precioMin", "#f-precio-max": "precioMax",
    };
    Object.entries(map).forEach(([sel, key]) => {
      const el = $(sel); if (!el) return;
      el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => { state[key] = el.value; renderCatalog(); });
    });
    $("#f-fin").addEventListener("change", (e) => { state.soloFin = e.target.checked; renderCatalog(); });
    $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderCatalog(); });
    $("#resetFilters").addEventListener("click", resetFilters);
  }
  function resetFilters() {
    Object.assign(state, { marca: "", modelo: "", tipo: "", anioMin: "", anioMax: "", kmMax: "", precioMin: "", precioMax: "", soloFin: false, sort: "relevancia" });
    ["#f-marca","#f-modelo","#f-tipo","#f-anio-min","#f-anio-max","#f-km","#f-precio-min","#f-precio-max"]
      .forEach((s) => { if ($(s)) $(s).value = ""; });
    $("#f-fin").checked = false;
    $("#sort").value = "relevancia";
    renderCatalog();
  }
  function bindQuickSearch() {
    $("#quickSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      track("search_submit", { source: "hero" });
      state.marca = $("#qs-marca").value;
      state.modelo = $("#qs-modelo").value;
      state.anioMin = $("#qs-anio").value;
      const tope = $("#qs-precio").value;
      state.precioMax = tope && tope !== "999999" ? tope : "";
      state.precioMin = tope === "999999" ? "35000" : "";
      $("#f-marca").value = state.marca;
      $("#f-modelo").value = state.modelo;
      $("#f-anio-min").value = state.anioMin;
      $("#f-precio-max").value = state.precioMax;
      $("#f-precio-min").value = state.precioMin;
      renderCatalog();
      $("#catalogo").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- FAQ / tabs / toggle filtros ---------- */
  function initFAQ() {
    $$(".faq__item").forEach((item) => {
      const q = $(".faq__q", item), a = $(".faq__a", item);
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
        tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
        $$(".howto").forEach((h) => h.classList.remove("active"));
        $(`#howto-${tab.dataset.tab}`).classList.add("active");
      })
    );
  }
  function initFiltersToggle() {
    const btn = $("#filtersToggle");
    btn.addEventListener("click", function () {
      const open = $("#filters").classList.toggle("open");
      this.innerHTML = ICONS.filter + (open ? " Ocultar filtros" : " Mostrar filtros");
    });
  }

  function init() {
    if (!$("#cards")) return; // solo corre en la home
    populateSelectors();
    bindFilters();
    bindQuickSearch();
    initFAQ();
    initTabs();
    initFiltersToggle();
    renderCatalog();
    $("#sellForm").addEventListener("submit", handleSellForm);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
