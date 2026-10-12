# Rediseño del portafolio personal — Diseño

- **Fecha:** 2026-10-12
- **Estado:** Aprobado en conversación, pendiente de revisión escrita
- **Rama:** `redesign`
- **Versión anterior:** tag `v1-2018` (Materialize + jQuery, sin mantenimiento; no se reutiliza nada)

## 1. Objetivo

Reemplazar el sitio estático de 2018 por un portafolio moderno, rápido y fácil de mantener, publicado en GitHub Pages.

**Audiencias, en orden de prioridad:**
1. Marca personal / comunidad: mostrar proyectos y forma de trabajar.
2. Clientes freelance: entender qué ofrezco y contactarme.
3. Reclutadores: experiencia, stack y CV.

**Criterios de éxito:**
- Agregar o editar un proyecto = crear o editar un archivo de contenido + `git push`. Sin tocar código.
- Lighthouse ≥ 95 en Performance, Accessibility, Best Practices y SEO (home y página de proyecto).
- Inglés como idioma principal, español disponible en cada página.
- Todo el desarrollo corre en Docker; nada se instala en la máquina host.
- El sitio es legible y usable por IAs: `llms.txt`, JSON-LD y WebMCP.

**Fuera de alcance (por ahora):** blog, formulario de contacto, CMS, backend, analytics, dominio propio, contenido real de proyectos (se agrega en una fase posterior).

## 2. Stack

| Pieza | Elección |
|---|---|
| Generador | Astro (última estable), salida 100 % estática |
| Interactividad | Islas React solo donde hace falta (`ThemeToggle`, `ImageGallery`) |
| Estilos | Tailwind CSS v4 con tokens de diseño propios |
| Contenido | Astro content collections (MDX + YAML) validadas con Zod |
| Lenguaje | TypeScript estricto |
| Tests | Vitest (unitarios) + Playwright (navegador) |
| Runtime | Node 22 LTS, solo dentro de Docker |
| Deploy | GitHub Actions → GitHub Pages (source "GitHub Actions" ya configurado) |

## 3. Dirección visual — "B1 Editorial light"

- Fondo claro cálido (`#f6f3ee`), texto casi negro (`#1b1a17`), texto secundario (`#6b665d`).
- Acento terracota: `#c2410c` en modo claro, `#fb923c` en modo oscuro.
- Modo oscuro: fondo `#1a1816`, texto `#ece6dc`.
- Tipografía: serif expresiva para titulares (Fraunces o similar) + sans para cuerpo (Inter o similar), auto-alojadas.
- Mucho espacio en blanco, layout tipo revista, animaciones sutiles.
- Los valores exactos se fijan como tokens CSS en `src/styles/global.css` y deben cumplir contraste WCAG AA en ambos modos.

## 4. Estructura del proyecto

```
mariovzc.github.io/
├── .github/workflows/deploy.yml
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── AGENTS.md                      # contexto para agentes de IA (fuente única)
├── CLAUDE.md                      # importa AGENTS.md
├── README.md
├── astro.config.mjs
├── docs/superpowers/specs/
├── public/
│   ├── favicon.svg
│   ├── (robots.txt: generado por un endpoint a partir de `site`)
│   └── cv/                        # CV público (fase de contenido)
├── src/
│   ├── components/
│   │   ├── astro/                 # Hero, ProjectsSection, ProjectCard, About, Services,
│   │   │                          # Experience, Contact, Nav, Footer, SEO
│   │   └── react/                 # ThemeToggle, ImageGallery
│   ├── content/
│   │   ├── projects/{en,es}/*.mdx
│   │   └── profile/{en,es}.yaml
│   ├── content.config.ts          # esquemas Zod
│   ├── i18n/{en,es}.json + utils.ts
│   ├── layouts/BaseLayout.astro
│   ├── lib/                       # lógica pura testeable (site data, llms, jsonld, webmcp tools)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects/[slug].astro
│   │   ├── llms.txt.ts
│   │   ├── 404.astro
│   │   └── es/index.astro, es/projects/[slug].astro
│   ├── scripts/webmcp.ts
│   └── styles/global.css
└── tests/{unit,e2e}/
```

