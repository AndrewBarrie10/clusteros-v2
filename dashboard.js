// ── ClusterOS Dashboard — Pathway Intelligence Layer ───────
// Generates personalised journeys. Recalibrates on every signal.

// ── STALL SCIENCE ─────────────────────────────────────────
const STALL_SCIENCE = {
  Narrating: {
    definition: 'The ecosystem produces stories about progress instead of evidence of change. Reporting substitutes for impact.',
    stacksWith: ['Re-proving', 'Coordinating'],
    leverage:   'Changing what gets reported — not who reports it — usually breaks this stack faster than any governance reform.'
  },
  Coordinating: {
    definition: 'Coordination becomes the output rather than the mechanism. Meetings, partnerships, and alignment processes substitute for committed action.',
    stacksWith: ['Mediating', 'Narrating'],
    leverage:   'The leverage point is almost never more coordination. It is identifying which actor has the most to lose from the current arrangement — and changing their constraint.'
  },
  'Re-proving': {
    definition: 'The ecosystem repeats the case for its own existence. Resources flow to justification rather than execution.',
    stacksWith: ['Narrating', 'Scaling'],
    leverage:   'Re-proving stalls break when a credible external validator makes the case once and commits publicly. Internal advocacy almost never works.'
  },
  Scaling: {
    definition: 'Early-stage activity is celebrated rather than evaluated. The ecosystem optimises for inputs and starts rather than outcomes and scale.',
    stacksWith: ['Re-proving', 'Forgiving'],
    leverage:   'The intervention is almost always at the measurement layer — changing what counts as success before changing who does what.'
  },
  Mediating: {
    definition: 'The ecosystem spends its energy managing relationships between actors rather than enabling transactions between them.',
    stacksWith: ['Coordinating', 'Forgiving'],
    leverage:   'Mediation stalls often break through structural changes to incentives rather than to relationships. The relationship problem is usually a symptom.'
  },
  Extracting: {
    definition: 'Anchor institutions extract value from the ecosystem rather than circulating it. Talent, IP, and capital flow outward.',
    stacksWith: ['Mediating', 'Stabilising'],
    leverage:   'The leverage is usually in changing anchor procurement or spin-out policy — not in asking anchors to behave differently without changing their constraints.'
  },
  Forgiving: {
    definition: 'Poor performance is tolerated to preserve relationships. Accountability systems are systematically avoided.',
    stacksWith: ['Mediating', 'Scaling'],
    leverage:   'Forgiving stalls rarely break through culture change. They break when a funder or anchor changes the conditions under which they will continue to support.'
  },
  Stabilising: {
    definition: 'The ecosystem optimises for stability over adaptation. Existing structures are preserved even when they no longer serve the system.',
    stacksWith: ['Coordinating', 'Extracting'],
    leverage:   'Stabilisation stacks are the hardest to break from inside. The leverage is almost always external — a new entrant, a policy shift, or a funding regime change.'
  },
  Waiting: {
    definition: 'Action is deferred pending external conditions — funding decisions, policy clarity, anchor commitment. Waiting becomes structural.',
    stacksWith: ['Re-proving', 'Stabilising'],
    leverage:   'Waiting stalls break when one actor stops waiting unilaterally and others follow. The question is always: who has the least to lose from going first?'
  }
};

// ── PILL CONFIG ───────────────────────────────────────────
const PILLS = [
  {
    key:   'commissioning',
    label: 'Commissioning strategies that don\'t change behaviour',
    stall: 'Narrating',
    entry: 'evidence'
  },
  {
    key:   'convening',
    label: 'Convening stakeholders instead of committing to things',
    stall: 'Coordinating',
    entry: 'diagnostic'
  },
  {
    key:   'measuring',
    label: 'Measuring activity instead of tracking outcomes',
    stall: 'Re-proving',
    entry: 'evidence'
  },
  {
    key:   'celebrating',
    label: 'Celebrating early wins instead of scaling what works',
    stall: 'Scaling',
    entry: 'diagnostic'
  },
  {
    key:   'relationships',
    label: 'Building relationships instead of changing structures',
    stall: 'Mediating',
    entry: 'founders'
  }
];

