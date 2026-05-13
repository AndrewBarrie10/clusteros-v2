#!/usr/bin/env node
// ClusterOS — Cluster page generator (rich version)
// Reads clusters.json → writes clusters/{slug}.html for each cluster
//
// Usage:
//   node generate-clusters.js
//     Regenerate every cluster page (default; OVERWRITES existing files —
//     do not use unless you want to wipe enrichment from live pages).
//
//   node generate-clusters.js --new-only
//     Only generate pages for entries whose clusters/{id}.html does not
//     already exist. Existing files are left untouched.
//
//   node generate-clusters.js --only id1,id2,id3
//     Only generate the listed slugs (still overwrites those files).
//
//   node generate-clusters.js --only-file path/to/ids.txt
//     One slug per line; blanks and `#` comments ignored.
//
//   Filters compose: `--new-only --only foo,bar` writes foo.html and
//   bar.html only if they don't already exist.

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const opts = { newOnly: false, only: null, onlyFile: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--new-only') {
      opts.newOnly = true;
    } else if (a === '--only') {
      opts.only = (argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (a.startsWith('--only=')) {
      opts.only = a.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean);
    } else if (a === '--only-file') {
      opts.onlyFile = argv[++i];
    } else if (a.startsWith('--only-file=')) {
      opts.onlyFile = a.slice('--only-file='.length);
    } else if (a === '--help' || a === '-h') {
      console.log('See file header for usage.'); process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`); process.exit(1);
    }
  }
  return opts;
}

const argv = parseArgs(process.argv);
const allowedIds = (() => {
  if (!argv.only && !argv.onlyFile) return null;
  const set = new Set();
  if (argv.only) argv.only.forEach(id => set.add(id));
  if (argv.onlyFile) {
    fs.readFileSync(argv.onlyFile, 'utf8').split(/\r?\n/).forEach(line => {
      const id = line.split('#')[0].trim();
      if (id) set.add(id);
    });
  }
  return set;
})();

const clusters = JSON.parse(fs.readFileSync('./clusters.json', 'utf8'));

const outDir = path.join(__dirname, 'clusters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// Phase 1 diagnostic composite registry. Pages with an entry here get a
// composite block (headlines + diagnostic PNG + caption + CTA + sources)
// rendered between the intro and the four-metric strip. Pages without an
// entry render unchanged.
const diagnosticsRegistryPath = path.join(__dirname, 'diagnostics.json');
const diagnostics = fs.existsSync(diagnosticsRegistryPath)
  ? JSON.parse(fs.readFileSync(diagnosticsRegistryPath, 'utf8'))
  : { clusters: {}, superclusters: {}, cta: null, source_line: '' };

// v3 per-page bundles. When a bundle exists for a cluster slug, the page is
// rendered in v3 mode (strap + behaviour + hot-linked PNG + DSIT source line)
// and the legacy evidence pill, stats-row and bullets composite are dropped.
// When absent, the legacy template is used.
const V3_BUNDLES_DIR = path.join(__dirname, 'v3-data', 'v2_pages');
function loadV3Bundle(slug) {
  const p = path.join(V3_BUNDLES_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.warn(`Failed to parse bundle ${p}: ${e.message}`); return null; }
}

// Preload supercluster bundles so cluster pages can render parent-region
// breadcrumbs, top nav, location pill and sibling-cluster navigation.
const V3_SC_BUNDLES_DIR = path.join(__dirname, 'v3-data', 'v2_pages', 'superclusters');
const v3SuperBundles = Object.create(null);
if (fs.existsSync(V3_SC_BUNDLES_DIR)) {
  for (const f of fs.readdirSync(V3_SC_BUNDLES_DIR)) {
    if (!f.endsWith('.json')) continue;
    try {
      v3SuperBundles[f.replace('.json','')] = JSON.parse(
        fs.readFileSync(path.join(V3_SC_BUNDLES_DIR, f), 'utf8')
      );
    } catch (e) { /* skip malformed */ }
  }
}
function loadV3SuperBundle(parentSlug) {
  return parentSlug ? (v3SuperBundles[parentSlug] || null) : null;
}

// v3 registry. When present, drives the in-scope cluster list (so we
// only emit UK pages defined by v3, not all 377 entries in clusters.json).
// Falls back to clusters.json iteration when the registry is absent.
const V3_REGISTRY_PATH = path.join(__dirname, 'v3-data', 'v2_cluster_registry.json');
const v3Registry = fs.existsSync(V3_REGISTRY_PATH)
  ? JSON.parse(fs.readFileSync(V3_REGISTRY_PATH, 'utf8'))
  : null;

// Build a stub cluster object for registry entries with no clusters.json
// counterpart (4 net-new clusters where Pipeline 1 data hasn't been
// imported yet). Stalls/stacks/leverage/resemblances render empty states.
function stubClusterFromBundle(slug, entry, bundle) {
  return {
    id: slug,
    name: bundle && bundle.cluster_name ? bundle.cluster_name : slug,
    city: bundle && bundle.region_name ? bundle.region_name : '',
    country: 'GB',
    parent: entry && entry.supercluster ? entry.supercluster : null,
    regime: null,
    summary: '',
    _evidence_count: null,
    _anchor_type: null,
    stalls: [],
    stacks: [],
    leverage: null,
  };
}

const V3_SOURCE_LINE_LEAD = 'Sources: UKRI Gateway to Research (grants, outcomes); OpenAlex (publications); Companies House (spin-out lifecycle); DSIT (cluster mapping); Public investment data.';
const V3_CTA_FRAMING = 'Same data examined through five diagnostic lenses — Pipeline, Leverage, Triple Helix, Throughput, Collaboration. The interactive diagnostic is currently in private preview.';
const V3_CTA_HREF = 'https://www.clusteros.io/request';
const V3_CTA_TEXT = 'Request access →';

function monthYearFromDate(iso) {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})/);
  if (!m) return '';
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[parseInt(m[2],10)-1]} ${m[1]}`;
}

// FT/McKinsey-style typography for v3 cluster pages: prose stays in
// --font-sans, serif is reserved for h1, mono is reserved for labels,
// pills, source line and CTA framing.
const V3_CLUSTER_CSS = `
.cluster-behaviour{font-family:var(--font-sans);font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:660px;margin:1.25rem 0 2rem;}
.diagnostic-composite-v3{margin:0 0 3rem;}
.diagnostic-figure-v3{margin:0;text-align:center;}
.diagnostic-image-v3{max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.06);}
.diagnostic-cta-v3{margin:1.75rem auto 0;max-width:720px;text-align:center;}
.diagnostic-cta-framing-v3{font-family:var(--font-mono);font-size:13px;color:var(--ink-dim);line-height:1.5;margin:0 0 0.75rem;}
.diagnostic-cta-link-v3{margin:0;font-family:var(--font-mono);font-size:14px;}
.diagnostic-cta-link-v3 a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);padding-bottom:2px;}
.diagnostic-cta-link-v3 a:hover{border-bottom-color:var(--ink);}
.diagnostic-source-v3{margin:1.5rem auto 0;max-width:720px;font-family:var(--font-mono);font-size:12px;color:var(--ink-muted);line-height:1.5;text-align:center;}
/* PNG tap-to-zoom trigger + modal */
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
/* Mobile responsive touch-ups */
@media(max-width:640px){
  .sibling-clusters .sibling-row{flex-direction:column;align-items:flex-start;gap:0.5rem;}
  .sibling-clusters .sibling-sep{display:none;}
  .stack-header{flex-direction:column;align-items:flex-start;gap:0.3rem;}
  .diagnostic-cta-v3,.diagnostic-source-v3{text-align:left;}
}
@media(max-width:480px){
  h1{font-size:1.5rem;}
  .cluster-meta{gap:0.3rem;}
  .csb-btn{padding:0 0.7rem;font-size:10px;letter-spacing:0.05em;}
}`;

function renderV3Composite(bundle) {
  const png = bundle.diagnostic_png_url + (bundle.snapshot_date ? `?v=${bundle.snapshot_date}` : '');
  const sourceLine = `${V3_SOURCE_LINE_LEAD} Snapshot ${monthYearFromDate(bundle.snapshot_date)}.`;
  return `
  <section class="diagnostic-composite-v3">
    <figure class="diagnostic-figure-v3">
      <button type="button" class="png-zoom-trigger" aria-label="Enlarge diagnostic Sankey">
        <img src="${png}" alt="${bundle.cluster_name || ''} diagnostic Sankey" class="diagnostic-image-v3" loading="lazy" />
      </button>
      <p class="png-zoom-hint">Tap diagram to enlarge</p>
    </figure>
    <div class="diagnostic-cta-v3">
      <p class="diagnostic-cta-framing-v3">${V3_CTA_FRAMING}</p>
      <p class="diagnostic-cta-link-v3"><a href="${V3_CTA_HREF}">${V3_CTA_TEXT}</a></p>
    </div>
    <p class="diagnostic-source-v3">${sourceLine}</p>
  </section>`;
}

// Shared mobile JS: PNG lightbox + close-collapsibles-on-mobile-load.
// Kept inline (no external file) to avoid extra request and keep self-contained.
const V3_MOBILE_JS = `
<script>
(function(){
  // Collapse mobile-only details sections on initial load.
  function applyCollapse(){
    var mobile = window.matchMedia('(max-width: 680px)').matches;
    document.querySelectorAll('details.section-collapsible').forEach(function(d){
      d.open = !mobile;
    });
  }
  applyCollapse();
  // Re-apply on resize across the breakpoint.
  var lastIsMobile = window.matchMedia('(max-width: 680px)').matches;
  window.addEventListener('resize', function(){
    var nowMobile = window.matchMedia('(max-width: 680px)').matches;
    if (nowMobile !== lastIsMobile){ lastIsMobile = nowMobile; applyCollapse(); }
  });
  // PNG lightbox.
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

// ── HELPERS ──────────────────────────────────────────────

const COUNTRIES = {
  AE:'UAE', AU:'Australia', BE:'Belgium', CA:'Canada', CH:'Switzerland',
  CL:'Chile', CZ:'Czech Republic', DE:'Germany', EE:'Estonia', ES:'Spain',
  FI:'Finland', FR:'France', GB:'United Kingdom', HK:'Hong Kong', IE:'Ireland',
  IL:'Israel', IN:'India', IT:'Italy', JP:'Japan', KR:'South Korea',
  MY:'Malaysia', NL:'Netherlands', NO:'Norway', NZ:'New Zealand', PL:'Poland',
  PT:'Portugal', SE:'Sweden', SG:'Singapore', TW:'Taiwan', UA:'Ukraine',
  US:'United States', ZA:'South Africa'
};

function countryName(code) { return COUNTRIES[code] || code; }

const STALL_CODES = {
  're-proving':'S1','coordinating':'S2','forgiving':'S3',
  'extracting':'S4','mediating':'S5','stabilis':'S6',
  'narrating':'S7','scaling':'S8','waiting':'S9'
};

const ALL_STALLS = [
  {code:'S1',short:'Re-proving',  key:'re-proving'},
  {code:'S2',short:'Coordinating',key:'coordinating'},
  {code:'S3',short:'Forgiving',   key:'forgiving'},
  {code:'S4',short:'Extracting',  key:'extracting'},
  {code:'S5',short:'Mediating',   key:'mediating'},
  {code:'S6',short:'Stabilising', key:'stabilis'},
  {code:'S7',short:'Narrating',   key:'narrating'},
  {code:'S8',short:'Scaling',     key:'scaling'},
  {code:'S9',short:'Waiting',     key:'waiting'},
];

function stallCode(name) {
  const n = name.toLowerCase();
  for (const [key,id] of Object.entries(STALL_CODES)) {
    if (n.includes(key)) return id;
  }
  return '—';
}

function stallMap(cluster) {
  const map = {};
  ALL_STALLS.forEach(s => { map[s.code] = 0; });
  (cluster.stalls||[]).forEach(s => {
    const n = s.name.toLowerCase();
    for (const st of ALL_STALLS) {
      if (n.includes(st.key)) { map[st.code] = s.intensity||0; break; }
    }
  });
  return map;
}

function findSimilar(cluster, all, n=3) {
  const myMap = stallMap(cluster);
  const myTop = Object.entries(myMap).filter(([,v])=>v>0.3).map(([k])=>k);
  return all
    .filter(c=>c.id!==cluster.id)
    .map(c=>{
      const theirMap = stallMap(c);
      const theirTop = Object.entries(theirMap).filter(([,v])=>v>0.3).map(([k])=>k);
      const shared = myTop.filter(s=>theirTop.includes(s)).length;
      const bonus = (c.regime===cluster.regime?1:0)+(c._anchor_type===cluster._anchor_type?0.5:0);
      return {cluster:c, score:shared+bonus};
    })
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,n)
    .map(x=>x.cluster);
}

function radarData(cluster) {
  const map = stallMap(cluster);
  return JSON.stringify({
    labels: ALL_STALLS.map(s=>s.short),
    values: ALL_STALLS.map(s=>Math.round((map[s.code]||0)*100))
  });
}

function regimeLabel(r) {
  return {emerging:'Emerging',cycling:'Cycling',active:'Active',mature:'Mature'}[r]||r||'Unknown';
}
function anchorLabel(t) {
  return {university:'University anchor',government:'Government anchor',
    corporate:'Corporate anchor',military:'Military anchor',mixed:'Mixed anchor'}[t]||t||'';
}
function intensityColour(v) {
  if (v>0.65) return '#d4695a';
  if (v>0.4)  return '#d4a94a';
  return '#2a7a4f';
}
function confidenceBadge(conf) {
  const c=(conf||'low').toLowerCase();
  return `<span class="conf conf-${c}">${c}</span>`;
}

function renderStalls(stalls) {
  if (!stalls||!stalls.length) return '<p class="empty">No stall data available.</p>';
  return stalls.map(s=>{
    const pct=Math.round((s.intensity||0.3)*100);
    const w=Math.round((s.intensity||0.3)*140);
    const col=intensityColour(s.intensity);
    return `<div class="stall-row">
      <span class="stall-id">${stallCode(s.name)}</span>
      <div class="stall-detail">
        <span class="stall-name">${s.name}</span>
        <div class="stall-bar-wrap">
          <div class="stall-bar" style="width:${w}px;background:${col}"></div>
        </div>
      </div>
      ${confidenceBadge(s.confidence)}
    </div>`;
  }).join('');
}

function renderStacks(stacks) {
  if (!stacks||!stacks.length) return '<p class="empty">No stack analysis available.</p>';
  return stacks.map((st,i)=>{
    const stackId = st.id && st.id.match(/STK-\d+/) ? st.id : null;
    const stackLabel = stackId || `Stack ${String(i+1).padStart(2,'0')}`;
    const stackName = st.name && st.name !== stackId ? ` · ${st.name}` : '';
    return `
    <div class="stack-item">
      <div class="stack-header">
        <span class="stack-num">${stackLabel}${stackName}</span>
        <span class="stack-stalls">${(st.stalls_involved||[]).join(' · ')}</span>
      </div>
      <p class="stack-desc">${st.description||''}</p>
    </div>`;
  }).join('');
}

function renderLeverage(leverage) {
  if (!leverage) return '<p class="empty">Leverage hypothesis available on request.</p>';
  return `<div class="leverage-block">
    <p class="leverage-hyp">"${leverage.hypothesis||''}"</p>
    <div class="leverage-meta">
      ${leverage.timeline?`<span class="lm-tag">${leverage.timeline}</span>`:''}
    </div>
  </div>`;
}

function renderSimilar(similar) {
  if (!similar.length) return '<p class="empty">No comparable clusters identified.</p>';
  return similar.map(c=>{
    const topStall=(c.stalls||[]).reduce((a,b)=>((a.intensity||0)>(b.intensity||0)?a:b),{});
    return `<a class="similar-card" href="/clusters/${c.id}.html">
      <div class="sc-name">${c.name}</div>
      <div class="sc-meta">${c.city} · ${countryName(c.country)}</div>
      <div class="sc-regime">${regimeLabel(c.regime)}</div>
      ${topStall.name?`<div class="sc-stall">Primary: ${topStall.name}</div>`:''}
    </a>`;
  }).join('');
}

function jsonLd(c) {
  return JSON.stringify({
    "@context":"https://schema.org","@type":"Dataset",
    "name":`${c.name} — ClusterOS Diagnostic Profile`,
    "description":c.summary||`Diagnostic profile for ${c.name}, ${c.city}.`,
    "url":`https://clusteros.io/clusters/${c.id}.html`,
    "keywords":["regional innovation cluster","cluster diagnostic",
      c.city,countryName(c.country),c.regime,c._anchor_type,
      ...(c.stalls||[]).map(s=>s.name)].filter(Boolean),
    "creator":{"@type":"Organization","name":"ClusterOS","url":"https://clusteros.io"},
    "spatialCoverage":{"@type":"Place","name":c.city,"addressCountry":c.country},
    "variableMeasured":(c.stalls||[]).map(s=>({
      "@type":"PropertyValue","name":s.name,"value":s.intensity,
      "description":`Confidence: ${s.confidence}`
    }))
  });
}