**Principios:**
- Un componente, una responsabilidad. `index.astro` solo ordena las secciones.
- Las páginas `es/` reutilizan los mismos componentes con `lang="es"`; no duplican lógica.
- La lógica no visual (armar datos, generar `llms.txt`, JSON-LD, herramientas WebMCP) vive en `src/lib/` como funciones puras, testeables con Vitest.
- Se eliminan `index.html`, `css/`, `js/`, `images/` y `bs4/`.
- Blog futuro: se añadiría como `src/content/blog/` + `src/pages/blog/` sin modificar lo existente.

## 5. Páginas y secciones

**Home (`/` y `/es/`), en este orden:**
1. **Hero:** nombre, rol, titular, badge de disponibilidad (opcional), CTAs "View work" y "Contact".
2. **Proyectos destacados:** tarjetas de proyectos con `featured: true`, ordenadas por `order`.
3. **Sobre mí + stack.**
4. **Servicios.**
5. **Experiencia + descarga de CV** (el CV se oculta si no hay archivo configurado).
6. **Contacto:** email y redes. Sin formulario.

**Detalle de proyecto (`/projects/<slug>` y `/es/projects/<slug>`):** portada, resumen, año, rol, stack, links (live/repo), galería y cuerpo MDX (problema, solución, rol, resultados, aprendizajes). Incluye navegación al proyecto anterior/siguiente.

**404:** página propia, bilingüe, con enlace al inicio.

## 6. Modelo de contenido

Una sola fuente de verdad. Páginas, `llms.txt`, JSON-LD, sitemap y WebMCP leen de las mismas colecciones.

### 6.1 Proyectos — `src/content/projects/{en,es}/<slug>.mdx`

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `title` | string | sí | |
| `summary` | string ≤ 160 | sí | Tarjeta, meta description, `llms.txt` |
| `year` | number | sí | |
| `role` | string | sí | |
| `stack` | string[] | sí | ≥ 1 |
| `tags` | string[] | no | p. ej. `web`, `mobile`, `freelance`, `open-source` |
| `cover` | image | sí | Optimizada por Astro (AVIF/WebP) |
| `gallery` | image[] | no | |
| `links.live` / `links.repo` | url | no | Repo privado → se omite |
| `featured` | boolean | no (default `false`) | |
| `order` | number | no (default `100`) | Orden entre destacados |
| `draft` | boolean | no (default `false`) | `true` → no se publica |

- El slug es el nombre del archivo; el mismo slug en `en/` y `es/` enlaza las traducciones.
- Si falta la versión ES, `/es/projects/<slug>` muestra el contenido EN con el aviso "Disponible solo en inglés", sin 404. Su `<link rel="canonical">` apunta a la versión EN y no se declara `hreflang` es.
- Un error de esquema hace fallar el build con un mensaje que indica archivo y campo.
- Los `draft` no se publican, pero son visibles en GitHub si el repo es público. Lo confidencial no se commitea.

### 6.2 Perfil — `src/content/profile/{en,es}.yaml`

Campos: `name`, `headline`, `role`, `location`, `bio`, `availability` (opcional), `services[] {title, description}`, `experience[] {company, role, start, end?, summary}`, `stack {frontend[], backend[], tools[]}`, `contact {email, github?, linkedin?, x?}`, `cv` (ruta opcional).

### 6.3 Textos de interfaz — `src/i18n/{en,es}.json`

Etiquetas de botones, navegación y títulos de sección. El helper `t(lang, key)` falla en tests si una clave existe en un idioma y no en el otro.

## 7. Idiomas

