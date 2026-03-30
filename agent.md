# Raven Website - Agent Instructions

This document contains every instruction your coding agent needs to implement the
Raven marketing and docs website from the scaffolded starting point.

---

## What is already done

The following files exist and are complete. Do not rewrite them unless something
is broken:

- `src/styles/global.css` - all design tokens, CSS variables (light + dark), typography,
  layout utilities, component styles (navbar, hero, cards, steps, docs, footer, search modal,
  animations). This is the source of truth for all styling.
- `src/layouts/BaseLayout.astro` - base HTML shell with theme flash prevention script in `<head>`.
- `src/layouts/DocsLayout.astro` - wraps BaseLayout with the docs sidebar and navbar.
- `src/components/layout/NavbarClient.tsx` - React island: scroll behavior, theme toggle,
  search modal trigger, keyboard shortcuts.
- `src/components/layout/Footer.astro` - minimal footer.
- `src/components/docs/DocsSidebar.astro` - static docs navigation sidebar.
- `src/components/landing/Hero.tsx` - React island with Three.js placeholder canvas + hero content.
- `src/pages/index.astro` - full landing page (hero, why, how, getting started, stack strip, footer).
- `src/pages/docs/index.astro` - introduction article (the main docs narrative page).
- `src/pages/docs/installation.astro` - installation placeholder.
- `src/pages/docs/[slug].astro` - catch-all for remaining placeholder doc pages.
- `astro.config.mjs` - Astro config with React, Tailwind, MDX integrations, static output.
- `tailwind.config.mjs` - Tailwind wired to the CSS variable tokens.
- `vercel.json` - build + output config for Vercel.

---

## What you need to implement

Work through each task in order. Each is independent unless noted.

---

### TASK 1 - Wire global.css into every page

Every `.astro` page that doesn't use a layout that already imports `global.css`
needs this at the top of the frontmatter:

```astro
---
import '../styles/global.css'; // adjust relative path as needed
---
```

`BaseLayout.astro` should import it directly so all pages that use a layout get it
automatically. Open `src/layouts/BaseLayout.astro` and add this import inside the
`<head>` or at the top of the frontmatter. Remove the individual imports from pages
once the layout handles it.

---

### TASK 2 - Copy the logo assets into /public

The following files must be present in the `public/` directory at the project root:

- `public/raven-icon.svg` - the square icon (the raven bird on teal background)
- `public/raven-logo-dark.png` - horizontal full logo, dark variant
- `public/raven-logo-light.png` - horizontal full logo, light variant

Copy them from wherever they currently live. These are referenced in the navbar,
footer, and hero. The paths in the code are exact - do not rename the files.

The `NavbarClient.tsx` references `/raven-icon.svg` for the navbar logo.
The `Footer.astro` references `/raven-icon.svg` for the footer logo.
The `Hero.tsx` can optionally show the horizontal logo - add it if it improves
the hero visually (light/dark aware using `data-theme`).

---

### TASK 3 - Navbar: make the logo theme-aware in Hero

In `src/components/landing/Hero.tsx`, below the badge and above the `<h1>`, add
a theme-aware logo:

```tsx
// Read current theme from html attribute
const [theme, setTheme] = useState('light');
useEffect(() => {
  const obs = new MutationObserver(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  return () => obs.disconnect();
}, []);

// Then in JSX:
<img
  src={theme === 'dark' ? '/raven-logo-dark.png' : '/raven-logo-light.png'}
  alt="Raven"
  style={{ height: 32, width: 'auto', marginBottom: 'var(--space-8)' }}
/>
```

---

### TASK 4 - Scroll animation observer on landing page

`src/pages/index.astro` already has a `<script>` block at the bottom that attaches
an `IntersectionObserver` to all `.animate-on-scroll` elements. Verify it runs
correctly on the page. If elements start invisible and fade in as you scroll down,
it is working. No changes needed if it works.

If it does not trigger: the issue is usually that the script runs before elements
are in the DOM. Wrap the observer setup in a `DOMContentLoaded` listener:

```js
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(...);
  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
});
```

---

### TASK 5 - Navbar sticky/float transition

Open `src/components/layout/NavbarClient.tsx`.

The navbar has two states: floating (pill shape, fixed, centered) and sticky
(full-width rectangle, stuck to top of viewport). The CSS classes `.navbar-float`
and `.navbar-float.scrolled` handle the visual transition - they are already defined
in `global.css`.

The React component adds the `scrolled` class when `window.scrollY > 80`. This is
already implemented. Verify it works by scrolling the landing page.

One edge case to handle: on the docs pages, the page may already be scrolled past
the threshold on load (e.g. if the user navigates to an anchor). Initialise the
`scrolled` state from `window.scrollY` on mount:

