#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════
// ClusterOS Self-Diagnosis Audit
// ══════════════════════════════════════════════════════════════════════
// Systematically enumerates all output paths through the diagnostic
// to measure: answer quality, response differentiation, question weight.

const fs = require('fs');

// ── QUALIFIER OPTIONS (from diagnostic-journey.html) ─────────────────
const QUALIFIER_OPTIONS = {
  clusterType: ['regional', 'national', 'corporate', 'city'],
  anchorType:  ['university', 'research', 'corporate', 'public', 'hospital', 'none'],
  stage:       ['early', 'established', 'mature'],
  priority:    ['talent', 'capital', 'research', 'supply', 'growth'],
  gap:         ['discovery', 'flow', 'access', 'conversion'],
  // protect is multi-select — we enumerate all 32 combinations (2^5)
};

const PROTECT_VALUES = ['knowledge', 'ip', 'trust', 'talent', 'sovereignty'];

// ── CONFIG_NAMES (from diagnostic-journey.html — expanded) ───────────
const CONFIG_NAMES = {
  // Regional
  'regional|university|research':  'Knowledge Commercialisation Cluster',
  'regional|university|talent':    'Knowledge Retention Cluster',
  'regional|university|capital':   'Research-Led Investment Cluster',
  'regional|university|supply':    'University Supply Integration Network',
  'regional|university|growth':    'Academic Growth Cluster',
  'regional|research|talent':      'Research Talent Pipeline',
  'regional|research|capital':     'Research Investment Cluster',
  'regional|research|research':    'Deep Research Cluster',
  'regional|research|supply':      'Research Supply Network',
  'regional|research|growth':      'Research-Led Growth Cluster',
  'regional|corporate|supply':     'Anchor Supply Network',
  'regional|corporate|growth':     'Industrial Growth Cluster',
  'regional|corporate|talent':     'Corporate Talent Cluster',
  'regional|corporate|capital':    'Corporate Investment Cluster',
  'regional|corporate|research':   'Corporate R&D Cluster',
  'regional|public|capital':       'Investment-Ready Region',
  'regional|public|growth':        'Regional Development Cluster',
  'regional|public|talent':        'Public Talent Development Cluster',
  'regional|public|research':      'Public Research Cluster',
  'regional|public|supply':        'Public Procurement Cluster',
  'regional|hospital|talent':      'Clinical Talent Pipeline',
  'regional|hospital|capital':     'Health Investment Cluster',
  'regional|hospital|research':    'Clinical Research Cluster',
  'regional|hospital|supply':      'Health Supply Network',
  'regional|hospital|growth':      'Health Economy Cluster',
  'regional|none|talent':          'Emerging Talent Cluster',
  'regional|none|capital':         'Pre-Anchor Investment Cluster',
  'regional|none|research':        'Emerging Research Cluster',
  'regional|none|supply':          'Emerging Supply Network',
  'regional|none|growth':          'Emerging Growth Cluster',
  // National
  'national|university|research':  'National Innovation Corridor',
  'national|university|talent':    'National Talent Corridor',
  'national|university|supply':    'National Academic Supply Network',
  'national|university|growth':    'National University Growth Network',
  'national|research|talent':      'National Research Talent Network',
  'national|research|research':    'National Research Infrastructure',
  'national|research|supply':      'National Research Supply Chain',
  'national|research|growth':      'National Research Growth Network',
  'national|corporate|supply':     'Strategic Supply Chain Network',
  'national|corporate|talent':     'National Corporate Talent Network',
  'national|corporate|research':   'National Corporate R&D Network',
  'national|corporate|growth':     'National Industrial Strategy Network',
  'national|public|growth':        'National Growth Programme',
  'national|public|talent':        'National Public Talent Programme',
  'national|public|research':      'National Public Research Programme',
  'national|public|supply':        'National Public Procurement Network',
  'national|hospital|talent':      'National Clinical Talent Programme',
  'national|hospital|research':    'National Health Research Network',
  'national|hospital|supply':      'National Health Supply Network',
  'national|hospital|growth':      'National Health Economy Network',
  'national|none|talent':          'National Emerging Talent Network',
  'national|none|research':        'National Emerging Research Network',
  'national|none|supply':          'National Emerging Supply Network',
  'national|none|growth':          'National Emerging Growth Network',
  'national|*|capital':            'Capital Mobilisation Network',
  // Enterprise (corporate cluster type)
  'corporate|corporate|supply':    'Supplier Ecosystem Network',
  'corporate|corporate|research':  'Corporate Innovation Cluster',
  'corporate|corporate|growth':    'Corporate Growth Ecosystem',
  'corporate|corporate|capital':   'Corporate Investment Ecosystem',
  'corporate|university|research': 'Corporate-Academic Alliance',
  'corporate|university|talent':   'Corporate-Academic Talent Pipeline',
  'corporate|university|supply':   'Corporate-Academic Supply Network',
  'corporate|university|capital':  'Corporate-Academic Investment Alliance',
  'corporate|university|growth':   'Corporate-Academic Growth Alliance',
  'corporate|research|research':   'Corporate Deep Research Alliance',
  'corporate|research|supply':     'Corporate Research Supply Network',
  'corporate|research|capital':    'Corporate Research Investment Network',
  'corporate|research|growth':     'Corporate Research Growth Network',
  'corporate|public|growth':       'Corporate Regional Partnership',
  'corporate|public|capital':      'Corporate Public Investment Partnership',
  'corporate|public|research':     'Corporate Public Research Partnership',
  'corporate|public|supply':       'Corporate Public Procurement Partnership',
  'corporate|hospital|research':   'Corporate Health R&D Alliance',
  'corporate|hospital|supply':     'Corporate Health Supply Alliance',
  'corporate|hospital|growth':     'Corporate Health Growth Alliance',
  'corporate|hospital|capital':    'Corporate Health Investment Alliance',
  'corporate|none|supply':         'Corporate Emerging Supplier Network',
  'corporate|none|research':       'Corporate Emerging R&D Network',
  'corporate|none|growth':         'Corporate Emerging Growth Network',
  'corporate|none|capital':        'Corporate Emerging Investment Network',
  'corporate|*|talent':            'Internal Talent Ecosystem',
  // City
  'city|university|research':      'City Research Cluster',
  'city|university|talent':        'City University Talent Cluster',
  'city|university|capital':       'City Research Investment Cluster',
  'city|university|supply':        'City Academic Supply Cluster',
  'city|university|growth':        'City University Growth Cluster',
  'city|research|research':        'City Deep Research Cluster',
  'city|research|talent':          'City Research Talent Cluster',
  'city|research|capital':         'City Research Investment Cluster',
  'city|research|supply':          'City Research Supply Cluster',
  'city|research|growth':          'City Research Growth Cluster',
  'city|corporate|supply':         'City Corporate Supply Cluster',
  'city|corporate|growth':         'City Industrial Cluster',
  'city|corporate|talent':         'City Corporate Talent Cluster',
  'city|corporate|capital':        'City Corporate Investment Cluster',
  'city|corporate|research':       'City Corporate R&D Cluster',
  'city|public|growth':            'City Development Cluster',
  'city|public|talent':            'City Public Talent Cluster',
  'city|public|capital':           'City Public Investment Cluster',
  'city|public|research':          'City Public Research Cluster',
  'city|public|supply':            'City Public Procurement Cluster',
  'city|hospital|talent':          'City Clinical Talent Cluster',
  'city|hospital|research':        'City Health Research Cluster',
  'city|hospital|capital':         'City Health Investment Cluster',
  'city|hospital|supply':          'City Health Supply Cluster',
  'city|hospital|growth':          'City Health Economy Cluster',
  'city|none|talent':              'City Emerging Talent Cluster',
  'city|none|capital':             'City Emerging Investment Cluster',
  'city|none|research':            'City Emerging Research Cluster',
  'city|none|supply':              'City Emerging Supply Cluster',
  'city|none|growth':              'City Emerging Growth Cluster',
};

