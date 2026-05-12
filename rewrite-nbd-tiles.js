#!/usr/bin/env node
// Phase 1.5 — One-off rewrite of the "All twenty-five readings" section in
// national-diagnostic.html.
//
// Performs three changes:
//   1. Extracts the <p class="sc-summary"> intro from each UK supercluster
//      page and uses it as the body of the corresponding NBD tile.
//   2. Removes the obsolete .region-meta and .region-leverage elements from
//      every tile.
//   3. Inserts a new Wales region-group containing the Cardiff Capital Region
//      tile between the Northern Ireland and England groups.
//
// Also swaps the .region-leverage CSS rule for a .region-intro rule that
// renders the intro as clean prose (not italic, no top border).
//
// One-off: this script mutates national-diagnostic.html in place. Re-running
// it after the change has been applied is a no-op (skips when .region-intro
// is already present in a tile).

const fs = require('fs');
const path = require('path');

const NBD = path.join(__dirname, 'national-diagnostic.html');
const SC_DIR = path.join(__dirname, 'superclusters');

function loadIntros() {
  const map = {};
  for (const file of fs.readdirSync(SC_DIR)) {
    if (!file.endsWith('.html')) continue;
    const slug = file.replace(/\.html$/, '');
    if (slug === 'orlando-innovation-ecosystem') continue; // not a UK region
    const html = fs.readFileSync(path.join(SC_DIR, file), 'utf8');
    const m = html.match(/<p class="sc-summary">([\s\S]*?)<\/p>/);
    if (!m) {
      console.warn(`  no sc-summary in ${file}`);
      continue;
    }
    map[slug] = m[1].trim();
  }
  return map;
}

const intros = loadIntros();
let html = fs.readFileSync(NBD, 'utf8');

// 1) Swap the .region-leverage CSS rule for a .region-intro rule.
const oldCss = `.region-leverage { font-size:12px; line-height:1.5; color:var(--ink-muted); margin-top:4px;
                   font-style:italic; padding-top:8px; border-top:1px solid var(--border); }`;
const newCss = `.region-intro { font-size:12.5px; line-height:1.55; color:var(--ink-dim); margin-top:6px;
                font-weight:300; }`;
if (html.includes(oldCss)) {
  html = html.replace(oldCss, newCss);
} else if (!html.includes('.region-intro')) {
  console.warn('  region-leverage CSS not found and region-intro not yet defined — leaving CSS alone');
}

// 2) Rewrite each tile: drop region-meta, replace region-leverage with region-intro.
//    Anchor on the existing href slug to look up the matching intro.
const tileRe = /(<a class="region-card" href="\/superclusters\/([a-z0-9-]+)"[\s\S]*?<\/a>)/g;
html = html.replace(tileRe, (full, anchor, slug) => {
  if (anchor.includes('class="region-intro"')) return anchor; // already migrated
  const intro = intros[slug];
  if (!intro) {
    console.warn(`  no intro found for slug "${slug}" — leaving tile untouched`);
    return anchor;
  }
  let out = anchor;
  // Remove the metadata row (3 lines).
  out = out.replace(/\n\s*<div class="region-meta mono">[\s\S]*?<\/div>/, '');
  // Replace the truncated leverage line with the supercluster intro.
  out = out.replace(/<p class="region-leverage">[\s\S]*?<\/p>/, `<p class="region-intro">${intro}</p>`);
  return out;
});

// 3) Insert the new Wales region-group between the Northern Ireland and
//    England groups. The Cardiff tile uses the same intro pattern.
const cardiffIntro = intros['cardiff-capital'];
if (!cardiffIntro) {
  console.error('  cardiff-capital intro missing — cannot insert Wales section');
  process.exit(1);
}
const walesBlock = `    <div class="region-group">
      <h3 class="region-group-h serif">Wales <span class="mono group-count">1 region</span></h3>
      <div class="region-grid">
        <a class="region-card" href="/superclusters/cardiff-capital"
           data-track="region-card" data-region="cardiff_capital">
          <h4 class="serif">Cardiff Capital Region</h4>
          <div class="region-stack"><span class="lbl mono">Distinctive stack</span>Coordination-Intermediary-Activity</div>
          <p class="region-intro">${cardiffIntro}</p>
        </a></div>
    </div>
`;
// Insert immediately before the England region-group.
const englandAnchor = '    <div class="region-group">\n      <h3 class="region-group-h serif">England';
if (!html.includes('Wales <span class="mono group-count">')) {
  if (!html.includes(englandAnchor)) {
    console.error('  England region-group anchor not found — cannot insert Wales');
    process.exit(1);
  }
  html = html.replace(englandAnchor, walesBlock + englandAnchor);
} else {
  console.log('  Wales region-group already present — skipping insert');
}

fs.writeFileSync(NBD, html, 'utf8');
console.log('Rewrote national-diagnostic.html');
