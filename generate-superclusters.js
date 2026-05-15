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
// Bundle path matches v3: data/v2_pages/superclusters/<sc.id>.json
const V3_BUNDLES_DIR = path.join(__dirname, 'v3-data', 'v2_pages', 'superclusters');
function loadBundle(scId) {
  const p = path.join(V3_BUNDLES_DIR, `${scId}.json`);
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

// Lowercase keys + case-insensitive lookup — clusters.json uses Title Case
// ("Re-proving Instead of Narrowing") for stall names, so a literal map would
// silently miss every entry and the Aggregate Stall Pattern section would
// render empty across all 25 regions.
const STALL_NAME_TO_ID = {
  're-proving instead of narrowing': 'S1',
  'coordinating instead of deciding': 'S2',
  'forgiving instead of redesigning': 'S3',
  'extracting without reinvesting': 'S4',
  'mediating instead of coupling': 'S5',
  'stabilizing around incumbents': 'S6',
  'stabilising around incumbents': 'S6',
  'narrating instead of testing': 'S7',
  'scaling activity instead of throughput': 'S8',
  'waiting for permission': 'S9',
};

function aggregateStalls(children) {
  const totals = {};
  const counts = {};
  children.forEach(c => {
    (c.stalls || []).forEach(s => {
      const id = STALL_NAME_TO_ID[(s.name || '').toLowerCase()];
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

// Mixpanel client snippet — identical to the one in generate-clusters.js so
// supercluster pages get the same autocapture + session recording on EU host.
const MIXPANEL_SNIPPET = `<!-- Mixpanel tracking -->
<script type="text/javascript">
  (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
  for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
  e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[])


  mixpanel.init('a5cac1b920750b79ab02f9cbf02c8f89', {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: 'https://api-eu.mixpanel.com',
  })

<\/script>`;

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
          <td data-label="Regime">${cj.regime || '—'}</td>
          <td data-label="Dominant stalls">${dominantStallsFor(cj) || '—'}</td>
          <td data-label="Evidence">${cj._evidence_count || '—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

// FT/McKinsey-style typography: prose stays in --font-sans, serif is reserved
// for h1, mono is reserved for labels, pills, source line, and CTA framing.
const V3_COMPOSITE_CSS = `
.sc-summary{font-family:var(--font-sans);font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:720px;margin-bottom:1.25rem;}
.sc-behaviour{font-family:var(--font-sans);font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:720px;margin-bottom:2rem;}
.diagnostic-composite{margin:1.5rem 0 3rem;}
.diagnostic-figure{margin:0;text-align:center;}
.diagnostic-image{max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.diagnostic-cta{margin:1.75rem auto 0;max-width:720px;text-align:center;}
.diagnostic-cta-framing{font-family:var(--font-mono);font-size:13px;color:var(--ink-dim);line-height:1.5;margin:0 0 0.75rem;}
.diagnostic-cta-link{margin:0;font-family:var(--font-mono);font-size:14px;}
.diagnostic-cta-link a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);padding-bottom:2px;}
.diagnostic-cta-link a:hover{border-bottom-color:var(--ink);}
.diagnostic-source{margin:1.5rem auto 0;max-width:720px;font-family:var(--font-mono);font-size:12px;color:var(--ink-muted);line-height:1.5;text-align:center;}
/* PNG tap-to-zoom */
.png-zoom-trigger{display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in;font:inherit;color:inherit;}
.png-zoom-hint{display:none;margin-top:0.5rem;font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;}
@media(max-width:680px){.png-zoom-hint{display:block;}}
.png-modal{position:fixed;inset:0;background:rgba(15,12,8,0.94);z-index:9999;display:flex;align-items:center;justify-content:center;overflow:auto;padding:1rem;cursor:zoom-out;}
.png-modal img{max-width:none;height:auto;display:block;margin:auto;}
.png-modal .png-modal-close{position:fixed;top:0.75rem;right:0.75rem;font-family:var(--font-mono);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.4);padding:0.5rem 0.9rem;border-radius:2px;cursor:pointer;}
.png-modal .png-modal-close:hover{background:rgba(0,0,0,0.85);}
body.png-modal-open{overflow:hidden;}
/* Skip-nav chip row (mobile only) */
.section-jumpnav{display:none;}
@media(max-width:680px){
  .section-jumpnav{display:flex;flex-wrap:wrap;gap:0.4rem;margin:0 0 2rem;padding:0 0 1.25rem;border-bottom:1px solid var(--border);}
  .section-jumpnav a{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-dim);background:var(--surface);border:1px solid var(--border);padding:5px 9px;border-radius:2px;text-decoration:none;transition:color 0.15s,border-color 0.15s;}
  .section-jumpnav a:hover{color:var(--green);border-color:var(--green);}
}
/* Mobile-only collapsibles */
details.section-collapsible{margin-bottom:2.5rem;}
details.section-collapsible > summary{list-style:none;cursor:pointer;}
details.section-collapsible > summary::-webkit-details-marker{display:none;}
details.section-collapsible > summary::marker{content:'';}
details.section-collapsible > summary .section-label{margin-bottom:1.2rem;}
@media(max-width:680px){
  details.section-collapsible > summary .section-label{position:relative;padding-right:1.5rem;}
  details.section-collapsible > summary .section-label::after{content:'▾';position:absolute;right:0;top:50%;transform:translateY(-65%);font-size:11px;color:var(--ink-muted);}
  details.section-collapsible:not([open]) > summary .section-label::after{content:'▸';}
}
@media(min-width:681px){
  details.section-collapsible > summary{cursor:default;pointer-events:none;}
}
/* Constituent Clusters table — stacked cards on mobile */
@media(max-width:640px){
  .ct thead{display:none;}
  .ct,.ct tbody,.ct tr,.ct td{display:block;width:100%;}
  .ct tr{border-bottom:1px solid var(--border);padding:0.9rem 0;}
  .ct td{padding:0.2rem 0;border-bottom:none;}
  .ct td:first-child{font-family:var(--font-sans);font-size:14px;color:var(--ink);margin-bottom:0.5rem;}
  .ct td:first-child a{border-bottom-color:var(--border-2);}
  .ct td:not(:first-child)::before{content:attr(data-label) ': ';font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);margin-right:6px;}
}
/* Mobile responsive touch-ups */
@media(max-width:640px){
  .diagnostic-cta,.diagnostic-source{text-align:left;}
  .stack-header{flex-direction:column;align-items:flex-start;gap:0.3rem;}
}
@media(max-width:480px){
  h1{font-size:1.5rem;}
  .sc-meta{gap:0.3rem;}
}`;

// Shared mobile JS: PNG lightbox + close-collapsibles-on-mobile-load.
const V3_MOBILE_JS = `
<script>
(function(){
  function applyCollapse(){
    var mobile = window.matchMedia('(max-width: 680px)').matches;
    document.querySelectorAll('details.section-collapsible').forEach(function(d){
      d.open = !mobile;
    });
  }
  applyCollapse();
  var lastIsMobile = window.matchMedia('(max-width: 680px)').matches;
  window.addEventListener('resize', function(){
    var nowMobile = window.matchMedia('(max-width: 680px)').matches;
    if (nowMobile !== lastIsMobile){ lastIsMobile = nowMobile; applyCollapse(); }
  });
  document.addEventListener('click', function(e){
    var trigger = e.target.closest && e.target.closest('.png-zoom-trigger');
    if (!trigger) return;
    e.preventDefault();
    var img = trigger.querySelector('img');
    if (!img) return;
    var modal = document.createElement('div');
    modal.className = 'png-modal';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'png-modal-close';
    close.textContent = 'Close ×';
    var enlarged = document.createElement('img');
    enlarged.src = img.src;
    enlarged.alt = img.alt;
    modal.appendChild(close);
    modal.appendChild(enlarged);
    document.body.appendChild(modal);
    document.body.classList.add('png-modal-open');
    function dismiss(){
      modal.remove();
      document.body.classList.remove('png-modal-open');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(ev){ if (ev.key === 'Escape') dismiss(); }
    close.addEventListener('click', dismiss);
    modal.addEventListener('click', function(ev){ if (ev.target === modal) dismiss(); });
    document.addEventListener('keydown', onKey);
  });
})();
<\/script>`;

function templateV3(sc, children, bundle) {
  // Restrict aggregation to v3's canonical active children. clusters.json's
  // `parent` field includes the deprecated <region>-innovation-ecosystem and
  // any NA clusters; bundle.constituent_clusters is the v3-active set.
  const v3ChildSlugs = new Set((bundle.constituent_clusters || []).map(cc => cc.v2_slug));
  const v3Children = v3ChildSlugs.size
    ? children.filter(c => v3ChildSlugs.has(c.id))
    : children;
  const aggStalls = aggregateStalls(v3Children);
  const aggStacks = aggregateStacks(v3Children);
  // "Dominant" = appears in 2+ constituent clusters. Falls back to all stacks
  // for tiny regions (e.g. Stirling has only 2 children with no overlap).
  const aggStacksDominant = aggStacks.filter(s => (s.count || 0) >= 2);
  const aggStacksToRender = aggStacksDominant.length ? aggStacksDominant : aggStacks;
  const lev = topLeverages(children);
  const metrics = bundle.metrics || {};
  const pngUrl = bundle.diagnostic_png_url + (bundle.snapshot_date ? `?v=${bundle.snapshot_date}` : '');
  const sourceLine = `${V3_SOURCE_LINE_LEAD} Snapshot ${monthYearFromDate(bundle.snapshot_date)}.`;
  const clusterCount = metrics.active_clusters != null ? metrics.active_clusters : children.length;

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
${MIXPANEL_SNIPPET}
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
  ${bundle.behaviour ? `<p class="sc-behaviour">${bundle.behaviour}</p>` : ''}
  <section class="diagnostic-composite">
    <figure class="diagnostic-figure">
      <button type="button" class="png-zoom-trigger" aria-label="Enlarge diagnostic Sankey">
        <img src="${pngUrl}" alt="${bundle.region_name || sc.name} diagnostic Sankey" class="diagnostic-image" loading="lazy" />
      </button>
      <p class="png-zoom-hint">Tap diagram to enlarge</p>
    </figure>
    <div class="diagnostic-cta">
      <p class="diagnostic-cta-framing">${V3_CTA_FRAMING}</p>
      <p class="diagnostic-cta-link"><a href="${V3_CTA_HREF}">${V3_CTA_TEXT}</a></p>
    </div>
    <p class="diagnostic-source">${sourceLine}</p>
  </section>
  <nav class="section-jumpnav" aria-label="Jump to section">
    <a href="#constituents">Constituents</a>
    <a href="#agg-stalls">Stalls</a>
    <a href="#dom-stacks">Stacks</a>
    <a href="#leverage">Leverage</a>
  </nav>
  <div class="section" id="constituents">
    <div class="section-label">Constituent clusters</div>
    ${renderConstituentTableV3(bundle.constituent_clusters, clusterIndex)}
  </div>
  <div class="section" id="agg-stalls">
    <div class="section-label">Aggregate stall pattern · Average intensity across clusters</div>
    ${renderAggregateStalls(aggStalls)}
  </div>
  <details class="section section-collapsible" id="dom-stacks" open>
    <summary><div class="section-label">Dominant stacks · Most common stabilisation patterns in the region</div></summary>
    <div class="stacks-box">${renderStacks(aggStacksToRender)}</div>
  </details>
  <details class="section section-collapsible" id="leverage" open>
    <summary><div class="section-label">Top leverage hypotheses</div></summary>
    ${
      sc.leverage_hypotheses && sc.leverage_hypotheses.length
        ? renderLeverageRich(sc.leverage_hypotheses, children)
        : renderLeverage(lev)
    }
  </details>
</main>
<footer>
  <span>© 2026 ClusterOS · Community Lab · Edinburgh</span>
  <span>
    <a href="/">Homepage</a> ·
    <a href="/national-diagnostic">National Diagnostic</a> ·
    <a href="/about.html">About</a>
  </span>
</footer>
${V3_MOBILE_JS}
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
${MIXPANEL_SNIPPET}
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