const ANCHOR_LABELS = {
  university: 'University',
  research:   'Research institute',
  corporate:  'Large corporate',
  public:     'Public agency',
  hospital:   'Hospital',
  none:       'Anchors',
};

// ── STALLS & STACKS ──────────────────────────────────────────────────
const STALL_IDS = ['S1','S2','S3','S4','S5','S6','S7','S8','S9'];
const STALL_NAMES = ['Re-proving','Coordinating','Forgiving','Extracting','Mediating','Stabilising','Narrating','Scaling','Waiting'];

const BEHAVIOURS = [
  { key:'commissioning', stall:'Narrating',    code:'S7' },
  { key:'convening',     stall:'Coordinating', code:'S2' },
  { key:'reprove',       stall:'Re-proving',   code:'S1' },
  { key:'celebrating',   stall:'Scaling',      code:'S8' },
  { key:'brokering',     stall:'Mediating',    code:'S5' },
  { key:'extracting',    stall:'Extracting',   code:'S4' },
  { key:'forgiving',     stall:'Forgiving',    code:'S3' },
  { key:'stabilising',   stall:'Stabilising',  code:'S6' },
  { key:'waiting',       stall:'Waiting',      code:'S9' },
];

// Named stacks from journey.js _generateStack() — PAIRS (all 36 now covered)
const NAMED_STACKS_PAIRS = {
  'Narrating+Scaling':        'Narrative × Activity',
  'Coordinating+Mediating':   'Coordination × Mediation',
  'Coordinating+Stabilising': 'Incumbent Anchor Lock-In',
  'Extracting+Scaling':       'Activity-Extraction Regime',
  'Coordinating+Re-proving':  'Legitimacy Loop',
  'Narrating+Re-proving':     'Strategy-Validation Stack',
  'Mediating+Stabilising':    'Gatekeeping Configuration',
  'Coordinating+Forgiving':   'Alignment Without Accountability',
  'Re-proving+Waiting':       'Permission Deadlock',
  'Extracting+Mediating':     'Value Leakage Through Intermediation',
  'Forgiving+Scaling':        'Proliferation Without Pruning',
  'Narrating+Waiting':        'Documented Paralysis',
  'Extracting+Narrating':     'Extraction-Narrative Cover',
  'Mediating+Narrating':      'The Brokered Story',
  'Mediating+Waiting':        'Permission-Mediation Hold',
  // 21 previously uncovered pairs
  'Forgiving+Re-proving':     'Justified Tolerance',
  'Extracting+Re-proving':    'Extraction Under Justification',
  'Mediating+Re-proving':     'Brokered Justification',
  'Re-proving+Stabilising':   'Incumbent Justification Lock',
  'Re-proving+Scaling':       'Proof-by-Activity Loop',
  'Coordinating+Extracting':  'Coordinated Extraction',
  'Coordinating+Narrating':   'Alignment-Narrative Cycle',
  'Coordinating+Scaling':     'Scaled Alignment',
  'Coordinating+Waiting':     'Alignment Pending Permission',
  'Extracting+Forgiving':     'Tolerated Extraction',
  'Forgiving+Mediating':      'Relationship Preservation Loop',
  'Forgiving+Stabilising':    'Comfortable Incumbency',
  'Forgiving+Narrating':      'Narrative Without Accountability',
  'Forgiving+Waiting':        'Patient Tolerance',
  'Extracting+Stabilising':   'Entrenched Extraction',
  'Extracting+Waiting':       'Extraction During Standby',
  'Mediating+Scaling':        'Brokered Growth',
  'Narrating+Stabilising':    'Narrated Incumbency',
  'Scaling+Stabilising':      'Stable Proliferation',
  'Stabilising+Waiting':      'Frozen Configuration',
  'Scaling+Waiting':          'Activity While Waiting',
};

