#!/usr/bin/env node
// ClusterOS — Supercluster summary page generator
// Reads superclusters.json + clusters.json → writes superclusters/{slug}.html
//
// Each supercluster page summarises a regional grouping of clusters:
//   - Region header + summary
//   - Constituent clusters table (cluster name, dominant stalls, evidence count, link)
//   - Aggregate stall pattern (top stalls across all children)
//   - Dominant stacks across the region
//   - Top leverage hypotheses
//   - Breadcrumb: ClusterOS → National Diagnostic → {Region}
//
// Mirrors the cream / serif design system used by /clusters/{id}.html.

const fs = require('fs');
const path = require('path');

// --only id1,id2 limits regeneration to the listed supercluster ids.
function parseArgs(argv) {
  const opts = { only: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') {
      opts.only = (argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (a.startsWith('--only=')) {
      opts.only = a.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return opts;
}
const argv = parseArgs(process.argv);
const allowedIds = argv.only ? new Set(argv.only) : null;

const supers   = JSON.parse(fs.readFileSync('./superclusters.json', 'utf8'));
const clusters = JSON.parse(fs.readFileSync('./clusters.json', 'utf8'));

const outDir = path.join(__dirname, 'superclusters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// v3 per-page bundles. When a bundle exists for a supercluster, the page is
// rendered from the bundle (strap, behaviour, metrics, constituent_clusters,
// hot-linked diagnostic PNG). When absent, the legacy template is used.
// Bundle slug = `${sc.id}-innovation-ecosystem` matching the v3 registry.
const V3_BUNDLES_DIR = path.join(__dirname, 'v3-data', 'v2_pages');
function loadBundle(scId) {
  const p = path.join(V3_BUNDLES_DIR, `${scId}-innovation-ecosystem.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.warn(`Failed to parse bundle ${p}: ${e.message}`); return null; }
}

const diagnosticsRegistryPath = path.join(__dirname, 'diagnostics.json');
const diagnostics = fs.existsSync(diagnosticsRegistryPath)
  ? JSON.parse(fs.readFileSync(diagnosticsRegistryPath, 'utf8'))
  : { clusters: {}, superclusters: {}, cta: null, source_line: '' };

function loadHeadlines(headlinesPath) {
  if (!headlinesPath) return null;
  const rel = headlinesPath.replace(/^\//, '');
  const abs = path.join(__dirname, rel);
  if (!fs.existsSync(abs)) return null;
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')); }
  catch (e) { return null; }
}

const DIAGNOSTIC_COMPOSITE_CSS = `
.diagnostic-composite{margin:2.5rem 0 3rem;position:relative;left:50%;transform:translateX(-50%);width:min(1000px,calc(100vw - 32px));}
.diagnostic-headlines{list-style:none;padding:0;margin:0 0 1.5rem;font-family:var(--font-mono);font-size:13.5px;line-height:1.6;color:var(--ink);}
.diagnostic-headlines li{padding:4px 0;}
.diagnostic-headlines b{font-weight:600;color:var(--ink);}
.diagnostic-figure{margin:0;text-align:center;}
.diagnostic-image{max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.diagnostic-caption{font-family:var(--font-serif);font-size:19px;font-style:normal;color:var(--ink);line-height:1.4;margin:1.25rem auto 0;max-width:720px;text-align:center;}
.diagnostic-cta{margin:1.75rem auto 0;max-width:720px;text-align:center;}
.diagnostic-cta-framing{font-family:var(--font-mono);font-size:13px;color:var(--ink-dim);line-height:1.5;margin:0 0 0.75rem;}
.diagnostic-cta-link{margin:0;font-family:var(--font-mono);font-size:14px;}
.diagnostic-cta-link a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);padding-bottom:2px;transition:border-bottom-color 0.15s;}
.diagnostic-cta-link a:hover{border-bottom-color:var(--ink);}
.diagnostic-source{margin:1.5rem auto 0;max-width:720px;font-family:var(--font-mono);font-size:12px;color:var(--ink-muted);line-height:1.5;text-align:center;}
@media(max-width:640px){
  .diagnostic-composite{margin:1.75rem 0 2rem;width:calc(100vw - 32px);}
  .diagnostic-headlines{font-size:13px;text-align:left;}
  .diagnostic-caption{font-size:17px;text-align:left;margin-top:1rem;}
  .diagnostic-cta,.diagnostic-source{text-align:left;}
}`;

function hasDiagnosticEntry(slug, kind) {
  const bucket = kind === 'supercluster' ? diagnostics.superclusters : diagnostics.clusters;
  return !!(bucket && bucket[slug]);
}

function diagnosticStyles(slug, kind) {
  return hasDiagnosticEntry(slug, kind) ? `\n<style>${DIAGNOSTIC_COMPOSITE_CSS}</style>` : '';
}

function renderDiagnosticComposite(slug, kind) {
  const bucket = kind === 'supercluster' ? diagnostics.superclusters : diagnostics.clusters;
  const entry = bucket && bucket[slug];
  if (!entry) return '';
  const headlines = loadHeadlines(entry.headlines);
  const bullets = (headlines && headlines.bullets) || [];
  const bulletsHtml = bullets.map(b => `      <li>${b.html}</li>`).join('\n');
  const cta = diagnostics.cta || { framing: '', link_text: '', link_href: '#' };
  const source = diagnostics.source_line || '';
  return `
  <section class="diagnostic-composite">
    <ul class="diagnostic-headlines">
${bulletsHtml}
    </ul>
    <figure class="diagnostic-figure">
      <img src="${entry.image}" alt="${entry.alt || ''}" class="diagnostic-image" loading="lazy" />
      <figcaption class="diagnostic-caption">${entry.caption || ''}</figcaption>
    </figure>
    <div class="diagnostic-cta">
      <p class="diagnostic-cta-framing">${cta.framing}</p>
      <p class="diagnostic-cta-link"><a href="${cta.link_href}">${cta.link_text}</a></p>
    </div>
    <p class="diagnostic-source">${source}</p>
  </section>`;
}

const COUNTRIES = {
  AE:'UAE', AU:'Australia', CA:'Canada', CH:'Switzerland', DE:'Germany',
  ES:'Spain', FR:'France', GB:'United Kingdom', IE:'Ireland', IL:'Israel',
  IN:'India', IT:'Italy', JP:'Japan', KR:'South Korea', NL:'Netherlands',
  SG:'Singapore', US:'United States', ZA:'South Africa'
};
function countryName(code) { return COUNTRIES[code] || code; }

const STALL_NAME_TO_ID = {
  'Re-proving instead of narrowing': 'S1',
  'Coordinating instead of deciding': 'S2',
  'Forgiving instead of redesigning': 'S3',
  'Extracting without reinvesting': 'S4',
  'Mediating instead of coupling': 'S5',
  'Stabilizing around incumbents': 'S6',
  'Stabilising around incumbents': 'S6',
  'Narrating instead of testing': 'S7',
  'Scaling activity instead of throughput': 'S8',
  'Waiting for permission': 'S9',
};

function aggregateStalls(children) {
  const totals = {};
  const counts = {};
  children.forEach(c => {
    (c.stalls || []).forEach(s => {
      const id = STALL_NAME_TO_ID[s.name];
      if (!id) return;
      totals[id] = (totals[id] || 0) + (s.intensity || 0);
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  return Object.keys(totals).map(id => ({
    id,
    name: id,
    avg: totals[id] / counts[id],
    count: counts[id]
  })).sort((a, b) => b.avg - a.avg);
}

function aggregateStacks(children) {
  const counts = {};
  const samples = {};
  children.forEach(c => {
    (c.stacks || []).forEach(s => {
      const id = s.canonical_id || s.id;
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
      if (!samples[id]) samples[id] = s;
    });
  });
  return Object.keys(counts).map(id => ({
    id,
    name: samples[id].stack_name || samples[id].name || id,
    description: samples[id].description || '',
    stalls: samples[id].stalls_involved || [],
    count: counts[id]
  })).sort((a, b) => b.count - a.count);
}

function topLeverages(children, n = 3) {
  return children
    .filter(c => c.leverage && c.leverage.hypothesis)
    .map(c => ({
      cluster: c.name,
      cluster_id: c.id,
      hypothesis: c.leverage.hypothesis,
      timeline: c.leverage.timeline
    }))
    .slice(0, n);
}

function dominantStallsFor(cluster) {
  return (cluster.stalls || [])
    .filter(s => (s.intensity || 0) >= 0.4)
    .sort((a, b) => (b.intensity || 0) - (a.intensity || 0))
    .slice(0, 3)
    .map(s => s.name)
    .join(', ');
}

function jsonLd(sc, children) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${sc.name} — ClusterOS Regional Diagnostic`,
    "description": sc.summary || `Regional supercluster diagnostic for ${sc.name}.`,
    "url": `https://www.clusteros.io/superclusters/${sc.id}`,
    "creator": { "@type": "Organization", "name": "ClusterOS", "url": "https://clusteros.io" },
    "spatialCoverage": {
      "@type": "Place",
      "name": sc.city || sc.name,
      "addressCountry": sc.country
    },
    "hasPart": (children || []).map(c => ({
      "@type": "Dataset",
      "name": c.name,
      "url": `https://www.clusteros.io/clusters/${c.id}.html`
    }))
  });
}

function renderClusterTable(children) {
  if (!children.length) {
    return `<p class="empty">Constituent cluster diagnostics pending import. The supercluster appears on the map but its underlying clusters will populate once <code>uk_clusters_for_website.json</code> is merged from clusteros-v3.</p>`;
  }
  return `<table class="ct">
    <thead><tr>
      <th>Cluster</th><th>Regime</th><th>Dominant stalls</th><th>Evidence</th>
    </tr></thead>
    <tbody>
      ${children.map(c => `<tr>
        <td><a href="/clusters/${c.id}.html">${c.name}</a></td>
        <td>${c.regime || '—'}</td>
        <td>${dominantStallsFor(c) || '—'}</td>
        <td>${c._evidence_count || '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderAggregateStalls(stalls) {
  if (!stalls.length) return '<p class="empty">No aggregate stall data yet.</p>';
  return stalls.slice(0, 9).map(s => {
    const pct = Math.round(s.avg * 100);
    return `<div class="agg-row">
      <span class="agg-id">${s.id}</span>
      <div class="agg-bar-wrap"><div class="agg-bar" style="width:${pct}%"></div></div>
      <span class="agg-pct">${pct}%</span>
      <span class="agg-count">${s.count} clusters</span>
    </div>`;
  }).join('');
}

function renderStacks(stacks) {
  if (!stacks.length) return '<p class="empty">No regional stack data yet.</p>';
  return stacks.slice(0, 5).map(s => `
    <div class="stack-item">
      <div class="stack-header">
        <span class="stack-num">${s.id}${s.name && s.name !== s.id ? ' · ' + s.name : ''}</span>
        <span class="stack-stalls">${(s.stalls || []).join(' · ')}</span>
        <span class="stack-count">${s.count} clusters</span>
      </div>
      <p class="stack-desc">${s.description || ''}</p>
    </div>`).join('');
}

function renderLeverage(lev) {
  if (!lev.length) return '<p class="empty">Leverage hypotheses pending.</p>';
  return lev.map(l => `
    <div class="leverage-block">
      <p class="leverage-hyp">"${l.hypothesis}"</p>
      <div class="leverage-meta">
        <span class="lm-tag"><a href="/clusters/${l.cluster_id}.html">${l.cluster}</a></span>
        ${l.timeline ? `<span class="lm-tag">${l.timeline}</span>` : ''}
      </div>
    </div>`).join('');
}

// Render the regional synthesis fields when the supercluster entry carries
// them (UK ecosystems supplied by the diagnostic repo). When absent, the
// template falls back to child-aggregated rendering (Orlando case).

function renderRegionalPatterns(patterns) {
  if (!patterns || !patterns.length) return '';
  return `
  <div class="section">
    <div class="section-label">Regional patterns · Cross-cluster synthesis</div>
    <ul class="rp-list">
      ${patterns.map(p => `<li>${p}</li>`).join('')}
    </ul>
  </div>`;
}

// Map keywords found in supercluster-level stack names onto the 9 stall ids.
// dominant_stacks names from the diagnostic export are composite labels like
// "Coordination-Intermediary-Activity" that don't appear verbatim in any
// child cluster's stack_name list, so we derive component stalls from
// keywords in the name itself.
const STACK_NAME_KEYWORD_TO_STALL = [
  [/re[- ]?prov|validat/i,                'S1'],
  [/coordinat|governance/i,               'S2'],
  [/forgiv|toleran/i,                     'S3'],
  [/extract/i,                            'S4'],
  [/intermediar|mediat/i,                 'S5'],
  [/incumbent|capture|stabilis|stabiliz/i,'S6'],
  [/narrat/i,                             'S7'],
  [/scal|activity|volume/i,               'S8'],
  [/permission|waiting|process/i,         'S9'],
];

function inferStallsFromName(name) {
  if (!name) return [];
  const found = new Set();
  for (const [re, sid] of STACK_NAME_KEYWORD_TO_STALL) {
    if (re.test(name)) found.add(sid);
  }
  return Array.from(found).sort();
}

function renderDominantStacksRich(stacks, children) {
  if (!stacks || !stacks.length) return '';
  // dominant_stacks from the diagnostic export only carries name/confidence/
  // cluster_count. We try to find a representative description by matching
  // stack_name across the constituent clusters' stacks[]; when that fails
  // (the supercluster-level labels are usually composites), we infer the
  // component stall ids from keywords in the name.
  function findStackDetail(stackName) {
    if (!stackName || !children) return null;
    for (const c of children) {
      for (const st of (c.stacks || [])) {
        if (st.stack_name === stackName) return st;
      }
    }
    return null;
  }
  return stacks.map(s => {
    const detail = findStackDetail(s.name);
    const stallsList = (detail && detail.stalls_involved && detail.stalls_involved.length)
      ? detail.stalls_involved
      : inferStallsFromName(s.name);
    const stalls = stallsList.join(' · ');
    const desc = detail && detail.description ? detail.description : '';
    return `
    <div class="stack-item">
      <div class="stack-header">
        <span class="stack-num">${s.name || ''}</span>
        ${stalls ? `<span class="stack-stalls">${stalls}</span>` : ''}
        ${s.confidence ? `<span class="lm-tag">${s.confidence} confidence</span>` : ''}
        ${s.cluster_count != null ? `<span class="stack-count">${s.cluster_count} cluster${String(s.cluster_count) === '1' ? '' : 's'}</span>` : ''}
      </div>
      ${desc ? `<p class="stack-desc">${desc}</p>` : ''}
    </div>`;
  }).join('');
}

function renderLeverageRich(hypotheses, children) {
  if (!hypotheses || !hypotheses.length) return '';
  // Build a name->id map for linking to the sourcing cluster's profile page.
  const nameToId = {};
  for (const c of (children || [])) nameToId[c.name] = c.id;
  return hypotheses.map(l => {
    const sourcedId = l._cluster_name ? nameToId[l._cluster_name] : null;
    return `
    <div class="leverage-block">
      <p class="leverage-hyp">"${l.hypothesis}"</p>
      <div class="leverage-meta">
        ${l.target_stack ? `<span class="lm-tag">${l.target_stack}</span>` : ''}
        ${l._cluster_name && sourcedId ? `<span class="lm-tag"><a href="/clusters/${sourcedId}.html">${l._cluster_name}</a></span>` : (l._cluster_name ? `<span class="lm-tag">${l._cluster_name}</span>` : '')}
        ${l.timeline ? `<span class="lm-tag">${l.timeline}</span>` : ''}
        ${l._confidence ? `<span class="lm-tag">${l._confidence} confidence</span>` : ''}
        ${l._testability ? `<span class="lm-tag">${l._testability} testability</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── v3 BUNDLE HELPERS ───────────────────────────────────

function formatGbp(amount) {
  if (amount == null) return '—';
  if (amount >= 1e9) return `£${(amount / 1e9).toFixed(2)}bn`;
  if (amount >= 1e6) return `£${Math.round(amount / 1e6)}m`;
  return `£${Math.round(amount).toLocaleString()}`;
}
function formatPct(x) {
  if (x == null) return '—';
  return `${Math.round(x * 100)}%`;
}
function formatInt(n) {
  return n == null ? '—' : n.toLocaleString();
}
function monthYearFromDate(iso) {
  // "2026-05-12" → "May 2026"
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})/);
  if (!m) return '';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[parseInt(m[2],10)-1]} ${m[1]}`;
}

const V3_SOURCE_LINE_LEAD = 'Sources: UKRI Gateway to Research (grants, outcomes); OpenAlex (publications); Companies House (spin-out lifecycle); DSIT (cluster mapping); Public investment data.';
const V3_CTA_FRAMING = 'Same data examined through five diagnostic lenses — Pipeline, Leverage, Triple Helix, Throughput, Collaboration. The interactive diagnostic is currently in private preview.';
const V3_CTA_HREF = 'https://www.clusteros.io/request';
const V3_CTA_TEXT = 'Request access →';

// Pipeline 1 narrative bullets that contradict v3 numbers. Filter from
// regional_patterns when a v3 bundle is rendering the page.
const V3_DROP_PATTERN_PHRASES = [
  /structurally empty/i,
  /could not produce a verified count/i,
];
function filterPatterns(patterns) {
  if (!patterns) return [];
  return patterns.filter(p => !V3_DROP_PATTERN_PHRASES.some(re => re.test(p)));
}

function renderMetricQuad(metrics) {
  if (!metrics) return '';
  const lines = [
    `${formatGbp(metrics.total_gbp)} UKRI lead-led across ${formatInt(metrics.total_grants)} grants spanning <b>${metrics.active_clusters}</b> active clusters`,
    `Largest cluster: <b>${metrics.top_cluster_name}</b> at <b>${formatPct(metrics.top_cluster_share)}</b> of regional £ (${formatGbp(metrics.top_cluster_gbp)})`,
    `Region-wide lead: <b>${metrics.lead_name}</b> — ${formatGbp(metrics.lead_gbp)} across all clusters (${formatPct(metrics.lead_share)} of regional £)`,
    `${formatInt(metrics.ch_spinouts)} Companies House-traced spin-outs region-wide → ${formatGbp(metrics.gbp_per_spinout)} UKRI per spin-out`,
  ];
  return `<ul class="sc-metric-quad">${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
}

function renderConstituentTableV3(constituents, clusterIndex) {
  if (!constituents || !constituents.length) {
    return `<p class="empty">No constituent clusters listed in bundle.</p>`;
  }
  return `<table class="ct">
    <thead><tr>
      <th>Cluster</th><th>Regime</th><th>Dominant stalls</th><th>Evidence</th>
    </tr></thead>
    <tbody>
      ${constituents.map(cc => {
        const cj = clusterIndex[cc.v2_slug] || {};
        return `<tr>
          <td><a href="/clusters/${cc.v2_slug}.html">${cc.name}</a></td>
          <td>${cj.regime || '—'}</td>
          <td>${dominantStallsFor(cj) || '—'}</td>
          <td>${cj._evidence_count || '—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

const V3_COMPOSITE_CSS = `
.sc-summary{font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:720px;margin-bottom:1.25rem;}
.sc-metric-quad{list-style:none;padding:0;margin:0 0 2.5rem;font-family:var(--font-mono);font-size:13px;line-height:1.6;color:var(--ink);max-width:720px;}
.sc-metric-quad li{padding:3px 0;}
.sc-metric-quad b{font-weight:600;color:var(--ink);}
.diagnostic-composite{margin:1.5rem 0 3rem;}
.diagnostic-figure{margin:0 0 1.25rem;text-align:center;}
.diagnostic-image{max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.diagnostic-behaviour{font-family:var(--font-serif);font-size:18px;color:var(--ink);line-height:1.5;margin:0 auto 1.5rem;max-width:720px;text-align:center;}
.diagnostic-cta{margin:1.5rem auto 0;max-width:720px;text-align:center;}
.diagnostic-cta-framing{font-family:var(--font-mono);font-size:13px;color:var(--ink-dim);line-height:1.5;margin:0 0 0.75rem;}
.diagnostic-cta-link{margin:0;font-family:var(--font-mono);font-size:14px;}
.diagnostic-cta-link a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);padding-bottom:2px;}
.diagnostic-cta-link a:hover{border-bottom-color:var(--ink);}
.diagnostic-source{margin:1.5rem auto 0;max-width:720px;font-family:var(--font-mono);font-size:12px;color:var(--ink-muted);line-height:1.5;text-align:center;}
@media(max-width:640px){
  .sc-metric-quad{font-size:12.5px;}
  .diagnostic-behaviour{font-size:16px;text-align:left;margin-top:1rem;}
  .diagnostic-cta,.diagnostic-source{text-align:left;}
}`;

function templateV3(sc, children, bundle) {
  const aggStalls = aggregateStalls(children);
  const aggStacks = aggregateStacks(children);
  const lev = topLeverages(children);
  const metrics = bundle.metrics || {};
  const pngUrl = bundle.diagnostic_png_url + (bundle.snapshot_date ? `?v=${bundle.snapshot_date}` : '');
  const sourceLine = `${V3_SOURCE_LINE_LEAD} Snapshot ${monthYearFromDate(bundle.snapshot_date)}.`;
  const clusterCount = metrics.active_clusters != null ? metrics.active_clusters : children.length;
  const filteredPatterns = filterPatterns(sc.regional_patterns);

  // Index clusters.json by id for table joins.
  const clusterIndex = Object.create(null);
  for (const c of clusters) clusterIndex[c.id] = c;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${bundle.region_name || sc.name} — ClusterOS Regional Diagnostic</title>
<meta name="description" content="${(bundle.strap || '').replace(/"/g,'&quot;').slice(0,160)}">
<script type="application/ld+json">${jsonLd(sc, children)}<\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#1a1a1a;--ink-dim:#5a5650;--ink-muted:#8c8780;
  --page:#f7f4ef;--surface:#f0ece4;--border:#ddd8cf;--border-2:#c8c2b7;
  --green:#2a7a4f;--green-dim:#1d5c3a;--signal:#c8f0d0;
  --font-serif:'Instrument Serif',Georgia,serif;
  --font-sans:'Geist',system-ui,sans-serif;
  --font-mono:'Geist Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font-sans);padding-bottom:56px;background:var(--page);color:var(--ink);font-weight:300;line-height:1.6;}
nav{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:52px;background:rgba(247,244,239,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;}
.nav-logo{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--green);letter-spacing:0.12em;text-decoration:none;text-transform:uppercase;}
.nav-back{font-family:var(--font-mono);font-size:11px;color:var(--ink-dim);text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;}
.nav-back::before{content:'← ';color:var(--ink-muted);}
.page-wrap{max-width:920px;margin:0 auto;padding:3rem 2rem 5rem;}
.breadcrumb{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:2rem;}
.breadcrumb a{color:var(--ink-muted);text-decoration:none;}
.breadcrumb a:hover{color:var(--green);}
.breadcrumb span{margin:0 6px;}
.sc-eyebrow{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1rem;}
h1{font-family:var(--font-serif);font-size:clamp(2rem,4.5vw,3rem);font-weight:400;line-height:1.15;margin-bottom:1rem;}
.sc-meta{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1.2rem;}
.meta-tag{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;padding:3px 10px;border-radius:2px;background:var(--surface);color:var(--ink-dim);border:1px solid var(--border);}
.section{margin-bottom:2.5rem;}
.section-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1.2rem;padding-bottom:0.6rem;border-bottom:1px solid var(--border);}
.ct{width:100%;border-collapse:collapse;font-size:13px;}
.ct th{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);text-align:left;padding:0.6rem 0.8rem;border-bottom:1px solid var(--border-2);font-weight:600;}
.ct td{padding:0.7rem 0.8rem;border-bottom:1px solid var(--border);color:var(--ink-dim);}
.ct td a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);}
.ct td a:hover{color:var(--green);border-bottom-color:var(--green);}
.agg-row{display:grid;grid-template-columns:32px 1fr 60px 90px;gap:0.8rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border);}
.agg-row:last-child{border-bottom:none;}
.agg-id{font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);font-weight:600;}
.agg-bar-wrap{background:var(--surface);height:6px;border-radius:2px;overflow:hidden;}
.agg-bar{height:100%;background:var(--green);}
.agg-pct{font-family:var(--font-mono);font-size:11px;color:var(--ink);}
.agg-count{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);}
.stacks-box{border:1px solid var(--border);}
.stack-item{padding:1.2rem 1.4rem;border-bottom:1px solid var(--border);}
.stack-item:last-child{border-bottom:none;}
.stack-header{display:flex;align-items:baseline;gap:1rem;margin-bottom:0.5rem;flex-wrap:wrap;}
.stack-num{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;}
.stack-stalls{font-family:var(--font-mono);font-size:12px;color:var(--green);font-weight:600;}
.stack-count{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);margin-left:auto;}
.stack-desc{font-size:13px;font-weight:300;color:var(--ink-dim);line-height:1.65;}
.leverage-block{border-left:3px solid var(--signal);padding:1rem 1.2rem;background:rgba(200,240,208,0.12);margin-bottom:0.8rem;}
.leverage-hyp{font-family:var(--font-serif);font-size:1.05rem;font-style:italic;color:var(--ink);line-height:1.6;margin-bottom:0.6rem;}
.leverage-meta{display:flex;gap:0.5rem;flex-wrap:wrap;}
.lm-tag{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;background:var(--surface);border:1px solid var(--border);padding:2px 8px;border-radius:2px;}
.lm-tag a{color:inherit;text-decoration:none;}
.rp-list{list-style:none;padding:0;margin:0;}
.rp-list li{font-size:14px;color:var(--ink-dim);line-height:1.65;padding:0.6rem 0 0.6rem 1.2rem;border-bottom:1px solid var(--border);position:relative;}
.rp-list li:last-child{border-bottom:none;}
.rp-list li::before{content:'›';position:absolute;left:0;color:var(--green);font-weight:600;}
.empty{font-size:13px;color:var(--ink-muted);font-style:italic;padding:0.8rem 0;}
footer{border-top:1px solid var(--border);padding:2rem;max-width:920px;margin:0 auto;font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;}
footer a{color:var(--ink-muted);text-decoration:none;}
footer a:hover{color:var(--green);}
${V3_COMPOSITE_CSS}
</style>
</head>
<body>
<nav>
  <a class="nav-logo" href="/">ClusterOS</a>
  <a class="nav-back" href="/national-diagnostic">National Diagnostic</a>
