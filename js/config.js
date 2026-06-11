/* =========================================================================
   RPM Móviles — CONFIGURACIÓN CENTRAL
   -------------------------------------------------------------------------
   👉 ESTE ES EL ÚNICO ARCHIVO QUE EL EQUIPO DE RPM NECESITA EDITAR
      para actualizar datos de contacto, redes y textos clave.
   Los valores marcados con // EDITAR son placeholders: reemplazar por
   los datos reales de la concesionaria.
   ========================================================================= */

const CONFIG = {
  /* ---- Contacto ---- */
  // Número de WhatsApp en formato internacional SIN "+", espacios ni guiones.
  // Ej. Argentina: 54 9 11 1234-5678  ->  "5491112345678"
  whatsapp: "5491100000000",                 // EDITAR

  phone: "+54 9 11 0000-0000",               // EDITAR (se muestra como texto)
  email: "ventas@rpmmoviles.com.ar",         // EDITAR

  /* ---- Redes ---- */
  instagram: "https://instagram.com/rpmmoviles",   // EDITAR
  instagramHandle: "@rpmmoviles",                  // EDITAR

  /* ---- Ubicación y horarios ---- */
  address: "Av. Siempreviva 1234, Buenos Aires, Argentina", // EDITAR
  mapsUrl: "https://maps.google.com/?q=RPM+Moviles",        // EDITAR
  hours: [
    { day: "Lunes a Viernes", time: "9:00 a 18:00 hs" },    // EDITAR
    { day: "Sábados",         time: "9:00 a 13:00 hs" },    // EDITAR
    { day: "Domingos",        time: "Cerrado" },            // EDITAR
  ],

  /* ---- Prueba social (placeholders editables) ---- */
  clientsCount: "+500",        // EDITAR — cantidad de clientes satisfechos
  yearsInMarket: "+10",        // EDITAR — años de experiencia

  /* ---- Mensajes base de WhatsApp ---- */
  waMessages: {
    general: "¡Hola RPM Móviles! Quería hacerles una consulta.",
    sell: "¡Hola RPM! Quiero vender mi auto y me gustaría cotizarlo.",
    car: (auto) =>
      `¡Hola RPM! Me interesa el ${auto.marca} ${auto.modelo} ${auto.anio} ` +
      `(${formatPrice(auto.precio)}). ¿Sigue disponible?`,
  },
};

/* Helper de formato de precio en pesos/dólares argentinos.
   Cambiar 'currency' y 'symbol' según cómo publique precios la concesionaria. */
const CURRENCY = { symbol: "US$", locale: "es-AR" }; // EDITAR (ej. "$" para pesos)

function formatPrice(value) {
  if (value == null) return "Consultar";
  return `${CURRENCY.symbol} ${new Intl.NumberFormat(CURRENCY.locale).format(value)}`;
}

function formatKm(value) {
  if (value == null) return "—";
  return `${new Intl.NumberFormat(CURRENCY.locale).format(value)} km`;
}
