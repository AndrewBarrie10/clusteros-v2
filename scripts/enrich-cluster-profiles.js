#!/usr/bin/env node
/**
 * Enrich cluster profile pages with evidence-derived structural narratives.
 * Reads clusters.json, computes similarity + shared stacks, and updates
 * the "Structural resemblances" section in each /clusters/{id}.html file.
 *
 * Run: node scripts/enrich-cluster-profiles.js
 * Re-run whenever clusters.json changes.
 */

const fs = require('fs');
const path = require('path');

const CLUSTERS_JSON = path.join(__dirname, '..', 'clusters.json');
const CLUSTERS_DIR = path.join(__dirname, '..', 'clusters');

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

const STALL_ID_TO_SHORT = {
  S1: 'Re-proving', S2: 'Coordinating', S3: 'Forgiving',
  S4: 'Extracting', S5: 'Mediating', S6: 'Stabilising',
  S7: 'Narrating', S8: 'Scaling', S9: 'Waiting',
};

function getActiveStalls(cluster) {
  return new Set(
    (cluster.stalls || [])
      .filter(s => s.intensity > 0.3)
      .map(s => STALL_NAME_TO_ID[s.name])
      .filter(Boolean)
  );
}

function getMedHighStalls(cluster) {
  return new Set(
    (cluster.stalls || [])
      .filter(s => s.confidence === 'medium' || s.confidence === 'high')
      .map(s => STALL_NAME_TO_ID[s.name])
      .filter(Boolean)
  );
}

