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
  async init(pillKey) {
    this.active   = true;
    this.pillKey  = pillKey;
    const pill    = PILLS.find(p => p.key === pillKey);
    this.stallName = pill?.stall || null;

    // Show panel with skeleton
    this._showPanel();
    this._renderSkeleton();

    // Update bar
    this._updateBar(pill);

    // Generate initial pathway via Claude
    await this._generatePathway();

    // Open recommended entry fork
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

  async _generatePathway() {
    const science = STALL_SCIENCE[this.stallName];
    const prompt = `You are generating a personalised learning pathway for the ClusterOS diagnostic platform.

VISITOR DECLARED: "${PILLS.find(p => p.key === this.pillKey)?.label}"
THIS MAPS TO: The ${this.stallName} stall — ${science?.definition || ''}
STACKS WITH: ${science?.stacksWith?.join(', ') || 'unknown'}
LEVERAGE DIRECTION: ${science?.leverage || 'unknown'}

THE PLATFORM HAS:
- A map of 75 diagnosed clusters worldwide (with full stall, stack, and leverage data)
- Four content panels: Evidence (what 75 diagnostics found), Diagnostic (how the 5-stage pipeline works), Architecture (MCP tech layer), Founders (B&H background and credibility)
- Individual cluster profile pages with radar charts
- A snapshot diagnostic product (4-5 weeks, fixed price)

Generate a 5-step pathway for this visitor. Each step should reveal one layer of the ClusterOS intellectual framework — stalls, stacks, leverage — through their specific problem. Step 1 is always completing (they just declared). Step 5 is always the diagnostic conversation.

Return ONLY valid JSON in this exact structure, no markdown, no explanation:
{
  "opening": "A single sharp sentence that names their stall and makes them feel seen. Under 20 words. No em-dashes.",
  "steps": [
    {
      "id": 1,
      "title": "Short title (3-5 words)",
      "description": "One sentence — what they will understand after this step. Specific to their stall.",
      "target": "one of: evidence, diagnostic, digital, founders, map, clusters, contact, snapshot",
      "branches": ["science", "evidence", "architecture"],
      "complete": true
    },
    {
      "id": 2,
      "title": "...",
      "description": "...",
      "target": "...",
      "branches": ["science", "evidence"],
      "complete": false
    },
    {
      "id": 3,
      "title": "...",
      "description": "...",
      "target": "...",
      "branches": ["science", "architecture", "clusters"],
      "complete": false
    },
    {
      "id": 4,
      "title": "...",
      "description": "...",
      "target": "...",
      "branches": ["clusters", "evidence"],
      "complete": false
    },
    {
      "id": 5,
      "title": "Confirm it in yours",
      "description": "A snapshot diagnostic takes 4-5 weeks at a fixed price. It tells you whether this is what is happening — and where leverage exists.",
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
      const data = await response.json();
      const text = data.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      this.steps        = parsed.steps;
      this.currentStep  = 1; // step 1 already complete
      this._renderOpening(parsed.opening);
      this._render();
    } catch(e) {
      // Fallback pathway
      this._fallbackPathway();
    }
  },

  async _recalibrate(reason) {
    const stepsAhead = this.steps.slice(this.currentStep + 1);
    const clusters   = window.behaviour.clusters.map(c => c.name).join(', ');
    const prompt = `You are recalibrating a ClusterOS visitor pathway.

ORIGINAL STALL: ${this.stallName}
RECALIBRATION TRIGGER: ${reason}
CLUSTERS VISITED: ${clusters || 'none'}
COMPLETED STEPS: ${this.currentStep} of 5
STEPS AHEAD WERE: ${stepsAhead.map(s => s.title).join(', ')}

The visitor has ${reason === 'cluster_exploration' ? 'been exploring specific clusters on the map — they are going deeper into evidence than the pathway predicted' : 'declared their specific cluster — this is now the primary framing context'}.

Rewrite steps ${this.currentStep + 2} to 4 only (keep step 5 as the diagnostic). Return ONLY valid JSON:
{
  "steps": [
    {
      "id": ${this.currentStep + 2},
      "title": "...",
      "description": "...",
      "target": "one of: evidence, diagnostic, digital, founders, map, clusters, contact, snapshot",
      "branches": ["science", "clusters"],
      "complete": false
    }
  ],
  "recalibration_note": "One sentence explaining why the path changed. Under 15 words."
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
    const science = STALL_SCIENCE[this.stallName] || {};
    this.steps = [
      { id:1, title:'You\'ve named it',        description:`The ${this.stallName} stall appears in 67% of clusters we\'ve diagnosed. It is not unique to yours.`, target:'evidence',   branches:['science','evidence'], complete:true },
      { id:2, title:'See it in the data',      description:'Three of the 75 clusters share your configuration. Their stall profiles are already mapped.', target:'map',        branches:['science','evidence'], complete:false },
      { id:3, title:'Understand why it holds', description:`${this.stallName} rarely travels alone. It stacks with ${(science.stacksWith||[]).join(' and ')}.`, target:'diagnostic', branches:['science','architecture','clusters'], complete:false },
      { id:4, title:'Find the leverage',       description:science.leverage || 'The point of intervention is almost never where the stall is most visible.', target:'clusters',   branches:['clusters','evidence'], complete:false },
      { id:5, title:'Confirm it in yours',     description:'A snapshot diagnostic takes 4-5 weeks at a fixed price. It tells you whether this is what is happening — and where leverage exists.', target:'snapshot', branches:['contact'], complete:false }
    ];
    this.currentStep = 1;
    this._renderOpening(`The ${this.stallName} stall is active. It will not respond to strategy.`);
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
      status.textContent   = `${pill?.stall || 'Stall'} detected — building your pathway`;
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
      clusters:     () => document.getElementById('map')?.scrollIntoView({ behavior:'smooth' }),
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
  // Replace bar placeholder with question and render pills above bar
  const input = document.getElementById('intel-bar-input');
  if (input) {
    input.placeholder = 'What does your ecosystem keep doing instead of progressing?';
  }

  // Render pills strip above bar
  const bar = document.getElementById('intel-bar');
  if (!bar) return;

  const pillsEl = document.createElement('div');
  pillsEl.id = 'intel-pills';
  pillsEl.innerHTML = `
    <div class="pills-label">Your ecosystem keeps…</div>
    <div class="pills-row">
      ${PILLS.map(p =>
        `<button class="pill" data-key="${p.key}">${p.label}</button>`
      ).join('')}
      <button class="pill pill-other" data-key="other">Something else →</button>
    </div>`;

  bar.parentNode.insertBefore(pillsEl, bar);

  // Wire up pills
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'other') {
        // Just focus the text input
        document.getElementById('intel-bar-input')?.focus();
        return;
      }
      // Mark pill selected
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // Dismiss pills after short delay
      setTimeout(() => {
        pillsEl.classList.add('dismissed');
      }, 600);
      // Fire
      behaviour.declareProblem(key);
    });
  });
}

// ── BOOT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initOpeningQuestion();
});
