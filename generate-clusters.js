#!/usr/bin/env node
// ClusterOS — Cluster page generator
// Reads clusters.json → writes clusters/{slug}.html for each cluster

const fs = require('fs');
const path = require('path');

const clusters = JSON.parse(fs.readFileSync('./clusters.json', 'utf8'));

// Output dir
const outDir = path.join(__dirname, 'clusters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Country names
const COUNTRIES = {
  AE:'UAE', AU:'Australia', BE:'Belgium', CA:'Canada', CH:'Switzerland',
  CL:'Chile', CZ:'Czech Republic', DE:'Germany', EE:'Estonia', ES:'Spain',
  FI:'Finland', FR:'France', GB:'United Kingdom', HK:'Hong Kong', IE:'Ireland',
  IL:'Israel', IN:'India', IT:'Italy', JP:'Japan', KR:'South Korea',
  MY:'Malaysia', NL:'Netherlands', NO:'Norway', NZ:'New Zealand', PL:'Poland',
  PT:'Portugal', SE:'Sweden', SG:'Singapore', TW:'Taiwan', UA:'Ukraine',
  US:'United States', ZA:'South Africa'
};

function countryName(code) {
  return COUNTRIES[code] || code;
}

// Stall ID map
const STALL_IDS = {
  're-proving': 'S1', 'coordinating': 'S2', 'forgiving': 'S3',
  'extracting': 'S4', 'mediating': 'S5', 'stabiliz': 'S6',
  'narrating': 'S7', 'scaling': 'S8', 'waiting': 'S9'
};

function stallId(name) {
  const n = name.toLowerCase();
  for (const [key, id] of Object.entries(STALL_IDS)) {
    if (n.includes(key)) return id;
  }
  return '—';
}

function intensityBar(intensity) {
  const pct = Math.round((intensity || 0.3) * 100);
  const w = Math.round((intensity || 0.3) * 120);
  let colour = '#2a7a4f';
  if (intensity > 0.65) colour = '#d4695a';
  else if (intensity > 0.4) colour = '#d4a94a';
  return `<div class="stall-bar-wrap">
    <div class="stall-bar" style="width:${w}px;background:${colour}"></div>
    <span class="stall-pct">${pct}%</span>
  </div>`;
}

function confidenceBadge(conf) {
  const c = (conf || 'low').toLowerCase();
  return `<span class="conf conf-${c}">${c}</span>`;
}

function regimeLabel(regime) {
  const map = { emerging: 'Emerging', cycling: 'Cycling', active: 'Active', mature: 'Mature' };
  return map[regime] || regime || 'Unknown';
}

function anchorLabel(type) {
  const map = { university: 'University anchor', government: 'Government anchor',
    corporate: 'Corporate anchor', military: 'Military anchor', mixed: 'Mixed anchor' };
  return map[type] || type || '';
}

function renderStalls(stalls) {
  if (!stalls || !stalls.length) return '<p class="empty">No stall data available.</p>';
  return stalls.map(s => `
    <div class="stall-row">
      <span class="stall-id">${stallId(s.name)}</span>
      <div class="stall-detail">
        <span class="stall-name">${s.name}</span>
        ${intensityBar(s.intensity)}
      </div>
      ${confidenceBadge(s.confidence)}
    </div>`).join('');
}

function renderStacks(stacks) {
  if (!stacks || !stacks.length) return '<p class="empty">No stack analysis available.</p>';
  return stacks.map((st, i) => `
    <div class="stack-item">
      <div class="stack-num">Stack ${String(i+1).padStart(2,'0')}</div>
      <div class="stack-stalls">${(st.stalls_involved || []).join(' · ')}</div>
      <p class="stack-desc">${st.description || ''}</p>
    </div>`).join('');
}

function renderLeverage(leverage) {
  if (!leverage) return '<p class="empty">Leverage hypothesis available on request.</p>';
  return `
    <div class="leverage-block">
      <p class="leverage-hyp">${leverage.hypothesis || ''}</p>
      <div class="leverage-meta">
        ${leverage.target_stack ? `<span class="lm-tag">${leverage.target_stack}</span>` : ''}
        ${leverage.timeline ? `<span class="lm-tag">${leverage.timeline}</span>` : ''}
      </div>
    </div>`;
}

// JSON-LD for each cluster
function jsonLd(c) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${c.name} — ClusterOS Diagnostic Profile`,
    "description": c.summary || `Diagnostic profile for ${c.name}, ${c.city}.`,
    "url": `https://clusteros.io/clusters/${c.id}.html`,
    "keywords": [
      "regional innovation cluster",
      "cluster diagnostic",
      c.city, countryName(c.country),
      c.regime, c._anchor_type,
      ...(c.stalls || []).map(s => s.name)
    ].filter(Boolean),
    "creator": { "@type": "Organization", "name": "ClusterOS", "url": "https://clusteros.io" },
    "spatialCoverage": { "@type": "Place", "name": c.city, "addressCountry": c.country },
    "variableMeasured": (c.stalls || []).map(s => ({
      "@type": "PropertyValue",
      "name": s.name,
      "value": s.intensity,
      "description": `Confidence: ${s.confidence}`
    }))
  });
}

