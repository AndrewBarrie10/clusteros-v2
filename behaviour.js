// ── ClusterOS Behavioural Tracking Layer ──────────────────
// Tracks visitor path signals. No server. No login. Local only.

const RAILWAY = 'https://clusteros-v3-production.up.railway.app';

const FORK_LABELS = {
  evidence:   'Show me the evidence — what 221 diagnostics found',
  diagnostic: 'How does the diagnostic work?',
  digital:    "I'm Head of Digital — show me the architecture",
  founders:   'Who built this and why does it exist?'
};

// ── STALL PILL MAP ─────────────────────────────────────────
// Maps opening question pill answers to stall names
const PILL_STALLS = {
  commissioning: { stall: 'Narrating',     code: 'S7' },
  convening:     { stall: 'Coordinating',  code: 'S2' },
  measuring:     { stall: 'Re-proving',    code: 'S1' },
  celebrating:   { stall: 'Scaling',       code: 'S8' },
  relationships: { stall: 'Mediating',     code: 'S5' },
};

// ── SECTOR INFERENCE ──────────────────────────────────────
function inferSector(c) {
  const name = (c.name + ' ' + (c.sector || '')).toLowerCase();
  if (/cyber|security|infosec/.test(name))              return 'cyber';
  if (/life.sci|biotech|medtech|health|pharma/.test(name)) return 'life';
  if (/manufactur|industrial|engineer/.test(name))      return 'manufacturing';
  if (/space|deep.tech|quantum|photon|satel/.test(name)) return 'space';
  return 'other';
}
window.inferSector = inferSector;

