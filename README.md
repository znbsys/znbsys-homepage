**English** | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

# znbsys-homepage（ZnbSys）

A JSON-config-driven multilingual corporate website. One codebase — swap `config/locales/*.json` to generate a new site; supports full-site theming (primary color + dark/light background) with live switching in the admin panel.

Design reference: [awesome-design-md](https://github.com/voltagent/awesome-design-md)

## Features

- **JSON data-driven**: page structure and content come entirely from site config, validated by a Zod schema before rendering
- **i18n**: built-in `zh-CN` / `en` / `ja`, automatic negotiation via middleware (cookie → Accept-Language → default), with hreflang / og:locale SEO metadata
- **Full-site theme system**: derives a complete palette from the primary color (page bg, section bg, cards, borders, panels, accents, text); supports **dark / light background** modes
- **Admin panel `/admin`**: preset swatches + custom picker + dark/light toggle + one-click reset; the default primary `#2563eb` is always kept
- **Composable sections**: `order` controls the render order of hero / features / about / testimonials / contact; `about` and `testimonials` can be omitted
- **Icon allowlist**: Lucide icons validated via the allowlist in `lib/icons.ts`
- **Dual build tracks**: Next.js as the main artifact, plus `build:standalone` producing a single-file static site (sharing the same JSON config)

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3 · Zod · lucide-react · Vitest · Playwright

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 (root 302-redirects to /zh-CN)
```

```bash
npm run build && npm run start   # production build & foreground start
```

### Start / stop scripts (background, persistent)

For production, prefer the background scripts — they manage PID and logs automatically (port 3000):

```bash
./scripts/start.sh    # build (npm run build) and start the standalone runtime (node server.js) in background
./scripts/stop.sh     # stop by .server.pid; falls back to clearing residual processes on port 3000
```

- **start.sh**: idempotent — if the service is already running it prints a message and exits; after building it assembles `.next/standalone` (copying static assets) and runs `node server.js` in the background; build and runtime logs go to `.server.log`, PID to `.server.pid` (both gitignored); on startup failure it rolls back the PID file and tells you to check the log
- **stop.sh**: graceful stop by PID file first, then a port-based `kill -9` fallback, finally cleans up the PID file

Matching npm shortcuts:

```bash
npm run dev:background   # run next dev in background, silence stdout, echo PID
npm run stop             # kill processes on port 3000 (lsof -ti:3000 | kill -9)
npm run restart          # stop && start (foreground production server)
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Negotiates locale, then 302 to `/{locale}` |
| `/zh-CN` `/en` `/ja` | Marketing homepage (SSG) |
| `/{locale}/privacy` | Privacy policy |
| `/{locale}/terms` | Terms of service |
| `/{locale}/changelog` | Changelog |
| `/admin` | Admin panel (theme color / dark-light toggle; skips locale negotiation) |
| Others | 404 page for the matching locale |

## Directory structure

```
app/
  [locale]/          # Multilingual homepage layout & rendering (layout injects theme CSS vars)
  admin/page.tsx     # Admin panel
  globals.css        # Default theme tokens (:root CSS variables)
components/
  layout/            # Navbar / Footer / MobileMenu
  sections/          # Hero / Features / About / Testimonials / Contact
  admin/             # ThemeColorSwitcher
  ThemeColorApplicator.tsx  # Applies theme from localStorage after hydration
  LanguageSwitcher.tsx / DynamicIcon.tsx
config/
  locales/           # Site content config (zh-CN / en / ja), one per language
  fixtures/          # Test configs (minimal / brand-b)
  site-data.json     # zh-CN mirror (backward compatibility)
messages/            # UI copy dictionaries (nav.*, hero.*, …; missing keys fall back to the default locale)
i18n/                # Locale negotiation, config/dictionary loading, t() translation
lib/                 # color / palette / theme / themePresets / config / icons / cn / paths
schemas/             # Zod: SiteConfigSchema
types/               # SiteConfig type contract
middleware.ts        # Locale negotiation (/admin passes through)
scripts/             # Config validation, i18n consistency, standalone build, etc.
tests/unit/          # Vitest unit tests
```

## Site configuration

Content lives in `config/locales/{locale}.json`. Main nodes:

| Node | Content |
| --- | --- |
| `meta` | Title, SEO, favicon, ogImage |
| `theme` | `primary` / `secondary` hex colors, `radius`, `font`, `background` (gradient \| solid \| grid) |
| `brand` / `navbar` | Logo (`logoSvg` or `logoUrl`), brand name, nav links, CTA |
| `hero` / `features` / `about` / `testimonials` / `contact` / `footer` | Per-section data |
| `order` | Section render order (optional; defaults to the standard order) |

Configs are validated on load by `SiteConfigSchema` (Zod); validation failures throw a clear error.

```bash
npm run validate          # validate all configs
npm run check:i18n        # check key parity between locales and messages
npm run sync:default-locale  # sync zh-CN into config/site-data.json
```

## Theme system

### Architecture

```
theme.primary in config/locales/*.json (or a selection in /admin)
        │
        ├─ Server: themeToCssVars() → inline injection via <body style>
        └─ Client: applyTheme(hex, mode) → overrides html/body CSS variables
                    (selection persisted in localStorage, applied after hydration by ThemeColorApplicator)
        │
        ▼
CSS variables (--color-*) → Tailwind semantic utilities (bg-page / text-ink …) → full-site reskin
```

### Semantic tokens

Components never hardcode colors — everything uses semantic tokens. **Default values equal the original slate/white/blue values one by one**, so the default theme is visually unchanged.

| Token | Default (dark + default color) | Purpose |
| --- | --- | --- |
| `primary` | `#2563eb` | Buttons, links, focus rings |
| `page` / `band` | slate-950 / slate-900 | Page background / section background |
| `surface` / `line` / `line-strong` | slate-800 / 800 / 700 | Solid surfaces, borders, hover borders |
| `panel` / `panel-line` / `wash` | white / slate-200 / slate-50 | Nav & dropdowns, admin page background |
| `accent` | blue-400 | Accents on dark backgrounds (badges / icons / logo) |
| `title` / `ink` / `soft` / `muted` | white / slate-100 / 300 / 400 | Titles / body / secondary / muted text |

- **Dark mode** (default) + default color → returns the baseline palette (current styles)
- **Custom color** → derives a full dark (or light) scheme from the hue
- **Light mode** → derives a light background + dark text; `accent` is darkened automatically for contrast

### Admin panel

Visit `/admin` → “Theme color settings”:

1. **Background**: dark / light
2. **Preset colors**: a 12-color swatch (first item is the default blue `#2563eb`) + custom color picker
3. **Reset**: one click back to the default primary
4. Live preview of primary components and the whole-site background (page bg / cards / borders / accents)

Selections persist in browser `localStorage` (`znbsys.theme-primary`, `znbsys.theme-mode`) and affect only that browser; marketing and admin pages stay in sync instantly. Core implementation: `lib/palette.ts`, `lib/themePresets.ts`.

## Internationalization

- **Content**: `config/locales/{locale}.json` (site data)
- **UI copy**: `messages/{locale}.json` (components use `t(dict, 'key')`; missing keys automatically fall back to `zh-CN`)
- **Switching**: `LanguageSwitcher` writes the `NEXT_LOCALE` cookie and preserves the current path; `middleware.ts` negotiates and redirects (302, so browsers don't cache language switches)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `start` | Dev / production foreground start |
| `./scripts/start.sh` / `stop.sh` | Background start (build + standalone `server.js` + PID/logs) / stop (PID + port fallback) |
| `npm run dev:background` | Run `next dev` in background and echo PID |
| `npm run stop` / `restart` | Kill processes on port 3000 / `stop && start` |
| `npm run build` | Production build |
| `npm run lint` / `typecheck` / `format` | ESLint / tsc / Prettier |
| `npm run test` / `test:watch` | Vitest unit tests (jsdom) |
| `npm run test:e2e` | Playwright E2E (`tests/e2e`, runs build+start itself) |
| `npm run validate` | Zod validation of site configs |
| `npm run check:i18n` | i18n key consistency check |
| `npm run sync:default-locale` | Sync default locale into `site-data.json` |
| `npm run build:standalone` | Generate a `dist/` single-file static site (Tailwind CDN) |

## Deployment

Two tracks, each triggered independently on push to `main`:

| Track | Workflow | Notes |
| --- | --- | --- |
| **GitHub Pages (free)** | [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) | Static-export hosting, no server needed; enabled by default |
| Own server | [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) | Method A from [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md), SCP + SSH deploy of the standalone build; **disabled by default**, requires `ENABLE_SERVER_DEPLOY=true` |

### GitHub Pages (free hosting, recommended to start)

1. In the repo **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**
2. Push to `main` (or run “Deploy to GitHub Pages” manually from the Actions page)
3. Visit `https://<owner>.github.io/<repo>/` (for a user site `<owner>.github.io`, it's the root path)

What the workflow does:

```
push main ──▶ quality gates (validate / i18n / lint / typecheck / test)
                 └─ STATIC_EXPORT=1 next build → out/ (pure static)
                        └─ basePath auto-set to /<repo> → upload Pages artifact → deploy
```

- **Zero config**: basePath and the site origin (`NEXT_PUBLIC_SITE_URL=https://<owner>.github.io`) are derived by CI from the repository name
- **Static-export limits**: middleware is not part of the runtime — the root `/` redirects via `app/page.tsx` after negotiating cookie → `navigator.language` to `/zh-CN/`, `/en/`, or `/ja/`; everything else (including `/admin` theme switching) is identical to the server deployment
- **Link compatibility**: internal links and SEO alternates get the path prefix automatically via `withBase()` in `lib/paths.ts`
- Preview the export locally:

```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/znbsys-homepage npm run build   # output in out/
```

### Own-server deployment (optional)

Enable it by adding `ENABLE_SERVER_DEPLOY` = `true` under **Settings → Secrets and variables → Actions → Variables**, and configure these Secrets:

| Name | Type | Description |
| --- | --- | --- |
| `SERVER_HOST` | Secret | Server public IP |
| `SERVER_USER` | Secret | SSH user (ubuntu/root/centos) |
| `SSH_PRIVATE_KEY` | Secret | SSH private key (`ssh-keygen -t rsa -b 4096`; add the public key to the server) |
| `SERVER_PORT` | Secret | Optional SSH port, default 22 |
| `NEXT_PUBLIC_SITE_URL` | Variable | Optional production origin (e.g. `https://example.com`) for SEO alternates |
| `ENABLE_SERVER_DEPLOY` | Variable | Set to `true` to enable this workflow (otherwise skipped; Pages only) |

Flow:

```
push main ──▶ CI (validate / check:i18n / lint / typecheck / test / build)
                 └─ package .next/standalone → release.tar.gz (artifact)
                        └─ SCP upload → SSH extract to /opt/znbsys-homepage → restart node server.js
                                       └─ health check (127.0.0.1:3000/admin)
```

**One-time server prep**:

```bash
sudo mkdir -p /opt/znbsys-homepage
sudo chown -R $USER:$USER /opt/znbsys-homepage
```

**Nginx reverse proxy** (app listens on port 3000):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Unlike an SPA, Next.js handles routing itself — no `try_files` needed. For HTTPS, configure Certbot per section 5 of the guide.

**Triggers & rollback**:

- **Trigger**: push to `main`, or manual `workflow_dispatch` from the Actions page
- **Artifacts**: `release-<sha>` retained for 7 days; the server keeps the previous release in `previous/`
- **Rollback** (run on the server):

```bash
cd /opt/znbsys-homepage
kill "$(cat .server.pid)" 2>/dev/null; rm -f .server.pid
mv current current.broken && mv previous current
cd current && nohup env PORT=3000 HOSTNAME=0.0.0.0 \
  node server.js > ../server.log 2>&1 & echo $! > ../.server.pid
```

Logs: `/opt/znbsys-homepage/server.log`

## Testing

- **Unit tests** (Vitest + Testing Library + jsdom): i18n negotiation and dictionaries, palette derivation (default baseline unchanged / dark-light modes / contrast), theme persistence and CSS variable application
- **E2E** (Playwright + axe-core, Chromium / mobile): configured in `playwright.config.ts`, tests in `tests/e2e`

## Related docs

- Design reference: [awesome-design-md](https://github.com/voltagent/awesome-design-md) — source of the project's design conventions
- [`SPEC.md`](./SPEC.md) — requirements & acceptance cases (UT-/E2E- IDs)
- [`LICENSE`](./LICENSE)