- `en` por defecto en `/`, `es` en `/es/` (i18n routing nativo de Astro, `prefixDefaultLocale: false`).
- El selector de idioma es un enlace Astro simple (sin isla React) que lleva a la misma página en el otro idioma.
- Sin redirección automática por idioma del navegador.
- `<html lang>` correcto por página.

## 8. SEO

Componente `SEO.astro` en el layout, por página:
- `<title>` y meta description (de `summary` o del perfil).
- `<link rel="canonical">` absoluto, basado en la URL `site` de `astro.config.mjs`.
- `hreflang` `en`, `es` y `x-default` cuando existen ambas versiones.
- Open Graph + Twitter card. Imagen: portada del proyecto, o una imagen estática diseñada para el home.
- JSON-LD: `Person` (home), `CreativeWork` (proyecto), `WebSite`.
- `@astrojs/sitemap` con alternativas por idioma.
- `robots.txt` generado por un endpoint a partir de `site`, que permite todo, incluidos explícitamente `GPTBot`, `ClaudeBot`, `PerplexityBot` y `Google-Extended`, y declara el sitemap.

**Dominio:** inicialmente `https://mariovzc.github.io`. Migrar a dominio propio = cambiar `site` + añadir `public/CNAME` + DNS (documentado en el README).

## 9. Tema y accesibilidad

- Al cargar: preferencia guardada en `localStorage` → si no hay, `prefers-color-scheme`.
- Script inline bloqueante en `<head>` aplica la clase antes del primer pintado (sin parpadeo). Acceso a `localStorage` envuelto en `try/catch`.
- `ThemeToggle` (isla React) cambia y guarda la preferencia.
- WCAG AA de contraste en ambos modos, navegación completa con teclado, foco visible, `prefers-reduced-motion` desactiva animaciones, imágenes con `alt` obligatorio.

## 10. Contexto de IA

| Capa | Para quién | Implementación |
|---|---|---|
| Desarrollo | Agentes que trabajan en el repo | `AGENTS.md` (stack, comandos `make`, convenciones, cómo añadir proyecto/idioma, regla: nunca `npm` en el host). `CLAUDE.md` importa `AGENTS.md`. |
| Lectura | IAs de búsqueda / crawlers | `/llms.txt` generado en build desde perfil + proyectos publicados; JSON-LD; `robots.txt`. |
| Acción | Agentes en el navegador | WebMCP (sección 11). |

## 11. WebMCP

Mejora progresiva; sin efecto en navegadores sin soporte.

- `src/scripts/webmcp.ts`, script sin React cargado en todas las páginas.
- Detección: `document.modelContext ?? navigator.modelContext`; si ninguno existe, no hace nada.
- Registro con `registerTool()` (la API actual devuelve una Promise; los errores se capturan y se ignoran en silencio).
- Herramientas de solo lectura; los datos se inyectan en build como JSON desde las colecciones:
  - `list_projects({ stack?, tag?, lang? })` → título, resumen, año, stack, URL.
  - `get_project({ slug, lang? })` → detalle completo (sin el cuerpo MDX renderizado; incluye resumen y metadatos).
  - `get_profile({ lang? })` → bio, rol, stack, servicios, experiencia.
  - `get_contact()` → email, redes, URL del CV.
- Las definiciones y handlers viven en `src/lib/webmcp-tools.ts` (puros, testeables); `webmcp.ts` solo hace el registro.
- Token de origin trial opcional vía variable de entorno `PUBLIC_WEBMCP_OT_TOKEN`; si existe se inyecta como `<meta http-equiv="origin-trial">`.
- Nota: la API cambió durante 2026 (de `navigator` a `document`) y está en origin trial en Chrome. Se revisa la spec vigente al implementar.

## 12. Docker y flujo diario