// ── TEMPLATE ─────────────────────────────────────────────
function template(c, similar, bundle) {
  const rd = radarData(c);
  const isV3 = !!bundle;
  // Parent-region navigation context (v3 pages only). Pulls the region's
  // canonical display name from the supercluster bundle so the cluster page
  // matches the supercluster page's h1 and the national-diagnostic tile.
  const parentSlug = isV3 ? c.parent : null;
  const parentBundle = parentSlug ? loadV3SuperBundle(parentSlug) : null;
  const parentName = (parentBundle && parentBundle.region_name) || '';
  const siblings = (parentBundle && Array.isArray(parentBundle.constituent_clusters))
    ? parentBundle.constituent_clusters.filter(cc => cc.v2_slug !== c.id)
    : [];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c.name} — ClusterOS Diagnostic Profile</title>
<meta name="description" content="${(c.summary||'').replace(/"/g,'&quot;').slice(0,160)}">
<script type="application/ld+json">${jsonLd(c)}<\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=Geist+Mono:wght@400;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
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
nav{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:52px;
  background:rgba(247,244,239,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;}
.nav-logo{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--green);
  letter-spacing:0.12em;text-decoration:none;text-transform:uppercase;}
.nav-back{font-family:var(--font-mono);font-size:11px;color:var(--ink-dim);text-decoration:none;
  text-transform:uppercase;letter-spacing:0.1em;transition:color 0.15s;}