// ── STEP TARGETS ──────────────────────────────────────────
// Maps step recommendations to site actions
const STEP_TARGETS = {
  evidence:    () => window.openPanel && window.openPanel('evidence'),
  diagnostic:  () => window.openPanel && window.openPanel('diagnostic'),
  digital:     () => window.openPanel && window.openPanel('digital'),
  founders:    () => window.openPanel && window.openPanel('founders'),
  map:         () => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }),
  clusters:    () => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }),
  contact:     () => window.location.href = 'mailto:andrew@communitylab.app?subject=ClusterOS%20conversation',
  snapshot:    () => window.location.href = 'https://clusteros.io/request.html'
};

// ── DASHBOARD STATE ───────────────────────────────────────
const dashboard = {
  active:        false,
  pillKey:       null,
  stallName:     null,
  steps:         [],
  currentStep:   0,
  inBranch:      false,
  currentBranch: null,

  // ── INIT ─────────────────────────────────────────────────
  async init(pillKeys) {
    // Accept single key or array
    if (!Array.isArray(pillKeys)) pillKeys = [pillKeys];
    this.active    = true;
    this.pillKeys  = pillKeys;
    this.pillKey   = pillKeys[0];
    const pill     = PILLS.find(p => p.key === this.pillKey);
    this.stallName = pill?.stall || null;
    this.stallNames = pillKeys.map(k => PILLS.find(p => p.key === k)?.stall).filter(Boolean);
    this.stack     = window.behaviour?._detectStack(this.stallNames) || null;

    this._showPanel();
    this._renderSkeleton();
    this._updateBar(pill);
    await this._generatePathway();

    if (pill?.entry && window.openPanel) {
      setTimeout(() => window.openPanel(pill.entry), 800);
    }
  },

  // ── SIGNAL HANDLERS ──────────────────────────────────────

  onClusterClick(cluster) {
    if (!this.active) return;
    // Check if this cluster matches current step target
    this._checkStepComplete('clusters');
    this._checkStepComplete('map');
    // Recalibrate if they've clicked 2+ clusters
    if (window.behaviour.clusters.length >= 2 && this.currentStep >= 2) {
      this._recalibrate('cluster_exploration');
    }
  },

  onBranch(branchId) {
    if (!this.active) return;
    this.inBranch      = true;
    this.currentBranch = branchId;
    this._renderBranchState(branchId);
  },

  onReturnFromBranch() {
    this.inBranch      = false;
    this.currentBranch = null;
    this._render();
  },

  onClusterDeclared(text) {
    if (!this.active) return;
    this._recalibrate('cluster_declared');
  },

  onForkOpen(forkId) {
    if (!this.active) return;
    // Check if opening this fork completes current step
    this._checkStepComplete(forkId);
  },

  // ── STEP MANAGEMENT ──────────────────────────────────────

  _checkStepComplete(target) {
    const step = this.steps[this.currentStep];
    if (!step || step.complete) return;
    if (step.target === target) {
      this.steps[this.currentStep].complete = true;
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
      this._render();
    }
  },

  advanceStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].complete = true;
      this.currentStep++;
      this._render();
      // Execute step target action
      const step = this.steps[this.currentStep];
      if (step?.target && STEP_TARGETS[step.target]) {
        STEP_TARGETS[step.target]();
      }
    }
  },

  // ── API CALLS ─────────────────────────────────────────────

  // ── CLUSTER MATCHING ─────────────────────────────────────
  // Run before pathway generation. Returns top N clusters scored
  // against declared stalls, with full diagnostic data serialised.

  _matchClusters(limit = 4) {
    const all = window._allClusters || [];
    if (!all.length) return [];

    const targetStalls = this.stallNames.map(s => s.toLowerCase());

    const STALL_ALIASES = {
      'narrating':    ['narrat'],
      'coordinating': ['coordinat'],
      're-proving':   ['re-prov', 'reprov', 'proving'],
      'scaling':      ['scal'],
      'mediating':    ['mediat'],
      'extracting':   ['extract'],
      'forgiving':    ['forgiv'],
      'stabilising':  ['stabilis', 'stabiliz'],
      'waiting':      ['wait'],
    };

    return all
      .map(c => {
        const clusterStalls = (c.stalls || []).map(s => ({
          name:      s.name || '',
          intensity: s.intensity || 0,
          confidence: s.confidence || 'medium'
        }));

        // Score: sum of intensity for each matched target stall
        let score = 0;
        targetStalls.forEach(target => {
          const aliases = STALL_ALIASES[target] || [target];
          clusterStalls.forEach(cs => {
            const csName = cs.name.toLowerCase();
            if (aliases.some(a => csName.includes(a))) {
              score += cs.intensity * (target === csName ? 1.2 : 1); // bonus for exact
            }
          });
        });

        // Boost if regime + stall combination is strong
        if (score > 0 && c.regime === 'cycling') score += 0.1;

        return { cluster: c, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.cluster);
  },

  _serializeCluster(c) {
    const stalls = (c.stalls || [])
      .sort((a, b) => (b.intensity||0) - (a.intensity||0))
      .slice(0, 4)
      .map(s => `    • ${s.name}: ${Math.round((s.intensity||0)*100)}% intensity (${s.confidence||'medium'} confidence)`)
      .join('\n');

    const stacks = (c.stacks || [])
      .map(s => `    Stack [${(s.stalls_involved||[]).join(' + ')}]: ${s.description||''}`)
      .join('\n');

    const leverage = c.leverage
      ? `    Hypothesis: "${c.leverage.hypothesis||''}"\n    Timeline: ${c.leverage.timeline||'unknown'}\n    Entry point: ${c.leverage.entry_point||'unknown'}`
      : '    No leverage hypothesis recorded.';

    const summary = c.summary ? `    "${c.summary.slice(0,200)}${c.summary.length>200?'…':''}"` : '';

    return `CLUSTER: ${c.name}
  Location: ${c.city||''}, ${c.country||''}
  Regime: ${c.regime||'unknown'} | Anchor type: ${c._anchor_type||'unknown'}
  Summary: ${summary}
  Stalls:
${stalls||'    None recorded'}
  Stacks:
${stacks||'    None recorded'}
  Leverage:
${leverage}`;
  },

  async _generatePathway() {
    const science = STALL_SCIENCE[this.stallName] || {};

    // Pre-compute matched clusters before generating prompt
    this.matchedClusters = this._matchClusters(4);
    const clusterEvidence = this.matchedClusters.length
      ? this.matchedClusters.map(c => this._serializeCluster(c)).join('\n\n')
      : 'Cluster data not yet loaded — generate pathway from stall science only.';

    const stackInfo = this.stack
      ? `DETECTED STACK: ${this.stack.name}\n${this.stack.description}`
      : '';
    const multiStall = this.stallNames.length > 1
      ? `MULTIPLE STALLS: ${this.stallNames.join(' + ')} — compound configuration.`
      : '';

    const prompt = `You are generating a highly personalised learning pathway for the ClusterOS diagnostic platform. ClusterOS has diagnosed 75 real innovation clusters worldwide. The pathway must reference specific clusters by name — not generically. Every step description should cite real cluster evidence from the data below.

VISITOR DECLARED: "${this.pillKeys.map(k => PILLS.find(p => p.key === k)?.label).join('" AND "')}"
PRIMARY STALL: The ${this.stallName} stall — ${science.definition || ''}
${multiStall}
${stackInfo}
STALL SCIENCE: ${science.stacksWith ? 'Stacks with: ' + science.stacksWith.join(', ') : ''}
LEVERAGE DIRECTION: ${science.leverage || ''}

MATCHED CLUSTERS — use these as the evidence base for the pathway:
${clusterEvidence}

PATHWAY RULES:
- Step 1: Already complete (visitor just declared their problem). Name the stall explicitly.
- Step 2: Show them they are not alone. Reference a specific matched cluster by name — its stall intensity, its regime. Make it concrete.
- Step 3: Introduce the stack concept through their specific configuration. Name which clusters share the same stall combination and why that matters for intervention.
- Step 4: The leverage hypothesis. Reference the specific leverage hypothesis from the best-matched cluster — what entry point, what timeline, what the hypothesis actually was. Be precise.
- Step 5: Always "Confirm it in yours" — snapshot diagnostic, 4-5 weeks, fixed price.

Descriptions must be specific. "Coventry & Warwickshire's Narrating stall ran at 71% intensity" is good. "Many clusters share this pattern" is not.

Return ONLY valid JSON, no markdown, no explanation:
{
  "opening": "A single sharp sentence naming their stall that makes them feel seen. Under 20 words. No em-dashes. Reference a real cluster name if possible.",
  "steps": [
    {
      "id": 1,
      "title": "Short title (3-5 words)",
      "description": "One sentence. Name the stall. Reference how many of the 75 clusters show it.",
      "target": "evidence",
      "branches": ["science", "evidence"],
      "complete": true
    },
    {
      "id": 2,
      "title": "...",
      "description": "One sentence citing a specific matched cluster by name with a real data point.",
      "target": "clusters",
      "branches": ["science", "evidence"],
      "complete": false
    },
    {
      "id": 3,
      "title": "...",
      "description": "One sentence on why the stall holds — name the stack, name which clusters share it.",
      "target": "diagnostic",
      "branches": ["science", "architecture", "clusters"],
      "complete": false
    },
    {
      "id": 4,
      "title": "...",
      "description": "One sentence on leverage — quote or closely paraphrase the actual leverage hypothesis from the best-matched cluster. Name the cluster.",
      "target": "clusters",
      "branches": ["clusters", "evidence"],
      "complete": false
    },
    {
      "id": 5,
      "title": "Confirm it in yours",
      "description": "A snapshot diagnostic takes 4-5 weeks at a fixed price. It tells you whether this configuration is active in your ecosystem — and where leverage actually sits.",
      "target": "snapshot",
      "branches": ["contact"],
      "complete": false
    }
  ]
}`;

    try {
      const response = await fetch(`${window.RAILWAY}/api/intelligence`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt })
      });
      const data   = await response.json();
      const text   = data.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      this.steps       = parsed.steps;
      this.currentStep = 1;
      this._renderOpening(parsed.opening);
      this._render();
    } catch(e) {
      this._fallbackPathway();
    }
  },

  async _recalibrate(reason) {
    const stepsAhead = this.steps.slice(this.currentStep + 1);

    // Get the clusters they actually clicked — serialize their full data
    const clickedClusters = window.behaviour.clusters.map(c =>
      c.fullData ? this._serializeCluster(c.fullData) : `CLUSTER: ${c.name} [${c.city}, ${c.country}]`
    ).join('\n\n');

    // Re-run matching with any new stall signals from clicked clusters
    const updatedMatches = this._matchClusters(3);
    const freshEvidence  = updatedMatches
      .filter(c => !window.behaviour.clusters.find(bc => bc.id === c.id)) // exclude already clicked
      .map(c => this._serializeCluster(c))
      .join('\n\n');

    const declaredCluster = window.behaviour.declaredCluster
      ? `DECLARED CLUSTER: "${window.behaviour.declaredCluster}" — weight all steps toward this context.`
      : '';

    const prompt = `You are recalibrating a ClusterOS visitor pathway based on new signals. References must be specific — name real clusters, cite real data points.

ORIGINAL STALL: ${this.stallName}
${this.stack ? 'STACK: ' + this.stack.name : ''}
RECALIBRATION TRIGGER: ${reason}
COMPLETED STEPS SO FAR: ${this.currentStep} of 5
${declaredCluster}

CLUSTERS THEY HAVE EXPLORED:
${clickedClusters || 'None clicked yet.'}

ADDITIONAL MATCHED CLUSTERS NOT YET SEEN:
${freshEvidence || 'None.'}

The visitor has ${reason === 'cluster_exploration'
  ? 'gone deeper into cluster evidence than predicted. Rewrite the remaining steps to follow that depth — more specific cluster comparisons, more precise leverage.'
  : 'declared their specific cluster. Reframe remaining steps around that cluster context — compare it explicitly to the matched clusters above.'
}

Rewrite steps ${this.currentStep + 2} through 4 only. Keep step 5 unchanged. Every description must name a specific cluster. Return ONLY valid JSON:
{
  "steps": [
    {
      "id": ${this.currentStep + 2},
      "title": "...",
      "description": "One sentence. Specific cluster name + real data point.",
      "target": "one of: evidence, diagnostic, digital, founders, clusters, snapshot",
      "branches": ["science", "clusters"],
      "complete": false
    }
  ],
  "recalibration_note": "One sentence on why the path changed. Under 15 words. Specific."
}`;

    try {
      const response = await fetch(`${window.RAILWAY}/api/intelligence`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt })
      });
      const data   = await response.json();
      const text   = data.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

      // Splice new steps in
      parsed.steps.forEach((newStep, i) => {
        const idx = this.currentStep + 1 + i;
        if (idx < this.steps.length - 1) { // don't overwrite step 5
          this.steps[idx] = newStep;
        }
      });

      this._renderRecalibrationNote(parsed.recalibration_note);
      this._render();
    } catch(e) {
      // silent fail — keep existing pathway
    }
  },

  _fallbackPathway() {
    const science   = STALL_SCIENCE[this.stallName] || {};
    const matched   = this.matchedClusters || [];
    const top       = matched[0];
    const second    = matched[1];

    const step2desc = top
      ? `${top.name} (${top.city}, ${top.country}) shows the ${this.stallName} stall at ${Math.round(((top.stalls||[])[0]?.intensity||0.5)*100)}% intensity — same configuration, already diagnosed.`
      : `Three of the 75 clusters share your configuration. Their stall profiles are already mapped.`;

    const stackDesc = this.stack
      ? `${this.stallName} stacks with ${this.stack.name} — ${second ? second.name + ' shows both active.' : 'single interventions will not break it.'}`
      : `${this.stallName} rarely travels alone. It stacks with ${(science.stacksWith||[]).join(' and ')}.`;

    const leverageDesc = top?.leverage?.hypothesis
      ? `${top.name}'s leverage hypothesis: "${top.leverage.hypothesis.slice(0,120)}${top.leverage.hypothesis.length>120?'…':''}"`
      : science.leverage || 'The point of intervention is almost never where the stall is most visible.';

    this.steps = [
      { id:1, title:'You\'ve named it',        description:`The ${this.stallName} stall appears across ${matched.length > 0 ? matched.length + ' of our closest matches' : '67% of clusters diagnosed'}. It is not unique to yours.`, target:'evidence',   branches:['science','evidence'], complete:true },
      { id:2, title:'See it in the data',      description:step2desc, target:'clusters', branches:['science','evidence'], complete:false },
      { id:3, title:'Understand why it holds', description:stackDesc, target:'diagnostic', branches:['science','architecture','clusters'], complete:false },
      { id:4, title:'Find the leverage',       description:leverageDesc, target:'clusters', branches:['clusters','evidence'], complete:false },
      { id:5, title:'Confirm it in yours',     description:'A snapshot diagnostic takes 4-5 weeks at a fixed price. It tells you whether this configuration is active — and where leverage actually sits.', target:'snapshot', branches:['contact'], complete:false }
    ];
    this.currentStep = 1;
    const opening = top
      ? `${top.name} has been through this. So have ${matched.length - 1} others in the dataset.`
      : `The ${this.stallName} stall is active. It will not respond to strategy.`;
    this._renderOpening(opening);
    this._render();
  },

  // ── RENDERING ─────────────────────────────────────────────

  _showPanel() {
    const panel = document.getElementById('dashboard-panel');
    if (panel) {
      panel.classList.add('open');
      document.body.classList.add('dashboard-open');
      document.getElementById('dashboard-tab')?.classList.remove('visible');
    }
  },

  _updateBar(pill) {
    const input  = document.getElementById('intel-bar-input');
    const submit = document.getElementById('intel-bar-submit');
    const status = document.getElementById('intel-bar-status');
    if (input)  input.style.display  = 'none';
    if (submit) submit.style.display = 'none';
    if (status) {
      status.style.display = 'block';
      const stackMsg = this.stack ? `${this.stack.name} detected` : `${this.stallNames.join(' + ')} stall${this.stallNames.length > 1 ? 's' : ''} detected`;
      status.textContent = stackMsg + ' — building your pathway';
    }
  },

  _renderSkeleton() {
    const body = document.getElementById('dashboard-body');
    if (!body) return;
    body.innerHTML = `
      <div class="db-skeleton">
        <div class="db-skel-line db-skel-wide"></div>
        <div class="db-skel-line db-skel-med"></div>
        <div class="db-skel-gap"></div>
        <div class="db-skel-line db-skel-wide"></div>
        <div class="db-skel-line db-skel-narrow"></div>
        <div class="db-skel-gap"></div>
        <div class="db-skel-line db-skel-wide"></div>
        <div class="db-skel-line db-skel-med"></div>
      </div>`;
  },

  _renderOpening(text) {
    const el = document.getElementById('dashboard-opening');
    if (el && text) {
      el.textContent = text;
      el.style.display = 'block';
    }
    // Show stack callout if detected
    if (this.stack) {
      const header = document.querySelector('.db-header');
      if (header && !document.getElementById('db-stack-callout')) {
        const callout = document.createElement('div');
        callout.id = 'db-stack-callout';
        callout.style.cssText = 'margin-top:0.8rem;padding:0.7rem 0.8rem;background:rgba(200,240,208,0.2);border-left:2px solid var(--signal);font-size:11px;color:var(--ink-dim);line-height:1.5;';
        callout.innerHTML = `<strong style="font-family:var(--font-mono);font-size:10px;color:var(--green);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:3px">${this.stack.name}</strong>${this.stack.description}`;
        header.appendChild(callout);
      }
    }
  },

  _renderRecalibrationNote(note) {
    const el = document.getElementById('dashboard-recal');
    if (el && note) {
      el.textContent  = 'Pathway updated: ' + note;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
  },

  _renderBranchState(branchId) {
    const el = document.getElementById('dashboard-branch-note');
    const labels = {
      science:      'Exploring the science →',
      architecture: 'Exploring the architecture →',
      clusters:     'Exploring cluster profiles →',
      evidence:     'Exploring the evidence →'
    };
    if (el) {
      el.textContent  = labels[branchId] || 'Exploring →';
      el.style.display = 'block';
    }
  },

  _render() {
    const body = document.getElementById('dashboard-body');
    if (!body || !this.steps.length) return;

    // Hide branch note
    const branchNote = document.getElementById('dashboard-branch-note');
    if (branchNote) branchNote.style.display = 'none';

    const BRANCH_LABELS = {
      science:      'The science of stalls',
      architecture: 'How it\'s built',
      clusters:     'See matching clusters',
      evidence:     'The evidence base',
      contact:      'Speak to Andrew'
    };

    body.innerHTML = this.steps.map((step, i) => {
      const isCurrent  = i === this.currentStep && !step.complete;
      const isComplete = step.complete;
      const isAhead    = !isComplete && !isCurrent;

      const stateClass = isComplete ? 'step-complete' : isCurrent ? 'step-current' : 'step-ahead';
      const icon       = isComplete ? '✓' : isCurrent ? '●' : String(step.id);

      const branches = (step.branches || []).map(b =>
        `<button class="db-branch" onclick="dashboard._takeBranch('${b}')">${BRANCH_LABELS[b] || b} →</button>`
      ).join('');

      const continueBtn = isCurrent
        ? `<button class="db-continue" onclick="dashboard.advanceStep()">Continue →</button>`
        : '';

      return `
        <div class="db-step ${stateClass}">
          <div class="db-step-head">
            <span class="db-step-icon">${icon}</span>
            <span class="db-step-title">${step.title}</span>
          </div>
          ${isCurrent || isComplete ? `<p class="db-step-desc">${step.description}</p>` : ''}
          ${isCurrent && branches ? `<div class="db-branches"><span class="db-branches-label">Go deeper</span>${branches}</div>` : ''}
          ${continueBtn}
        </div>`;
    }).join('');
  },

  _takeBranch(branchId) {
    behaviour.recordBranch(branchId);
    const actions = {
      science:      () => window.openPanel && window.openPanel('diagnostic'),
      architecture: () => window.openPanel && window.openPanel('digital'),
      clusters:     () => window.openSimilarClusters && window.openSimilarClusters(),
      evidence:     () => window.openPanel && window.openPanel('evidence'),
      contact:      () => { window.location.href = 'mailto:andrew@communitylab.app?subject=ClusterOS%20conversation'; }
    };
    if (actions[branchId]) actions[branchId]();
    this._renderBranchState(branchId);
  }
};

