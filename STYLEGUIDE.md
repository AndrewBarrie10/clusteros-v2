# ClusterOS website — style & templating guide

This site uses a small templating system (Phase 1) so that nav, footer, the
intel-bar, fonts, Mixpanel, and CSS variables can never drift across pages
again. Edit chrome in one place; it changes everywhere.

## Where things live

| Concern                                       | Source of truth |
|-----------------------------------------------|-----------------|
| Site nav (top bar, dropdowns, mobile menu)    | `chrome.js` — `NAV_HTML` template + `wireNav()` |
| Site footer                                   | `chrome.js` — `FOOTER_HTML` |
| Persistent intel-bar (default + journey state, diagnostic + platform CTAs) | `chrome.js` — `BAR_HTML` |
| Mixpanel init + pageview                      | `chrome.js` — `initMixpanel()` |
| Shared CSS — colour vars, type, nav, footer, intel-bar, dashboard panel, journey frame, map, hero, and all classes used on more than one page | `site.css` |
| Page skeleton for new pages                   | `_template.html` |

If a style is used on more than one page, it goes in `site.css`. Page-specific
styling stays inline in that page's `<style>` block. Err toward `site.css` —
it's easier to override a shared style than to deduplicate later.

## Adding a new page

1. Copy `_template.html` to your new filename.
2. Fill in the per-page blocks marked at the top of `<head>`:
   - `<title>`, `<meta name="description">`, canonical link
   - Open Graph: title, description, url, type, image
   - schema.org JSON-LD (`@type` per page — `WebPage`, `Article`, `AboutPage`,
     `ContactPage`, `Dataset`, `Report`, etc.)
3. Write your content inside `<main>`.
4. Add page-specific styles inside the per-page `<style>` block. Add
   page-specific JS as a `<script>` block before `</body>`, AFTER `chrome.js`.
5. Run `python verify-pages.py` and confirm it shows your page as PASS.

Do not re-inline the nav, footer, intel-bar, or Mixpanel snippet. The slot
divs (`#site-nav`, `#site-intel-bar`, `#site-footer`) are filled by
`chrome.js`.

## Container widths

Two canonical container classes in `site.css`. Use them to wrap top-level
page sections; they handle horizontal centering and the standard 24px gutter.

- `.container-prose` — max-width 720px. Use for prose-tier content: article
  copy, hero text, single-column callouts, narrow form layouts.
- `.container-content` — max-width 1200px. Use for layout-tier content:
  multi-column grids, dashboard rows, table-style listings.

Don't introduce new max-width values at these tiers in inline styles. If a
page genuinely needs a deliberately tighter width (e.g. a 480px narrow
callout, or a 900px form-friendly tier between the two), keep that inline
and explain why with a comment.

## Pill vocabulary

`.pill` is the canonical low-saturation, mono-uppercase chip used for
metadata tags and category labels — NOT for section eyebrows. Section
eyebrows ("STAGE 3 · STALL DETECTION") stay as plain mono-uppercase
labels; pills are for inline categorical metadata ("Free", "10–15 minutes",
"Hosted report", region/sector tags on a card).

Variants:

- `.pill` — base (cream background, neutral border, ink-dim text).
- `.pill--green` — for status / success / "go" indicators.
- `.pill--amber` — for callouts / warnings.
- `.pill--ink` — for high-contrast on muted backgrounds.

Use the base style by default. Reach for a colour variant only when the
pill is carrying semantic colour. Most pills should be `.pill` alone.

The legacy `.sa-badge` class on `get-started.html` is the same idea but
visually slightly different (square corners, 9px / 700-weight). It stays
in place; new pills use `.pill`. Phase 2.x can unify if desired.

## Intel-bar behaviour

The intel-bar shows the same two CTAs on every non-excluded page in default
mode:

- "Diagnose your ecosystem →" (amber, links to `/diagnostic-journey.html`)
- "Talk to us →" (green, links to `/request`)

There is no zone switching. The previous diagnostic ↔ platform CTA swap and
the homepage scroll-based bar zone have both been retired. Pages no longer
need a `data-bar-zone` attribute on `<body>`.

The bar still has a journey state, controlled by
`localStorage['clusteros_journey_active']`. When that key is `'true'`, the
default CTAs are hidden and the bar shows the pathway indicator + Briefing
button instead. See "Journey state on the intel-bar" below.

## Excluded pages

The following pages own their own chrome and `chrome.js` skips DOM injection
and Mixpanel init for them:

- `diagnostic-journey.html` — React + Babel-Standalone self-assessment app
- `diagnostic-report.html` — companion report page

Don't add the slot divs to these pages. Don't link `chrome.js` from them.
Their inlined Mixpanel keeps working.

The exclusion list is hardcoded in `chrome.js` (`EXCLUDED_PAGES`) and
matches both the `.html` form and Vercel's clean-URL form.

## Journey state on the intel-bar

When a visitor starts the diagnostic journey, the bar switches from the
default state (logo + section links) to a journey state (active stage
breadcrumb + briefing button). State is persisted via:

- Key:  `localStorage['clusteros_journey_active']`
- Set:  `window._setBarMode('journey')` (from the journey React app)
- Clear: `window._setBarMode('default')`

`chrome.js` reads the key on every page load and renders the appropriate
state. Step labels are updated via `window._updateBarJourneySteps(stages,
activeIndex)`.

## Verifying drift

```
python verify-pages.py
```

Checks every top-level `*.html` (except excluded and the template) for:

- `<link rel="stylesheet" href="/site.css">`
- `<script src="/chrome.js">`
- `<div id="site-nav">`, `<div id="site-intel-bar">`, `<div id="site-footer">`
- `<meta name="description">`, `<link rel="canonical">`,
  `<meta property="og:title">`, `<script type="application/ld+json">`

Prints per-page pass/fail. Cluster and supercluster pages under `clusters/`
and `superclusters/` are not checked here — they're Phase 2 (their generator
scripts will be migrated separately).

## Editing chrome safely

When you edit `chrome.js` or `site.css`, your change ships to every page that
uses them. Sanity-check:

1. Reload the homepage and one diagnostic-zone page (e.g. `findings.html`)
   and one platform-zone page (e.g. `national-diagnostic.html`). Look at
   nav, intel-bar, footer.
2. Check `diagnostic-journey.html` — confirm site chrome is still NOT
   injected and the React app's own chrome is intact.
3. Open dev tools → Network → confirm `site.css` and `chrome.js` are 200,
   not 404.
4. In Mixpanel Live View, confirm pageviews still arrive for ordinary pages
   AND for `diagnostic-journey.html` (which uses its own inlined snippet).
