# RPM Móviles — Sitio web

Landing comercial responsive para **RPM Móviles**, concesionaria de autos usados en Argentina.
Objetivo: **generar más consultas comerciales y más ventas** (comprar y vender autos), con foco en
confianza, claridad y conversión por WhatsApp. Inspirada en la UX de Kavak, con identidad propia
más cercana y humana.

---

## 🚀 Cómo correrlo

No requiere build ni dependencias. Es HTML + CSS + JS vanilla.

```bash
# Opción 1: abrir directamente
open index.html

# Opción 2: servidor local (recomendado, evita restricciones de CORS)
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

---

## ⚙️ Qué editar (sin tocar código)

Casi todo lo "de negocio" vive en dos archivos:

| Archivo | Qué contiene |
|---|---|
| **`js/config.js`** | WhatsApp, teléfono, email, Instagram, dirección, horarios, métricas, moneda y mensajes base. Buscá los comentarios `// EDITAR`. |
| **`js/data.js`** | El stock de autos (array `VEHICLES`). Agregar/editar/borrar autos acá. |

> ⚠️ El número de WhatsApp va en formato internacional **sin** `+`, espacios ni guiones. Ej: `5491112345678`.

---

## 🏛️ Arquitectura de archivos

```
rpm-web/
├── index.html                 # Estructura + todas las secciones + SEO/metadata + datos estructurados
├── css/
│   └── styles.css             # Design system (tokens) + componentes (mobile-first)
├── js/
│   ├── config.js              # ⚙️ Config editable (contacto, redes, textos, moneda)
│   ├── data.js                # 🚗 Stock de autos (listo para reemplazar por API/CRM)
│   └── app.js                 # Lógica: render, filtros, orden, buscador, modal, forms→WhatsApp
├── assets/
│   ├── logo.svg               # Logo provisional (reemplazar por el oficial)
│   └── placeholder-car.svg    # Imagen fallback cuando un auto no tiene foto
└── README.md
```

### Arquitectura de páginas
- **Single page** (landing) con navegación por anclas: Inicio → Catálogo → Vender → Confianza → Cómo funciona → Testimonios → FAQ → Footer.
- **Detalle de vehículo = modal** (mejor en mobile, sin recarga). Preparado para migrar a página propia (`/auto/:id`) cuando haya backend/SSR para SEO de cada unidad.

---

## 🧭 Wireframe textual

```
┌─────────────────────────────────────────────┐
│ HEADER fijo: Logo | Menú | Comprar | Vender  │
│              | WhatsApp                        │
├─────────────────────────────────────────────┤
│ HERO (fondo navy)                             │
│  Título fuerte + subtítulo de confianza       │
│  [Ver autos disponibles] [Quiero vender]      │
│  ✔ verificados ✔ tasación ✔ atención          │
│  ┌── BUSCADOR: Marca | Modelo | Año | $ ──┐   │
│  └──────────────[ Buscar autos ]──────────┘   │
├─────────────────────────────────────────────┤
│ CATÁLOGO                                      │
│  [Filtros]  | Toolbar: N resultados | Orden   │
│  marca      | ┌────┐ ┌────┐ ┌────┐            │
│  modelo     | │card│ │card│ │card│            │
│  tipo/año   | └────┘ └────┘ └────┘            │
│  km/precio  | (cada card: foto, datos, $,     │
│  ☑ financ.  |  estado, [Ver detalle][Consultar]│
├─────────────────────────────────────────────┤
│ VENDÉ TU AUTO (navy)                          │
│  Beneficio + 3 pasos | Formulario cotización  │
├─────────────────────────────────────────────┤
│ CONFIANZA: 6 bloques + métricas               │
├─────────────────────────────────────────────┤
│ CÓMO FUNCIONA: [Comprar][Vender] → 4 pasos    │
├─────────────────────────────────────────────┤
│ TESTIMONIOS: 3 reseñas                         │
├─────────────────────────────────────────────┤
│ FAQ: acordeón (6 preguntas)                   │
├─────────────────────────────────────────────┤
│ FOOTER: marca | nav | redes | contacto        │
└─────────────────────────────────────────────┘
 [Modal detalle] · [Action-bar mobile] · [FAB WhatsApp desktop]
```

---

## 🧩 Componentes