.nav-back:hover{color:var(--ink);}
.nav-back::before{content:'← ';color:var(--ink-muted);}
.nav-cta{font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--green);
  text-transform:uppercase;letter-spacing:0.08em;border:1px solid var(--green);
  padding:5px 14px;border-radius:2px;text-decoration:none;transition:background 0.15s,color 0.15s;}
.nav-cta:hover{background:var(--green);color:#fff;}
.page-wrap{max-width:860px;margin:0 auto;padding:3.5rem 2rem 6rem;}
.breadcrumb{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);
  text-transform:uppercase;letter-spacing:0.12em;margin-bottom:2rem;}
.breadcrumb a{color:var(--ink-muted);text-decoration:none;}
.breadcrumb a:hover{color:var(--green);}
.breadcrumb span{margin:0 6px;}
.cluster-header{margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid var(--border);}
.cluster-eyebrow{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);
  text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1rem;}
.cluster-eyebrow::before{content:'';display:inline-block;width:20px;height:1px;
  background:var(--border-2);vertical-align:middle;margin-right:8px;}
h1{font-family:var(--font-serif);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:400;
  line-height:1.15;margin-bottom:1rem;}
.cluster-meta{display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1.2rem;}
.meta-tag{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;
  letter-spacing:0.1em;padding:3px 10px;border-radius:2px;}
