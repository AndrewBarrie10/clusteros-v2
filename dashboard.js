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


// ── PATHWAY SCRIPTS ───────────────────────────────────────
// One script per visitor frame. Each defines:
//   opening    — first bar line (makes them feel seen)
//   beats[]    — sequence of {observation, invitations[]}
//   cta        — final action
// Invitations: { label, action } where action is a function name or url

const PATHWAY_SCRIPTS = {

  steward: {
    opening: "Most strategies don't fail at execution. They fail because the structural blocker was never named.",
    beats: [
      {
        title: 'You named it',
        observation: null, // opening beat — invitations only
        invitations: [
          { label: "The same patterns, everywhere →",  action: "page:findings.html" },
          { label: "Why your diagnosis keeps failing →", action: "page:ln-13-diagnosis.html" },
          { label: "Show me a cluster →",               action: "action:map" }
        ]
      },
      {
        title: 'The pattern',
        observation: "The leverage point is almost never where the stall is most visible.",
        invitations: [
          { label: "What leverage actually looks like →", action: "page:leverage.html" },
          { label: "Walk me through the diagnostic →",    action: "page:diagnostic.html" },
          { label: "The Narrative × Activity stack →",    action: "page:ln-10-narrative-activity-stack.html" }
        ]
      },
      {
        title: 'The mechanism',
        observation: "A single intervention rarely breaks a stack. Two levers, applied in sequence, usually do.",
        invitations: [
          { label: "See the stall science →",   action: "page:notes.html" },
          { label: "What does it cost? →",      action: "page:pricing.html" }
        ]
      },
      {
        title: 'What changes it',
        observation: null,
        invitations: [
          { label: "Request a snapshot diagnostic →", action: "page:request.html" },
          { label: "Speak to Andrew →",               action: "action:email:Steward conversation" }
        ]
      }
    ]
  },

  digital: {
        title: 'Take action',
    opening: "This isn't a community platform with AI features added. The architecture is the product.",
    beats: [
      {
        title: 'The architecture',
        observation: null,
        invitations: [
          { label: "How the intelligence layer works →", action: "page:digital-infrastructure.html" },
          { label: "Four actors. One system. →",         action: "page:signals-systems.html" },
          { label: "Why not a dashboard? →",             action: "page:ln-13-diagnosis.html" }
        ]
      },
      {
        title: 'How it works',
        observation: "The key design decision is where intelligence lives — in the interface, or in the protocol. Those produce completely different systems.",
        invitations: [
          { label: "The MCP substrate →",          action: "page:digital-infrastructure.html" },
          { label: "How actor journeys are built →", action: "page:signals-systems.html" },
          { label: "The data model →",              action: "page:data.html" }
        ]
      },
      {
        title: 'Why not a dashboard',
        observation: "Every actor experience is generated at runtime from live data. Nothing is hardcoded into the interface.",
        invitations: [
          { label: "How we've built this before →", action: "page:about.html" },
          { label: "Platform pricing →",            action: "page:pricing.html" }
        ]
      },
      {
        title: 'The model',
        observation: null,
        invitations: [
          { label: "Talk to Andrew about the architecture →", action: "action:email:Architecture conversation" }
        ]
      }
    ]
  },

  investor: {
        title: 'Talk to us',
    opening: "The ecosystem a company operates in predicts its trajectory. Most investors don't have a way to read it.",
    beats: [
      {
        title: 'The signal gap',
        observation: null,
        invitations: [
          { label: "What 75 diagnostics actually found →", action: "page:findings.html" },
          { label: "The structured dataset →",             action: "page:data.html" },
          { label: "What regime type predicts →",          action: "page:ln-05-incumbents.html" }
        ]
      },
      {
        title: 'What the data shows',
        observation: "Cycling ecosystems and anchored ecosystems produce different company trajectories. The difference is structural, not sectoral.",
        invitations: [
          { label: "How extracting without reinvesting works →", action: "page:ln-08-extracting.html" },
          { label: "What the leverage data shows →",             action: "page:leverage.html" },
          { label: "See the cluster map →",                      action: "action:map" }
        ]
      },
      {
        title: 'Reading regime type',
        observation: "The question isn't whether an ecosystem is active. It's whether activity is converting to structural change.",
        invitations: [
          { label: "How a diagnostic works →",  action: "page:diagnostic.html" },
          { label: "Pricing and access →",      action: "page:pricing.html" }
        ]
      },
      {
        title: 'The evidence',
        observation: null,
        invitations: [
          { label: "Request a cluster diagnostic →", action: "page:request.html" },
          { label: "Speak to Andrew →",              action: "action:email:Investor conversation" }
        ]
      }
    ]
  },

  consultant: {
        title: 'Next step',
    opening: "The strategy isn't the problem. The structural blocker that makes strategies irrelevant is.",
    beats: [
      {
        title: 'The real problem',
        observation: null,
        invitations: [
          { label: "Why diagnosis keeps failing →",     action: "page:ln-13-diagnosis.html" },
          { label: "What a diagnostic produces →",      action: "page:diagnostic.html" },
          { label: "The validation deadlock →",         action: "page:ln-11-validation-deadlock.html" }
        ]
      },
      {
        title: 'The stall layer',
        observation: "Most consultants diagnose at the wrong layer. The stall is behavioural — but it looks structural from the outside.",
        invitations: [
          { label: "The 9 stall types →",           action: "page:notes.html" },
          { label: "What leverage looks like →",    action: "page:leverage.html" },
          { label: "Coordinating instead of deciding →", action: "page:ln-01-coordinating.html" }
        ]
      },
      {
        title: 'What a diagnostic is',
        observation: "A diagnostic names the blocker in a way a strategy can't. That's a different kind of deliverable.",
        invitations: [
          { label: "Three ways in →",         action: "page:pricing.html" }
        ]
      },
      {
        title: 'The deliverable',
        observation: null,
        invitations: [
          { label: "Talk to Andrew about using this in an engagement →", action: "action:email:Consultant conversation" }
        ]
      }
    ]
  },

  anchor: {
        title: 'Work together',
    opening: "Anchors generate more signal than any other actor in an ecosystem. Most of it disappears.",
    beats: [
      {
        title: 'Signal disappears',
        observation: null,
        invitations: [
          { label: "Four actors. One system. →",         action: "page:signals-systems.html" },
          { label: "How signals cascade →",              action: "page:signals-systems.html" },
          { label: "What extracting without reinvesting looks like →", action: "page:ln-08-extracting.html" }
        ]
      },
      {
        title: 'How it changes',
        observation: "The same procurement signal reaches a founder, a researcher, and a steward — but each sees a completely different surface. That's not broadcast. That's coordination.",
        invitations: [
          { label: "The intelligence layer →",     action: "page:digital-infrastructure.html" },
          { label: "What mediating instead of coupling costs →", action: "page:ln-06-mediating.html" },
          { label: "See the cluster data →",        action: "page:data.html" }
        ]
      },
      {
        title: 'What you get back',
        observation: "The platform doesn't ask anchors to behave differently. It changes what their existing behaviour produces.",
        invitations: [
          { label: "How it's priced →",           action: "page:pricing.html" }
        ]
      },
      {
        title: 'The infrastructure',
        observation: null,
        invitations: [
          { label: "Request a diagnostic of your cluster →", action: "page:request.html" },
          { label: "Speak to Andrew →",                      action: "action:email:Anchor conversation" }
        ]
      }
    ]
  },

  politician: {
        title: 'Take action',
    opening: "Economic transformation stalls for structural reasons, not political ones. The blockers are nameable — and that changes what's possible.",
    beats: [
      {
        title: 'Structural reasons',
        observation: null,
        invitations: [
          { label: "Why effort fails to compound →",    action: "page:notes.html" },
          { label: "The same patterns, everywhere →",  action: "page:findings.html" },
          { label: "What stabilising around incumbents looks like →", action: "page:ln-05-incumbents.html" }
        ]
      },
      {
        title: 'What the data shows',
        observation: "The clusters that transformed fastest weren't the best resourced. They had the clearest diagnosis of what was holding them back.",
        invitations: [
          { label: "What leverage actually looks like →", action: "page:leverage.html" },
          { label: "Waiting for permission →",            action: "page:ln-09-permission.html" },
          { label: "See the evidence →",                  action: "page:data.html" }
        ]
      },
      {
        title: 'What it produces',
        observation: "A diagnostic doesn't produce a report. It produces a named, evidenced intervention point — something you can act on and explain publicly.",
        invitations: [
          { label: "How it works →",    action: "page:diagnostic.html" },
          { label: "What it costs →",   action: "page:pricing.html" }
        ]
      },
      {
        title: 'The policy lever',
        observation: null,
        invitations: [
          { label: "Request a diagnostic briefing →", action: "page:request.html" },
          { label: "Speak to Andrew →",               action: "action:email:Political briefing" }
        ]
      }
    ]
  },

  government: {
        title: 'Get a briefing',
    opening: "EDA investment without diagnostic infrastructure is flying blind. You're funding activity. That's not the same as funding outcomes.",
    beats: [
      {
        title: 'Flying blind',
        observation: null,
        invitations: [
          { label: "What the platform surfaces for stewards →", action: "page:signals-systems.html" },
          { label: "How clusters are compared →",               action: "page:findings.html" },
          { label: "The 75-cluster evidence base →",            action: "page:data.html" }
        ]
      },
      {
        title: 'The right question',
        observation: "The question isn't whether your EDAs are active. It's whether activity is converting to structural change. Those require different measurements.",
        invitations: [
          { label: "How health signals work →",         action: "page:diagnostic.html" },
          { label: "What leverage hypotheses surface →", action: "page:leverage.html" },
          { label: "Re-proving instead of narrowing →",  action: "page:ln-04-reproving.html" }
        ]
      },
      {
        title: 'Comparing clusters',
        observation: "A sovereign database means your EDA's data stays jurisdictional. The intelligence layer improves centrally. The data never leaves the region.",
        invitations: [
          { label: "The infrastructure model →",  action: "page:digital-infrastructure.html" },
          { label: "Procurement and pricing →",   action: "page:pricing.html" }
        ]
      },
      {
        title: 'The infrastructure',
        observation: null,
        invitations: [
          { label: "Request a policy briefing →", action: "page:request.html" },
          { label: "Speak to Andrew →",           action: "action:email:Government procurement conversation" }
        ]
      }
    ]
  },

  unknown: {
        title: 'Next step',
    opening: "75 clusters diagnosed. 18 countries. The same 9 behavioural patterns appear everywhere — regardless of sector, geography, or funding.",
    beats: [
      {
        title: 'The finding',
        observation: null,
        invitations: [
          { label: "The finding that surprised us most →", action: "page:findings.html" },
          { label: "Why diagnosis keeps failing →",        action: "page:ln-13-diagnosis.html" },
          { label: "Explore the clusters →",               action: "action:map" }
        ]
      },
      {
        title: 'The pattern',
        observation: "Every cluster thinks its situation is unique. The structural patterns say otherwise.",
        invitations: [
          { label: "The 9 stall types →",         action: "page:notes.html" },
          { label: "What leverage looks like →",  action: "page:leverage.html" },
          { label: "The intelligence layer →",    action: "page:digital-infrastructure.html" }
        ]
      },
      {
        observation: null,
        invitations: [
          { label: "See how it's priced →",          action: "page:pricing.html" },
          { label: "Request a diagnostic →",          action: "page:request.html" },
          { label: "Speak to Andrew →",               action: "action:email:ClusterOS conversation" }
        ]
      }
    ]
  }
};

