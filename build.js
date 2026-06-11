#!/usr/bin/env node
/* =========================================================================
   RPM Móviles — Generador estático de páginas de vehículo
   -------------------------------------------------------------------------
   Lee js/config.js + js/data.js y genera:
     - /autos/<id>/index.html   (una página SEO por cada auto)
     - /autos/index.html        (listado/índice de autos)
     - /sitemap.xml             (home + todas las fichas)
     - /robots.txt

   Uso:  node build.js     (ó: npm run build)
   Ejecutar cada vez que se modifica el stock en js/data.js.
   ========================================================================= */

const fs = require("fs");
const path = require("path");

const { CONFIG, formatPrice, formatKm } = require("./js/config.js");
const { VEHICLES } = require("./js/data.js");

const ROOT = __dirname;
// Directorio de salida que publica Vercel (autocontenido). El código fuente
// queda en la raíz; acá se copian los estáticos + se generan las páginas.
const OUT = path.join(ROOT, "public");
const SITE = CONFIG.siteUrl.replace(/\/$/, "");
const PLACEHOLDER = "/assets/placeholder-car.svg";
const OG_FALLBACK = `${SITE}/assets/og-image.jpg`;

/* ---------- Helpers ---------- */
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const carImage = (v) => (v.imagenes && v.imagenes.length ? v.imagenes[0] : PLACEHOLDER);
const absUrl = (p) => (p.startsWith("http") ? p : `${SITE}${p}`);
const vehicleUrl = (v) => `${SITE}/autos/${v.id}/`;

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(file, content) { ensureDir(path.dirname(file)); fs.writeFileSync(file, content); }