.meta-emerging{background:rgba(245,217,122,0.3);color:#7a5500;}
.meta-cycling{background:rgba(125,211,200,0.3);color:#1a6060;}
.meta-active,.meta-mature{background:rgba(200,240,208,0.3);color:var(--green);}
.meta-plain{background:var(--surface);color:var(--ink-dim);border:1px solid var(--border);}
.cluster-summary{font-size:1rem;font-weight:300;color:var(--ink-dim);line-height:1.75;max-width:660px;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);margin-bottom:2.5rem;}
.stat-cell{padding:1rem 1.2rem;border-right:1px solid var(--border);}
.stat-cell:last-child{border-right:none;}
.stat-num{font-family:var(--font-serif);font-size:2rem;color:var(--green);line-height:1;margin-bottom:0.2rem;}
.stat-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2.5rem;align-items:start;}
.section{margin-bottom:2.5rem;}
.section-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);
  text-transform:uppercase;letter-spacing:0.14em;margin-bottom:1.2rem;
  padding-bottom:0.6rem;border-bottom:1px solid var(--border);}
.radar-wrap{background:var(--surface);border:1px solid var(--border);padding:1.2rem;}
.stall-row{display:flex;align-items:center;gap:0.8rem;padding:0.75rem 0;border-bottom:1px solid var(--border);}
.stall-row:last-child{border-bottom:none;}
.stall-id{font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);font-weight:600;width:2rem;flex-shrink:0;}
.stall-detail{flex:1;}
.stall-name{font-size:13px;color:var(--ink-dim);display:block;margin-bottom:4px;}
.stall-bar-wrap{display:flex;align-items:center;gap:8px;}
.stall-bar{height:3px;border-radius:2px;flex-shrink:0;}
.stall-pct{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);}
.conf{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;
  letter-spacing:0.08em;padding:2px 6px;border-radius:2px;flex-shrink:0;}