// ── TEMPLATE ────────────────────────────────────────────
function template(c) {
  const primaryStall = c.stalls && c.stalls.length
    ? c.stalls.reduce((a, b) => (a.intensity > b.intensity ? a : b))
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.name} — ClusterOS Diagnostic Profile</title>
<meta name="description" content="${(c.summary || '').replace(/"/g, '&quot;').slice(0, 160)}">
<meta property="og:title" content="${c.name} — ClusterOS">
<meta property="og:description" content="${(c.summary || '').replace(/"/g, '&quot;').slice(0, 160)}">
<script type="application/ld+json">${jsonLd(c)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root {
  --ink: #1a1a1a; --ink-dim: #5a5650; --ink-muted: #8c8780;
  --page: #f7f4ef; --surface: #f0ece4; --border: #ddd8cf; --border-2: #c8c2b7;
  --green: #2a7a4f; --signal: #c8f0d0;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); background: var(--page); color: var(--ink);
  font-weight: 300; line-height: 1.6; }

/* NAV */
nav { display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 52px; background: rgba(247,244,239,0.95);
  backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100; }
.nav-logo { font-family: var(--font-mono); font-size: 13px; font-weight: 600;
  color: var(--green); letter-spacing: 0.12em; text-decoration: none; text-transform: uppercase; }
.nav-back { font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted);
  text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;
  transition: color 0.15s; }
.nav-back:hover { color: var(--ink); }
.nav-back::before { content: '← '; }
.nav-cta { font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  color: var(--green); text-transform: uppercase; letter-spacing: 0.08em;
  border: 1px solid var(--green); padding: 5px 14px; border-radius: 2px;
  text-decoration: none; transition: background 0.15s, color 0.15s; }
.nav-cta:hover { background: var(--green); color: #fff; }

/* LAYOUT */
.page-wrap { max-width: 820px; margin: 0 auto; padding: 4rem 2rem 6rem; }

/* BREADCRUMB */
.breadcrumb { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 2rem; }
.breadcrumb a { color: var(--ink-muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--green); }
.breadcrumb span { margin: 0 6px; }

/* HEADER */
.cluster-header { margin-bottom: 3rem; padding-bottom: 2rem;
  border-bottom: 1px solid var(--border); }
.cluster-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 1rem; }
.cluster-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px;
  background: var(--border-2); vertical-align: middle; margin-right: 8px; }
h1 { font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400; line-height: 1.15; margin-bottom: 1rem; }
.cluster-meta { display: flex; flex-wrap: wrap; gap: 0.6rem;
  align-items: center; margin-bottom: 1.4rem; }
