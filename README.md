# RPM Móviles — Sitio web

Sitio comercial responsive para **RPM Móviles**, concesionaria de autos usados en CABA.
Objetivo: **generar más leads, consultas por WhatsApp, captación de usados, ventas y
posicionamiento orgánico en Google**. UX inspirada en Kavak / Mercado Libre Autos / Carvana,
con identidad propia más cercana y humana.

---

## 🚀 Cómo correrlo

HTML + CSS + JS vanilla. Las fichas de cada auto se **generan como HTML estático** con un
pequeño script de Node (sin frameworks ni dependencias).

```bash
# 1. Generar las páginas de cada auto + sitemap + robots
npm run build          # (equivale a: node build.js)

# 2. Levantar un servidor local en la raíz (recomendado: las rutas son root-relativas)
npm run serve          # http://localhost:8080
# o todo junto:
npm run dev
```

> Las páginas usan rutas **root-relativas** (`/css`, `/js`, `/autos/...`). Sirvas siempre desde
> la raíz del dominio (en producción) o con un server local apuntando a la carpeta del proyecto.

---

## ⚙️ Qué editar (sin tocar la lógica)

| Archivo | Qué contiene |
|---|---|
| **`js/config.js`** | WhatsApp, teléfono, email, Instagram, dirección, horarios, métricas, moneda, dominio (`siteUrl`) y mensajes de WhatsApp. Todo centralizado. |
| **`js/data.js`** | El stock de autos (array `VEHICLES`). Agregar/editar/borrar autos acá. |

**Después de editar `data.js`, regenerá las páginas:** `npm run build`.

> ⚠️ WhatsApp en formato internacional sin `+`, espacios ni guiones (ej: `5491123330202`).
> Datos actuales ya cargados: WhatsApp `11 2333-0202`, tel `11 7079-8444`,
> IG `@rpm_moviles`, Av. de los Constituyentes 4636 (CABA), comercial@rpmmoviles.com.ar.

---

## 🏛️ Arquitectura

```
rpm-web/
├── index.html                 # Home (hero, catálogo filtrable, vender, confianza, FAQ…)
├── build.js                   # Generador estático: fichas + /autos/ + sitemap + robots
├── package.json               # Scripts: build / dev / serve
├── css/
│   └── styles.css             # Design system (tokens) + componentes (mobile-first)
├── js/
│   ├── config.js              # ⚙️ Config editable (isomórfico: navegador + Node)
│   ├── data.js                # 🚗 Stock (isomórfico, listo para API/CRM)
│   ├── ui.js                  # UI compartida (header, WhatsApp, galería, contacto, tracking)
│   └── catalog.js             # Lógica de la home (filtros, orden, buscador, form vender)
├── assets/
│   ├── logo.svg               # Logo PLACEHOLDER (reemplazar por el oficial)
│   └── placeholder-car.svg    # Imagen fallback cuando un auto no tiene foto
│
│  ── generados por build.js (commiteados para deploy) ──
├── autos/
│   ├── index.html             # Índice de stock /autos/
│   └── <id>/index.html        # Ficha individual de cada auto → /autos/<id>/
├── sitemap.xml
└── robots.txt
```

### Arquitectura de páginas
- **Home** (`/`): single page con navegación por anclas + catálogo filtrable (client-side).
- **Índice de stock** (`/autos/`): listado completo, SEO-friendly.
- **Ficha por vehículo** (`/autos/<id>/`): **página propia con URL amigable**, HTML estático
  para máxima indexación y enlaces compartibles. Estructura tipo Kavak/ML/Carvana:
  galería + CTA sticky con precio + ficha técnica + descripción + documentación + relacionados.

### SEO por ficha (automático en `build.js`)
- ✅ URL amigable (`/autos/marca-modelo-anio/`)
- ✅ `<title>` dinámico · meta description dinámica
- ✅ Open Graph + Twitter Card (imagen, título, descripción por auto)
- ✅ `canonical` por página
- ✅ **Schema.org `Car` + `Offer`** (precio, moneda, km, combustible, transmisión, condición usado)
- ✅ **Schema.org `BreadcrumbList`** + breadcrumb visible
- ✅ `ItemList` en `/autos/`, `AutoDealer` en la home
- ✅ `sitemap.xml` + `robots.txt` regenerados en cada build

---

## 📈 Medición de conversiones (CRO)
`ui.js` empuja eventos a `window.dataLayer` (listo para Google Tag Manager / GA4):
`whatsapp_click`, `lead_submit`, `search_submit`, `share_click`. Mapearlos como conversiones
al instalar GTM. El lead del formulario también pasa por `sendToCRM()` (hook en `catalog.js`).

---

## 🔌 Integraciones
- **WhatsApp:** todos los CTA y formularios abren `wa.me` con mensaje prellenado (incluye link del auto).
- **CRM (preparado):** `sendToCRM(payload)` en `catalog.js` → reemplazar por `fetch()` a tu endpoint.
- **Stock dinámico (futuro):** reemplazar el array de `data.js` por `await fetch('/api/vehiculos')` y rebuild.

---

## ✅ Checklist de implementación

**Listo**
- [x] Home: header fijo, hero + buscador, catálogo filtrable, vender, confianza, cómo funciona, testimonios, FAQ, footer
- [x] **Páginas individuales por auto** con SEO completo (title/meta/OG/Schema.org/canonical)
- [x] Índice `/autos/`, `sitemap.xml`, `robots.txt`
- [x] CTAs y formularios → WhatsApp con mensaje prellenado
- [x] Datos de contacto centralizados en `config.js`
- [x] Tracking de conversiones (dataLayer / GTM-ready) + hook CRM
- [x] Responsive mobile-first, action-bar mobile + FAB WhatsApp, hover/focus, `prefers-reduced-motion`

**Antes de publicar (a cargo de RPM)**
- [ ] Reemplazar `logo.svg` por el logo oficial
- [ ] Cargar stock real con **fotos** en `data.js` y `npm run build`
- [ ] Crear `assets/og-image.jpg` (1200×630) para compartir
- [ ] Confirmar horarios reales en `config.js`
- [ ] Reemplazar testimonios por reseñas verificadas
- [ ] Instalar GTM/GA4 y marcar `whatsapp_click` y `lead_submit` como conversiones
- [ ] Verificar en Google Search Console + enviar `sitemap.xml`

---

## 🔮 Mejoras futuras
- Backend/CRM real + panel de administración (cargar autos sin tocar código ni rebuild manual).
- GitHub Action que ejecute `npm run build` automáticamente al cambiar `data.js`.
- Galería con fotos reales + lightbox/zoom.
- Filtros con URL compartible (querystring) y contador por opción.
- Calculadora de cuotas / financiación.
- Comparador de vehículos y favoritos.
- Multimoneda (USD/ARS) y tests E2E + Lighthouse en CI.