.conf-high{background:rgba(212,105,90,0.15);color:#8a2a1a;}
.conf-medium{background:rgba(245,217,122,0.25);color:#7a5500;}
.conf-low{background:var(--surface);color:var(--ink-muted);border:1px solid var(--border);}
.stacks-box{border:1px solid var(--border);}
.stack-item{padding:1.2rem 1.4rem;border-bottom:1px solid var(--border);}
.stack-item:last-child{border-bottom:none;}
.stack-header{display:flex;align-items:baseline;gap:1rem;margin-bottom:0.5rem;}
.stack-num{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.1em;flex-shrink:0;}
.stack-stalls{font-family:var(--font-mono);font-size:12px;color:var(--green);font-weight:600;}
.stack-desc{font-size:13px;font-weight:300;color:var(--ink-dim);line-height:1.65;}
.leverage-block{border-left:3px solid var(--signal);padding:1.2rem 1.4rem;background:rgba(200,240,208,0.12);}
.leverage-hyp{font-family:var(--font-serif);font-size:1.05rem;font-style:italic;color:var(--ink);line-height:1.65;margin-bottom:0.8rem;}
.leverage-meta{display:flex;gap:0.5rem;flex-wrap:wrap;}
.lm-tag{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;
  letter-spacing:0.1em;background:var(--surface);border:1px solid var(--border);padding:2px 8px;border-radius:2px;}
.disclaimer{font-size:12px;color:var(--ink-muted);line-height:1.6;
  border-top:1px solid var(--border);padding-top:1rem;margin-top:1rem;}
.similar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);}
.similar-card{background:var(--page);padding:1.2rem;text-decoration:none;display:block;transition:background 0.15s;}
.similar-card:hover{background:var(--surface);}
.sc-name{font-size:13px;font-weight:500;color:var(--ink);margin-bottom:3px;line-height:1.3;}
.sc-meta{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);margin-bottom:6px;}
.sc-regime{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:var(--green);margin-bottom:4px;}
.sc-stall{font-size:11px;color:var(--ink-muted);line-height:1.4;}
.meta-link{text-decoration:none;cursor:pointer;transition:background 0.15s,color 0.15s;}
.meta-link:hover{background:var(--border);color:var(--ink);}
.sibling-clusters .sibling-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:0.5rem 0.6rem;font-size:13px;line-height:1.6;}
.sibling-clusters .sibling-row a{font-family:var(--font-sans);color:var(--ink);text-decoration:none;border-bottom:1px solid var(--border-2);padding-bottom:1px;transition:color 0.15s,border-bottom-color 0.15s;}
.sibling-clusters .sibling-row a:hover{color:var(--green);border-bottom-color:var(--green);}
.sibling-clusters .sibling-sep{color:var(--ink-muted);user-select:none;}
.cta-block{background:var(--surface);border:1px solid var(--border);padding:2rem;margin-top:3rem;}
.cta-label{font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:0.8rem;}
.cta-h{font-family:var(--font-serif);font-size:1.3rem;margin-bottom:0.6rem;}
.cta-body{font-size:14px;color:var(--ink-dim);margin-bottom:1.2rem;line-height:1.65;}
.cta-link{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);
  font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;
  color:#fff;background:var(--green);padding:10px 20px;text-decoration:none;transition:background 0.15s;}
