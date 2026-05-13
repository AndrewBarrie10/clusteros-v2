#!/usr/bin/env node
// Sync the 25 UK supercluster entries in superclusters.json with the v3
// bundles. Updates cluster_count, evidence_count, summary and cluster_ids
// so that the homepage map sidepanel (map-superclusters.js, which reads
// /superclusters.json) matches the regenerated /superclusters/<id> pages.
//
// Touches only entries with a matching v3 bundle. Orlando and any future
// non-UK superclusters are left untouched. regime, regional_patterns,
// dominant_stacks, leverage_hypotheses are preserved as-is.

const fs = require('fs');
const path = require('path');

const supersPath = path.join(__dirname, '..', 'superclusters.json');
const clustersPath = path.join(__dirname, '..', 'clusters.json');
const bundlesDir = path.join(__dirname, '..', 'v3-data', 'v2_pages', 'superclusters');

const supers = JSON.parse(fs.readFileSync(supersPath, 'utf8'));
const clusters = JSON.parse(fs.readFileSync(clustersPath, 'utf8'));
const clustersById = Object.create(null);
for (const c of clusters) clustersById[c.id] = c;

let updated = 0;
let skipped = 0;
for (const sc of supers) {
  const bundlePath = path.join(bundlesDir, `${sc.id}.json`);
  if (!fs.existsSync(bundlePath)) { skipped++; continue; }
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const metrics = bundle.metrics || {};
  const constituents = bundle.constituent_clusters || [];

  const newClusterIds = constituents.map(c => c.v2_slug);
  const evidenceSum = newClusterIds.reduce((s, id) => {
    const c = clustersById[id];
    return s + ((c && c._evidence_count) || 0);
  }, 0);

  sc.cluster_count = metrics.active_clusters != null ? metrics.active_clusters : newClusterIds.length;
  sc.evidence_count = evidenceSum || null;
  sc.cluster_ids = newClusterIds;
  sc.summary = bundle.strap || sc.summary;
  updated++;
}

fs.writeFileSync(supersPath, JSON.stringify(supers, null, 2) + '\n', 'utf8');
console.log(`Updated ${updated} supercluster entries from v3 bundles (skipped ${skipped} without bundle).`);