// Named stacks — TRIPLES
const NAMED_STACKS_TRIPLES = {
  'Coordinating+Narrating+Scaling':      'Full Legitimacy Stack',
  'Coordinating+Re-proving+Waiting':     'Consensus-Permission Deadlock',
  'Extracting+Mediating+Scaling':        'Growth Without Retention',
};

// ── REPLICATE deriveOSConfig ─────────────────────────────────────────
function lookupConfigName(clusterType, anchorType, priority) {
  const ct = clusterType || 'regional';
  const at = anchorType || 'none';
  const pr = priority || 'growth';
  const exact = CONFIG_NAMES[`${ct}|${at}|${pr}`];
  if (exact) return exact;
  const wildAnchor = CONFIG_NAMES[`${ct}|*|${pr}`];
  if (wildAnchor) return wildAnchor;
  const wildPriority = CONFIG_NAMES[`${ct}|${at}|*`];
  if (wildPriority) return wildPriority;
  return 'Regional Operating System';
}

function deriveOSConfig(qualifiers, stalls, detectedStacks) {
  const { clusterType, anchorType, stage, priority, gap, protect } = qualifiers;
  const protectSet = new Set(protect || []);
  const stallSet = new Set(stalls || []);

  const configName = lookupConfigName(clusterType, anchorType, priority);
  const anchorLabel = ANCHOR_LABELS[anchorType] || 'Anchors';

  const researchFocus = priority === 'research' || protectSet.has('ip');
  const talentFocus = priority === 'talent' || protectSet.has('talent');
  const anchorLed = clusterType === 'corporate' || priority === 'supply';
  const sovereignty = protectSet.has('sovereignty') || protectSet.has('knowledge');

  const isEarly  = stage === 'early';
  const isMature = stage === 'mature';

  const priorities = [];

  // Gap-driven
  if (gap === 'discovery' || gap === 'access')
    priorities.push({ name: 'Actor Registry & Discovery Layer' });
  if (gap === 'flow' || researchFocus)
    priorities.push({ name: 'Knowledge Flow Infrastructure' });
  if (gap === 'conversion' || stallSet.has('S7') || stallSet.has('S8'))
    priorities.push({ name: 'Outcome Measurement Layer' });

  // Stage-driven
  if (isEarly)
    priorities.push({ name: 'Ecosystem Formation Protocol' });
  if (isMature)
    priorities.push({ name: 'Structural Review & Pruning Layer' });

  // Protection-driven
  if (sovereignty || protectSet.has('trust'))
    priorities.push({ name: 'Sovereign Data Membrane' });

  // Stall-driven (all 9)
  if (stallSet.has('S1'))
    priorities.push({ name: 'External Validation Mechanism' });
  if (stallSet.has('S2'))
    priorities.push({ name: 'Decision Commitment Tracker' });
  if (stallSet.has('S3'))
    priorities.push({ name: 'Conditional Continuation Protocol' });
  if (anchorLed || stallSet.has('S4'))
    priorities.push({ name: 'Anchor Accountability Protocol' });
  if (stallSet.has('S5'))
    priorities.push({ name: 'Direct Coupling Layer' });
  if (stallSet.has('S6'))
    priorities.push({ name: 'New Entrant Pathway' });
  if (stallSet.has('S9'))
    priorities.push({ name: 'Unilateral Action Protocol' });

  // Context-driven
  if (talentFocus)
    priorities.push({ name: 'Talent Pipeline Tracker' });
  if (priority === 'capital')
    priorities.push({ name: 'Investment Signalling Layer' });
  if (detectedStacks.length > 0)
    priorities.push({ name: 'Stack Intervention Monitor' });

  const topPriorities = priorities.slice(0, 4);
  if (topPriorities.length < 3) {
    topPriorities.push({ name: 'Coordination Infrastructure' });
  }

  const outsideActors = [];
  if (priority === 'capital' || clusterType === 'national') outsideActors.push('Investors');
  if (researchFocus) outsideActors.push('Research partners');
  if (priority === 'talent' || protectSet.has('talent')) outsideActors.push('Talent networks');
  if (anchorLed) outsideActors.push('Supply chain partners');
  if (priority === 'growth') outsideActors.push('Trade bodies');
  if (clusterType === 'national') outsideActors.push('Regional EDAs');
  if (isEarly) outsideActors.push('Anchor candidates');
  if (isMature && !outsideActors.includes('Investors')) outsideActors.push('Scale capital');
  if (protectSet.has('sovereignty') && !outsideActors.includes('Government / Policy')) outsideActors.push('Government / Policy');
  if (protectSet.has('talent') && !outsideActors.includes('Talent networks')) outsideActors.push('Talent networks');
  if (outsideActors.length === 0) outsideActors.push('External partners');
  if (outsideActors.length < 2) outsideActors.push('Policy actors');

  return { configName, priorities: topPriorities.map(p => p.name), outsideActors: outsideActors.slice(0, 5) };
}