// ── BEHAVIOUR OBJECT ──────────────────────────────────────
const behaviour = {
  forks:          [],    // fork ids opened in order
  clusters:       [],    // cluster objects clicked
  panelTime:      {},    // ms per panel
  branches:       [],    // depth branches taken
  declaredProblem: null, // pill answer key
  declaredStall:   null, // stall name from pill
  declaredCluster: null, // free text cluster name
  _openedAt:      null,
  _currentPanel:  null,

  // ── RECORDING ────────────────────────────────────────────

  recordFork(id) {
    if (!this.forks.includes(id)) this.forks.push(id);
    this._openedAt    = Date.now();
    this._currentPanel = id;
  },

  recordClose(id) {
    if (this._openedAt && this._currentPanel === id) {
      this.panelTime[id] = (this.panelTime[id] || 0) + (Date.now() - this._openedAt);
      this._openedAt    = null;
      this._currentPanel = null;
    }
  },

  recordCluster(cluster) {
    if (!this.clusters.find(c => c.id === cluster.id)) {
      this.clusters.push({
        id:         cluster.id,
        name:       cluster.name,
        city:       cluster.city       || '',
        country:    cluster.country    || '',
        sector:     inferSector(cluster),
        regime:     cluster.regime,
        anchorType: cluster._anchor_type || '',
        topStall:   (cluster.stalls || [])
                      .reduce((a, b) => ((a.intensity||0) > (b.intensity||0) ? a : b), {}).name || null,
        fullData:   cluster
      });
    }
    this.updateAdaptive();
    if (window.dashboard) window.dashboard.onClusterClick(cluster);
  },

  recordBranch(branchId) {
    this.branches.push({ id: branchId, at: Date.now() });
    if (window.dashboard) window.dashboard.onBranch(branchId);
  },

  // Multiple pills — accumulate before committing
  selectedPills: [],

  togglePill(pillKey) {
    const idx = this.selectedPills.indexOf(pillKey);
    if (idx === -1) {
      this.selectedPills.push(pillKey);
    } else {
      this.selectedPills.splice(idx, 1);
    }
  },

  commitPills() {
    if (!this.selectedPills.length) return;
    this.declaredProblem = this.selectedPills[0];
    this.declaredStalls  = this.selectedPills.map(k => PILL_STALLS[k]?.stall).filter(Boolean);
    this.declaredStall   = this.declaredStalls[0] || null;
    // Detect stack — two pills that stack together
    this.declaredStack   = this._detectStack(this.declaredStalls);
    if (window.dashboard) window.dashboard.init(this.selectedPills);
  },

  _detectStack(stalls) {
    if (stalls.length < 2) return null;
    const KNOWN_STACKS = {
      'Narrating+Coordinating':  { name: 'Activity-Alignment Stack', description: 'The most common configuration. The ecosystem reports activity to justify continued coordination, and coordinates to generate reportable activity. Neither breaks without changing both.' },
      'Narrating+Re-proving':    { name: 'Justification Stack', description: 'Resources flow to making the case rather than executing it. External validation is sought repeatedly but never quite sufficient to unlock committed action.' },
      'Coordinating+Mediating':  { name: 'Relationship Stack', description: 'The ecosystem manages its relationships as the primary output. Transactions are replaced by partnerships, and partnerships by further coordination.' },
      'Re-proving+Scaling':      { name: 'Evidence-Activity Stack', description: 'Early-stage activity is used as proof of concept rather than evaluated against outcomes. The case for scaling is never quite strong enough.' },
      'Scaling+Forgiving':       { name: 'Tolerance Stack', description: 'Poor performance at scale is tolerated to avoid disrupting the narrative of progress. Accountability is systematically deferred.' },
      'Mediating+Extracting':    { name: 'Anchor Dependency Stack', description: 'The ecosystem organises itself around managing anchor institutions rather than changing their behaviour. Value flows out while relationships are maintained.' },
    };
    // Try combinations
    for (let i = 0; i < stalls.length; i++) {
      for (let j = i+1; j < stalls.length; j++) {
        const key1 = stalls[i] + '+' + stalls[j];
        const key2 = stalls[j] + '+' + stalls[i];
        if (KNOWN_STACKS[key1]) return KNOWN_STACKS[key1];
        if (KNOWN_STACKS[key2]) return KNOWN_STACKS[key2];
      }
    }
    return null;
  },

  declareProblem(pillKey) {
    this.declaredProblem = pillKey;
    this.declaredStall   = PILL_STALLS[pillKey]?.stall || null;
    if (window.dashboard) window.dashboard.init([pillKey]);
  },

  commitFreeText(text) {
    // No pills selected — generate pathway from description alone
    this.freeDescription = text;
    this.declaredProblem = 'freetext';
    if (window.dashboard) window.dashboard.initFromFreeText(text);
  },

  declareCluster(text) {
    this.declaredCluster = text;
    this.updateAdaptive();
    if (window.dashboard) window.dashboard.onClusterDeclared(text);
  },

  // ── INFERENCE ────────────────────────────────────────────

  persona() {
    if (this.declaredProblem) return 'declared';
    const f = this.forks;
    if (!f.length) return 'unknown';
    if (f[0] === 'digital')   return 'digital';
    if (f[0] === 'founders')  return 'sceptic';
    if (f[0] === 'evidence' || f[0] === 'diagnostic') return 'steward';
    if (f.length > 1)         return 'explorer';
    return 'unknown';
  },

  dominantSector() {
    if (!this.clusters.length) return null;
    const counts = {};
    this.clusters.forEach(c => { counts[c.sector] = (counts[c.sector] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  },

  // ── PROMPT BUILDING ───────────────────────────────────────

  buildObservationPrompt(panelId) {
    const forksOpened  = this.forks.map(f => FORK_LABELS[f] || f).join(', then ');
    const currentFork  = FORK_LABELS[panelId] || panelId;

    const clusterDetail = this.clusters.map(c => {
      const stalls = (c.fullData.stalls || []).map(s =>
        `${s.name} (intensity ${Math.round((s.intensity||0)*100)}%, confidence ${s.confidence||'unknown'})`
      ).join(', ');
      const stacks = (c.fullData.stacks || []).map(s =>
        `Stack: ${(s.stalls_involved||[]).join('+')} — ${s.description||''}`
      ).join(' | ');
      const leverage = c.fullData.leverage
        ? `Leverage hypothesis: "${c.fullData.leverage.hypothesis||''}" (${c.fullData.leverage.timeline||-''})`
        : '';
      return `${c.name} [${c.city}, ${c.country}] — Regime: ${c.regime}, Anchor: ${c.anchorType||'unknown'}
  Stalls: ${stalls || 'none recorded'}
  ${stacks ? 'Stacks: ' + stacks : ''}
  ${leverage}
  Summary: ${c.fullData.summary || ''}`;
    }).join('\n\n');

    const declaredProblemLine = this.declaredProblem && this.declaredProblem !== 'freetext'
      ? `DECLARED PROBLEM: Visitor selected "${this.declaredProblem}" — maps to the ${this.declaredStall} stall.`
      : '';

    const declaredClusterLine = this.declaredCluster
      ? `DECLARED CLUSTER: Visitor works with "${this.declaredCluster}". Weight this heavily.`
      : '';

    const freeDescLine = this.freeDescription
      ? `VISITOR DESCRIPTION (their own words): "${this.freeDescription}"`
      : '';

    return `You are the diagnostic intelligence layer of ClusterOS — a platform that identifies why regional innovation ecosystems stall. A stall is a behavioural substitution: the system doing something observable instead of something harder. There are 9 stall types. Stalls form stabilisation stacks that resist single interventions.

${declaredProblemLine}
${freeDescLine}
${declaredClusterLine}

VISITOR PATH:
- Entry: ${FORK_LABELS[this.forks[0]] || 'map exploration'}
- Full path: ${forksOpened || 'map only'}
- Currently reading: "${currentFork}"
- Branches taken: ${this.branches.map(b => b.id).join(', ') || 'none'}

CLUSTERS EXAMINED:
${clusterDetail || 'None yet.'}

YOUR TASK:
Make one sharp, assertive observation. Not a summary. Not a question. A statement that demonstrates the system has seen something real. Find the structural pattern — shared stall types, similar regime configurations, comparable leverage positions. If they declared a cluster or problem, connect it explicitly. Be specific. Be structural. Be slightly unexpected. Do not hedge. Do not say "it appears" or "it seems". State what is true. 2-3 sentences. Write as ClusterOS, not as an assistant. No em-dashes.`;
  },

  // ── API CALLS ─────────────────────────────────────────────

  async callAPI(prompt) {
    const response = await fetch(`${RAILWAY}/api/intelligence`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.text || null;
  },

  async updateAdaptive() {
    if (!this.clusters.length && !this.declaredProblem) return;

    document.querySelectorAll('.journey-panel.open').forEach(async panel => {
      const id    = panel.id.replace('panel-', '');
      const wrap  = document.getElementById('adaptive-' + id);
      const textEl = document.getElementById('adaptive-text-' + id);
      if (!wrap || !textEl) return;
      if (wrap.classList.contains('visible')) return; // already showing

      wrap.classList.add('visible');
      textEl.innerHTML = '<span class="adaptive-loading">Reading your path...</span>';

      try {
        const text = await this.callAPI(this.buildObservationPrompt(id));
        if (text) {
          textEl.textContent = text;
        } else {
          wrap.classList.remove('visible');
        }
      } catch(e) {
        wrap.classList.remove('visible');
      }
    });
  },

  // Legacy alias
  updateAll() { this.updateAdaptive(); }
};

window.behaviour = behaviour;
window.PILL_STALLS = PILL_STALLS;
window.RAILWAY = RAILWAY;