/* ---------- Bloques HTML compartidos (header / footer / scripts) ---------- */
function head(meta) {
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#c1272d" />
  <link rel="canonical" href="${esc(meta.url)}" />

  <meta property="og:type" content="${meta.ogType || "website"}" />
  <meta property="og:locale" content="es_AR" />
  <meta property="og:site_name" content="RPM Móviles" />
  <meta property="og:title" content="${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.description)}" />
  <meta property="og:url" content="${esc(meta.url)}" />
  <meta property="og:image" content="${esc(meta.image || OG_FALLBACK)}" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="/assets/logo.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/styles.css" />
  ${(meta.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</scr` + `ipt>`).join("\n  ")}
</head>
<body>`;
}

const HEADER = `
  <header class="header">
    <div class="container nav">
      <a href="/" aria-label="RPM Móviles - Inicio"><img src="/assets/logo.svg" alt="RPM Móviles" class="nav__logo" width="168" height="44" /></a>
      <nav class="nav__links" aria-label="Navegación principal">
        <a href="/#catalogo">Comprar auto</a>
        <a href="/#vender">Vender mi auto</a>
        <a href="/#como-funciona">Cómo funciona</a>
        <a href="/#confianza">Por qué RPM</a>
        <a href="/#faq">Preguntas</a>
      </nav>
      <div class="nav__actions">
        <a href="/#catalogo" class="btn btn--ghost btn--sm">Comprar auto</a>
        <a href="/#vender" class="btn btn--primary btn--sm">Vender mi auto</a>
        <a href="#" data-wa="general" class="btn btn--wa btn--sm">WhatsApp</a>
      </div>
      <button class="nav__burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
    </div>
    <div class="container mobile-menu" id="mobileMenu">
      <a href="/#catalogo">Comprar auto</a>
      <a href="/#vender">Vender mi auto</a>
      <a href="/#como-funciona">Cómo funciona</a>
      <a href="/#faq">Preguntas frecuentes</a>
      <a href="#" data-wa="general" class="btn btn--wa btn--block">Contactar por WhatsApp</a>
    </div>
  </header>`;

const FOOTER = `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <img src="/assets/logo.svg" alt="RPM Móviles" width="168" height="44" />
          <p style="color:#b0b0b0; max-width:280px">Concesionaria de autos usados seleccionados en CABA. Comprá o vendé con confianza, simple y transparente.</p>
        </div>
        <div><h4>Navegación</h4><ul>
          <li><a href="/#catalogo">Comprar auto</a></li>
          <li><a href="/#vender">Vender mi auto</a></li>
          <li><a href="/autos/">Todos los autos</a></li>
          <li><a href="/#faq">Preguntas frecuentes</a></li>
        </ul></div>
        <div><h4>Seguinos</h4><ul>
          <li><a id="footInstagram" href="#" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="#" data-wa="general">WhatsApp</a></li>
        </ul></div>
        <div><h4>Contacto</h4><ul class="footer__contact">
          <li><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg> <a id="footAddress" href="#" target="_blank" rel="noopener"></a></li>
          <li><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1z"/></svg> <a id="footPhone" href="#"></a></li>
          <li><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg> <a id="footEmail" href="#"></a></li>
          <li><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 10.4 4 2.3-.8 1.3-4.7-2.7V6h1.5z"/></svg> <span id="footHours"></span></li>
        </ul></div>
      </div>
      <div class="footer__bottom">
        <span>© <span id="year"></span> RPM Móviles. Todos los derechos reservados.</span>
        <span>Diseñado para vender más y mejor.</span>
      </div>
    </div>
  </footer>`;

const SCRIPTS = `
  <div class="toast" id="toast"></div>
  <a href="#" data-wa="general" class="fab-wa" aria-label="Contactar por WhatsApp">
    <svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.5 23.5l1.6-5.9A11.4 11.4 0 1 1 12 23.4a11.6 11.6 0 0 1-5.5-1.4L.5 23.5zM6.8 20l.4.2a9.5 9.5 0 1 0-3.3-3.4l.2.4-1 3.5 3.7-.7z"/></svg>
  </a>
  <script src="/js/config.js"></script>
  <script src="/js/data.js"></script>
  <script src="/js/ui.js"></script>
</body>
</html>`;

/* ---------- Página individual de vehículo ---------- */
function vehiclePage(v) {
  const url = vehicleUrl(v);
  const imgs = v.imagenes && v.imagenes.length ? v.imagenes : [PLACEHOLDER];
  const title = `${v.marca} ${v.modelo} ${v.anio} | ${formatPrice(v.precio)} | RPM Móviles`;
  const description =
    `${v.marca} ${v.modelo} ${v.anio}, ${formatKm(v.km)}, ${v.transmision}, ${v.combustible}. ` +
    `Estado ${v.estado.toLowerCase()}. ${v.financiacion ? "Financiación disponible. " : ""}` +
    `Consultá por WhatsApp en RPM Móviles, CABA.`;

  // Schema.org: vehículo (Car) + breadcrumb
  const carSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${v.marca} ${v.modelo} ${v.anio}`,
    description: v.descripcion || description,
    url,
    image: imgs.map(absUrl),
    brand: { "@type": "Brand", name: v.marca },
    model: v.modelo,
    vehicleModelDate: String(v.anio),
    productionDate: String(v.anio),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
    fuelType: v.combustible,
    vehicleTransmission: v.transmision,
    vehicleEngine: { "@type": "EngineSpecification", name: v.motor },
    color: v.color || undefined,
    numberOfDoors: v.puertas || undefined,
    bodyType: v.tipo,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: v.precio,
      priceCurrency: CONFIG.currency.code,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      url,
      seller: { "@type": "AutoDealer", name: "RPM Móviles" },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Autos", item: `${SITE}/autos/` },
      { "@type": "ListItem", position: 3, name: `${v.marca} ${v.modelo}`, item: url },
    ],
  };

  const thumbs = imgs.length > 1
    ? `<div class="gallery__thumbs">${imgs.map((s, i) =>
        `<img src="${esc(s)}" alt="${esc(v.marca)} ${esc(v.modelo)} - vista ${i + 1}" class="${i === 0 ? "active" : ""}" data-thumb="${esc(s)}" onerror="this.src='${PLACEHOLDER}'" />`).join("")}</div>`
    : "";

  const spec = (l, val) => `<div class="spec"><div class="spec__label">${l}</div><div class="spec__value">${esc(val)}</div></div>`;

  // Relacionados: misma marca o tipo, hasta 3
  const related = VEHICLES.filter((x) => x.id !== v.id && (x.marca === v.marca || x.tipo === v.tipo)).slice(0, 3);
  const relatedHtml = related.length ? `
    <section class="vehicle__section">
      <h2>Autos relacionados</h2>
      <div class="grid related-grid">
        ${related.map((r) => `
          <article class="card">
            <a class="card__media" href="/autos/${r.id}/" aria-label="Ver ${esc(r.marca)} ${esc(r.modelo)}">
              ${r.financiacion ? '<span class="badge badge--fin">Financiación</span>' : ""}
              <img src="${esc(carImage(r))}" alt="${esc(r.marca)} ${esc(r.modelo)} ${r.anio} usado" loading="lazy" onerror="this.src='${PLACEHOLDER}'" />
            </a>
            <div class="card__body">
              <a href="/autos/${r.id}/"><h3 class="card__title">${esc(r.marca)} ${esc(r.modelo)}</h3></a>
              <div class="card__meta"><span>📅 ${r.anio}</span><span>🛣️ ${formatKm(r.km)}</span></div>
              <div class="card__price">${formatPrice(r.precio)}</div>
              <div class="card__actions">
                <a class="btn btn--ghost btn--sm" href="/autos/${r.id}/">Ver detalle</a>
                <button class="btn btn--wa btn--sm" data-car-wa="${r.id}">Consultar</button>
              </div>
            </div>
          </article>`).join("")}
      </div>
    </section>` : "";

  return head({ title, description, url, image: absUrl(imgs[0]), ogType: "product", jsonld: [carSchema, breadcrumbSchema] })
    + HEADER + `
  <main>
    <div class="container breadcrumb">
      <nav aria-label="Migas de pan"><ol>
        <li><a href="/">Inicio</a></li>
        <li><a href="/autos/">Autos</a></li>
        <li aria-current="page">${esc(v.marca)} ${esc(v.modelo)}</li>
      </ol></nav>
    </div>

    <section class="container vehicle">
      <div class="vehicle__layout">
        <!-- Galería -->
        <div>
          <div class="vehicle__gallery">
            <div class="gallery__main"><img id="galleryMain" src="${esc(imgs[0])}" alt="${esc(v.marca)} ${esc(v.modelo)} ${v.anio} usado en venta" onerror="this.src='${PLACEHOLDER}'" /></div>
            ${thumbs}
          </div>

          <section class="vehicle__section vehicle__desc">
            <h2>Descripción</h2>
            <p>${esc(v.descripcion || description)}</p>
          </section>

          <section class="vehicle__section">
            <h2>Ficha técnica</h2>
            <div class="specs">
              ${spec("Año", v.anio)}
              ${spec("Kilometraje", formatKm(v.km))}
              ${spec("Motor", v.motor)}
              ${spec("Transmisión", v.transmision)}
              ${spec("Combustible", v.combustible)}
              ${spec("Tipo", v.tipo)}
              ${v.color ? spec("Color", v.color) : ""}
              ${v.puertas ? spec("Puertas", v.puertas) : ""}
              ${spec("Estado", v.estado)}
            </div>
          </section>

          <section class="vehicle__section">
            <h2>Documentación</h2>
            <p>${esc(v.documentacion || "Documentación al día y verificada.")}</p>
          </section>
        </div>

        <!-- CTA lateral -->
        <aside class="vehicle__cta">
          <h1>${esc(v.marca)} ${esc(v.modelo)}</h1>
          <div class="detail__tags">
            <span class="tag">${v.anio}</span>
            <span class="tag">${formatKm(v.km)}</span>
            <span class="tag">${esc(v.tipo)}</span>
            ${v.financiacion ? '<span class="tag tag--fin">Con financiación</span>' : ""}
          </div>
          <div class="price">${formatPrice(v.precio)}</div>
          <div class="price-note">Precio publicado · Consultá formas de pago y financiación</div>

          <div class="cta-stack">
            <button class="btn btn--wa btn--block" data-car-wa="${v.id}">Consultar por este auto</button>
            <button class="btn btn--ghost btn--block" data-visit="${v.id}">Reservar / Coordinar visita</button>
          </div>

          <div class="reassure">
            <span><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> Auto verificado mecánica y legalmente</span>
            <span><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> Te respondemos por WhatsApp en el día</span>
            <span><svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg> Aceptamos tu usado como parte de pago</span>
          </div>

          <div class="share">
            Compartir:
            <button data-share type="button">Enviar enlace</button>
          </div>
        </aside>
      </div>

      ${relatedHtml}
    </section>
  </main>`
    + FOOTER + `
  <nav class="action-bar" aria-label="Acciones rápidas">
    <button class="btn btn--ghost" data-visit="${v.id}">Coordinar visita</button>
    <button class="btn btn--wa" data-car-wa="${v.id}">Consultar</button>
  </nav>`
    + SCRIPTS;
}

/* ---------- Índice de autos /autos/ ---------- */
function autosIndexPage() {
  const url = `${SITE}/autos/`;
  const title = "Autos usados en venta | Stock disponible | RPM Móviles";
  const description = "Mirá todos los autos usados verificados disponibles en RPM Móviles, CABA. Filtrá por marca, precio y kilometraje. Financiación y atención por WhatsApp.";
  const list = [...VEHICLES].sort((a, b) => (b.destacado === true) - (a.destacado === true));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: vehicleUrl(v), name: `${v.marca} ${v.modelo} ${v.anio}` })),
  };

  const cards = list.map((v) => `
    <article class="card">
      <a class="card__media" href="/autos/${v.id}/" aria-label="Ver ${esc(v.marca)} ${esc(v.modelo)} ${v.anio}">
        ${v.destacado ? '<span class="badge">Destacado</span>' : ""}
        ${v.financiacion ? '<span class="badge badge--fin">Financiación</span>' : ""}
        <img src="${esc(carImage(v))}" alt="${esc(v.marca)} ${esc(v.modelo)} ${v.anio} usado en venta" loading="lazy" onerror="this.src='${PLACEHOLDER}'" />
      </a>
      <div class="card__body">
        <a href="/autos/${v.id}/"><h3 class="card__title">${esc(v.marca)} ${esc(v.modelo)}</h3></a>
        <div class="card__meta"><span>📅 ${v.anio}</span><span>🛣️ ${formatKm(v.km)}</span><span>⚙️ ${esc(v.transmision)}</span></div>
        <div class="card__price">${formatPrice(v.precio)}</div>
        <div class="card__state">● ${esc(v.estado)}</div>
        <div class="card__actions">
          <a class="btn btn--ghost btn--sm" href="/autos/${v.id}/">Ver detalle</a>
          <button class="btn btn--wa btn--sm" data-car-wa="${v.id}">Consultar</button>
        </div>
      </div>
    </article>`).join("");

  return head({ title, description, url, jsonld: [itemList] }) + HEADER + `
  <main>
    <div class="container breadcrumb">
      <nav aria-label="Migas de pan"><ol>
        <li><a href="/">Inicio</a></li>
        <li aria-current="page">Autos</li>
      </ol></nav>
    </div>
    <section class="container section" style="padding-top:24px">
      <div class="section__head" style="margin-left:0;text-align:left">
        <span class="eyebrow">Stock disponible</span>
        <h1>Autos usados en venta</h1>
        <p>${list.length} unidades verificadas y listas para transferir. ¿Buscás algo puntual? Filtrá desde la <a href="/#catalogo">página principal</a>.</p>
      </div>
      <div class="cards">${cards}</div>
    </section>
  </main>` + FOOTER + SCRIPTS;
}

/* ---------- Sitemap + robots ---------- */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, priority: "1.0", freq: "daily" },
    { loc: `${SITE}/autos/`, priority: "0.9", freq: "daily" },
    ...VEHICLES.map((v) => ({ loc: vehicleUrl(v), priority: "0.8", freq: "weekly" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
}
function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}

/* ---------- Run ---------- */
// Estáticos a copiar tal cual desde la raíz hacia public/
const STATIC = ["index.html", "css", "js", "assets"];

function run() {
  // 1. Limpiar y recrear el directorio de salida
  fs.rmSync(OUT, { recursive: true, force: true });
  ensureDir(OUT);

  // 2. Copiar los estáticos del sitio (home, estilos, scripts, imágenes)
  STATIC.forEach((item) => {
    const src = path.join(ROOT, item);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, item), { recursive: true });
  });

  // 3. Generar las páginas dinámicas dentro de public/
  VEHICLES.forEach((v) => write(path.join(OUT, "autos", v.id, "index.html"), vehiclePage(v)));
  write(path.join(OUT, "autos", "index.html"), autosIndexPage());
  write(path.join(OUT, "sitemap.xml"), sitemap());
  write(path.join(OUT, "robots.txt"), robots());

  console.log(`✅ Build OK → public/  (home + ${VEHICLES.length} fichas + /autos/ + sitemap.xml + robots.txt)`);
}

run();