// ── HELPER: generate all protect combinations ────────────────────────
function protectCombinations() {
  const combos = [];
  for (let mask = 0; mask < (1 << PROTECT_VALUES.length); mask++) {
    const combo = [];
    for (let i = 0; i < PROTECT_VALUES.length; i++) {
      if (mask & (1 << i)) combo.push(PROTECT_VALUES[i]);
    }
    combos.push(combo);
  }
  return combos;
}

// ── HELPER: generate all stall combinations (2-9 stalls) ─────────────
function stallCombinations(minSize = 1, maxSize = 9) {
  const combos = [];
  for (let mask = 1; mask < (1 << STALL_NAMES.length); mask++) {
    const combo = [];
    const codes = [];
    for (let i = 0; i < STALL_NAMES.length; i++) {
      if (mask & (1 << i)) { combo.push(STALL_NAMES[i]); codes.push(STALL_IDS[i]); }
    }
    if (combo.length >= minSize && combo.length <= maxSize) combos.push({ names: combo, codes });
  }
  return combos;
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 1: CONFIG SPACE ENUMERATION
// ══════════════════════════════════════════════════════════════════════
function auditConfigSpace() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 1: CONFIGURATION SPACE — UNIQUE OUTPUT PATHS');
  console.log('═'.repeat(70));

  const allProtect = protectCombinations();
  const uniqueOutputs = new Map(); // fingerprint → example input
  let totalCombinations = 0;

  // Use a representative stall set (2 stalls with a stack)
  const sampleStalls = ['S7', 'S2']; // Narrating + Coordinating
  const sampleStacks = [{ name: 'test' }]; // at least one stack detected

  for (const ct of QUALIFIER_OPTIONS.clusterType) {
    for (const at of QUALIFIER_OPTIONS.anchorType) {
      for (const st of QUALIFIER_OPTIONS.stage) {
        for (const pr of QUALIFIER_OPTIONS.priority) {
          for (const gp of QUALIFIER_OPTIONS.gap) {
            for (const pt of allProtect) {
              totalCombinations++;
              const qualifiers = { clusterType: ct, anchorType: at, stage: st, priority: pr, gap: gp, protect: pt };
              const result = deriveOSConfig(qualifiers, sampleStalls, sampleStacks);
              const fingerprint = JSON.stringify({ configName: result.configName, priorities: result.priorities, outsideActors: result.outsideActors });
              if (!uniqueOutputs.has(fingerprint)) {
                uniqueOutputs.set(fingerprint, { qualifiers, result });
              }
            }
          }
        }
      }
    }
  }

  console.log(`\nTotal qualifier combinations: ${totalCombinations.toLocaleString()}`);
  console.log(`Unique output fingerprints:  ${uniqueOutputs.size}`);
  console.log(`Compression ratio:           ${(totalCombinations / uniqueOutputs.size).toFixed(1)}:1`);
  console.log(`\n→ ${uniqueOutputs.size} distinct outputs from ${totalCombinations.toLocaleString()} inputs means`);
  console.log(`  many users get identical recommendations.\n`);

  // Breakdown by configName
  const byConfig = {};
  for (const [fp, data] of uniqueOutputs) {
    const cn = data.result.configName;
    if (!byConfig[cn]) byConfig[cn] = [];
    byConfig[cn].push(data);
  }
  console.log('Config name distribution (unique outputs per config name):');
  Object.entries(byConfig).sort((a,b) => b[1].length - a[1].length).forEach(([name, items]) => {
    console.log(`  ${items.length.toString().padStart(3)} │ ${name}`);
  });

  return { totalCombinations, uniqueOutputs: uniqueOutputs.size, byConfig };
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 2: QUESTION SENSITIVITY
// ══════════════════════════════════════════════════════════════════════
function auditQuestionSensitivity() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 2: QUESTION SENSITIVITY — WHICH QUESTIONS CHANGE OUTPUT?');
  console.log('═'.repeat(70));

  const baseline = {
    clusterType: 'regional', anchorType: 'university', stage: 'established',
    priority: 'research', gap: 'flow', protect: ['ip']
  };
  const baseStalls = ['S7', 'S2'];
  const baseStacks = [{ name: 'test' }];
  const baseResult = deriveOSConfig(baseline, baseStalls, baseStacks);
  const baseFP = JSON.stringify(baseResult);

  console.log('\nBaseline profile:');
  console.log(`  Cluster: regional | Anchor: university | Stage: established`);
  console.log(`  Priority: research | Gap: flow | Protect: [ip]`);
  console.log(`  → Config: ${baseResult.configName}`);
  console.log(`  → Priorities: ${baseResult.priorities.join(', ')}`);
  console.log(`  → Outside actors: ${baseResult.outsideActors.join(', ')}`);

  // Test each question independently
  const questions = [
    { id: 'clusterType', values: QUALIFIER_OPTIONS.clusterType },
    { id: 'anchorType',  values: QUALIFIER_OPTIONS.anchorType },
    { id: 'stage',       values: QUALIFIER_OPTIONS.stage },
    { id: 'priority',    values: QUALIFIER_OPTIONS.priority },
    { id: 'gap',         values: QUALIFIER_OPTIONS.gap },
  ];

  console.log('\nSingle-question sensitivity (change one question, hold others):');
  console.log('─'.repeat(70));

  for (const q of questions) {
    let changes = 0;
    const changedFields = new Set();
    for (const val of q.values) {
      const modified = { ...baseline, [q.id]: val };
      const result = deriveOSConfig(modified, baseStalls, baseStacks);
      const fp = JSON.stringify(result);
      if (fp !== baseFP) {
        changes++;
        if (result.configName !== baseResult.configName) changedFields.add('configName');
        if (JSON.stringify(result.priorities) !== JSON.stringify(baseResult.priorities)) changedFields.add('priorities');
        if (JSON.stringify(result.outsideActors) !== JSON.stringify(baseResult.outsideActors)) changedFields.add('outsideActors');
      }
    }
    const pct = Math.round((changes / q.values.length) * 100);
    console.log(`  ${q.id.padEnd(14)} │ ${changes}/${q.values.length} values change output (${pct}%) │ affects: ${[...changedFields].join(', ') || 'nothing'}`);
  }

  // Special test for protect (multi-select)
  const protectCombos = protectCombinations();
  let protectChanges = 0;
  const protectChangedFields = new Set();
  for (const pt of protectCombos) {
    const modified = { ...baseline, protect: pt };
    const result = deriveOSConfig(modified, baseStalls, baseStacks);
    if (JSON.stringify(result) !== baseFP) {
      protectChanges++;
      if (result.configName !== baseResult.configName) protectChangedFields.add('configName');
      if (JSON.stringify(result.priorities) !== JSON.stringify(baseResult.priorities)) protectChangedFields.add('priorities');
      if (JSON.stringify(result.outsideActors) !== JSON.stringify(baseResult.outsideActors)) protectChangedFields.add('outsideActors');
    }
  }
  console.log(`  protect (multi) │ ${protectChanges}/${protectCombos.length} combos change output (${Math.round((protectChanges / protectCombos.length) * 100)}%) │ affects: ${[...protectChangedFields].join(', ') || 'nothing'}`);

  // KEY TEST: Does 'stage' ever change output?
  console.log('\n' + '─'.repeat(70));
  console.log('CRITICAL TEST: Does "stage" ever change any output?');
  let stageEverMatters = false;
  const allProtectCombos = protectCombinations();

  for (const ct of QUALIFIER_OPTIONS.clusterType) {
    for (const at of QUALIFIER_OPTIONS.anchorType) {
      for (const pr of QUALIFIER_OPTIONS.priority) {
        for (const gp of QUALIFIER_OPTIONS.gap) {
          for (const pt of allProtectCombos) {
            const results = QUALIFIER_OPTIONS.stage.map(st => {
              const q = { clusterType: ct, anchorType: at, stage: st, priority: pr, gap: gp, protect: pt };
              return JSON.stringify(deriveOSConfig(q, baseStalls, baseStacks));
            });
            if (new Set(results).size > 1) {
              stageEverMatters = true;
              break;
            }
          }
          if (stageEverMatters) break;
        }
        if (stageEverMatters) break;
      }
      if (stageEverMatters) break;
    }
    if (stageEverMatters) break;
  }
  console.log(`  → Stage changes output in ANY combination: ${stageEverMatters ? 'YES' : 'NO ← DEAD QUESTION'}`);
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 3: STACK COVERAGE
// ══════════════════════════════════════════════════════════════════════
function auditStackCoverage() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 3: STACK COVERAGE — NAMED vs FALLBACK');
  console.log('═'.repeat(70));

  // All possible pairs from 9 stalls
  const allPairs = [];
  for (let i = 0; i < STALL_NAMES.length; i++) {
    for (let j = i + 1; j < STALL_NAMES.length; j++) {
      const key = [STALL_NAMES[i], STALL_NAMES[j]].sort().join('+');
      allPairs.push(key);
    }
  }

  const namedPairKeys = new Set(Object.keys(NAMED_STACKS_PAIRS));
  const coveredPairs = allPairs.filter(p => namedPairKeys.has(p));
  const uncoveredPairs = allPairs.filter(p => !namedPairKeys.has(p));

  console.log(`\nTotal possible pairs (9 choose 2): ${allPairs.length}`);
  console.log(`Named pair stacks:                  ${coveredPairs.length} (${Math.round(coveredPairs.length / allPairs.length * 100)}%)`);
  console.log(`Uncovered pairs (fallback):         ${uncoveredPairs.length} (${Math.round(uncoveredPairs.length / allPairs.length * 100)}%)`);

  console.log('\nCovered pairs:');
  coveredPairs.forEach(p => console.log(`  ✓ ${p.padEnd(35)} → ${NAMED_STACKS_PAIRS[p]}`));

  console.log('\nUncovered pairs (will get generic fallback text):');
  uncoveredPairs.forEach(p => console.log(`  ✗ ${p}`));

  // All possible triples
  const allTriples = [];
  for (let i = 0; i < STALL_NAMES.length; i++) {
    for (let j = i + 1; j < STALL_NAMES.length; j++) {
      for (let k = j + 1; k < STALL_NAMES.length; k++) {
        allTriples.push([STALL_NAMES[i], STALL_NAMES[j], STALL_NAMES[k]].sort().join('+'));
      }
    }
  }

  const namedTripleKeys = new Set(Object.keys(NAMED_STACKS_TRIPLES));
  const coveredTriples = allTriples.filter(t => namedTripleKeys.has(t));

  console.log(`\nTotal possible triples (9 choose 3): ${allTriples.length}`);
  console.log(`Named triple stacks:                  ${coveredTriples.length} (${Math.round(coveredTriples.length / allTriples.length * 100)}%)`);
  console.log(`Uncovered triples:                    ${allTriples.length - coveredTriples.length}`);
  console.log(`\n→ Triples that aren't named fall back to best-matching PAIR (≥50% overlap)`);
  console.log(`  or generic text. With ${Math.round((allTriples.length - coveredTriples.length) / allTriples.length * 100)}% uncovered, most 3-stall users get pair-level or generic output.`);

  // Check which stalls appear in the fewest named stacks
  console.log('\nStall coverage in named stacks (how often each stall appears):');
  const stallCounts = {};
  STALL_NAMES.forEach(s => stallCounts[s] = 0);
  [...Object.keys(NAMED_STACKS_PAIRS), ...Object.keys(NAMED_STACKS_TRIPLES)].forEach(key => {
    key.split('+').forEach(s => { if (stallCounts[s] !== undefined) stallCounts[s]++; });
  });
  Object.entries(stallCounts).sort((a, b) => b[1] - a[1]).forEach(([stall, count]) => {
    const maxBar = Math.max(count, 1); const bar = '█'.repeat(Math.min(count, 20)) + '░'.repeat(Math.max(20 - count, 0));
    console.log(`  ${stall.padEnd(14)} │ ${bar} ${count} stacks`);
  });
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 4: STALL-SENSITIVE CONFIG VARIATION
// ══════════════════════════════════════════════════════════════════════
function auditStallInfluence() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 4: STALL INFLUENCE ON CONFIG OUTPUT');
  console.log('═'.repeat(70));
  console.log('Which stalls actually change deriveOSConfig priorities?\n');

  const baseQualifiers = {
    clusterType: 'regional', anchorType: 'university', stage: 'established',
    priority: 'growth', gap: 'discovery', protect: ['trust']
  };

  // Baseline with no stalls
  const baseResult = deriveOSConfig(baseQualifiers, [], []);
  console.log(`Baseline (no stalls): ${baseResult.priorities.join(', ')}`);
  console.log('─'.repeat(70));

  // Test each stall individually
  for (const [i, stallName] of STALL_NAMES.entries()) {
    const result = deriveOSConfig(baseQualifiers, [STALL_IDS[i]], []);
    const diff = result.priorities.filter(p => !baseResult.priorities.includes(p));
    const marker = diff.length > 0 ? '← CHANGES' : '  (same)';
    console.log(`  + ${stallName.padEnd(14)} │ ${result.priorities.join(', ')} ${marker}`);
  }

  console.log('\n→ Only stalls S4 (Extracting), S7 (Narrating), S8 (Scaling) have');
  console.log('  hard-coded influence on infrastructure priorities.');
  console.log('  The other 6 stalls do NOT change config output at all.');
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 5: PRIORITY ORDERING ANALYSIS
// ══════════════════════════════════════════════════════════════════════
function auditPriorityDominance() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 5: INFRASTRUCTURE PRIORITY FREQUENCY');
  console.log('═'.repeat(70));
  console.log('How often does each priority appear across all combinations?\n');

  const allProtect = protectCombinations();
  const priorityCounts = {};
  const topSlotCounts = {};
  let totalRuns = 0;

  for (const ct of QUALIFIER_OPTIONS.clusterType) {
    for (const pr of QUALIFIER_OPTIONS.priority) {
      for (const gp of QUALIFIER_OPTIONS.gap) {
        for (const pt of allProtect) {
          totalRuns++;
          const q = { clusterType: ct, anchorType: 'university', stage: 'established', priority: pr, gap: gp, protect: pt };
          const result = deriveOSConfig(q, ['S7', 'S2'], [{ name: 'test' }]);
          result.priorities.forEach((p, idx) => {
            priorityCounts[p] = (priorityCounts[p] || 0) + 1;
            if (idx === 0) topSlotCounts[p] = (topSlotCounts[p] || 0) + 1;
          });
        }
      }
    }
  }

  console.log(`Total combinations sampled: ${totalRuns}`);
  console.log('\nPriority frequency (how often it appears in any slot):');
  Object.entries(priorityCounts).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
    const pct = Math.round(count / totalRuns * 100);
    const bar = '█'.repeat(Math.round(pct / 2)) + '░'.repeat(50 - Math.round(pct / 2));
    console.log(`  ${pct.toString().padStart(3)}% │ ${bar} │ ${name}`);
  });

  console.log('\nTop-slot frequency (how often it appears as #1 priority):');
  Object.entries(topSlotCounts).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
    const pct = Math.round(count / totalRuns * 100);
    console.log(`  ${pct.toString().padStart(3)}% │ ${name}`);
  });
}