window.dashboard = dashboard;

// ── OPENING QUESTION & PILLS ──────────────────────────────
function initOpeningQuestion() {
  const input = document.getElementById('intel-bar-input');
  if (input) {
    input.placeholder = 'Name your cluster, or pick what your ecosystem keeps doing below';
  }

  const bar = document.getElementById('intel-bar');
  if (!bar) return;

  const pillsEl = document.createElement('div');
  pillsEl.id = 'intel-pills';
  pillsEl.innerHTML = `
    <div class="pills-label">Your ecosystem keeps… <span id="pills-hint" style="color:var(--green);margin-left:8px;display:none">Pick all that apply</span></div>
    <div class="pills-row">
      ${PILLS.map(p =>
        `<button class="pill" data-key="${p.key}">${p.label}</button>`
      ).join('')}
      <button class="pill pill-other" data-key="other">Something else →</button>
    </div>
    <div id="pills-commit-row" style="display:none;margin-top:0.6rem;">
      <button id="pills-commit">Build my pathway →</button>
      <span id="pills-stack-preview" style="font-family:var(--font-mono);font-size:10px;color:var(--green);margin-left:12px;text-transform:uppercase;letter-spacing:0.08em;"></span>
    </div>`;

  bar.parentNode.insertBefore(pillsEl, bar);

  // Add commit button style
  const style = document.createElement('style');
  style.textContent = '#pills-commit{background:var(--green);color:#fff;border:none;font-family:var(--font-mono);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;padding:6px 16px;cursor:pointer;transition:background 0.15s;}#pills-commit:hover{background:var(--green-dim);}';
  document.head.appendChild(style);

  const commitRow  = document.getElementById('pills-commit-row');
  const commitBtn  = document.getElementById('pills-commit');
  const stackPrev  = document.getElementById('pills-stack-preview');
  const hint       = document.getElementById('pills-hint');

  // Wire up pills — multi-select
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'other') {
        document.getElementById('intel-bar-input')?.focus();
        return;
      }
      btn.classList.toggle('selected');
      behaviour.togglePill(key);

      const selected = behaviour.selectedPills;
      if (selected.length === 0) {
        commitRow.style.display = 'none';
        hint.style.display = 'none';
        stackPrev.textContent = '';
      } else {
        commitRow.style.display = 'block';
        hint.style.display = 'inline';
        // Preview stack if detectable
        const stalls = selected.map(k => window.PILL_STALLS[k]?.stall).filter(Boolean);
        const stack  = behaviour._detectStack(stalls);
        stackPrev.textContent = stack ? stack.name + ' detected' : '';
      }
    });
  });

  // Commit
  commitBtn?.addEventListener('click', () => {
    if (!behaviour.selectedPills.length) return;
    pillsEl.classList.add('dismissed');
    behaviour.commitPills();
  });
}