| Componente | Dónde | Reutilizable |
|---|---|---|
| Botones (`.btn` + variantes `--primary/--accent/--wa/--ghost/--light`) | global | ✅ |
| Header + menú mobile | `index.html` / `app.js` | — |
| Buscador rápido (`.searchbar`) | hero | — |
| Panel de filtros (`.filters`) | catálogo | — |
| Card de vehículo (`cardTemplate`) | `app.js` | ✅ (data-driven) |
| Modal de detalle + galería | `app.js` | ✅ |
| Formulario (`.form`) | vender | ✅ |
| Trust card / Stat / Howto card / Testimonio / FAQ item | secciones | ✅ |
| Toast, Action-bar, FAB WhatsApp | global | ✅ |

---

## ✍️ Copywriting (resumen por sección)

- **Hero:** *"Tu próximo auto, sin vueltas y con confianza."* + subtítulo de simplicidad y trato humano.
- **Catálogo:** *"Elegí entre nuestros autos seleccionados"* — refuerza curaduría.
- **Vender:** *"Vendé tu auto rápido, seguro y al mejor precio."* + 3 pasos + microcopy de privacidad.
- **Confianza:** 6 pilares (selección, seguridad, atención, tasación, documentación, clientes).
- **Cómo funciona:** dos recorridos (comprar/vender) en 4 pasos cada uno.
- **FAQ:** financiación, usado en parte de pago, verificación, visita, documentación, tasación.
- **CTAs:** "Ver autos disponibles", "Quiero vender mi auto", "Consultar por WhatsApp", "Cotizar mi auto".

---

## 🔌 Integraciones

### WhatsApp
Todos los CTA de contacto y los formularios arman un mensaje prellenado y abren `wa.me`.
Los textos base están en `CONFIG.waMessages`.

### CRM (preparado, no conectado)
En `app.js` la función `sendToCRM(payload)` es el punto de integración. Hoy loguea en consola;
reemplazar por un `fetch()` a tu endpoint para capturar leads (compra/venta).

### Carga dinámica de stock (futuro)
`data.js` expone un array `VEHICLES`. Para conectar a una API, reemplazar por:
```js
const VEHICLES = await (await fetch('/api/vehiculos')).json();
```
La capa de render (`renderCatalog`) no necesita cambios.

---

## ✅ Checklist de implementación

**Listo en esta versión**
- [x] Header fijo + menú mobile + CTAs
- [x] Hero con posicionamiento + buscador rápido
- [x] Filtros (marca, modelo, tipo, año, km, precio, financiación) + orden
- [x] Catálogo data-driven con cards
- [x] Modal de detalle con galería y CTA fijo
- [x] Sección "Vendé tu auto" + formulario → WhatsApp
- [x] Confianza + métricas
- [x] Cómo funciona (comprar/vender)
- [x] Testimonios (placeholders)
- [x] FAQ (acordeón)
- [x] Footer con contacto/redes/horarios
- [x] Action-bar mobile + FAB WhatsApp
- [x] SEO básico, Open Graph y datos estructurados (AutoDealer)
- [x] Estados hover/focus, accesibilidad básica, `prefers-reduced-motion`

**Antes de publicar (a cargo de RPM)**
- [ ] Cargar datos reales en `config.js` (WhatsApp, dirección, horarios, redes)
- [ ] Reemplazar `logo.svg` por el logo oficial
- [ ] Cargar stock real con fotos en `data.js`
- [ ] Crear `assets/og-image.jpg` (1200×630) para compartir en redes
- [ ] Reemplazar testimonios por reseñas verificadas
- [ ] Configurar dominio + HTTPS y verificar `canonical`/URLs absolutas
- [ ] Agregar Google Analytics / Meta Pixel y eventos de conversión (clicks WhatsApp, envío de formularios)

---

## 🔮 Mejoras futuras
- Página propia por vehículo (`/auto/:id`) con SSR para SEO individual.
- Galería con carga real de múltiples fotos + zoom/lightbox.
- Backend/CRM real + panel de administración para cargar autos sin tocar código.
- Filtros con contador por opción y URL compartible (querystring).
- Calculadora de financiación / cuotas estimadas.
- Comparador de vehículos.
- Multimoneda (USD/ARS) con cotización.
- Tests E2E (Playwright) y Lighthouse en CI.
- i18n y modo oscuro.