function findSimilar(cluster, allClusters, n = 3) {
  const myActive = getActiveStalls(cluster);
  const myStackIds = new Set((cluster.stacks || []).map(s => s.canonical_id));
  const scored = [];

  for (const c of allClusters) {
    if (c.id === cluster.id) continue;

    const theirActive = getActiveStalls(c);
    const theirStackIds = new Set((c.stacks || []).map(s => s.canonical_id));

    // Stack overlap (strongest signal)
    let sharedStackCount = 0;
    const sharedStackIds = [];
    for (const sid of myStackIds) {
      if (theirStackIds.has(sid)) { sharedStackCount++; sharedStackIds.push(sid); }
    }

    // Stall overlap (medium+high confidence only)
    const myMedHigh = getMedHighStalls(cluster);
    const theirMedHigh = getMedHighStalls(c);
    let sharedStallCount = 0;
    const sharedStalls = [];
    for (const sid of myMedHigh) {
      if (theirMedHigh.has(sid)) { sharedStallCount++; sharedStalls.push(sid); }
    }

    // Bonuses
    const regimeMatch = c.regime === cluster.regime;
    const anchorMatch = c._anchor_type === cluster._anchor_type;
    const bonus = (regimeMatch ? 1 : 0) + (anchorMatch ? 0.5 : 0);

    const score = sharedStackCount * 10 + sharedStallCount + bonus;
    if (score > 0) {
      scored.push({ cluster: c, score, sharedStackIds, sharedStalls, regimeMatch, anchorMatch });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

const STALL_CODE_MAP = {
  S1:'Re-proving', S2:'Coordinating', S3:'Forgiving', S4:'Extracting',
  S5:'Mediating', S6:'Stabilising', S7:'Narrating', S8:'Scaling activity', S9:'Waiting',
};

function cleanText(text) {
  if (!text) return '';
  let c = text;
  c = c.replace(/(?:STALL_|S)(\d{1,2})/g, (m, n) => {
    const num = String(parseInt(n, 10)); // strip leading zeros: '06' → '6'
    return STALL_CODE_MAP[`S${num}`] || m;
  });
  c = c.replace(/X-side of /gi, '');
  c = c.replace(/Y-side of /gi, '');
  c = c.replace(/\((?:S\d|STALL_\d{1,2}):\s*/gi, '(');
  // Remove empty parentheses (pipeline artefacts)
  c = c.replace(/\s*\(\s*\)/g, '');
  c = c.replace(/\s*\(\s*,[\s,]*\)/g, '');
  c = c.replace(/\s*\([\s,:-]+\)/g, '');
  c = c.replace(/  +/g, ' ');
  if (c && !c.endsWith('.') && !c.endsWith('...')) c = c.replace(/\s+\S*$/, '...');
  return c;
}

function buildNarrative(comparator, sharedStackIds) {
  const cl = comparator;
  const sharedStacks = (cl.stacks || []).filter(s => sharedStackIds.includes(s.canonical_id));

  if (sharedStacks.length > 0) {
    const confOrder = { high: 3, medium: 2, low: 1 };
    const best = sharedStacks.sort((a, b) => (confOrder[b.confidence] || 0) - (confOrder[a.confidence] || 0))[0];
    return {
      stackName: best.stack_name,
      mechanism: cleanText(best.description),
      absorbed: best.absorbed_signals || '',
      sharedStallNames: (best.stalls_involved || []).map(id => STALL_ID_TO_SHORT[id] || id),
    };
  }

  // Fallback to primary stack
  const primary = (cl.stacks || [])[0];
  if (primary) {
    return {
      stackName: primary.stack_name,
      mechanism: cleanText(primary.description),
      absorbed: primary.absorbed_signals || '',
      sharedStallNames: (primary.stalls_involved || []).map(id => STALL_ID_TO_SHORT[id] || id),
    };
  }
  return null;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildSimilarHTML(matches) {
  return matches.map(m => {
    const c = m.cluster;
    const narrative = buildNarrative(c, m.sharedStackIds);
    const profileUrl = `/clusters/${c.id}.html`;
    const loc = [c.city, c.country].filter(Boolean).join(' · ');
    const matchType = m.sharedStackIds.length > 0
      ? `${m.sharedStackIds.length} shared stack${m.sharedStackIds.length > 1 ? 's' : ''}`
      : `${m.sharedStalls.length} shared stall${m.sharedStalls.length > 1 ? 's' : ''}`;
    const evidence = `${c._evidence_count || '—'} evidence · ${c._evidence_tier || '—'}`;

    let html = `<a class="similar-card" href="${profileUrl}">
      <div class="sc-name">${escapeHtml(c.name)}</div>
      <div class="sc-meta">${escapeHtml(loc)}</div>
      <div class="sc-regime">${escapeHtml((c._lifecycle_stage || c.regime || '').charAt(0).toUpperCase() + (c._lifecycle_stage || c.regime || '').slice(1))}</div>
      <div class="sc-match">${escapeHtml(matchType)} · ${escapeHtml(evidence)}</div>`;

    if (narrative) {
      html += `\n      <div class="sc-mechanism">${escapeHtml(narrative.stackName)}: ${escapeHtml(narrative.mechanism.slice(0, 200))}${narrative.mechanism.length > 200 ? '...' : ''}</div>`;
      if (narrative.absorbed) {
        html += `\n      <div class="sc-absorbed">Absorbs: ${escapeHtml(narrative.absorbed)}</div>`;
      }
    }

    html += `\n    </a>`;
    return html;
  }).join('');
}

// CSS to inject for the new narrative elements
const INJECT_CSS = `
.sc-match{font-family:var(--mono,monospace);font-size:0.65rem;letter-spacing:0.06em;color:var(--teal,#0c9488);margin-top:0.3rem;}
.sc-mechanism{font-size:0.75rem;color:var(--ink-dim,#5a5650);line-height:1.55;margin-top:0.5rem;font-weight:300;}
.sc-absorbed{font-family:var(--mono,monospace);font-size:0.65rem;color:var(--ink-muted,#8c8780);margin-top:0.3rem;font-style:italic;}`;

function main() {
  // Load clusters
  const clusters = JSON.parse(fs.readFileSync(CLUSTERS_JSON, 'utf8'));
  console.log(`Loaded ${clusters.length} clusters`);

  let updated = 0;
  let skipped = 0;

  for (const cluster of clusters) {
    const htmlPath = path.join(CLUSTERS_DIR, `${cluster.id}.html`);
    if (!fs.existsSync(htmlPath)) {
      skipped++;
      continue;
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Compute similar clusters
    const matches = findSimilar(cluster, clusters, 3);
    if (matches.length === 0) {
      skipped++;
      continue;
    }

    // Build new similar-grid HTML
    const newGrid = `<div class="similar-grid">${buildSimilarHTML(matches)}</div>`;

    // Replace existing similar-grid
    const gridRegex = /<div class="similar-grid">[\s\S]*?<\/div>\s*(?=<\/div>)/;
    if (gridRegex.test(html)) {
      html = html.replace(gridRegex, newGrid);
    } else {
      skipped++;
      continue;
    }

    // Clean stall codes in existing stack descriptions
    html = html.replace(/<p class="stack-desc">([\s\S]*?)<\/p>/g, (match, content) => {
      return `<p class="stack-desc">${cleanText(content)}</p>`;
    });
    // Clean leverage hypothesis text
    html = html.replace(/<p class="leverage-hyp">([\s\S]*?)<\/p>/g, (match, content) => {
      return `<p class="leverage-hyp">${cleanText(content)}</p>`;
    });

    // Inject CSS if not already present
    if (!html.includes('.sc-match{')) {
      html = html.replace('</style>', INJECT_CSS + '\n</style>');
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    updated++;
  }

  console.log(`Updated: ${updated} cluster profiles`);
  console.log(`Skipped: ${skipped} (no file or no matches)`);
}

main();