</nav>
<main class="page-wrap">
  <div class="breadcrumb">
    <a href="/">ClusterOS</a><span>›</span>
    <a href="/national-diagnostic">National Diagnostic</a><span>›</span>
    ${bundle.region_name || sc.name}
  </div>
  <p class="sc-eyebrow">ClusterOS Regional Diagnostic</p>
  <h1>${bundle.region_name || sc.name}</h1>
  <div class="sc-meta">
    <span class="meta-tag">${sc.city ? sc.city + ', ' : ''}${countryName(sc.country)}</span>
    <span class="meta-tag">Supercluster</span>
    <span class="meta-tag">${clusterCount} cluster${clusterCount === 1 ? '' : 's'}</span>
  </div>
  <p class="sc-summary">${bundle.strap || ''}</p>
  ${renderMetricQuad(metrics)}
  <section class="diagnostic-composite">
    <figure class="diagnostic-figure">
      <img src="${pngUrl}" alt="${bundle.region_name || sc.name} diagnostic Sankey" class="diagnostic-image" loading="lazy" />
    </figure>
    ${bundle.behaviour ? `<p class="diagnostic-behaviour">${bundle.behaviour}</p>` : ''}
    <div class="diagnostic-cta">
      <p class="diagnostic-cta-framing">${V3_CTA_FRAMING}</p>
      <p class="diagnostic-cta-link"><a href="${V3_CTA_HREF}">${V3_CTA_TEXT}</a></p>
    </div>
    <p class="diagnostic-source">${sourceLine}</p>
  </section>
  ${filteredPatterns.length ? `
  <div class="section">
    <div class="section-label">Regional patterns · Cross-cluster synthesis</div>
    <ul class="rp-list">
      ${filteredPatterns.map(p => `<li>${p}</li>`).join('')}
    </ul>
  </div>` : ''}
  <div class="section">
    <div class="section-label">Constituent clusters</div>
    ${renderConstituentTableV3(bundle.constituent_clusters, clusterIndex)}
  </div>
  <div class="section">
    <div class="section-label">Aggregate stall pattern · Average intensity across clusters</div>
    ${renderAggregateStalls(aggStalls)}
  </div>
  <div class="section">
    <div class="section-label">Dominant stacks · Most common stabilisation patterns in the region</div>
    <div class="stacks-box">${
      sc.dominant_stacks && sc.dominant_stacks.length
        ? renderDominantStacksRich(sc.dominant_stacks, children)
        : renderStacks(aggStacks)
    }</div>
  </div>
  <div class="section">
    <div class="section-label">Top leverage hypotheses</div>
    ${
      sc.leverage_hypotheses && sc.leverage_hypotheses.length
        ? renderLeverageRich(sc.leverage_hypotheses, children)
        : renderLeverage(lev)
    }
  </div>
