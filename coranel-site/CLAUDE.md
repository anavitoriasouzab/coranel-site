# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A one-page static landing site for "Lívia Coranel · Advocacia previdenciária", a fictional social-security (INSS) law practice in Manaus, built as a portfolio project. It is plain HTML/CSS/vanilla JS: no package manager, no build step, no linter, no tests.

## Running it

Serve the folder (the motion libraries load from CDNs, so you need internet access):

```sh
npx serve .   # or just open index.html in the browser
```

## Structure

- `index.html`: the landing page. Sections in order: intro overlay, header, hero, `.faixa` (scrolling marquee), `#advogada`, the concerns cards, `#como-funciona` (the "storytime"), `#compromisso`, `#duvidas`, `#contato` (message builder), the footer (ends with the `.fecho` signed-letter closing), and the floating WhatsApp button.
- `css/style.css`: one stylesheet grouped by section. Tokens are in `:root`. Responsive overrides are all at the bottom: 1180px (the menu becomes the hamburger dropdown), 1100px (the hero stacks the photo above the text using the horizontal image, and two-column layouts collapse), 900px (the hero switches to the vertical `hero-mobile` crop, and cards stack), and 600px. The `prefers-reduced-motion` block comes last.
- `js/main.js`: all behavior. It depends on GSAP 3.13 + ScrollTrigger + SplitText and Lenis 1.1, loaded from CDNs at the end of `index.html`.
- `politica-de-privacidade.html`, `termos-de-uso.html`, `404.html`: standalone pages that reuse `style.css` (`.doc-pagina`, `.erro`) and do not load `main.js`.
- `robots.txt`, `sitemap.xml`, `site.webmanifest`: use the placeholder domain `https://www.exemplo.com.br`.
- Hero image: a CSS background on `.hero__bg` that uses `image-set()` (WebP, with JPG as fallback). Desktop uses `hero-1672.*`. At 900px and below it switches to `hero-mobile.*`, a vertical crop shown only in the top part of the hero and faded to black. A dark gradient (`--hero-veu`) covers the light right side so the white text stays readable. The variants are generated with `sharp` from the source PNG `assets/img/Advogada em Escritório Elegante.png`. Never upscale past the source width.

## How the motion works

- An inline script adds `.js` to `<html>`. CSS hides `.reveal` and `.hero-anim` only under `.js`. If GSAP fails to load, `main.js` removes `.js` and the intro, so the page stays usable. `.intro` also has a CSS failsafe animation that hides it after 5s.
- `main.js` waits for fonts (max 1.2s) before splitting text, then sets up Lenis synced to the GSAP ticker. With `prefers-reduced-motion`, Lenis and every animation are skipped and the CSS shows everything.
- The intro plays once per session (`sessionStorage` key `lc-intro`).
- **Storytime (`.historia`)**: `gsap.matchMedia` chooses between two modes. On screens at least 901px wide and 700px tall, `historiaFixa()` adds `.historia--pin`, stacks the four `.capitulo` items in one grid cell, and drives them with one scrubbed, pinned timeline that snaps to labels. Elements marked `[data-passo]` inside the mockups build up step by step, and `.trilha__fill` tracks progress. Everywhere else, `historiaModoLista()` shows the chapters stacked, with one-shot reveals.
- ScrollTriggers below the pinned section depend on its pin spacer. `iniciar()` calls `ScrollTrigger.sort()` and `refresh()` after creating everything. Keep that in place if you add triggers.
- **Contact `.montador`**: a `<form>` that posts the default message to `wa.me` without JS. With JS, the radio chips and the name field build the text (the `situacoes`/`formatos` maps in `main.js`), update `.previa__balao` live and open `wa.me` on submit. The WhatsApp number is duplicated in `NUMERO` in `main.js`.
- **Footer `.fecho`**: "Atenciosamente," plus an SVG `<text>` signature in Mrs Saint Delafield. `main.js` fits its viewBox to `getBBox()` once fonts load, and a scrubbed `clip-path` wipe plus the `.fecho__pena` dot "writes" it. `.voltar__progresso` is a ring that shows scroll progress.
- **About (`#advogada`)**: on desktop `.sobre__foto` is `position: sticky`, so the section uses `overflow: clip`, not `hidden`, which would break sticky. The arch opens with a `clip-path` reveal and the `<picture>` zooms out. `.selo` (a rotating `textPath` seal: CSS spin on the SVG plus a scroll-scrubbed rotation on `.selo__giro`) and `.cartao` float on parallax. The quote is split into lines, then `.grifo` draws its highlight by animating `background-size`. The background has two drifting `.sobre__luz` glows (CSS keyframes) and a faint `.sobre__marca` monogram. At 1100px and below the photo moves above the text (`order: -1`).
- `[data-split]` headings reveal word by word, `[data-contar]` numbers count up, `.magnetico` buttons follow the cursor, and `.card` elements get the spotlight (`--mx`/`--my`) plus a 3D tilt on fine pointers.

## Conventions

- Everything is in Brazilian Portuguese: copy, class names, JS identifiers and comments. Classes are BEM-like (`bloco__elemento`, `bloco--variante`).
- The copy's promises (reply within 1 business day, written opinion within 7 business days, updates every 15 days, rescission without penalty, never asking for the gov.br password) are repeated across the hero, cards, storytime, compromisso, FAQ, footer, legal pages and the meta description. A change to one must be made in all of them.
- Lawyer advertising (OAB Provimento 205/2021): no testimonials and no promised results. The storytime mockups are labeled illustrative, so keep them that way.
- The serif is EB Garamond. Cormorant Garamond was dropped because its accents (í, ú, ê) render shifted to the right. Body text uses Montserrat, and the footer signature uses Mrs Saint Delafield. EB Garamond defaults to old-style figures, so `lining-nums` is set on `body`.

## Placeholders still in the code

The WhatsApp number `5500000000000` (hero, contact form action, `NUMERO` in `main.js`, floating button, privacy policy), `OAB/AM 00.000`, the Instagram link `https://instagram.com/`, and the `exemplo.com.br` domain.