// ── SIMILAR CLUSTERS PANEL ────────────────────────────────
function buildClusterCards(clusters) {
  if (!clusters.length) return '<p style="color:var(--ink-muted);font-style:italic;font-size:14px;">No matching clusters found.</p>';

  return '<div class="clusters-grid">' + clusters.map(c => {
    const topStalls = (c.stalls || [])
      .sort((a,b) => (b.intensity||0) - (a.intensity||0))
      .slice(0, 3);

    const stallsHtml = topStalls.map(s => {
      const w   = Math.round((s.intensity||0.3) * 80);
      const col = (s.intensity||0) > 0.65 ? '#d4695a' : (s.intensity||0) > 0.4 ? '#d4a94a' : '#2a7a4f';
      return `<div class="cmc-stall-row">
        <div class="cmc-stall-bar" style="width:${w}px;background:${col}"></div>
        <span class="cmc-stall-name">${s.name}</span>
      </div>`;
    }).join('');

    const leverage = c.leverage?.hypothesis
      ? `<p class="cmc-leverage">"${c.leverage.hypothesis.slice(0,120)}${c.leverage.hypothesis.length > 120 ? '…' : ''}"</p>`
      : '';

    const slug = c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return `<a class="cluster-match-card" href="/clusters/${slug}.html">
      <div class="cmc-name">${c.name}</div>
      <div class="cmc-meta">${c.city || ''} · ${c.country || ''}</div>
      <span class="cmc-regime ${c.regime||'emerging'}">${c.regime||'emerging'}</span>
      <div class="cmc-stalls">${stallsHtml}</div>
      ${leverage}
      <span class="cmc-link">Full profile →</span>
    </a>`;
  }).join('') + '</div>';
}