</main>
<footer>
  <span>© 2026 ClusterOS · Community Lab · Edinburgh</span>
  <span>
    <a href="/">Homepage</a> ·
    <a href="/national-diagnostic">National Diagnostic</a> ·
    <a href="/about.html">About</a>
  </span>
</footer>
</body>
</html>`;
}

function template(sc, children) {
  const aggStalls = aggregateStalls(children);
  const aggStacks = aggregateStacks(children);
  const lev = topLeverages(children);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${sc.name} — ClusterOS Regional Diagnostic</title>
<meta name="description" content="${(sc.summary || '').replace(/"/g,'&quot;').slice(0, 160)}">
<script type="application/ld+json">${jsonLd(sc, children)}<\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#1a1a1a;--ink-dim:#5a5650;--ink-muted:#8c8780;
  --page:#f7f4ef;--surface:#f0ece4;--border:#ddd8cf;--border-2:#c8c2b7;
  --green:#2a7a4f;--green-dim:#1d5c3a;--signal:#c8f0d0;
  --font-serif:'Instrument Serif',Georgia,serif;
  --font-sans:'Geist',system-ui,sans-serif;
  --font-mono:'Geist Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font-sans);padding-bottom:56px;background:var(--page);color:var(--ink);font-weight:300;line-height:1.6;}
nav{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:52px;background:rgba(247,244,239,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;}
.nav-logo{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--green);letter-spacing:0.12em;text-decoration:none;text-transform:uppercase;}
.nav-back{font-family:var(--font-mono);font-size:11px;color:var(--ink-dim);text-decoration:none;text-transform:uppercase;letter-spacing:0.1em;}
.nav-back::before{content:'← ';color:var(--ink-muted);}
.page-wrap{max-width:920px;margin:0 auto;padding:3rem 2rem 5rem;}
.breadcrumb{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:2rem;}
.breadcrumb a{color:var(--ink-muted);text-decoration:none;}
.breadcrumb a:hover{color:var(--green);}
.breadcrumb span{margin:0 6px;}
.sc-eyebrow{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1rem;}
h1{font-family:var(--font-serif);font-size:clamp(2rem,4.5vw,3rem);font-weight:400;line-height:1.15;margin-bottom:1rem;}
.sc-meta{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1.2rem;}
.meta-tag{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;padding:3px 10px;border-radius:2px;background:var(--surface);color:var(--ink-dim);border:1px solid var(--border);}
.sc-summary{font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:720px;margin-bottom:2.5rem;}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);margin-bottom:2.5rem;}
.stat-cell{padding:1rem 1.2rem;border-right:1px solid var(--border);}
.stat-cell:last-child{border-right:none;}
.stat-num{font-family:var(--font-serif);font-size:2rem;color:var(--green);line-height:1;margin-bottom:0.2rem;}
.stat-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;}
.section{margin-bottom:2.5rem;}
.section-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1.2rem;padding-bottom:0.6rem;border-bottom:1px solid var(--border);}
.ct{width:100%;border-collapse:collapse;font-size:13px;}
.ct th{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);text-align:left;padding:0.6rem 0.8rem;border-bottom:1px solid var(--border-2);font-weight:600;}
.ct td{padding:0.7rem 0.8rem;border-bottom:1px solid var(--border);color:var(--ink-dim);}
.ct td a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);}
.ct td a:hover{color:var(--green);border-bottom-color:var(--green);}
.agg-row{display:grid;grid-template-columns:32px 1fr 60px 90px;gap:0.8rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border);}
.agg-row:last-child{border-bottom:none;}
.agg-id{font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);font-weight:600;}
.agg-bar-wrap{background:var(--surface);height:6px;border-radius:2px;overflow:hidden;}
.agg-bar{height:100%;background:var(--green);}
.agg-pct{font-family:var(--font-mono);font-size:11px;color:var(--ink);}
.agg-count{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);}
.stacks-box{border:1px solid var(--border);}
.stack-item{padding:1.2rem 1.4rem;border-bottom:1px solid var(--border);}
.stack-item:last-child{border-bottom:none;}
.stack-header{display:flex;align-items:baseline;gap:1rem;margin-bottom:0.5rem;flex-wrap:wrap;}
.stack-num{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;}
.stack-stalls{font-family:var(--font-mono);font-size:12px;color:var(--green);font-weight:600;}
.stack-count{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);margin-left:auto;}
.stack-desc{font-size:13px;font-weight:300;color:var(--ink-dim);line-height:1.65;}
.leverage-block{border-left:3px solid var(--signal);padding:1rem 1.2rem;background:rgba(200,240,208,0.12);margin-bottom:0.8rem;}
.leverage-hyp{font-family:var(--font-serif);font-size:1.05rem;font-style:italic;color:var(--ink);line-height:1.6;margin-bottom:0.6rem;}
.leverage-meta{display:flex;gap:0.5rem;flex-wrap:wrap;}
.lm-tag{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;background:var(--surface);border:1px solid var(--border);padding:2px 8px;border-radius:2px;}
.lm-tag a{color:inherit;text-decoration:none;}
.rp-list{list-style:none;padding:0;margin:0;}
.rp-list li{font-size:14px;color:var(--ink-dim);line-height:1.65;padding:0.6rem 0 0.6rem 1.2rem;border-bottom:1px solid var(--border);position:relative;}
.rp-list li:last-child{border-bottom:none;}
.rp-list li::before{content:'›';position:absolute;left:0;color:var(--green);font-weight:600;}
.empty{font-size:13px;color:var(--ink-muted);font-style:italic;padding:0.8rem 0;}
.empty code{font-family:var(--font-mono);font-size:12px;color:var(--ink);background:var(--surface);padding:1px 5px;border-radius:2px;}
footer{border-top:1px solid var(--border);padding:2rem;max-width:920px;margin:0 auto;font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;}
footer a{color:var(--ink-muted);text-decoration:none;}
footer a:hover{color:var(--green);}
@media(max-width:680px){.stats-row{grid-template-columns:1fr 1fr;}.stat-cell:last-child{border-top:1px solid var(--border);grid-column:span 2;}.agg-row{grid-template-columns:28px 1fr 50px;}.agg-count{display:none;}}
</style>${diagnosticStyles(sc.id, 'supercluster')}
</head>
<body>
<nav>
  <a class="nav-logo" href="/">ClusterOS</a>
  <a class="nav-back" href="/national-diagnostic">National Diagnostic</a>
</nav>
<main class="page-wrap">
  <div class="breadcrumb">
    <a href="/">ClusterOS</a><span>›</span>
    <a href="/national-diagnostic">National Diagnostic</a><span>›</span>
    ${sc.name}
  </div>
  <p class="sc-eyebrow">ClusterOS Regional Diagnostic</p>
  <h1>${sc.name}</h1>
  <div class="sc-meta">
    <span class="meta-tag">${sc.city ? sc.city + ', ' : ''}${countryName(sc.country)}</span>
    <span class="meta-tag">Supercluster</span>
    <span class="meta-tag">${children.length} cluster${children.length === 1 ? '' : 's'}</span>
  </div>
  <p class="sc-summary">${sc.summary || ''}</p>${renderDiagnosticComposite(sc.id, 'supercluster')}
  <div class="stats-row">
    <div class="stat-cell">
      <div class="stat-num">${children.length}</div>
      <div class="stat-label">Clusters diagnosed</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${children.reduce((sum, c) => sum + (c._evidence_count || 0), 0) || (sc.evidence_count || '—')}</div>
      <div class="stat-label">Evidence items</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${aggStacks.length}</div>
      <div class="stat-label">Distinct stacks</div>
    </div>
  </div>
  ${renderRegionalPatterns(sc.regional_patterns)}
  <div class="section">
    <div class="section-label">Constituent clusters</div>
    ${renderClusterTable(children)}
  </div>
  <div class="section">
    <div class="section-label">Aggregate stall pattern · Average intensity across clusters</div>
    ${renderAggregateStalls(aggStalls)}
  </div>
  <div class="section">
    <div class="section-label">Dominant stacks · Most common stabilisation patterns in the region</div>
    <div class="stacks-box">${
      sc.dominant_stacks && sc.dominant_stacks.length
        ? renderDominantStacksRich(sc.dominant_stacks, children)
        : renderStacks(aggStacks)
    }</div>
  </div>
  <div class="section">
    <div class="section-label">Top leverage hypotheses</div>
    ${
      sc.leverage_hypotheses && sc.leverage_hypotheses.length
        ? renderLeverageRich(sc.leverage_hypotheses, children)
        : renderLeverage(lev)
    }
  </div>
</main>
<footer>
  <span>© 2026 ClusterOS · Community Lab · Edinburgh</span>
  <span>
    <a href="/">Homepage</a> ·
    <a href="/national-diagnostic">National Diagnostic</a> ·
    <a href="/about.html">About</a>
  </span>
</footer>
</body>
</html>`;
}

let count = 0;
let v3Count = 0;
let filteredOut = 0;
for (const sc of supers) {
  if (allowedIds && !allowedIds.has(sc.id)) { filteredOut++; continue; }
  const children = clusters.filter(c => c.parent === sc.id);
  const bundle = loadBundle(sc.id);
  const html = bundle ? templateV3(sc, children, bundle) : template(sc, children);
  fs.writeFileSync(path.join(outDir, `${sc.id}.html`), html, 'utf8');
  if (bundle) v3Count++;
  count++;
}
console.log(`Generated ${count} supercluster pages → superclusters/ (${v3Count} via v3 bundle)`);
if (allowedIds) console.log(`Filtered out (outside --only): ${filteredOut}`);
