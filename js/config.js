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
  module.exports = { CONFIG, formatPrice, formatKm };
}