- `Dockerfile` basado en `node:22-bookworm-slim` (no alpine: `node_modules` se comparte con la imagen Playwright basada en glibc). `docker-compose.yml` monta el código y guarda `node_modules` en un volumen con nombre.
- Hot reload con polling activado (fiabilidad de eventos de archivos macOS → contenedor).
- Puerto de desarrollo `4321`.
- Playwright y Lighthouse corren en contenedores propios (imagen oficial de Playwright; Chromium en contenedor para Lighthouse).

| Comando | Acción |
|---|---|
| `make dev` | Servidor de desarrollo en `localhost:4321` |
| `make stop` | Detiene los contenedores |
| `make build` | Build de producción en `dist/` |
| `make preview` | Sirve `dist/` |
| `make check` | `astro check` (tipos + contenido) + Prettier (sin ESLint, a propósito: sitio estático pequeño) |
| `make test` | Vitest + Playwright |
| `make lighthouse` | Lighthouse contra el build, reporte en `reports/` |
| `make add pkg=<nombre>` | Instala una dependencia dentro del contenedor |
| `make clean` | Borra contenedores, volúmenes y `dist/` |

## 13. Pruebas

| Nivel | Herramienta | Cubre |
|---|---|---|
| Contenido | Zod + `astro check` | Campos obligatorios, tipos, URLs, imágenes existentes |
| Unitario | Vitest | `t()` y paridad de claves EN/ES, resolución de traducciones de proyectos y fallback, generador de `llms.txt`, JSON-LD, handlers WebMCP |
| Navegador | Playwright | Home y detalle cargan en ambos idiomas, el selector de idioma mantiene la página, `ThemeToggle` persiste, sin enlaces internos rotos, 404 funciona, meta tags SEO presentes |
| Calidad | Lighthouse (local) | Objetivo ≥ 95 en las cuatro categorías |

Mientras no haya contenido real, se usan 2 proyectos de ejemplo marcados como tales, uno solo en EN para probar el fallback. Se reemplazan en la fase de contenido.

## 14. Deploy

Workflow `.github/workflows/deploy.yml` en push a `master`:
1. Instala dependencias (`npm ci`) con Node 22.
2. `astro check` + Vitest.
3. Build.
4. Publica con `actions/upload-pages-artifact` + `actions/deploy-pages`.

Si cualquier paso falla, no se publica y el sitio anterior sigue en línea. Playwright y Lighthouse no se ejecutan en CI en esta fase.

## 15. Migración

1. Trabajo en la rama `redesign`; `master` sigue sirviendo la versión anterior.
2. Versión antigua preservada en el tag `v1-2018`.
3. En `redesign` se eliminan los archivos antiguos y se construye el sitio nuevo.
4. Revisión del usuario → merge a `master` → deploy automático.
5. `.gitignore` incluye `node_modules/`, `dist/`, `.astro/`, `reports/`, `.superpowers/`, `.DS_Store` y PDFs personales en la raíz (`/*.pdf`).

## 16. Fase posterior (no incluida en este spec)

- Contenido real: proyectos (pendiente de confirmar cuáles son públicos), perfil a partir del CV, CV público sin datos sensibles.
- Dominio propio.
- Blog.

## 17. Cambios durante la implementación (2026-10-12)

- Imagen Docker base `node:22-bookworm-slim` en lugar de alpine: `node_modules` se comparte con la imagen Playwright (glibc).
- El selector de idioma es un enlace Astro plano, no una isla React; la página 404 lo apunta a `/es/`.
- `robots.txt` lo genera un endpoint a partir de `site`.
- `make check` = `astro check` + Prettier; no hay ESLint (decisión deliberada para un sitio estático pequeño).
- `image.dangerouslyProcessSVG` está activo porque las portadas de ejemplo son SVG que sharp rasteriza a WebP.
- Las páginas de proyecto con contenido de respaldo (fallback) se excluyen del sitemap con `src/lib/sitemap.ts`, que reutiliza `localizeProjects`; los nombres de archivo de proyectos deben ser kebab-case en minúsculas.
- Las páginas `noindex` (404) no emiten canonical ni hreflang.