.cta-link:hover{background:var(--green-dim);}
footer{border-top:1px solid var(--border);padding:2rem;max-width:860px;margin:0 auto;
  font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);
  display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;}
footer a{color:var(--ink-muted);text-decoration:none;}
.cluster-sticky-bar{position:fixed;bottom:0;left:0;right:0;z-index:950;background:rgba(247,244,239,0.97);backdrop-filter:blur(16px);border-top:1px solid var(--border);height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 0 0 1.4rem;gap:1rem;}
.csb-name{font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1;}
.csb-actions{display:flex;align-items:center;flex-shrink:0;height:100%;}
.csb-btn{font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:0 1.2rem;height:100%;display:flex;align-items:center;white-space:nowrap;transition:opacity 0.15s;}
.csb-amber{background:var(--amber,#d97706);color:#fff;}
.csb-amber:hover{opacity:0.85;}
.csb-green{background:var(--green);color:#fff;}
.csb-green:hover{opacity:0.85;}
@media(max-width:640px){.csb-name{display:none;}.csb-btn{font-size:10px;padding:0 1rem;}}
footer a:hover{color:var(--green);}
.empty{font-size:13px;color:var(--ink-muted);font-style:italic;padding:0.8rem 0;}
@media(max-width:680px){
  .two-col{grid-template-columns:1fr;}
  .stats-row{grid-template-columns:1fr 1fr;}
  .stat-cell:nth-child(2){border-right:none;}
  .stat-cell:nth-child(3){border-top:1px solid var(--border);}
  .similar-grid{grid-template-columns:1fr;}
  nav{padding:0 1rem;}
  .page-wrap{padding:2rem 1.2rem 4rem;}
}
${isV3 ? V3_CLUSTER_CSS : ''}
</style>${isV3 ? '' : diagnosticStyles(c.id, 'cluster')}
<!-- Mixpanel tracking -->
<script type="text/javascript">
  (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
  for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
  e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[])


  mixpanel.init('a5cac1b920750b79ab02f9cbf02c8f89', {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: 'https://api-eu.mixpanel.com',
  })

<\/script>
</head>
<body>
<nav>
  <div class="nav-left">
    <a class="nav-logo" href="/">ClusterOS</a>
    <span class="nav-sep">/</span>
    ${isV3 && parentSlug && parentName
      ? `<a class="nav-back" href="/superclusters/${parentSlug}">${parentName}</a>`
      : `<a class="nav-back" href="/">All clusters</a>`}
  </div>
</nav>
<main class="page-wrap">
  <div class="breadcrumb">
    ${isV3 && parentSlug && parentName
      ? `<a href="/">ClusterOS</a><span>›</span>
    <a href="/national-diagnostic">National Diagnostic</a><span>›</span>
    <a href="/superclusters/${parentSlug}">${parentName}</a><span>›</span>
    ${c.name}`
      : `<a href="/">ClusterOS</a><span>›</span>
    <a href="/">Clusters</a><span>›</span>
    ${c.name}`}
  </div>
  <header class="cluster-header">
    <p class="cluster-eyebrow">ClusterOS Diagnostic Profile</p>
    <h1>${c.name}</h1>
    <div class="cluster-meta">
      ${isV3 && parentSlug
        ? `<a class="meta-tag meta-plain meta-link" href="/superclusters/${parentSlug}">${c.city}, ${countryName(c.country)}</a>`
        : `<span class="meta-tag meta-plain">${c.city}, ${countryName(c.country)}</span>`}
      <span class="meta-tag meta-${c.regime||'emerging'}">${regimeLabel(c.regime)}</span>
      ${c._anchor_type?`<span class="meta-tag meta-plain">${anchorLabel(c._anchor_type)}</span>`:''}
      ${(!isV3 && c._evidence_count)?`<span class="meta-tag meta-plain">${c._evidence_count} evidence items</span>`:''}
    </div>
    <p class="cluster-summary">${isV3 ? (bundle.strap||'') : (c.summary||'')}</p>
    ${isV3 && bundle.behaviour ? `<p class="cluster-behaviour">${bundle.behaviour}</p>` : ''}
  </header>${isV3 ? renderV3Composite(bundle) : renderDiagnosticComposite(c.id, 'cluster')}
  ${isV3 ? `<nav class="section-jumpnav" aria-label="Jump to section">
    <a href="#stalls">Stalls</a>
    <a href="#radar">Radar</a>
    <a href="#stacks">Stacks</a>
    <a href="#leverage">Leverage</a>
    <a href="#resemblances">Resemblances</a>
    ${siblings.length ? `<a href="#siblings">Siblings</a>` : ''}
  </nav>` : ''}
  ${isV3 ? '' : `<div class="stats-row">
    <div class="stat-cell">
      <div class="stat-num">${(c.stalls||[]).length}</div>
      <div class="stat-label">Active stalls</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${(c.stacks||[]).length}</div>
      <div class="stat-label">Stacks identified</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${c._evidence_count||'—'}</div>
      <div class="stat-label">Evidence items</div>
    </div>
    <div class="stat-cell">
      <div class="stat-num">${c.leverage&&c.leverage.timeline?c.leverage.timeline.split('-')[0]:'—'}</div>
      <div class="stat-label">Leverage timeline (mo)</div>
    </div>
  </div>`}
  <div class="two-col">
    <div class="section" id="stalls">
      <div class="section-label">Active stalls · Behavioural substitution patterns</div>
      ${renderStalls(c.stalls)}
    </div>
    <div class="section" id="radar">
      <div class="section-label">Stall radar · Intensity across all 9 types</div>
      <div class="radar-wrap">
        <canvas id="radarChart"></canvas>
      </div>
    </div>
  </div>
  ${isV3 ? `<details class="section section-collapsible" id="stacks" open>
    <summary><div class="section-label">Stabilisation stacks · Why single interventions fail</div></summary>
    <div class="stacks-box">${renderStacks(c.stacks)}</div>
  </details>` : `<div class="section" id="stacks">
    <div class="section-label">Stabilisation stacks · Why single interventions fail</div>
    <div class="stacks-box">${renderStacks(c.stacks)}</div>
  </div>`}
  <div class="section" id="leverage">
    <div class="section-label">Stage 5 · Leverage hypothesis</div>
    ${renderLeverage(c.leverage)}
    <p class="disclaimer">Leverage hypotheses are testable perturbations, not prescriptions. Where demand-side behaviour is weakly visible, the correct move is observation — improving visibility before attempting change.</p>
  </div>
  ${isV3 ? `<details class="section section-collapsible" id="resemblances" open>
    <summary><div class="section-label">Structural resemblances · Clusters with similar stall configurations</div></summary>
    <div class="similar-grid">${renderSimilar(similar)}</div>
  </details>` : `<div class="section" id="resemblances">
    <div class="section-label">Structural resemblances · Clusters with similar stall configurations</div>
    <div class="similar-grid">${renderSimilar(similar)}</div>
  </div>`}
  ${(isV3 && siblings.length) ? `<div class="section sibling-clusters" id="siblings">
    <div class="section-label">Other clusters in ${parentName}</div>
    <div class="sibling-row">
      ${siblings.map(s => `<a href="/clusters/${s.v2_slug}.html">${s.name}</a>`).join('<span class="sibling-sep">·</span>')}
    </div>
  </div>` : ''}
  <div class="cta-block">
    <div class="cta-label">What happens next</div>
    <div class="cta-h">This is a structural profile, not a full diagnostic.</div>
    <p class="cta-body">A full ClusterOS diagnostic adds actor questionnaire data, working sessions, and anchor interviews — producing higher-confidence stall identification, board-ready stack analysis, and leverage hypotheses calibrated to your specific context.</p>
  </div>
</main>
<footer>
  <span>© 2026 ClusterOS · Community Lab · Edinburgh</span>
  <span>
    <a href="/">Homepage</a> ·
    <a href="https://clusteros.io/findings.html">Findings</a> ·
    <a href="https://clusteros.io/about.html">About</a>
  </span>
</footer>
<div class="cluster-sticky-bar">
  <span class="csb-name">${c.name}</span>
  <div class="csb-actions">
    <a class="csb-btn csb-amber" href="/cas-explainer.html">Free Pulse Check →</a>
    <a class="csb-btn csb-green" href="/request.html">Request a Diagnostic →</a>
  </div>
</div>
<script>
const rd = ${rd};
new Chart(document.getElementById('radarChart').getContext('2d'),{
  type:'radar',
  data:{
    labels:rd.labels,
    datasets:[{
      data:rd.values,
      backgroundColor:'rgba(42,122,79,0.12)',
      borderColor:'#2a7a4f',
      borderWidth:2,
      pointBackgroundColor:rd.values.map(v=>v>65?'#d4695a':v>40?'#d4a94a':'#2a7a4f'),
      pointRadius:4,pointHoverRadius:6
    }]
  },
  options:{
    responsive:true,
    scales:{r:{
      min:0,max:100,
      ticks:{stepSize:25,font:{family:"'Geist Mono',monospace",size:9},color:'#8c8780',backdropColor:'transparent'},
      pointLabels:{font:{family:"'Geist Mono',monospace",size:10},color:'#5a5650'},
      grid:{color:'#ddd8cf'},angleLines:{color:'#ddd8cf'}
    }},
    plugins:{
      legend:{display:false},
      tooltip:{
        callbacks:{label:ctx=>' '+ctx.raw+'% intensity'},
        bodyFont:{family:"'Geist Mono',monospace"},
        backgroundColor:'#f7f4ef',borderColor:'#ddd8cf',borderWidth:1,
        titleColor:'#1a1a1a',bodyColor:'#5a5650'
      }
    }
  }
});
<\/script>
${isV3 ? V3_MOBILE_JS : ''}
</body>
</html>`;
}

// ── GENERATE ─────────────────────────────────────────────
// Build the in-scope task list.
//   - When the v3 registry is present: drive off registry's shape:"cluster"
//     entries. This is the UK production path (125 in-scope clusters).
//   - When absent: iterate clusters.json as before. Dev / legacy fallback.
//   - --only filter applies on top of either set.
const clustersById = Object.create(null);
for (const c of clusters) clustersById[c.id] = c;

let tasks;
if (v3Registry) {
  tasks = [];
  for (const [slug, entry] of Object.entries(v3Registry)) {
    if (slug.startsWith('_') || slug.startsWith('//')) continue;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    if (entry.shape !== 'cluster') continue;
    const cluster = clustersById[slug] || stubClusterFromBundle(slug, entry, loadV3Bundle(slug));
    tasks.push({ slug, cluster });
  }
} else {
  tasks = clusters.map(c => ({ slug: c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), cluster: c }));
}

let count = 0;
let v3Count = 0;
let skippedExisting = 0;
let filteredOut = 0;
let stubCount = 0;
for (const { slug, cluster } of tasks) {
  if (allowedIds && !allowedIds.has(slug)) { filteredOut++; continue; }
  const outPath = path.join(outDir, `${slug}.html`);
  if (argv.newOnly && fs.existsSync(outPath)) { skippedExisting++; continue; }
  const similar = findSimilar(cluster, clusters);
  const bundle = loadV3Bundle(slug);
  const html = template(cluster, similar, bundle);
  fs.writeFileSync(outPath, html, 'utf8');
  if (bundle) v3Count++;
  if (!clustersById[slug]) stubCount++;
  count++;
}
console.log(`Generated ${count} cluster pages → clusters/ (${v3Count} via v3 bundle, ${stubCount} from stubs)`);
if (argv.newOnly) console.log(`Skipped (file already exists): ${skippedExisting}`);
if (allowedIds) console.log(`Filtered out (outside --only / --only-file): ${filteredOut}`);
if (v3Registry) console.log(`Driven from v3 registry (${V3_REGISTRY_PATH}).`);
