#!/usr/bin/env node
// ClusterOS — Surgical injection of the Phase 1 diagnostic composite block
// into the seven Greater Glasgow cluster/supercluster HTML pages.
//
// The cluster/supercluster generators (generate-clusters.js,
// generate-superclusters.js) are aware of diagnostics.json and will render
// the composite block on a fresh generation. Several existing pages carry
// hand-enrichment that a full regeneration would wipe, so Phase 1 patches the
// seven target pages in place instead. Re-running this script is idempotent:
// already-patched pages are left untouched.
//
// Usage: node inject-diagnostic-composite.js

const fs = require('fs');
const path = require('path');

const REGISTRY = JSON.parse(fs.readFileSync(path.join(__dirname, 'diagnostics.json'), 'utf8'));

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

function loadHeadlines(headlinesPath) {
  const rel = headlinesPath.replace(/^\//, '');
  const abs = path.join(__dirname, rel);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

function buildComposite(entry) {
  const headlines = loadHeadlines(entry.headlines);
  const bullets = (headlines && headlines.bullets) || [];
  const bulletsHtml = bullets.map(b => `      <li>${b.html}</li>`).join('\n');
  const cta = REGISTRY.cta;
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
    <p class="diagnostic-source">${REGISTRY.source_line}</p>
  </section>`;
}

function patchFile(filePath, kind, entry) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip (missing): ${filePath}`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('class="diagnostic-composite"')) {
    console.log(`  already patched: ${filePath}`);
    return;
  }

  // 1) Inject scoped stylesheet immediately after the first </style> close.
  const styleClose = '</style>';
  const styleIdx = html.indexOf(styleClose);
  if (styleIdx === -1) {
    console.warn(`  no </style> tag, skipping: ${filePath}`);
    return;
  }
  const styleBlock = `\n<style>${DIAGNOSTIC_COMPOSITE_CSS}</style>`;
  html = html.slice(0, styleIdx + styleClose.length) + styleBlock + html.slice(styleIdx + styleClose.length);

  // 2) Inject the composite block at the right anchor.
  const composite = buildComposite(entry);
  let anchorIdx = -1;
  let anchorLen = 0;
  if (kind === 'cluster') {
    const anchor = '</header>';
    anchorIdx = html.indexOf(anchor);
    anchorLen = anchor.length;
  } else {
    // Supercluster: insert after the </p> closing the sc-summary paragraph.
    const re = /<p class="sc-summary">[\s\S]*?<\/p>/;
    const m = html.match(re);
    if (m) {
      anchorIdx = m.index;
      anchorLen = m[0].length;
    }
  }
  if (anchorIdx === -1) {
    console.warn(`  anchor not found, skipping content injection: ${filePath}`);
    return;
  }
  html = html.slice(0, anchorIdx + anchorLen) + composite + html.slice(anchorIdx + anchorLen);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  patched: ${filePath}`);
}

console.log('Patching cluster pages:');
for (const [slug, entry] of Object.entries(REGISTRY.clusters || {})) {
  patchFile(path.join(__dirname, 'clusters', `${slug}.html`), 'cluster', entry);
}

console.log('Patching supercluster pages:');
for (const [slug, entry] of Object.entries(REGISTRY.superclusters || {})) {
  patchFile(path.join(__dirname, 'superclusters', `${slug}.html`), 'supercluster', entry);
}