// ── FRAME CLASSIFIER ──────────────────────────────────────
// Classifies gate input into a frame key.
// Returns { frame, confidence, signal }
async function classifyFrame(text) {
  const prompt = `You are classifying a visitor to the ClusterOS platform based on their self-description.

VISITOR SAID: "${text}"

Classify them into exactly one of these frames:
- steward       (EDA lead, cluster manager, innovation agency director)
- digital       (head of digital, CTO, technical architect, developer)
- investor      (VC, fund manager, growth equity, angel, analyst)
- consultant    (strategy consultant, advisor, researcher hired to advise)
- anchor        (university, NHS, large employer, anchor institution representative)
- politician    (elected official, minister, councillor, political advisor)
- government    (civil servant, policy officer, government buyer, public sector procurement)
- unknown       (anything else, or too ambiguous to classify)

Return ONLY valid JSON, no markdown:
{"frame":"steward","confidence":"high","signal":"EDA director, ecosystem not working"}`;

  try {
    const response = await fetch(`${window.RAILWAY}/api/intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    const text2 = (data.text || '').replace(/```json|```/g, '').trim();
    return JSON.parse(text2);
  } catch(e) {
    return { frame: 'unknown', confidence: 'low', signal: '' };
  }
}

// ── DASHBOARD STATE ───────────────────────────────────────
const dashboard = {
  active:        false,
  pillKey:       null,
  stallName:     null,
  steps:         [],
  currentStep:   0,
  inBranch:      false,
  currentBranch: null,

  // ── INIT FROM FREE TEXT ─────────────────────────────────
  async initFromFreeText(text) {
    this.active   = true;
    this.freeText = text;
    this.frame    = null;

    // Classify frame silently in background
    // journey.start() already called by pathway submit handler
    const classification = await classifyFrame(text);
    this.frame  = classification.frame  || 'unknown';
    this.signal = classification.signal || '';

    // Update bar label once classification is done
    const status = document.getElementById('intel-bar-status');
    if (status && status.style.display !== 'none') {
      status.textContent = this._frameLabel(this.frame) + ' pathway';
    }
    document.getElementById('briefing-btn')?.classList.add('visible');
  },

  _defaultTitle(index, total) {
    const defaults = ['Opening', 'Explore', 'Go deeper', 'Understand the system', 'Take action'];
    return defaults[index] || 'Continue';
  },

  _frameLabel(frame) {
    const labels = {
      steward: 'Steward', digital: 'Head of Digital', investor: 'Investor',
      consultant: 'Consultant', anchor: 'Anchor Institution',
      politician: 'Politician', government: 'Government', unknown: 'Explorer'
    };
    return labels[frame] || 'Explorer';
  },

  _renderFrameLabel(frame) {
    const label = document.querySelector('.db-label');
    if (label) {
      label.textContent = 'Your pathway · ' + this._frameLabel(frame);
    }
  },

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

  // ── SHARED PATHWAY JSON SPEC ─────────────────────────────
  _pathwayJsonSpec() {
    return `STRICT RULES:
- Every description is EXACTLY one sentence. Maximum 25 words. No exceptions.
- Name a real cluster from the matched data in steps 2, 3, and 4.
- No hedging. No "suggests", "may", "often". State facts.
- No em-dashes. No semicolons. Short, direct, specific.

Return ONLY valid JSON, no markdown:
{
  "opening": "One sentence. Name a real cluster if possible. Make the visitor feel seen. Under 18 words. No em-dashes.",
  "steps": [
    { "id": 1, "title": "3-4 words", "description": "Name the stall and a prevalence number. Max 25 words.", "target": "evidence", "branches": ["science","evidence"], "complete": true },
    { "id": 2, "title": "3-4 words", "description": "Name a real matched cluster with a specific data point. Max 25 words.", "target": "clusters", "branches": ["science","evidence"], "complete": false },
    { "id": 3, "title": "3-4 words", "description": "Name the stack and which clusters share it. Max 25 words.", "target": "diagnostic", "branches": ["science","architecture","clusters"], "complete": false },
    { "id": 4, "title": "3-4 words", "description": "State the leverage entry point from a named cluster. Max 25 words.", "target": "clusters", "branches": ["clusters","evidence"], "complete": false },
    { "id": 5, "title": "Confirm it in yours", "description": "A snapshot diagnostic takes 4-5 weeks at a fixed price and tells you where leverage sits in your ecosystem.", "target": "snapshot", "branches": ["contact"], "complete": false }
  ]
}`;
  },

  // ── CLUSTER MATCHING ─────────────────────────────────────
  // Run before pathway generation. Returns top N clusters scored
  // against declared stalls, with full diagnostic data serialised.

  _matchClusters(limit = 4) {
    const all = window._allClusters || [];
    if (!all.length) return [];

    const targetStalls = this.stallNames.map(s => s.toLowerCase());

    // Keys are canonical stall names (from STALL_SCIENCE / pills).
    // Values are substrings that appear in the actual cluster data stall names.
    // Actual names: "Narrating instead of testing", "Re-proving instead of narrowing",
    // "Coordinating instead of deciding", "Mediating instead of coupling",
    // "Scaling activity instead of throughput", "Extracting without reinvesting",
    // "Stabilising around incumbents", "Stabilizing around incumbents", "Waiting for permission"
    const STALL_ALIASES = {
      'narrating':    ['narrating instead'],
      'coordinating': ['coordinating instead'],
      're-proving':   ['re-proving instead'],
      'scaling':      ['scaling activity'],
      'mediating':    ['mediating instead'],
      'extracting':   ['extracting without'],
      'forgiving':    ['forgiving instead'],
      'stabilising':  ['stabilising around', 'stabilizing around'],
      'waiting':      ['waiting for'],
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

STRICT RULES:
- Every description is EXACTLY one sentence. Maximum 25 words. No exceptions.
- Name a real cluster from the matched data in steps 2, 3, and 4.
- No hedging. No "suggests", "may", "often". State facts.
- No em-dashes. No semicolons. Short, direct, specific.

Step 1 (complete): Name the stall. State how many of the 75 clusters show it. One sentence.
Step 2: Name one matched cluster + one specific data point (stall intensity % or regime). One sentence.
Step 3: Name the stack + which clusters share this combination. One sentence.
Step 4: State the leverage entry point from the best matched cluster's leverage hypothesis. Name the cluster. One sentence.
Step 5: Fixed. "A snapshot diagnostic takes 4-5 weeks at a fixed price and tells you where leverage sits in your ecosystem."

Return ONLY valid JSON, no markdown:
{
  "opening": "One sentence. Name a real cluster from the matched data. Make the visitor feel seen. Under 18 words. No em-dashes.",
  "steps": [
    {
      "id": 1,
      "title": "3-4 words max",
      "description": "EXACTLY one sentence, max 25 words, names the stall and a prevalence number.",
      "target": "evidence",
      "branches": ["science", "evidence"],
      "complete": true
    },
    {
      "id": 2,
      "title": "3-4 words max",
      "description": "EXACTLY one sentence, max 25 words, names a real cluster with a specific data point.",
      "target": "clusters",
      "branches": ["science", "evidence"],
      "complete": false
    },
    {
      "id": 3,
      "title": "3-4 words max",
      "description": "EXACTLY one sentence, max 25 words, names the stack and which clusters share it.",
      "target": "diagnostic",
      "branches": ["science", "architecture", "clusters"],
      "complete": false
    },
    {
      "id": 4,
      "title": "3-4 words max",
      "description": "EXACTLY one sentence, max 25 words, states the leverage entry point from a named cluster.",
      "target": "clusters",
      "branches": ["clusters", "evidence"],
      "complete": false
    },
    {
      "id": 5,
      "title": "Confirm it in yours",
      "description": "A snapshot diagnostic takes 4-5 weeks at a fixed price and tells you where leverage sits in your ecosystem.",
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

Rewrite steps ${this.currentStep + 2} through 4 only. Keep step 5 unchanged. STRICT: every description is exactly one sentence, maximum 25 words, must name a specific cluster. Return ONLY valid JSON:
{
  "steps": [
    {
      "id": ${this.currentStep + 2},
      "title": "3-4 words",
      "description": "EXACTLY one sentence, max 25 words, specific cluster name + data point.",
      "target": "one of: evidence, diagnostic, digital, founders, clusters, snapshot",
      "branches": ["science", "clusters"],
      "complete": false
    }
  ],
  "recalibration_note": "Under 10 words. Specific. No hedging."
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

    body.innerHTML = this.steps.map((step, i) => {
      const isCurrent  = i === this.currentStep && !step.complete;
      const isComplete = step.complete;
      const stateClass = isComplete ? 'step-complete' : isCurrent ? 'step-current' : 'step-ahead';
      const icon       = isComplete ? '✓' : isCurrent ? '●' : String(step.id);

      // Invitations — shown on current step
      const invHtml = (isCurrent && step.invitations?.length)
        ? `<div class="db-invitations">
             ${step.invitations.map(inv =>
               `<button class="db-inv-btn" onclick="dashboard._executeInvitation('${inv.action}',${i})">${inv.label}</button>`
             ).join('')}
           </div>`
        : '';

      // Fallback continue button if no invitations
      const continueBtn = (isCurrent && !step.invitations?.length)
        ? `<button class="db-continue" onclick="dashboard.advanceStep()">Continue →</button>`
        : '';

      const desc = (isCurrent || isComplete) && step.description
        ? `<p class="db-step-desc">${step.description}</p>`
        : '';

      return `
        <div class="db-step ${stateClass}">
          <div class="db-step-head">
            <span class="db-step-icon">${icon}</span>
            <span class="db-step-title">${step.title}</span>
          </div>
          ${desc}${invHtml}${continueBtn}
        </div>`;
    }).join('');
  },

  _executeInvitation(action, stepIndex) {
    if (!action) return;
    if (action.startsWith('page:')) {
      window.open('/' + action.replace('page:', ''), '_blank');
    } else if (action === 'action:map') {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action.startsWith('action:email:')) {
      const subj = action.replace('action:email:', '');
      window.location.href = `mailto:andrew@communitylab.app?subject=${encodeURIComponent(subj)}`;
    }
    // Advance step
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].complete = true;
      if (stepIndex < this.steps.length - 1) this.currentStep = stepIndex + 1;
      this._render();
    }
  },
};

window.dashboard = dashboard;

// ── GATE & ONBOARDING ────────────────────────────────────
function initGate() {
  // Gate removed — entry now via scroll-triggered pathway prompt
  // Kept as no-op for compatibility
}

function initOpeningQuestion() {} // legacy no-op

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
      'Narrating':    ['narrating instead'],
      'Coordinating': ['coordinating instead'],
      'Re-proving':   ['re-proving instead'],
      'Scaling':      ['scaling activity'],
      'Mediating':    ['mediating instead'],
      'Extracting':   ['extracting without'],
      'Forgiving':    ['forgiving instead'],
      'Stabilising':  ['stabilising around', 'stabilizing around'],
      'Waiting':      ['waiting for']
    };
    scored = allClusters.map(c => {
      const names = (c.stalls||[]).map(s => s.name.toLowerCase());
      let score = 0;
      targetStalls.forEach(t => {
        const aliasList = ALIASES[t] || [t.toLowerCase()];
        if (names.some(n => aliasList.some(a => n.includes(a)))) score += 1;
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



// ── BRIEFING GENERATOR ───────────────────────────────────
// Generates a frame-specific one-pager from session data.
// Renders into a hidden print div — visitor prints to PDF.

const briefing = {

  // ── CONTENT TEMPLATES BY FRAME ───────────────────────
  _templates: {

    steward: {
      title:    "Diagnostic Briefing",
      subtitle: "ClusterOS · Structural Diagnosis for Regional Economies",
      sections: [
        { heading: "Why strategy isn't working",
          content: "Development agencies commission strategies. They produce roadmaps, priority sectors, and action plans. Then the cluster keeps doing what it was doing — because the structural blocker was never named. The blocker is not a gap in the strategy. It is a behavioural substitution: the ecosystem doing something observable instead of something harder. ClusterOS calls these stalls." },
        { heading: "What the diagnostic found across 75 clusters",
          content: "75 clusters diagnosed across 18 countries. 9 canonical stall types appear repeatedly — regardless of sector, geography, or funding level. The most common: Coordinating Instead of Deciding (97% frequency), Narrating Instead of Testing (89%), and Re-proving Instead of Narrowing (81%). Stalls rarely travel alone. They form stabilisation stacks that resist single interventions." },
        { heading: "Where leverage sits",
          content: "The leverage point is almost never where the stall is most visible. A coordination stall is rarely fixed by more coordination — it breaks when one actor's constraint changes. A narrating stall breaks when what gets reported changes, not who reports it. A snapshot diagnostic identifies the structural configuration, names the stack, and surfaces a specific leverage hypothesis in 4–5 weeks." },
        { heading: "What a diagnostic produces",
          content: "A structured evidence review across five stages: Evidence → Patterns → Stalls → Stacks → Leverage. Output is a named intervention point — something specific, evidenced, and actionable. Not a strategy. Not a roadmap. A diagnosis." }
      ],
      cta: { text: "Request a Snapshot Diagnostic", url: "/request.html" }
    },

    digital: {
      title:    "Architecture Brief",
      subtitle: "ClusterOS · Coordination Infrastructure for Regional Economies",
      sections: [
        { heading: "What ClusterOS actually is",
          content: "Not a community platform with AI features added. Not a dashboard system. ClusterOS is coordination infrastructure — the infrastructure through which a complex adaptive system of selfish actors generates collective intelligence without being asked to. Its defining purpose: making complexity cheaper to operate." },
        { heading: "The intelligence layer",
          content: "Model Context Protocol (MCP) is the infrastructure. The backend exposes the ecosystem database as a defined set of named tools. The AI calls those tools at runtime to assemble actor experiences from live data, on demand. Intelligence is not hardcoded into the interface — it is reasoned fresh on every call. When the AI model improves, everything the platform produces improves automatically." },
        { heading: "Why not a dashboard",
          content: "Dashboards embed intelligence in code — frozen, role-generic, unable to answer questions nobody designed for. MCP keeps intelligence in the protocol layer — live, role-aware, improving automatically. A dashboard can tell you what happened. An MCP-driven system can tell each actor what it means for them specifically, at the moment they need to know." },
        { heading: "The data model",
          content: "One sovereign database per regional EDA. Supercluster → Cluster → Group → Actor hierarchy. Full role-based access control. Data residency is jurisdictional — it does not leave the region. The intelligence layer improves centrally via model updates. The platform arrives pre-populated via autonomous bots before any actor joins." }
      ],
      cta: { text: "Talk to Andrew about the architecture", url: "mailto:andrew@communitylab.app?subject=Architecture%20conversation" }
    },

    investor: {
      title:    "Ecosystem Health as an Investment Signal",
      subtitle: "ClusterOS · Diagnostic Intelligence for Regional Economies",
      sections: [
        { heading: "The problem with ecosystem-blind investing",
          content: "The ecosystem a company operates in predicts its trajectory more than most investors account for. An anchor-dominated ecosystem extracts talent, IP, and capital rather than circulating it. A cycling ecosystem compounds — early-stage activity converts to scale, relationships convert to transactions, knowledge stays local. Most investors have no instrument for reading this." },
        { heading: "What the data shows",
          content: "75 clusters diagnosed across 18 countries. Regime type — the structural configuration of power and incentive — is the strongest predictor of ecosystem behaviour. Anchored ecosystems show Extracting Without Reinvesting at 73% frequency. Cycling ecosystems show higher founder survival rates and faster time-to-scale. The difference is not sector or geography — it is structural." },
        { heading: "The 9 stall types as investment signals",
          content: "Coordinating Instead of Deciding means no actor will commit to anything — deals stall, partnerships dissolve, nothing closes. Re-proving Instead of Narrowing means the investment case will be remade repeatedly without execution. Scaling Activity Instead of Throughput means the headline numbers are inputs, not outcomes. Each stall type has a predictable effect on portfolio company trajectory." },
        { heading: "What a diagnostic tells you",
          content: "A snapshot diagnostic identifies the structural configuration of a specific cluster, names the active stalls and stacks, and surfaces a leverage hypothesis. For investors, it answers: is this ecosystem structurally capable of producing the outcomes we're backing this company to achieve?" }
      ],
      cta: { text: "Request a cluster diagnostic", url: "/request.html" }
    },

    consultant: {
      title:    "The Diagnostic as a Deliverable",
      subtitle: "ClusterOS · Structural Diagnosis for Regional Economies",
      sections: [
        { heading: "Why strategy engagements don't produce change",
          content: "The strategy is rarely the problem. The structural blocker that makes strategies irrelevant is the problem — and it operates at a layer most strategy engagements don't reach. A Narrating stall means the ecosystem produces reports about progress instead of evidence of change. The strategy becomes another report. Commissioning a better strategy without diagnosing the stall produces a better report that also won't be implemented." },
        { heading: "What a stall is",
          content: "A stall is a behavioural substitution: the system doing something observable instead of something harder. 9 canonical stall types appear across 75 clusters worldwide. They form stabilisation stacks — combinations of two or more stalls that reinforce each other and resist single interventions. The stack is what makes ecosystems feel intractable. A single-stall ecosystem is fixable. A stacked ecosystem needs two levers applied in sequence." },
        { heading: "What the diagnostic produces",
          content: "A structured evidence review across five stages: Evidence → Patterns → Stalls → Stacks → Leverage. Output is a named intervention point — specific, evidenced, and actionable. Delivered in 4–5 weeks at a fixed price. The diagnostic doesn't tell the client what to do. It tells them what is structurally blocking everything they're already trying to do." },
        { heading: "Using ClusterOS in an engagement",
          content: "The diagnostic can be commissioned directly, white-labelled as part of a wider engagement, or used as a scoping instrument before a larger piece of work. The 75-cluster dataset provides comparative context — your client's configuration measured against analogous clusters that have been through the full diagnostic." }
      ],
      cta: { text: "Talk to Andrew about using this in an engagement", url: "mailto:andrew@communitylab.app?subject=Consultant%20conversation" }
    },

    anchor: {
      title:    "What Anchor Participation Actually Produces",
      subtitle: "ClusterOS · Coordination Infrastructure for Regional Economies",
      sections: [
        { heading: "The anchor problem",
          content: "Anchor institutions generate more signal than any other actor in an ecosystem. Most of it disappears. A procurement need goes unmatched. A research output finds no commercial route. A talent pipeline feeds competitors rather than the local cluster. Not because anchors aren't engaged — but because there is no infrastructure to route their signals to the right actors at the right moment." },
        { heading: "How the platform changes this",
          content: "A single event — an anchor posting a procurement RFI — is reframed by the AI for each actor type. A founder sees a specific capability match with a 14-day deadline. A researcher sees two founders who could intermediate their published work. A steward sees a systems-level bridging opportunity with a current score and an intervention available. Same signal. Different intelligence surfaces." },
        { heading: "What anchors get back",
          content: "Capability visibility without premature disclosure. Supply chain intelligence from within the cluster. Research partner matching against live commercial demand. The platform doesn't ask anchors to behave differently — it changes what their existing behaviour produces. Every RFI, every milestone, every connection generates typed signals that make the system more useful for everyone." },
        { heading: "The coordination infrastructure model",
          content: "ClusterOS is not a network platform. It is coordination infrastructure — the infrastructure through which selfish actors generate collective intelligence without being asked to care about the ecosystem. Anchors participate in their own interest. The ecosystem benefits structurally and automatically." }
      ],
      cta: { text: "Request a diagnostic of your cluster", url: "/request.html" }
    },

    politician: {
      title:    "Why Economic Transformation Is So Difficult — and What Changes That",
      subtitle: "ClusterOS · Diagnostic Intelligence for Regional Economies",
      sections: [
        { heading: "The structural answer to a political question",
          content: "Economic transformation stalls for structural reasons, not political ones. The blockers are nameable — behavioural substitutions that operate below the level of strategy. Ecosystems coordinate instead of committing. They narrate progress instead of generating it. They wait for permission instead of moving. These are not culture problems. They are structural configurations that respond to specific interventions." },
        { heading: "What the evidence shows",
          content: "75 clusters diagnosed across 18 countries. The clusters that transformed fastest were not the best resourced — they had the clearest diagnosis of what was holding them back. Removing the right structural blocker produces compounding change. Adding more resource to a stalled system produces more activity, not more outcomes." },
        { heading: "What a diagnostic tells you publicly",
          content: "A diagnostic names the blocker in a way a strategy cannot. It produces a specific, evidenced intervention point — something that can be explained to a board, a minister, or a public audience. Not 'we are investing in the ecosystem.' But 'we identified the specific configuration holding this cluster back, and here is the intervention that addresses it.'" },
        { heading: "The policy lever",
          content: "ClusterOS operates as infrastructure for EDAs — giving stewards the diagnostic capability to identify where intervention will compound, and the platform to coordinate actors around it. A diagnostic commissioned before a significant public investment tells you whether the structural conditions exist for that investment to produce outcomes." }
      ],
      cta: { text: "Request a diagnostic briefing", url: "/request.html" }
    },

    government: {
      title:    "Maximising Return on EDA Investment",
      subtitle: "ClusterOS · Diagnostic Infrastructure for Regional Economies",
      sections: [
        { heading: "The measurement problem",
          content: "EDA investment without diagnostic infrastructure is flying blind. Activity is measurable — meetings held, companies supported, events run. Structural change is not. The question is not whether your EDAs are active. It is whether activity is converting to structural change. Those require different measurements, and most public investment frameworks only have instruments for the first." },
        { heading: "What ClusterOS measures",
          content: "Four health signals per cluster, updated continuously: bridging score (are anchors and founders transacting?), signal velocity (is new information entering the system?), stall intensity (which behavioural substitutions are active?), and leverage position (where would a specific intervention have compounding effect?). These are systems-level measurements — not activity counts." },
        { heading: "How clusters are compared",
          content: "75 clusters diagnosed across 18 countries provide the comparative baseline. Your EDAs' clusters can be positioned against analogous configurations worldwide — same sector, similar regime, comparable maturity. The diagnostic identifies whether a cluster is ahead of, behind, or structurally different from its comparators — and why." },
        { heading: "The procurement model",
          content: "ClusterOS operates as sovereign infrastructure — one dedicated instance per regional EDA. Data residency is jurisdictional; it does not leave the region. The intelligence layer improves centrally via model updates. Platform procurement includes the diagnostic capability, the coordination infrastructure, and the bot network for continuous signal ingestion. Diagnostic runs are available separately as a scoping instrument before platform procurement." }
      ],
      cta: { text: "Request a policy briefing", url: "/request.html" }
    },

    unknown: {
      title:    "ClusterOS — Platform Overview",
      subtitle: "Diagnostic Intelligence for Regional Economies",
      sections: [
        { heading: "What ClusterOS is",
          content: "Coordination infrastructure for regional innovation ecosystems. Not a community platform. Not a dashboard system. ClusterOS gives Economic Development Agencies the diagnostic capability to identify why their clusters stall — and the platform infrastructure to coordinate actors around the intervention." },
        { heading: "What the diagnostic found",
          content: "75 clusters diagnosed across 18 countries. 9 canonical stall types appear regardless of sector, geography, or funding level. Stalls are behavioural substitutions — the ecosystem doing something observable instead of something harder. They form stabilisation stacks that resist single interventions. The diagnosis names the stack and surfaces a specific leverage hypothesis." },
        { heading: "The intelligence layer",
          content: "Model Context Protocol is the infrastructure. Actor experiences are generated at runtime from live data — not hardcoded into an interface. Founders get personalised pathways. Anchors get capability matching. Researchers get demand signal translation. Stewards get structural interrogation. Every selfish action by every actor generates typed signals that make the system more intelligent for everyone else." },
        { heading: "Three ways in",
          content: "A snapshot diagnostic (4–5 weeks, fixed price) identifies the structural configuration of your cluster and surfaces a leverage hypothesis. A full diagnostic run produces the complete five-stage analysis. Platform procurement gives your EDA the full coordination infrastructure — diagnostic capability, actor journeys, signal ingestion, and the sovereign database." }
      ],
      cta: { text: "See how it's priced", url: "/pricing.html" }
    }
  },

  // ── GENERATE ──────────────────────────────────────────
  async generate() {
    const frame  = window.dashboard?.frame || 'unknown';
    const input  = window.behaviour?.freeDescription || '';
    const tmpl   = this._templates[frame] || this._templates.unknown;

    // Build the print HTML
    const sectionsHtml = tmpl.sections.map(s => `
      <div class="bp-section">
        <h3 class="bp-section-heading">${s.heading}</h3>
        <p class="bp-section-body">${s.content}</p>
      </div>`).join('');

    const inputBlock = input
      ? `<div class="bp-visitor-input">
           <span class="bp-input-label">Your situation</span>
           <p class="bp-input-text">"${input}"</p>
         </div>`
      : '';

    const html = `
      <div class="bp-page">
        <div class="bp-header">
          <div class="bp-brand">Cluster<span>OS</span></div>
          <div class="bp-meta">clusteros.io · ${new Date().toLocaleDateString('en-GB', {month:'long', year:'numeric'})}</div>
        </div>
        <div class="bp-title-block">
          <h1 class="bp-title">${tmpl.title}</h1>
          <p class="bp-subtitle">${tmpl.subtitle}</p>
        </div>
        ${inputBlock}
        <div class="bp-sections">${sectionsHtml}</div>
        <div class="bp-footer">
          <a class="bp-cta" href="${tmpl.cta.url}">${tmpl.cta.text} →</a>
          <span class="bp-footer-note">clusteros.io · andrew@communitylab.app</span>
        </div>
      </div>`;

    // Inject into print container
    let container = document.getElementById('briefing-print-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'briefing-print-container';
      document.body.appendChild(container);
    }
    container.innerHTML = html;

    // Trigger print
    window.print();
  }
};

window.briefing = briefing;

// ── INTEL BAR PATHWAY CONTROLLER ─────────────────────────
// Drives the bottom bar as a living pathway thread.
// After gate submission it becomes the guide — not a text input.

const intelBar = {

  // ── LOADING STATE ──────────────────────────────────────
  setLoading(message) {
    const bar = document.getElementById('intel-bar');
    if (!bar) return;
    bar.innerHTML = `
      <div class="ib-loading">
        <span class="ib-loading-dot"></span>
        <span class="ib-loading-text">${message}</span>
      </div>`;
    bar.classList.add('ib-pathway-mode');
  },

  // ── SHOW A BEAT ────────────────────────────────────────
  showBeat(script, beatIndex, visitorText) {
    const bar  = document.getElementById('intel-bar');
    if (!bar) return;

    const beat = script.beats[beatIndex];
    if (!beat) return;

    // First beat uses script opening, subsequent use beat observation
    const line = beatIndex === 0
      ? script.opening
      : beat.observation;

    const invHtml = (beat.invitations || []).map(inv =>
      `<button class="ib-inv" data-action="${inv.action}">${inv.label}</button>`
    ).join('');

    bar.innerHTML = `
      <div class="ib-thread">
        ${line ? `<p class="ib-observation">${line}</p>` : ''}
        <div class="ib-invitations">${invHtml}</div>
      </div>`;

    bar.classList.add('ib-pathway-mode');

    // Show briefing download button
    document.getElementById('briefing-btn')?.classList.add('visible');

    // Wire invitation buttons
    bar.querySelectorAll('.ib-inv').forEach(btn => {
      btn.addEventListener('click', () => {
        this._executeAction(btn.dataset.action);
        this._advance(script, beatIndex);
      });
    });
  },

  // ── ADVANCE TO NEXT BEAT ───────────────────────────────
  _advance(script, currentBeat) {
    const next = currentBeat + 1;
    if (next >= script.beats.length) return;
    // Small delay — let the page action happen first
    setTimeout(() => {
      this.showBeat(script, next);
    }, 1800);
  },

  // ── EXECUTE INVITATION ACTION ──────────────────────────
  _executeAction(action) {
    if (!action) return;

    if (action.startsWith('page:')) {
      const page = action.replace('page:', '');
      window.open('/' + page, '_blank');
      return;
    }

    if (action === 'action:map') {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (action.startsWith('action:email:')) {
      const subject = action.replace('action:email:', '');
      window.location.href = `mailto:andrew@communitylab.app?subject=${encodeURIComponent(subject)}`;
      return;
    }

    if (action.startsWith('action:panel:')) {
      const panelId = action.replace('action:panel:', '');
      window.openPanel && window.openPanel(panelId);
      return;
    }
  }
};

window.intelBar = intelBar;

// ── BOOT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGate();
});
