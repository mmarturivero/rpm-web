/* =========================================================================
   RPM Móviles — CONFIGURACIÓN CENTRAL
   -------------------------------------------------------------------------
   👉 ESTE ES EL ÚNICO ARCHIVO QUE EL EQUIPO DE RPM NECESITA EDITAR
      para actualizar datos de contacto, redes y textos clave.
   Los valores marcados con // EDITAR son placeholders / datos provisionales.

   Este archivo es "isomórfico": funciona tanto en el navegador como en el
   script de build de Node (build.js) que genera las páginas de cada auto.
   ========================================================================= */

const CONFIG = {
  /* ---- Identidad del sitio ---- */
  siteName: "RPM Móviles",
  // URL pública final (sin barra al final). Usada para canonical, OG y sitemap.
  siteUrl: "https://rpmmoviles.com.ar",   // EDITAR si cambia el dominio

  /* ---- Contacto ---- */
  // Número de WhatsApp en formato internacional SIN "+", espacios ni guiones.
  // 11 2333-0202  ->  54 9 11 2333 0202  ->  "5491123330202"
  whatsapp: "5491123330202",

  phone: "+54 11 7079-8444",                 // se muestra como texto
  email: "comercial@rpmmoviles.com.ar",

  /* ---- Redes ---- */
  instagram: "https://instagram.com/rpm_moviles",
  instagramHandle: "@rpm_moviles",

  /* ---- Ubicación y horarios ---- */
  address: "Av. de los Constituyentes 4636, CABA, Argentina",
  mapsUrl: "https://maps.google.com/?q=Av.+de+los+Constituyentes+4636+CABA",
  hours: [
    { day: "Lunes a Viernes", time: "9:00 a 18:00 hs" },    // EDITAR
    { day: "Sábados",         time: "9:00 a 13:00 hs" },    // EDITAR
    { day: "Domingos",        time: "Cerrado" },            // EDITAR
  ],

  /* ---- Prueba social (placeholders editables) ---- */
  clientsCount: "+500",        // EDITAR — cantidad de clientes satisfechos
  yearsInMarket: "+10",        // EDITAR — años de experiencia

  /* ---- Moneda en la que se publican los precios ---- */
  currency: { symbol: "US$", code: "USD", locale: "es-AR" }, // EDITAR ("$"/"ARS" para pesos)

  /* ---- Mensajes base de WhatsApp ---- */
  waMessages: {
    general: "¡Hola RPM Móviles! Quería hacerles una consulta.",
    sell: "¡Hola RPM! Quiero vender mi auto y me gustaría cotizarlo.",
    car: (auto) =>
      `¡Hola RPM! Me interesa el ${auto.marca} ${auto.modelo} ${auto.anio} ` +
      `(${formatPrice(auto.precio)}). ¿Sigue disponible?\n` +
      `${CONFIG.siteUrl}/autos/${auto.id}/`,
    visit: (auto) =>
      `¡Hola RPM! Quiero coordinar una visita para ver el ${auto.marca} ${auto.modelo} ${auto.anio}. ¿Qué horarios tienen?\n` +
      `${CONFIG.siteUrl}/autos/${auto.id}/`,
  },
};

/* =========================================================================
   Set de íconos SVG (línea, estilo profesional y consistente).
   Reemplazan a los emojis. Usan currentColor (heredan el color del contexto).
   Se usan tanto en el navegador (catalog.js) como en el build (build.js).
   ========================================================================= */
const ICONS = {
  calendar: '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>',
  gauge:    '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 18a8 8 0 1 1 15 0"/><path d="M12 14l3.5-3"/><circle cx="12" cy="14" r="1.3"/></svg>',
  gearbox:  '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12M12 6v12M18 6v4M6 9h12"/><circle cx="6" cy="5" r="1.3"/><circle cx="12" cy="5" r="1.3"/><circle cx="18" cy="5" r="1.3"/><circle cx="6" cy="19" r="1.3"/><circle cx="12" cy="19" r="1.3"/></svg>',
  fuel:     '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20.5V5.5A1.5 1.5 0 0 1 5.5 4h6A1.5 1.5 0 0 1 13 5.5v15"/><path d="M3 20.5h11M7 9h4"/><path d="M13 9.5h3l2 2v5.5a1.5 1.5 0 0 0 3 0V8.5L18 5.5"/></svg>',
  engine:   '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9.5h6l2 2h4v5h-2l-2 2H8l-2-2H3v-4l4-1z"/><path d="M9 9.5V7.5h4v2M19 12.5h2"/></svg>',
  car:      '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l1.6-5A2 2 0 0 1 7.5 9.6h9a2 2 0 0 1 1.9 1.4L20 16"/><path d="M3 16h18v2h-2M5 18H3M5 16v2M19 16v2"/><circle cx="7.5" cy="16.5" r="1.2"/><circle cx="16.5" cy="16.5" r="1.2"/></svg>',
  check:    '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6.5 9.5 17 4 11.5"/></svg>',
  shield:   '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 2.5v5C19 15.5 16 19.5 12 21 8 19.5 5 15.5 5 10.5v-5z"/><path d="M9 12l2 2 4-4"/></svg>',
  doc:      '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5M8 13h8M8 17h6"/></svg>',
  filter:   '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
  lock:     '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  search:   '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  pin:      '<svg class="ico-line" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
};

/* ---- Helpers de formato (compartidos navegador + build) ---- */
function formatPrice(value) {
  if (value == null) return "Consultar";
  return `${CONFIG.currency.symbol} ${new Intl.NumberFormat(CONFIG.currency.locale).format(value)}`;
}

function formatKm(value) {
  if (value == null) return "—";
  return `${new Intl.NumberFormat(CONFIG.currency.locale).format(value)} km`;
}

/* Export para Node (build.js). En el navegador, "module" no existe y se ignora. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CONFIG, formatPrice, formatKm, ICONS };
}