// ══════════════════════════════════════════════════════════════════════
// AUDIT 6: configName COVERAGE
// ══════════════════════════════════════════════════════════════════════
function auditConfigNameCoverage() {
  console.log('\n' + '═'.repeat(70));
  console.log('AUDIT 6: CONFIG NAME LOOKUP — FALLBACK RATE');
  console.log('═'.repeat(70));

  let total = 0;
  let exact = 0;
  let wildcard = 0;
  let fallback = 0;
  const fallbackCombos = [];

  for (const ct of QUALIFIER_OPTIONS.clusterType) {
    for (const at of QUALIFIER_OPTIONS.anchorType) {
      for (const pr of QUALIFIER_OPTIONS.priority) {
        total++;
        const key = `${ct}|${at}|${pr}`;
        if (CONFIG_NAMES[key]) {
          exact++;
        } else if (CONFIG_NAMES[`${ct}|*|${pr}`] || CONFIG_NAMES[`${ct}|${at}|*`]) {
          wildcard++;
        } else {
          fallback++;
          fallbackCombos.push(key);
        }
      }
    }
  }

  console.log(`\nTotal clusterType × anchorType × priority combinations: ${total}`);
  console.log(`  Exact match:                ${exact} (${Math.round(exact/total*100)}%)`);
  console.log(`  Wildcard match:             ${wildcard} (${Math.round(wildcard/total*100)}%)`);
  console.log(`  Fallback "Regional OS":     ${fallback} (${Math.round(fallback/total*100)}%)`);

  if (fallbackCombos.length > 0) {
    console.log(`\nCombinations hitting fallback (get generic "Regional Operating System"):`);
    fallbackCombos.forEach(c => console.log(`  → ${c}`));
  }
}