window.openSimilarClusters = function() {
  const b = window.behaviour;

  // Prefer pre-computed matches from the dashboard; fall back to re-scoring
  let scored = [];
  if (window.dashboard?.matchedClusters?.length) {
    // Use pre-computed matches — already scored against declared stalls
    scored = window.dashboard.matchedClusters.slice(0, 6);
  } else {
    const allClusters = window._allClusters || [];
    if (!allClusters.length) {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const targetStalls = new Set();
    if (b.declaredStalls?.length) b.declaredStalls.forEach(s => targetStalls.add(s));
    b.clusters.forEach(c => { if (c.topStall) targetStalls.add(c.topStall); });

    const ALIASES = {
      'Narrating':'narrat','Coordinating':'coordinat','Re-proving':'re-prov',
      'Scaling':'scal','Mediating':'mediat','Extracting':'extract',
      'Forgiving':'forgiv','Stabilising':'stabilis','Waiting':'wait'
    };
    scored = allClusters.map(c => {
      const names = (c.stalls||[]).map(s => s.name.toLowerCase());
      let score = 0;
      targetStalls.forEach(t => {
        const alias = ALIASES[t] || t.toLowerCase();
        if (names.some(n => n.includes(alias))) score += 1;
      });
      return { cluster: c, score };
    })
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0,6)
    .map(x => x.cluster);
  }

  // Update panel content
  const title = document.getElementById('clusters-panel-title');
  const intro = document.getElementById('clusters-panel-intro');
  const grid  = document.getElementById('clusters-panel-grid');

  if (title) {
    const stallList = Array.from(targetStalls).slice(0,2).join(' + ');
    title.textContent = stallList
      ? `Clusters with active ${stallList} stalls`
      : 'Clusters with similar configurations';
  }
  if (intro && b.stack) {
    intro.textContent = `These clusters share the ${b.stack.name}. Each has been through the full 5-stage diagnostic — stalls, stacks, and leverage hypotheses are live data.`;
  }
  if (grid) grid.innerHTML = buildClusterCards(scored);

  // Open the panel
  if (window.openPanel) window.openPanel('clusters');
};

// ── BOOT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initOpeningQuestion();
});
