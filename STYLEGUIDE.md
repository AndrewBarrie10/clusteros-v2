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
3. Set `<body data-bar-zone="diagnostic">` or `<body data-bar-zone="platform">`
   — see the rule below.
4. Write your content inside `<main>`.
5. Add page-specific styles inside the per-page `<style>` block. Add
   page-specific JS as a `<script>` block before `</body>`, AFTER `chrome.js`.
6. Run `python verify-pages.py` and confirm it shows your page as PASS.

Do not re-inline the nav, footer, intel-bar, or Mixpanel snippet. The slot
divs (`#site-nav`, `#site-intel-bar`, `#site-footer`) are filled by
`chrome.js`.

## `data-bar-zone` — diagnostic vs platform

The intel-bar swaps its right-hand CTAs based on which conversion we're
nudging towards.

- `diagnostic` — entry-level conversion ask: "Diagnose / See a diagnostic /
  Request a Diagnostic." Use on entry pages, lab notes, findings, contact —
  anywhere a visitor is being introduced to ClusterOS.
- `platform` — operator-level ask: "Diagnose / See how it works / Map your
  OS." Use on platform-product pages — Digital Infrastructure, Signals &
  Systems, Cluster Data, Leverage.

The homepage is special-cased: no `data-bar-zone` attribute, because
`chrome.js` swaps the bar's CTAs based on scroll position past
`#platform-bridge`.

When the attribute is missing on a non-homepage page, `chrome.js` defaults to
`diagnostic` — that's the safer fallback.

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
- `<body data-bar-zone="…">` (homepage exempt)

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