.meta-tag { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; padding: 3px 10px; border-radius: 2px; }
.meta-regime-emerging { background: rgba(245,217,122,0.3); color: #7a5500; }
.meta-regime-cycling   { background: rgba(125,211,200,0.3); color: #1a6060; }
.meta-regime-active    { background: rgba(200,240,208,0.3); color: var(--green); }
.meta-regime-mature    { background: rgba(42,122,79,0.15);  color: var(--green); }
.meta-plain { background: var(--surface); color: var(--ink-dim); border: 1px solid var(--border); }
.cluster-summary { font-size: 1rem; font-weight: 300; color: var(--ink-dim);
  line-height: 1.75; max-width: 640px; }

/* STATS ROW */
.stats-row { display: flex; gap: 0; border: 1px solid var(--border);
  margin-bottom: 3rem; }
.stat-cell { flex: 1; padding: 1rem 1.2rem; border-right: 1px solid var(--border); }
.stat-cell:last-child { border-right: none; }
.stat-num { font-family: var(--font-serif); font-size: 1.8rem; color: var(--green);
  line-height: 1; margin-bottom: 0.2rem; }
.stat-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.1em; }

/* SECTION */
.section { margin-bottom: 3rem; }
.section-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 1.2rem;
  padding-bottom: 0.6rem; border-bottom: 1px solid var(--border); }

/* STALLS */
.stalls-list { display: flex; flex-direction: column; }
.stall-row { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 0;
  border-bottom: 1px solid var(--border); }
.stall-row:last-child { border-bottom: none; }
.stall-id { font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted);
  font-weight: 600; width: 2.2rem; flex-shrink: 0; }
.stall-detail { flex: 1; }
.stall-name { font-size: 14px; color: var(--ink-dim); display: block; margin-bottom: 4px; }
.stall-bar-wrap { display: flex; align-items: center; gap: 8px; }
.stall-bar { height: 3px; border-radius: 2px; flex-shrink: 0; }
.stall-pct { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); }
.conf { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.08em; padding: 2px 6px; border-radius: 2px; flex-shrink: 0; }
.conf-high   { background: rgba(212,105,90,0.15);  color: #8a2a1a; }
.conf-medium { background: rgba(245,217,122,0.25); color: #7a5500; }
.conf-low    { background: var(--surface); color: var(--ink-muted); border: 1px solid var(--border); }

/* STACKS */
.stacks-list { display: flex; flex-direction: column; gap: 1px;
  background: var(--border); border: 1px solid var(--border); }
.stack-item { background: var(--page); padding: 1.2rem 1.4rem; }
.stack-num { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.3rem; }
.stack-stalls { font-family: var(--font-mono); font-size: 12px; color: var(--green);
  margin-bottom: 0.5rem; font-weight: 600; }
.stack-desc { font-size: 13px; font-weight: 300; color: var(--ink-dim); line-height: 1.6; }

/* LEVERAGE */
.leverage-block { border-left: 3px solid var(--signal); padding: 1.2rem 1.4rem;
  background: rgba(200,240,208,0.1); }
.leverage-hyp { font-family: var(--font-serif); font-size: 1rem; font-style: italic;
  color: var(--ink); line-height: 1.65; margin-bottom: 0.8rem; }
.leverage-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.lm-tag { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.1em; background: var(--surface);
  border: 1px solid var(--border); padding: 2px 8px; border-radius: 2px; }

/* DISCLAIMER */
.disclaimer { font-size: 12px; color: var(--ink-muted); line-height: 1.6;
  border-top: 1px solid var(--border); padding-top: 1.2rem; margin-top: 1.2rem; }

/* CTA */
.cta-block { background: var(--surface); border: 1px solid var(--border);
  padding: 2rem; margin-top: 3rem; }
.cta-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted);
  text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 0.8rem; }
.cta-h { font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 0.6rem; }
.cta-body { font-size: 14px; color: var(--ink-dim); margin-bottom: 1.2rem; line-height: 1.65; }
.cta-link { display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em; color: #fff;
  background: var(--green); padding: 10px 20px; text-decoration: none;
  transition: background 0.15s; }