```tsx
const [scrolled, setScrolled] = useState(() =>
  typeof window !== 'undefined' ? window.scrollY > SCROLL_THRESHOLD : false
);
```

---

### TASK 6 - Search modal: wire up pagefind

This is the most complex task. Do it last.

After `bun run build` runs, Astro generates the static `dist/` folder.
`pagefind` then indexes it:

```
bunx pagefind --site dist
```

This creates `dist/pagefind/` with the search index. The `package.json` build
script already chains these.

To use pagefind in the search modal:

1. In `NavbarClient.tsx`, when the search modal opens, dynamically load the
   pagefind bundle:

```tsx
useEffect(() => {
  if (!searchOpen) return;
  // @ts-ignore
  import('/pagefind/pagefind.js').then((pf) => {
    pf.init();
    // store pf on a ref for use in the input handler
  });
}, [searchOpen]);
```

2. On input change in the search field, call `pf.search(query)` and render
   the results from the returned `results` array. Each result has `.data()`
   which returns title, excerpt, url.

3. Render results as links inside `.search-results`. Style them to match
   the existing search modal classes.

Note: pagefind only works in the production build, not in `bun run dev`.
During dev, the search modal will show the "Start typing..." empty state -
this is expected and acceptable.

---

### TASK 7 - Three.js hero scene (deferred)

`src/components/landing/Hero.tsx` has a `TODO` comment in `useEffect` and a
placeholder `hero-canvas` div that currently shows a subtle radial tint.

This task is intentionally left for later, after the owner selects a scene.
Do not implement a scene yet. Leave the placeholder as-is.

When the owner provides a scene choice, the implementation goes inside the
`hero-canvas` div. The canvas should:
- Be `position: absolute`, `inset: 0`, `width: 100%`, `height: 100%`
- Have `pointer-events: none` so clicks pass through to hero content
- Respect `data-theme` changes if the scene has colors

---

### TASK 8 - Verify the docs [slug].astro getStaticPaths

`src/pages/docs/[slug].astro` exports `getStaticPaths` at the bottom of the file.
In Astro, `getStaticPaths` must be exported from the frontmatter (the `---` block),
not from the script body.

Move the export inside the frontmatter:

```astro
---
export const getStaticPaths = () => [
  { params: { slug: 'agent-config' } },
  { params: { slug: 'server-config' } },
  { params: { slug: 'api-reference' } },
  { params: { slug: 'alerting' } },
  { params: { slug: 'security' } },
];

// rest of the frontmatter...
const { slug } = Astro.params;
---
```

---

### TASK 9 - Final check: bun run build

Run `bun run build`. It should:
1. Compile all Astro pages without errors
2. Run `bunx pagefind --site dist` and generate the search index

Fix any TypeScript or Astro compilation errors that appear. Common issues:
- Missing `client:load` directive on React islands used in `.astro` files
- Relative import path mismatches
- `Astro.params` typing in dynamic routes

---

## Design constraints (do not violate these)

- **No gradients** except the subtle `radial-gradient` used as a placeholder in the
  hero canvas. Remove even that once the Three.js scene is in place.
- **No emojis** anywhere in the UI.
- **No inline `style` colors** that are not CSS variables. All colors must reference
  `var(--token-name)` from `global.css`.
- **Icons** - use `lucide-react` throughout. The icon size for feature cards is 36px,
  navbar actions 15px, inline text 14px.
- **No new fonts**. Only Geist (sans) and Geist Mono are used.
- **No additional CSS frameworks or UI libraries** beyond what's already installed
  (Tailwind, lucide-react, clsx, tailwind-merge, class-variance-authority).

---

## Color reference

| Token | Light | Dark |
|---|---|---|
| `--accent` | `#00B4C6` | `#00C8DC` |
| `--bg` | `#ffffff` | `#09090b` |
| `--fg` | `#09090b` | `#fafafa` |
| `--fg-muted` | `#71717a` | `#a1a1aa` |
| `--border` | `#e4e4e7` | `#27272a` |

---

## File structure reference

```
src/
├── components/
│   ├── docs/
│   │   └── DocsSidebar.astro
│   ├── landing/
│   │   └── Hero.tsx              ← React island (client:load)
│   └── layout/
│       ├── Footer.astro
│       └── NavbarClient.tsx      ← React island (client:load)
├── layouts/
│   ├── BaseLayout.astro
│   └── DocsLayout.astro
├── pages/
│   ├── index.astro               ← Landing page
│   └── docs/
│       ├── index.astro           ← Introduction article
│       ├── installation.astro    ← Placeholder
│       └── [slug].astro          ← Catch-all placeholder
└── styles/
    └── global.css
```

---

## GitHub and links

- Main project repo: https://github.com/rvnhq/raven
- All external links to GitHub should use this URL.
- Install script is not yet available - any reference to it should show
  the `.placeholder-notice` component with "Install script coming soon."
