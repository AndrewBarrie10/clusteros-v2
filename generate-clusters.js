#!/usr/bin/env node
// ClusterOS — Cluster page generator (rich version)
// Reads clusters.json → writes clusters/{slug}.html for each cluster

const fs = require('fs');
const path = require('path');

const clusters = JSON.parse(fs.readFileSync('./clusters.json', 'utf8'));

const outDir = path.join(__dirname, 'clusters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

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
  'extracting':'S4','mediating':'S5','stabiliz':'S6',
  'narrating':'S7','scaling':'S8','waiting':'S9'
};

const ALL_STALLS = [
  {code:'S1',short:'Re-proving',  key:'re-proving'},
  {code:'S2',short:'Coordinating',key:'coordinating'},
  {code:'S3',short:'Forgiving',   key:'forgiving'},
  {code:'S4',short:'Extracting',  key:'extracting'},
  {code:'S5',short:'Mediating',   key:'mediating'},
  {code:'S6',short:'Stabilising', key:'stabiliz'},
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
          <span class="stall-pct">${pct}%</span>
        </div>
      </div>
      ${confidenceBadge(s.confidence)}
    </div>`;
  }).join('');
}

function renderStacks(stacks) {
  if (!stacks||!stacks.length) return '<p class="empty">No stack analysis available.</p>';
  return stacks.map((st,i)=>`
    <div class="stack-item">
      <div class="stack-header">
        <span class="stack-num">Stack ${String(i+1).padStart(2,'0')}</span>
        <span class="stack-stalls">${(st.stalls_involved||[]).join(' · ')}</span>
      </div>
      <p class="stack-desc">${st.description||''}</p>
    </div>`).join('');
}

function renderLeverage(leverage) {
  if (!leverage) return '<p class="empty">Leverage hypothesis available on request.</p>';
  return `<div class="leverage-block">
    <p class="leverage-hyp">"${leverage.hypothesis||''}"</p>
    <div class="leverage-meta">
      ${leverage.target_stack?`<span class="lm-tag">${leverage.target_stack}</span>`:''}
      ${leverage.timeline?`<span class="lm-tag">Timeline: ${leverage.timeline}</span>`:''}
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
function template(c, similar) {
  const rd = radarData(c);
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
body{font-family:var(--font-sans);background:var(--page);color:var(--ink);font-weight:300;line-height:1.6;}
nav{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:52px;
  background:rgba(247,244,239,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;}
.nav-logo{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--green);
  letter-spacing:0.12em;text-decoration:none;text-transform:uppercase;}
.nav-back{font-family:var(--font-mono);font-size:11px;color:var(--ink-muted);text-decoration:none;
  text-transform:uppercase;letter-spacing:0.1em;transition:color 0.15s;}
.nav-back:hover{color:var(--ink);}
.nav-back::before{content:'← ';}
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
    <a href="/">ClusterOS</a><span>›</span>
    <a href="/">Clusters</a><span>›</span>
    ${c.name}
  </div>
  <header class="cluster-header">
    <p class="cluster-eyebrow">Diagnostic Profile · ${c._run_id||'ClusterOS 2026'}</p>
    <h1>${c.name}</h1>
    <div class="cluster-meta">
      <span class="meta-tag meta-plain">${c.city}, ${countryName(c.country)}</span>
      <span class="meta-tag meta-${c.regime||'emerging'}">${regimeLabel(c.regime)}</span>
      ${c._anchor_type?`<span class="meta-tag meta-plain">${anchorLabel(c._anchor_type)}</span>`:''}
      ${c._evidence_count?`<span class="meta-tag meta-plain">${c._evidence_count} evidence items</span>`:''}
    </div>
    <p class="cluster-summary">${c.summary||''}</p>
  </header>
  <div class="stats-row">
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
  </div>
  <div class="two-col">
    <div class="section">
      <div class="section-label">Active stalls · Behavioural substitution patterns</div>
      ${renderStalls(c.stalls)}
    </div>
    <div class="section">
      <div class="section-label">Stall radar · Intensity across all 9 types</div>
      <div class="radar-wrap">
        <canvas id="radarChart"></canvas>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-label">Stabilisation stacks · Why single interventions fail</div>
    <div class="stacks-box">${renderStacks(c.stacks)}</div>
  </div>
  <div class="section">
    <div class="section-label">Stage 5 · Leverage hypothesis</div>
    ${renderLeverage(c.leverage)}
    <p class="disclaimer">Leverage hypotheses are testable perturbations, not prescriptions. Where demand-side behaviour is weakly visible, the correct move is observation — improving visibility before attempting change.</p>
  </div>
  <div class="section">
    <div class="section-label">Structural resemblances · Clusters with similar stall configurations</div>
    <div class="similar-grid">${renderSimilar(similar)}</div>
  </div>
  <div class="cta-block">
    <div class="cta-label">What happens next</div>
    <div class="cta-h">This is a structural profile, not a full diagnostic.</div>
    <p class="cta-body">A full ClusterOS diagnostic adds actor questionnaire data, working sessions, and anchor interviews — producing higher-confidence stall identification, board-ready stack analysis, and leverage hypotheses calibrated to your specific context. Fixed price. 4–5 weeks.</p>
    <a class="cta-link" href="https://clusteros.io/request.html">Request a diagnostic →</a>
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
</body>
</html>`;
}

// ── GENERATE ─────────────────────────────────────────────
let count = 0;
for (const cluster of clusters) {
  const similar = findSimilar(cluster, clusters);
  const html = template(cluster, similar);
  const slug = cluster.id||cluster.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html, 'utf8');
  count++;
}
console.log(`Generated ${count} cluster pages → clusters/`);
