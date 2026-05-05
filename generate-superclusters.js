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

const supers   = JSON.parse(fs.readFileSync('./superclusters.json', 'utf8'));
const clusters = JSON.parse(fs.readFileSync('./clusters.json', 'utf8'));

const outDir = path.join(__dirname, 'superclusters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

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
    ${sc.name}
  </div>
  <p class="sc-eyebrow">ClusterOS Regional Diagnostic</p>
  <h1>${sc.name}</h1>
  <div class="sc-meta">
    <span class="meta-tag">${sc.city ? sc.city + ', ' : ''}${countryName(sc.country)}</span>
    <span class="meta-tag">Supercluster</span>
    <span class="meta-tag">${children.length} cluster${children.length === 1 ? '' : 's'}</span>
  </div>
  <p class="sc-summary">${sc.summary || ''}</p>
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
for (const sc of supers) {
  const children = clusters.filter(c => c.parent === sc.id);
  const html = template(sc, children);
  fs.writeFileSync(path.join(outDir, `${sc.id}.html`), html, 'utf8');
  count++;
}
console.log(`Generated ${count} supercluster pages → superclusters/`);
