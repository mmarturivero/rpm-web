/* =========================================================================
   RPM Móviles — STOCK DE VEHÍCULOS (datos de ejemplo / placeholders)
   -------------------------------------------------------------------------
   Estructura preparada para cargar autos dinámicamente en el futuro.
   Para conectar con un CRM/API, reemplazar este array por un fetch():

     async function loadVehicles() {
       const res = await fetch('/api/vehiculos');
       return res.json();
     }

   ⚠️ Cada vez que se edita este archivo, regenerar las páginas individuales:
        npm run build      (ó: node build.js)

   Campos por vehículo:
   - id: identificador único → define la URL /autos/<id>/  (usar slug amigable)
   - imagenes: array de URLs. Si está vacío se usa el placeholder.
   - estado: "Excelente" | "Muy bueno" | "Bueno"
   - tipo: "Sedán" | "SUV" | "Hatchback" | "Pickup" | "Utilitario"
   - financiacion: true/false  (si admite financiación)
   - destacado: true/false     (badge "Destacado")
   - descripcion: texto comercial para la ficha (SEO + conversión)
   ========================================================================= */

const VEHICLES = [
  {
    id: "volkswagen-golf-1-4-tsi-highline-2019",
    marca: "Volkswagen",
    modelo: "Golf 1.4 TSI Highline",
    anio: 2019,
    km: 48000,
    precio: 21500,
    estado: "Excelente",
    tipo: "Hatchback",
    motor: "1.4 TSI Turbo",
    transmision: "Automática DSG",
    combustible: "Nafta",
    color: "Gris Platino",
    puertas: 5,
    financiacion: true,
    destacado: true,
    documentacion: "Al día, con verificación policial y service oficial.",
    descripcion:
      "Volkswagen Golf Highline impecable, con caja automática DSG y motor 1.4 TSI turbo. " +
      "Único dueño, service oficial al día y muy bajo kilometraje para el año. Ideal para quien busca " +
      "confort, terminación premium y bajo consumo.",
    imagenes: [],
  },
  {
    id: "toyota-corolla-2-0-xei-cvt-2021",
    marca: "Toyota",
    modelo: "Corolla 2.0 XEI CVT",
    anio: 2021,
    km: 32000,
    precio: 26900,
    estado: "Excelente",
    tipo: "Sedán",
    motor: "2.0 Dynamic Force",
    transmision: "Automática CVT",
    combustible: "Nafta",
    color: "Blanco Perlado",
    puertas: 4,
    financiacion: true,
    destacado: true,
    documentacion: "Título y cédula al día. Único dueño.",
    descripcion:
      "Toyota Corolla XEI 2.0 con caja CVT, el sedán más confiable del segmento. Único dueño, " +
      "excelente estado general y bajo kilometraje. Equipamiento completo, seguridad Toyota Safety Sense.",
    imagenes: [],
  },
  {
    id: "ford-ranger-3-2-limited-4x4-2020",
    marca: "Ford",
    modelo: "Ranger 3.2 Limited 4x4",
    anio: 2020,
    km: 75000,
    precio: 34500,
    estado: "Muy bueno",
    tipo: "Pickup",
    motor: "3.2 Turbodiésel",
    transmision: "Automática",
    combustible: "Diésel",
    color: "Gris Oscuro",
    puertas: 4,
    financiacion: true,
    destacado: false,
    documentacion: "Service al día. Lista para transferir.",
    descripcion:
      "Ford Ranger Limited 4x4 3.2 turbodiésel, full equipo. Potente, robusta y lista para trabajo o " +
      "aventura. Cubiertas en excelente estado y mantenimiento al día.",
    imagenes: [],
  },
  {
    id: "chevrolet-onix-1-0-turbo-premier-2022",
    marca: "Chevrolet",
    modelo: "Onix 1.0 Turbo Premier",
    anio: 2022,
    km: 19000,
    precio: 18900,
    estado: "Excelente",
    tipo: "Hatchback",
    motor: "1.0 Turbo",
    transmision: "Automática",
    combustible: "Nafta",
    color: "Rojo",
    puertas: 5,
    financiacion: true,
    destacado: false,
    documentacion: "Como nuevo. Garantía de fábrica vigente.",
    descripcion:
      "Chevrolet Onix Premier 1.0 turbo prácticamente nuevo, con garantía de fábrica vigente. " +
      "La versión tope de gama con pantalla, cámara de retroceso y conectividad total.",
    imagenes: [],
  },
  {
    id: "peugeot-208-1-6-feline-2018",
    marca: "Peugeot",
    modelo: "208 1.6 Feline",
    anio: 2018,
    km: 62000,
    precio: 13500,
    estado: "Bueno",
    tipo: "Hatchback",
    motor: "1.6 16v",
    transmision: "Manual",
    combustible: "Nafta",
    color: "Azul",
    puertas: 5,
    financiacion: false,
    destacado: false,
    documentacion: "Al día. Listo para patentar.",
    descripcion:
      "Peugeot 208 Feline 1.6, una excelente puerta de entrada a un primer auto confiable y económico. " +
      "Bien mantenido, listo para transferir.",
    imagenes: [],
  },
  {
    id: "volkswagen-amarok-2-0-highline-4x4-2019",
    marca: "Volkswagen",
    modelo: "Amarok 2.0 Highline 4x4",
    anio: 2019,
    km: 88000,
    precio: 31000,
    estado: "Muy bueno",
    tipo: "Pickup",
    motor: "2.0 Biturbo TDI",
    transmision: "Automática",
    combustible: "Diésel",
    color: "Blanco",
    puertas: 4,
    financiacion: true,
    destacado: false,
    documentacion: "Service oficial. Verificada.",
    descripcion:
      "Volkswagen Amarok Highline 4x4 con motor 2.0 biturbo, confort de auto y capacidad de pickup. " +
      "Service oficial, documentación verificada y lista para transferir.",
    imagenes: [],
  },
  {
    id: "jeep-renegade-1-8-sport-2021",
    marca: "Jeep",
    modelo: "Renegade 1.8 Sport",
    anio: 2021,
    km: 41000,
    precio: 23800,
    estado: "Excelente",
    tipo: "SUV",
    motor: "1.8 E.torQ",
    transmision: "Automática",
    combustible: "Nafta",
    color: "Gris",
    puertas: 5,
    financiacion: true,
    destacado: true,
    documentacion: "Único dueño. Documentación verificada.",
    descripcion:
      "Jeep Renegade Sport 1.8 automática, el SUV ideal para ciudad y ruta. Único dueño, excelente " +
      "estado y muy buen equipamiento. Postura de manejo alta y gran seguridad.",
    imagenes: [],
  },
  {
    id: "renault-kangoo-express-confort-2020",
    marca: "Renault",
    modelo: "Kangoo Express Confort",
    anio: 2020,
    km: 95000,
    precio: 12900,
    estado: "Bueno",
    tipo: "Utilitario",
    motor: "1.6 16v",
    transmision: "Manual",
    combustible: "Nafta",
    color: "Blanco",
    puertas: 4,
    financiacion: false,
    destacado: false,
    documentacion: "Ideal trabajo. Al día.",
    descripcion:
      "Renault Kangoo Express Confort, el utilitario ideal para tu emprendimiento o trabajo diario. " +
      "Amplia, económica y confiable. Documentación al día.",
    imagenes: [],
  },
  {
    id: "fiat-cronos-1-3-drive-2022",
    marca: "Fiat",
    modelo: "Cronos 1.3 Drive",
    anio: 2022,
    km: 27000,
    precio: 15500,
    estado: "Excelente",
    tipo: "Sedán",
    motor: "1.3 Firefly",
    transmision: "Manual",
    combustible: "Nafta",
    color: "Gris",
    puertas: 4,
    financiacion: true,
    destacado: false,
    documentacion: "Bajo kilometraje. Como nuevo.",
    descripcion:
      "Fiat Cronos Drive 1.3, uno de los sedanes más elegidos del país por su espacio y bajo consumo. " +
      "Muy bajo kilometraje, prácticamente nuevo y con financiación disponible.",
    imagenes: [],
  },
];

/* Export para Node (build.js). En el navegador se ignora. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { VEHICLES };
}