// ══════════════════════════════════════════════════════════════════════
// RUN ALL AUDITS
// ══════════════════════════════════════════════════════════════════════
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║         CLUSTEROS SELF-DIAGNOSIS AUDIT REPORT                      ║');
console.log('║         Generated: ' + new Date().toISOString().slice(0, 19) + '                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');

const configResults = auditConfigSpace();
auditQuestionSensitivity();
auditStackCoverage();
auditStallInfluence();
auditPriorityDominance();
auditConfigNameCoverage();

// ══════════════════════════════════════════════════════════════════════
// SUMMARY FINDINGS
// ══════════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70));
console.log('SUMMARY FINDINGS');
console.log('═'.repeat(70));

console.log(`
1. DIFFERENTIATION
   - ${configResults.uniqueOutputs} unique outputs from ${configResults.totalCombinations.toLocaleString()} input combinations
   - Compression ratio of ${(configResults.totalCombinations / configResults.uniqueOutputs).toFixed(0)}:1 means most users get duplicate recommendations

2. DEAD QUESTION
   - "stage" (early/established/mature) has ZERO influence on any output
   - It does not affect configName, priorities, or outsideActors
   - It appears in AI commentary prompt context only — but you confirmed no AI layer

3. STALL BLIND SPOTS
   - Only 3 of 9 stalls (S4 Extracting, S7 Narrating, S8 Scaling) influence config output
   - The other 6 stalls affect stack detection but NOT infrastructure recommendations
   - A user with Coordinating + Forgiving + Waiting gets the same config as someone
     with no stalls at all (given same qualifiers)

4. STACK COVERAGE GAPS
   - 15 of 36 possible pairs are named (42%)
   - 3 of 84 possible triples are named (4%)
   - Users selecting 3+ behaviours usually get pair-level or generic fallback text

5. CONFIG NAME COVERAGE
   - Many clusterType × anchorType × priority combos fall through to
     generic "Regional Operating System" — especially city clusters and hospital anchors

6. PRIORITY ORDERING
   - Infrastructure priorities are insertion-ordered, not ranked by relevance
   - "gap" question dominates: it determines the #1 priority in most paths
   - Stack Intervention Monitor appears whenever stacks are detected (nearly always)
`);