.cta-link:hover { background: #1d5c3a; }

/* FOOTER */
footer { border-top: 1px solid var(--border); padding: 2rem;
  max-width: 820px; margin: 0 auto;
  font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
footer a { color: var(--ink-muted); text-decoration: none; }
footer a:hover { color: var(--green); }

.empty { font-size: 13px; color: var(--ink-muted); font-style: italic; padding: 0.8rem 0; }

@media (max-width: 600px) {
  .page-wrap { padding: 2rem 1.2rem 4rem; }
  .stats-row { flex-direction: column; }
  .stat-cell { border-right: none; border-bottom: 1px solid var(--border); }
  .stat-cell:last-child { border-bottom: none; }
  nav { padding: 0 1rem; }
}
</style>
</head>
<body>

<nav>
  <a class="nav-logo" href="/">ClusterOS</a>
  <a class="nav-back" href="/">All clusters</a>
  <a class="nav-cta" href="https://clusteros.io/request.html">Request →</a>
</nav>

<main class="page-wrap">

  <div class="breadcrumb">
    <a href="/">ClusterOS</a>
    <span>›</span>
    <a href="/">Clusters</a>
    <span>›</span>
    ${c.name}
  </div>

  <header class="cluster-header">
    <p class="cluster-eyebrow">Diagnostic Profile · ${c._run_id || 'ClusterOS 2026'}</p>
    <h1>${c.name}</h1>
    <div class="cluster-meta">
      <span class="meta-tag meta-plain">${c.city}, ${countryName(c.country)}</span>
      <span class="meta-tag meta-regime-${c.regime || 'emerging'}">${regimeLabel(c.regime)}</span>
      ${c._anchor_type ? `<span class="meta-tag meta-plain">${anchorLabel(c._anchor_type)}</span>` : ''}
      ${c._evidence_count ? `<span class="meta-tag meta-plain">${c._evidence_count} evidence items</span>` : ''}
    </div>
    <p class="cluster-summary">${c.summary || ''}</p>
  </header>

  <div class="stats-row">
    <div class="stat-cell">
      <div class="stat-num">${(c.stalls || []).length}</div>
      <div class="stat-label">Active stalls</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${(c.stacks || []).length}</div>
      <div class="stat-label">Stacks identified</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${c._evidence_count || '—'}</div>
      <div class="stat-label">Evidence items</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${c.leverage && c.leverage.timeline ? c.leverage.timeline.split('-')[0] : '—'}</div>
      <div class="stat-label">Leverage timeline</div>
    </div>
  </div>

  <section class="section">
    <div class="section-label">Active stalls · Behavioural substitution patterns</div>
    <div class="stalls-list">
      ${renderStalls(c.stalls)}
    </div>
  </section>

  <section class="section">
    <div class="section-label">Stabilisation stacks · Why single interventions fail</div>
    <div class="stacks-list">
      ${renderStacks(c.stacks)}
    </div>
  </section>

  <section class="section">
    <div class="section-label">Stage 5 · Leverage hypothesis</div>
    ${renderLeverage(c.leverage)}
    <p class="disclaimer">Leverage hypotheses are testable perturbations, not prescriptions. Confidence levels reflect evidence quality. Where demand-side behaviour and reinvestment flows are weakly visible, the correct steward move is observation — improving visibility before attempting change.</p>
  </section>

  <div class="cta-block">
    <div class="cta-label">What happens next</div>
    <div class="cta-h">This is a structural profile, not a full diagnostic.</div>
    <p class="cta-body">A full ClusterOS diagnostic adds actor questionnaire data, working sessions, and anchor interviews — producing higher-confidence stall identification, board-ready stack analysis, and leverage hypotheses calibrated to your specific operating context. Fixed price. 4–5 weeks.</p>
    <a class="cta-link" href="https://clusteros.io/request.html">Request a diagnostic →</a>
  </div>

</main>

<footer>
  <span>© 2026 ClusterOS · Community Lab · Edinburgh</span>
  <span>
    <a href="/">Homepage</a> ·
    <a href="https://clusteros.io/findings.html">Findings</a> ·
    <a href="https://clusteros.io/diagnostic.html">Diagnostic</a> ·
    <a href="https://clusteros.io/about.html">About</a>
  </span>
</footer>

</body>
</html>`;
}

// ── GENERATE ─────────────────────────────────────────────
let count = 0;
for (const cluster of clusters) {
  const slug = cluster.id || cluster.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const html = template(cluster);
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
  count++;
}

console.log(`Generated ${count} cluster pages → clusters/`);
