// ── ClusterOS Guided Journey ──────────────────────────────
// Self-contained 6-stage guided experience inside the panel.
// Nothing navigates away. Everything happens here.

// ── STAGE 1: OBSERVABLE BEHAVIOURS ───────────────────────
// Visitor picks what they recognise — stall name hidden until Stage 2

const BEHAVIOURS = [
  {
    key:   'commissioning',
    label: 'We keep commissioning strategies, reports and reviews that don\'t change what anyone actually does',
    stall: 'Narrating'
  },
  {
    key:   'convening',
    label: 'Every decision requires another meeting, working group or alignment process before anything moves',
    stall: 'Coordinating'
  },
  {
    key:   'reprove',
    label: 'We\'re still making the case for why this matters — to funders, to leadership, to partners',
    stall: 'Re-proving'
  },
  {
    key:   'celebrating',
    label: 'We celebrate new programmes and cohort launches but struggle to point to things that have actually scaled',
    stall: 'Scaling'
  },
  {
    key:   'brokering',
    label: 'Everything routes through us — founders and corporates can\'t seem to connect without an intermediary',
    stall: 'Mediating'
  },
  {
    key:   'extracting',
    label: 'Our best companies, talent and ideas end up benefiting other places more than they benefit us',
    stall: 'Extracting'
  },
  {
    key:   'forgiving',
    label: 'Programmes that aren\'t working keep getting renewed — it\'s easier than having the difficult conversation',
    stall: 'Forgiving'
  },
  {
    key:   'stabilising',
    label: 'The same organisations have been at the table for years — new entrants can\'t get traction',
    stall: 'Stabilising'
  },
  {
    key:   'waiting',
    label: 'We\'re waiting for a funding decision, a policy signal or an anchor to commit before we can move',
    stall: 'Waiting'
  }
];

// ── NAMED STACKS (pre-written, authoritative) ─────────────
const NAMED_STACKS = {
  'Narrating+Coordinating': {
    name: 'The Activity–Alignment Stack',
    description: 'The ecosystem reports activity to justify continued coordination, and coordinates to generate reportable activity. Each stall provides the other with its raw material. Reports need meetings to generate content. Meetings need reports to justify continuance. Neither breaks without changing both simultaneously.',
    leverage: 'The entry point is almost always the reporting layer, not the governance layer. Change what counts as evidence of progress — specifically, require evidence of decisions made and options closed — and the coordination machinery loses its fuel.',
    tech: 'The platform replaces narrative reporting with live signal data. Steward interrogation tools surface actual connection rates, transaction velocity and stall indicators automatically. There is nothing left to report on — the substrate already knows.'
  },
  'Narrating+Re-proving': {
    name: 'The Justification Stack',
    description: 'Resources flow to making the case rather than executing it. The ecosystem produces increasingly sophisticated evidence of its own potential while deferring the bets that would test it. Each validation cycle is followed by a request for more validation. External credibility is sought repeatedly but never quite sufficient to unlock committed action.',
    leverage: 'A single credible external commitment — a named anchor investing, a government fund activated, a corporate signing a procurement agreement — breaks this faster than any internal advocacy. The leverage is finding who has the least to lose from going first publicly.',
    tech: 'The anchor journey surfaces procurement RFIs and commitment signals automatically. The steward sees which anchors have relevant demand and which founders are ready. The platform creates the conditions for a first visible commitment without requiring anyone to negotiate it manually.'
  },
  'Coordinating+Mediating': {
    name: 'The Intermediary Stack',
    description: 'Coordination creates demand for intermediaries. Intermediaries make coordination manageable. The ecosystem develops sophisticated brokerage infrastructure that becomes load-bearing — every connection routes through it, every decision requires its blessing. The system coheres around process rather than around value exchange.',
    leverage: 'Direct coupling between actors — a founder talking to corporate procurement without a broker, a researcher publishing directly to commercial audiences — is the intervention. The intermediary layer doesn\'t need to be removed. It needs to be bypassed once, publicly, so the path exists.',
    tech: 'The platform enables direct actor-to-actor signal routing. A corporate RFI reaches matched founders without passing through the cluster body. A research output reaches commercial audiences without a matchmaking event. Intermediaries are freed to focus on cases where brokerage genuinely adds value.'
  },
  'Re-proving+Scaling': {
    name: 'The Evidence–Activity Stack',
    description: 'Early-stage activity is used as proof of concept rather than evaluated against outcomes. The case for scaling is never quite strong enough because the evidence base keeps expanding rather than narrowing. More pilots are commissioned to strengthen the case. The case for scaling requires more pilots.',
    leverage: 'The measurement layer is the intervention point. Define what scaling means before the next pilot begins — specific, observable, time-bound. The stack breaks when the question shifts from "does this work?" to "what would it take to do ten times more of this?"',
    tech: 'Journey state tracking gives the steward a live view of which founders are progressing through defined milestones versus cycling through early stages. The diagnostic surfaces the ratio of new starts to scaled outcomes. The evidence base becomes an argument for focus, not an argument for expansion.'
  },
  'Mediating+Extracting': {
    name: 'The Anchor Dependency Stack',
    description: 'The ecosystem organises itself around managing anchor institutions rather than changing their behaviour. Intermediaries absorb the friction of anchor relationships, which makes those relationships sustainable without requiring anchors to reinvest. Value flows outward while relationships are maintained. The anchor stays engaged without the ecosystem capturing value from that engagement.',
    leverage: 'Anchor procurement policy is the leverage point — not anchor engagement. Changing what anchors are required to source locally, report on, or invest back into the cluster changes the constraint. Relationship management without constraint change produces more relationship management.',
    tech: 'The anchor journey makes local capability visible to anchor procurement before they look elsewhere. Supply chain intelligence, founder readiness levels and research-to-market maps are surfaced automatically. The anchor doesn\'t need to be persuaded to engage differently — the platform makes local sourcing the path of least resistance.'
  },
  'Forgiving+Scaling': {
    name: 'The Tolerance Stack',
    description: 'Poor performance at early stages is tolerated to preserve the narrative of progress. The ecosystem scales activity rather than outcomes because scaling outcomes would require acknowledging which early bets failed. Accountability is deferred to avoid disrupting momentum. The tolerance and the scaling reinforce each other: more activity means more things to tolerate.',
    leverage: 'A funder or anchor changing the conditions of continued support — not asking for better performance, but changing what they will fund next — breaks this faster than any internal review. The tolerance stack survives internal scrutiny. It does not survive external funders changing their criteria.',
    tech: 'The steward interrogation layer surfaces programme performance against outcome milestones rather than activity counts. The system shows which programmes are generating compounding signals versus which are generating activity. The diagnostic makes the tolerance visible as a structural choice, not a management failure.'
  },
  'Stabilising+Extracting': {
    name: 'The Incumbent Stack',
    description: 'Existing structures are preserved because the actors who benefit from them also control access to the ecosystem\'s resources. New entrants find that innovation pathways route through incumbents, which absorb and filter what reaches the market. The stability serves extraction: the ecosystem is predictable enough for incumbents to extract reliably, and the extraction funds the stability.',
    leverage: 'New entry pathways that bypass the incumbent orbit — direct government procurement from startups, independent research commercialisation routes, alternative funding tracks — are the intervention. The leverage is rarely changing incumbent behaviour. It is creating routes that don\'t require it.',
    tech: 'The platform maintains parallel actor journeys that don\'t route through incumbent gatekeepers. Founder pathways to procurement, researcher pathways to commercial application, and government support programme matching all operate independently of anchor endorsement. The substrate routes around the blockage.'
  },
  'Coordinating+Re-proving': {
    name: 'The Alignment–Justification Stack',
    description: 'The ecosystem coordinates to build the case, and builds the case to justify continued coordination. Alignment processes generate evidence of engagement. Evidence of engagement is used to demonstrate impact. Demonstrating impact requires more alignment. The system becomes very good at producing visible process while deferring the decisions that would make process unnecessary.',
    leverage: 'A decision that closes options — committing to a priority, defunding a programme, naming a lead — breaks the coordination loop by creating something real to report on. The justification stack collapses when there is actual news rather than process news.',
    tech: 'The steward dashboard shows decision velocity alongside activity counts. The diagnostic flags when coordination events are not producing observable commitments. The system distinguishes between alignment that precedes action and alignment that substitutes for it.'
  },
  'Waiting+Re-proving': {
    name: 'The Permission Stack',
    description: 'The ecosystem defers action pending external validation, and uses the waiting period to build a stronger case for permission. The case-building extends the waiting. The waiting legitimises more case-building. By the time permission arrives, the conditions that made the original case compelling have shifted — and the cycle begins again.',
    leverage: 'The actor with the least to lose from acting without permission is the leverage point. One unilateral move — a founder who doesn\'t wait for the matchmaking event, a researcher who publishes without the cluster\'s endorsement — creates a path others can follow. The permission stack survives collective waiting. It does not survive individual defection.',
    tech: 'The platform surfaces support programmes, funding eligibility and connection opportunities to actors directly — without requiring steward intermediation. Founders see procurement RFIs. Researchers see commercial demand. The substrate routes opportunities to the actors who can act on them, regardless of whether the system has formally endorsed the connection.'
  }
};

// ── JOURNEY STATE ─────────────────────────────────────────
const journey = {
  stage:          1,
  selectedKeys:   [],
  selectedStalls: [],
  stackResult:    null,

  // ── ENTRY POINT ───────────────────────────────────────
  start() {
    // Open the dashboard panel
    const panel = document.getElementById('dashboard-panel');
    if (panel) {
      panel.classList.add('open');
      document.body.classList.add('dashboard-open');
    }
    // Wire close button
    document.getElementById('dashboard-close')?.addEventListener('click', () => {
      panel?.classList.remove('open');
      document.body.classList.remove('dashboard-open');
    });
    this.stage          = 0;
    this.selectedKeys   = [];
    this.selectedStalls = [];
    this.stackResult    = null;
    this._renderIntro();
  },

  // ── INTRO ─────────────────────────────────────────────
  _renderIntro() {
    const frame     = window.dashboard?.frame || null;
    const frameText = this._frameGreeting(frame);

    this._setHeader('Your pathway', '');

    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-intro">
        ${frameText ? `<p class="jny-intro-frame">${frameText}</p>` : ''}
        <p class="jny-intro-what">This panel guides you through the platform. It stays open as you explore — use it to navigate, go deeper, or change direction at any point.</p>
        <div class="jny-intro-steps">
          <div class="jny-intro-step">
            <span class="jny-intro-step-num">1</span>
            <span class="jny-intro-step-label">Identify what you're seeing</span>
          </div>
          <div class="jny-intro-step">
            <span class="jny-intro-step-num">2</span>
            <span class="jny-intro-step-label">Name the structural pattern</span>
          </div>
          <div class="jny-intro-step">
            <span class="jny-intro-step-num">3</span>
            <span class="jny-intro-step-label">See who else has been here</span>
          </div>
          <div class="jny-intro-step">
            <span class="jny-intro-step-num">4</span>
            <span class="jny-intro-step-label">Find where leverage sits</span>
          </div>
          <div class="jny-intro-step">
            <span class="jny-intro-step-num">5</span>
            <span class="jny-intro-step-label">Understand the technical response</span>
          </div>
        </div>
        <p class="jny-intro-note">The main area hosts full interactions — maps, actor journeys, architecture. This panel tells you what to look at and why.</p>
        <div class="jny-actions">
          <button class="jny-next" onclick="journey._startDiagnostic()">Start the walkthrough →</button>
        </div>
      </div>`;
  },

  _frameGreeting(frame) {
    const greetings = {
      steward:     'You\'re a steward or EDA lead. This walkthrough is built around what you\'re likely observing in your ecosystem.',
      digital:     'You\'re coming at this from a technical angle. The walkthrough covers the diagnostic first — the infrastructure story comes at Stage 5.',
      investor:    'You\'re looking at ecosystems as an investor. The walkthrough shows you what structural health actually looks like in the data.',
      consultant:  'You\'re a consultant. The walkthrough covers the diagnostic framework — what it produces and how it\'s different from strategy.',
      anchor:      'You represent an anchor institution. The walkthrough covers ecosystem dynamics from the anchor perspective.',
      politician:  'You\'re thinking about this at a policy level. The walkthrough shows the structural evidence behind ecosystem transformation.',
      government:  'You\'re looking at this as a potential infrastructure investment. The walkthrough covers the diagnostic before the platform story.',
      unknown:     null
    };
    return greetings[frame] || null;
  },

  _startDiagnostic() {
    this.stage = 1;
    this._renderStage1();
  },

  // ── STAGE 1: PICK BEHAVIOURS ──────────────────────────
  _renderStage1() {
    this._setHeader('What do you keep seeing?', 'Select everything that sounds familiar — you can pick more than one.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-behaviours">
        ${BEHAVIOURS.map(b => `
          <button class="jny-behaviour" data-key="${b.key}">
            ${b.label}
          </button>`).join('')}
      </div>
      <div class="jny-actions">
        <button class="jny-next" id="jny-next-1" disabled onclick="journey._commitBehaviours()">
          This is what I see →
        </button>
      </div>`;

    // Wire selection
    body.querySelectorAll('.jny-behaviour').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const keys = [...body.querySelectorAll('.jny-behaviour.selected')].map(b => b.dataset.key);
        this.selectedKeys = keys;
        document.getElementById('jny-next-1').disabled = keys.length === 0;
      });
    });
  },

  // ── STAGE 1 → 2 ───────────────────────────────────────
  _commitBehaviours() {
    this.selectedStalls = this.selectedKeys
      .map(k => BEHAVIOURS.find(b => b.key === k)?.stall)
      .filter(Boolean);
    this.stage = 2;
    this._renderStage2();
  },

  // ── STAGE 2: NAME THE STALLS ──────────────────────────
  _renderStage2() {
    this._setHeader('Here\'s what that means', 'These are the structural patterns behind what you\'re observing.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    const stallScience = window.STALL_SCIENCE_DATA || {};

    const stallsHtml = this.selectedStalls.map(stallName => {
      const science = stallScience[stallName] || {};
      return `
        <div class="jny-stall-reveal">
          <div class="jny-stall-name">${stallName}</div>
          <p class="jny-stall-def">${science.definition || ''}</p>
        </div>`;
    }).join('');

    const multiMsg = this.selectedStalls.length > 1
      ? `<p class="jny-multi-note">You've identified ${this.selectedStalls.length} stalls. That's significant — they rarely travel alone.</p>`
      : '';

    body.innerHTML = `
      <div class="jny-stalls">${stallsHtml}</div>
      ${multiMsg}
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._back(1)">← Back</button>
        <button class="jny-next" onclick="journey._toStage3()">
          ${this.selectedStalls.length > 1 ? 'See how they interact →' : 'See where leverage sits →'}
        </button>
      </div>`;
  },

  // ── STAGE 2 → 3 ───────────────────────────────────────
  _toStage3() {
    if (this.selectedStalls.length > 1) {
      this.stage = 3;
      this._renderStage3();
    } else {
      // Single stall — skip stack stage, go straight to leverage
      this.stage = 4;
      this._renderStage4();
    }
  },

  // ── STAGE 3: THE STACK ────────────────────────────────
  _renderStage3() {
    this._setHeader('Your stack', 'This is why single interventions keep failing.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    // Find named stack or generate
    const stack = this._findStack(this.selectedStalls);
    this.stackResult = stack;

    if (stack.named) {
      body.innerHTML = `
        <div class="jny-stack">
          <div class="jny-stack-name">${stack.name}</div>
          <div class="jny-stack-stalls">
            ${this.selectedStalls.map(s => `<span class="jny-stack-tag">${s}</span>`).join('<span class="jny-stack-plus">+</span>')}
          </div>
          <p class="jny-stack-desc">${stack.description}</p>
        </div>
        <div class="jny-actions">
          <button class="jny-back" onclick="journey._back(2)">← Back</button>
          <button class="jny-next" onclick="journey._toStage4()">Where does leverage sit? →</button>
        </div>`;
    } else {
      // AI-generated — show skeleton while loading
      body.innerHTML = `
        <div class="jny-stack">
          <div class="jny-stack-stalls">
            ${this.selectedStalls.map(s => `<span class="jny-stack-tag">${s}</span>`).join('<span class="jny-stack-plus">+</span>')}
          </div>
          <div class="jny-ai-loading">
            <span class="jny-loading-dot"></span>
            <span>Reasoning about this combination...</span>
          </div>
        </div>
        <div class="jny-actions" style="opacity:0.4">
          <button class="jny-back" onclick="journey._back(2)">← Back</button>
          <button class="jny-next" disabled>Where does leverage sit? →</button>
        </div>`;
      this._generateStack();
    }
  },

  // ── GENERATE UNNAMED STACK VIA AI ─────────────────────
  async _generateStack() {
    const stallScience = window.STALL_SCIENCE_DATA || {};
    const stallDetails = this.selectedStalls.map(s => {
      const sc = stallScience[s] || {};
      return `${s}: ${sc.definition || ''} Leverage direction: ${sc.leverage || ''}`;
    }).join('\n');

    const prompt = `You are the ClusterOS diagnostic intelligence layer. Analyse this combination of stalls found in a regional innovation ecosystem.

STALLS PRESENT:
${stallDetails}

Generate a stack analysis. A stack is when two or more stalls reinforce each other — each one lowering the cost of the other and raising the cost of changing either. The result is a self-stabilising configuration that resists single interventions.

Return ONLY valid JSON, no markdown:
{
  "name": "A short evocative name for this stack (3-5 words, e.g. 'The Tolerance Stack')",
  "description": "2-3 sentences. Explain specifically how these stalls reinforce each other. What does each provide the other? Why does changing one without the other fail? Be structural, not generic. No em-dashes.",
  "leverage": "2 sentences. Where is the specific entry point that could break this configuration? What changes first, and why does that cascade? Be concrete. No em-dashes.",
  "tech": "2 sentences. What specifically does the ClusterOS platform do about this configuration — which actor journeys, which signal types, which substrate capabilities address this stack directly? Be specific. No em-dashes."
}`;

    try {
      const response = await fetch(`${window.RAILWAY}/api/intelligence`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt })
      });
      const data   = await response.json();
      const parsed = JSON.parse((data.text || '').replace(/```json|```/g, '').trim());

      this.stackResult = { named: false, ...parsed };

      const body = document.getElementById('dashboard-body');
      if (!body) return;
      body.innerHTML = `
        <div class="jny-stack">
          <div class="jny-stack-name">${parsed.name}</div>
          <div class="jny-stack-stalls">
            ${this.selectedStalls.map(s => `<span class="jny-stack-tag">${s}</span>`).join('<span class="jny-stack-plus">+</span>')}
          </div>
          <p class="jny-stack-desc">${parsed.description}</p>
        </div>
        <div class="jny-actions">
          <button class="jny-back" onclick="journey._back(2)">← Back</button>
          <button class="jny-next" onclick="journey._toStage4()">Where does leverage sit? →</button>
        </div>`;
    } catch(e) {
      const body = document.getElementById('dashboard-body');
      if (body) body.querySelector('.jny-ai-loading').textContent = 'Could not generate analysis — try again.';
    }
  },

  // ── STAGE 3 → 3.5 (MATCHING CLUSTERS) ───────────────────
  _toStage4() {
    this.stage = 3.5;
    this._renderStage35();
  },

  // ── STAGE 3.5: MATCHING CLUSTERS ─────────────────────
  _renderStage35() {
    this._setHeader('Who else has been here', 'Real clusters with the same configuration — already diagnosed.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    const matched = this._matchClusters(4);

    if (!matched.length) {
      // No matches — skip straight to leverage
      this.stage = 4;
      this._renderStage4();
      return;
    }

    const cardsHtml = matched.map(c => {
      const topStalls = (c.stalls || [])
        .sort((a,b) => (b.intensity||0) - (a.intensity||0))
        .slice(0, 2)
        .map(s => {
          const pct = Math.round((s.intensity||0.3) * 100);
          const col = pct > 65 ? 'var(--red,#d4695a)' : pct > 40 ? 'var(--amber)' : 'var(--green)';
          const w   = Math.round(pct * 0.6);
          return `<div class="jny-cc-stall">
            <div class="jny-cc-bar" style="width:${w}px;background:${col}"></div>
            <span class="jny-cc-stall-name">${s.name?.replace(/ instead of.*/i,'').replace(/ without.*/i,'').replace(/ around.*/i,'') || s.name}</span>
          </div>`;
        }).join('');

      const regime = c.regime
        ? `<span class="jny-cc-regime">${c.regime}</span>` : '';

      return `<div class="jny-cluster-card">
        <div class="jny-cc-name">${c.name}</div>
        <div class="jny-cc-meta">${c.city || ''} · ${c.country || ''} ${regime}</div>
        <div class="jny-cc-stalls">${topStalls}</div>
        <a class="jny-cc-link" href="/clusters/${c.id || ''}.html" target="_blank" onclick="event.stopPropagation()">Full profile →</a>
      </div>`;
    }).join('');

    body.innerHTML = `
      <p class="jny-clusters-intro">These clusters share your stall configuration. Each has been through the full diagnostic — stalls, stacks, and leverage hypotheses are live data.</p>
      <div class="jny-cluster-grid">${cardsHtml}</div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._back(3)">← Back</button>
        <button class="jny-next" onclick="journey._toLeverage()">Where does leverage sit? →</button>
      </div>`;
  },

  _toLeverage() {
    this.stage = 4;
    this._renderStage4();
  },

  // ── CLUSTER MATCHING ──────────────────────────────────
  _matchClusters(limit) {
    const all = window._allClusters || [];
    if (!all.length) return [];

    const targetStalls = this.selectedStalls.map(s => s.toLowerCase());

    const ALIASES = {
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
        const clusterStalls = (c.stalls || []).map(s => s.name?.toLowerCase() || '');
        let score = 0;
        targetStalls.forEach(target => {
          const aliases = ALIASES[target] || [target];
          clusterStalls.forEach(cs => {
            if (aliases.some(a => cs.includes(a))) score += 1;
          });
        });
        return { cluster: c, score };
      })
      .filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.cluster);
  },

  // ── STAGE 4: LEVERAGE ─────────────────────────────────
  _renderStage4() {
    this._setHeader('Where leverage sits', 'The entry point that shifts the configuration.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    // Get leverage from stack result, named stack, or stall science
    let leverageText = '';
    if (this.stackResult?.leverage) {
      leverageText = this.stackResult.leverage;
    } else if (this.selectedStalls.length === 1) {
      const sc = (window.STALL_SCIENCE_DATA || {})[this.selectedStalls[0]];
      leverageText = sc?.leverage || '';
    }

    body.innerHTML = `
      <div class="jny-leverage">
        <p class="jny-leverage-text">${leverageText}</p>
        <div class="jny-leverage-principle">
          <div class="jny-lev-label">Why this works</div>
          <p class="jny-lev-body">Stacks stabilise because each element provides cover for the other. The leverage point is the element that, if changed, removes that cover — not the element that feels most urgent. Most interventions target urgency. The diagnostic targets dependency.</p>
        </div>
      </div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._back(journey.selectedStalls.length > 1 ? 3.5 : 2)">← Back</button>
        <button class="jny-next" onclick="journey._toStage5()">How ClusterOS addresses this →</button>
      </div>`;
  },

  // ── STAGE 5: FORK ────────────────────────────────────
  _toStage5() {
    this.stage = 5;
    this._renderStage5Fork();
  },

  _renderStage5Fork() {
    this._setHeader('Two ways to go deeper', '');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <p class="jny-fork-intro">You've seen the diagnostic layer — stalls, stacks, leverage. ClusterOS goes further than diagnosis. Choose what matters most to you right now.</p>
      <div class="jny-fork-cards">
        <button class="jny-fork-card" onclick="journey._toStage5Diagnostic()">
          <div class="jny-fork-card-label">The diagnostic</div>
          <div class="jny-fork-card-title">How ClusterOS identifies and addresses your specific configuration</div>
          <div class="jny-fork-card-sub">The 5-stage pipeline, what it produces, what a snapshot diagnostic delivers</div>
          <div class="jny-fork-card-cta">Show me →</div>
        </button>
        <button class="jny-fork-card jny-fork-card-infra" onclick="journey._toStage5Infra()">
          <div class="jny-fork-card-label">The infrastructure</div>
          <div class="jny-fork-card-title">ClusterOS as the operating substrate for your entire ecosystem</div>
          <div class="jny-fork-card-sub">Actor journeys, signal routing, sovereign database, coordination at scale</div>
          <div class="jny-fork-card-cta">Show me →</div>
        </button>
      </div>
      <div class="jny-actions" style="margin-top:8px">
        <button class="jny-back" onclick="journey._back(4)">← Back</button>
      </div>`;
  },

  // ── STAGE 5A: DIAGNOSTIC PATH ─────────────────────────
  _toStage5Diagnostic() {
    this.stage = 5.1;
    this._renderStage5();
  },

  _renderStage5() {
    this._setHeader('The technical response', 'What ClusterOS specifically does about this configuration.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    const techText = this.stackResult?.tech || this._defaultTech();

    body.innerHTML = `
      <div class="jny-tech">
        <p class="jny-tech-text">${techText}</p>
        <div class="jny-tech-components">
          <div class="jny-tech-label">Platform components involved</div>
          ${this._techComponents().map(c => `
            <div class="jny-tech-component">
              <span class="jny-tech-component-name">${c.name}</span>
              <span class="jny-tech-component-desc">${c.desc}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._toStage5()">← Back</button>
        <button class="jny-next" onclick="journey._toStage6()">What happens next →</button>
      </div>`;
  },

  // ── STAGE 5B: INFRASTRUCTURE PATH ────────────────────
  _toStage5Infra() {
    this.stage = 5.2;
    this._renderStage5Infra1();
  },

  _renderStage5Infra1() {
    this._setHeader('Not a platform. A substrate.', 'The infrastructure your ecosystem runs on.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-infra">
        <p class="jny-infra-text">ClusterOS isn't a tool you use to manage an ecosystem. It's the layer the ecosystem runs on — where every selfish action by every actor automatically generates intelligence that makes everyone else more effective.</p>
        <div class="jny-infra-contrast">
          <div class="jny-infra-col jny-infra-col-bad">
            <div class="jny-infra-col-label">Community platform</div>
            <p>Actors log in to add value. Intelligence is in the interface. Dashboards show what happened. Data is generic.</p>
          </div>
          <div class="jny-infra-col jny-infra-col-good">
            <div class="jny-infra-col-label">ClusterOS substrate</div>
            <p>Actors pursue their own goals. Intelligence is in the protocol. The system reasons from live data. Every actor sees a different surface.</p>
          </div>
        </div>
        <p class="jny-infra-pull">"No actor needs to care about the ecosystem for the ecosystem to function as a system."</p>
      </div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._toStage5()">← Back</button>
        <button class="jny-next" onclick="journey._renderStage5Infra2()">How signals work →</button>
      </div>`;
  },

  _renderStage5Infra2() {
    this._setHeader('One event. Four reframings.', 'Same signal. Different intelligence for each actor.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-infra">
        <p class="jny-infra-text">A corporate posts a procurement RFI. They're just trying to find a supplier. In a connected substrate, that single selfish act cascades.</p>
        <div class="jny-reframings">
          <div class="jny-reframing">
            <span class="jny-reframing-actor jny-actor-founder">Founder</span>
            <span class="jny-reframing-text">Sees a specific capability match with a 14-day deadline and three preparation steps</span>
          </div>
          <div class="jny-reframing">
            <span class="jny-reframing-actor jny-actor-researcher">Researcher</span>
            <span class="jny-reframing-text">Their published paper is matched to the RFI and surfaced to the corporate and three founders simultaneously</span>
          </div>
          <div class="jny-reframing">
            <span class="jny-reframing-actor jny-actor-steward">Steward</span>
            <span class="jny-reframing-text">Sees a bridging opportunity, current score, and an intervention — not an activity log</span>
          </div>
          <div class="jny-reframing">
            <span class="jny-reframing-actor jny-actor-anchor">Anchor</span>
            <span class="jny-reframing-text">Learns a founder has reached validation stage — no premature disclosure of commercial intent required</span>
          </div>
        </div>
      </div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._renderStage5Infra1()">← Back</button>
        <button class="jny-next" onclick="journey._renderStage5Infra3()">The intelligence layer →</button>
      </div>`;
  },

  _renderStage5Infra3() {
    this._setHeader('Intelligence at the protocol layer.', 'Not hardcoded. Not a dashboard. Reasoned fresh on every call.');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-infra">
        <p class="jny-infra-text">Model Context Protocol is the substrate. The AI calls structured tools against the live database at runtime — assembling each actor's experience from real data at the moment they need it.</p>
        <div class="jny-mcp-tools">
          <div class="jny-mcp-label">What the AI calls</div>
          ${[
            'get_actor_profile()',
            'get_cluster_signals()',
            'detect_stalls()',
            'get_matched_connections()',
            'propagate_signal()',
            'get_steward_diagnostic()',
            'search_support_programmes()',
            'get_leverage_hypotheses()'
          ].map(t => `<span class="jny-mcp-tool">${t}</span>`).join('')}
        </div>
        <p class="jny-infra-pull">When the AI model improves, everything the platform produces improves automatically. No rebuild required.</p>
        <div class="jny-infra-sovereign">
          <span class="jny-infra-sov-label">Sovereign by design</span>
          One dedicated database per regional EDA. Data never leaves the region. Intelligence improves centrally. Full role-based access control.
        </div>
      </div>
      <div class="jny-actions">
        <button class="jny-back" onclick="journey._renderStage5Infra2()">← Back</button>
        <button class="jny-next" onclick="journey._toStage6Infra()">What this costs →</button>
      </div>`;
  },

  _toStage6Infra() {
    this.stage = 6;
    this._renderStage6Infra();
  },

  _renderStage6Infra() {
    this._setHeader('What next', '');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    body.innerHTML = `
      <div class="jny-final">
        <p class="jny-final-text">ClusterOS is procurement infrastructure — one sovereign instance per EDA, pre-populated via bot network before any actor joins, generating compounding intelligence from day one.</p>
        <p class="jny-final-sub">Pricing reflects the scope: snapshot diagnostic, full diagnostic run, or platform procurement. Three ways in, one direction.</p>
        <a class="jny-cta" href="/pricing.html" target="_blank">See how it's priced →</a>
        <button class="jny-restart" onclick="journey.start()">Start again</button>
      </div>`;
  },
  },

  _defaultTech() {
    return 'The platform addresses this configuration at the substrate level — not by changing actor behaviour directly, but by changing what their existing behaviour produces. Signal routing, journey construction and steward interrogation are all calibrated to the specific stall pattern present.';
  },

  _techComponents() {
    // Returns components relevant to the selected stalls
    const stalls = new Set(this.selectedStalls);
    const all = [
      { name: 'Steward Interrogation',  desc: 'Open-ended diagnostic queries against live ecosystem data — not dashboards', stalls: ['Narrating','Re-proving','Coordinating','Scaling'] },
      { name: 'Actor Journey Engine',   desc: 'Personalised pathways generated at runtime from live signals, not templates', stalls: ['Mediating','Coordinating','Waiting'] },
      { name: 'Signal Routing Layer',   desc: 'Events reframed per actor type — same signal, different intelligence surface', stalls: ['Mediating','Extracting','Stabilising'] },
      { name: 'Anchor Journey',         desc: 'Procurement visibility, capability matching, RFI signal management', stalls: ['Extracting','Stabilising','Forgiving'] },
      { name: 'Autonomous Bot Network', desc: 'Continuous signal ingestion — platform arrives pre-populated, cold start solved', stalls: ['Waiting','Re-proving'] },
      { name: 'Health Signal Layer',    desc: 'Four live indicators per cluster: bridging, velocity, stall intensity, leverage position', stalls: ['Narrating','Scaling','Forgiving','Re-proving'] },
    ];
    const relevant = all.filter(c => c.stalls.some(s => stalls.has(s)));
    return relevant.length ? relevant : all.slice(0, 3);
  },

  // ── STAGE 6: WHAT NEXT ────────────────────────────────
  _toStage6() {
    this.stage = 6;
    this._renderStage6();
  },

  _renderStage6() {
    this._setHeader('What next', '');
    const body = document.getElementById('dashboard-body');
    if (!body) return;

    const stackName = this.stackResult?.name || (this.selectedStalls.length > 1 ? this.selectedStalls.join(' + ') : this.selectedStalls[0]);

    body.innerHTML = `
      <div class="jny-final">
        <p class="jny-final-text">You've identified a <strong>${stackName}</strong> in your ecosystem. The diagnostic confirms it, names the specific configuration active in your cluster, and surfaces a testable leverage hypothesis calibrated to your context.</p>
        <p class="jny-final-sub">A snapshot diagnostic takes 4–5 weeks at a fixed price. It tells you whether this configuration is active — and exactly where leverage sits in your ecosystem.</p>
        <a class="jny-cta" href="/request.html">Request a snapshot diagnostic →</a>
        <button class="jny-restart" onclick="journey.start()">Start again with different behaviours</button>
      </div>`;
  },

  // ── STACK MATCHING ────────────────────────────────────
  _findStack(stalls) {
    if (stalls.length < 2) return null;
    for (let i = 0; i < stalls.length; i++) {
      for (let j = i + 1; j < stalls.length; j++) {
        const k1 = stalls[i] + '+' + stalls[j];
        const k2 = stalls[j] + '+' + stalls[i];
        if (NAMED_STACKS[k1]) return { named: true, ...NAMED_STACKS[k1] };
        if (NAMED_STACKS[k2]) return { named: true, ...NAMED_STACKS[k2] };
      }
    }
    return { named: false }; // trigger AI generation
  },

  // ── BACK NAVIGATION ───────────────────────────────────
  _back(toStage) {
    this.stage = toStage;
    if (toStage === 1)   this._renderStage1();
    else if (toStage === 2)   this._renderStage2();
    else if (toStage === 3)   this._renderStage3();
    else if (toStage === 3.5) this._renderStage35();
    else if (toStage === 4)   this._renderStage4();
  },

  // ── HELPERS ───────────────────────────────────────────
  _setHeader(title, sub) {
    const label = document.querySelector('.db-label');
    const opening = document.getElementById('dashboard-opening');
    if (label)   label.textContent   = title;
    if (opening) {
      opening.textContent = sub;
      opening.style.display = sub ? 'block' : 'none';
    }
    // Hide recal/branch notes
    const recal  = document.getElementById('dashboard-recal');
    const branch = document.getElementById('dashboard-branch-note');
    if (recal)  recal.style.display  = 'none';
    if (branch) branch.style.display = 'none';
  }
};

window.journey = journey;

// ── STALL SCIENCE — exposed for journey module ────────────
// Mirrors STALL_SCIENCE in dashboard.js but available globally
window.STALL_SCIENCE_DATA = {
  Narrating: {
    definition: 'The ecosystem produces stories about progress instead of evidence of change. Reporting substitutes for impact — the story of activity becomes the activity.',
    leverage:   'Changing what gets reported — not who reports it — breaks this faster than any governance reform. Require evidence of decisions made and options closed, not events held.'
  },
  Coordinating: {
    definition: 'Coordination becomes the output rather than the mechanism. Meetings, partnerships and alignment processes substitute for committed action with real consequences.',
    leverage:   'Identify the actor with the most to lose from the current arrangement and change their constraint. The leverage is never more coordination — it is one actor making an exclusionary choice.'
  },
  'Re-proving': {
    definition: 'The ecosystem repeats the case for its own existence. Resources flow to justification rather than execution — the case is never quite strong enough to unlock committed action.',
    leverage:   'A single credible external commitment — a named anchor investing, a government fund activated — breaks this faster than any internal advocacy. Find who has the least to lose from going first publicly.'
  },
  Scaling: {
    definition: 'Early-stage activity is celebrated rather than evaluated. The ecosystem optimises for inputs and starts rather than outcomes — motion is mistaken for momentum.',
    leverage:   'Change what counts as success before the next programme begins. Define scaling milestones specifically and publicly. The intervention is at the measurement layer, not the programme layer.'
  },
  Mediating: {
    definition: 'The ecosystem spends its energy managing relationships rather than enabling transactions. Every connection routes through an intermediary — direct actor coupling is structurally unavailable.',
    leverage:   'One direct connection that bypasses the intermediary layer creates a path others can follow. The leverage is not removing the intermediary — it is demonstrating that direct coupling works.'
  },
  Extracting: {
    definition: 'Anchor institutions extract value from the ecosystem rather than circulating it. Talent, IP and capital flow outward — the ecosystem produces but does not retain.',
    leverage:   'Changing anchor procurement or spin-out policy changes the constraint without requiring anchors to behave differently by goodwill. The leverage is structural, not relational.'
  },
  Forgiving: {
    definition: 'Poor performance is tolerated to preserve relationships. Accountability systems are systematically avoided — the relationship is worth more than the outcome it was supposed to produce.',
    leverage:   'A funder or anchor changing the conditions of continued support breaks this faster than any internal review. External conditions change what internal tolerance costs.'
  },
  Stabilising: {
    definition: 'The ecosystem optimises for stability over adaptation. Existing structures are preserved even when they no longer serve the system — change threatens the positions built on the current arrangement.',
    leverage:   'New entry pathways that bypass incumbent gatekeepers are the intervention. The leverage is creating routes that do not require incumbent permission — not changing incumbent behaviour.'
  },
  Waiting: {
    definition: 'Action is deferred pending external conditions — funding decisions, policy clarity, anchor commitment. Waiting becomes structural: the system learns to produce deferral as its primary output.',
    leverage:   'The actor with the least to lose from acting without permission is the entry point. One unilateral move creates a path others can follow. The stack survives collective waiting — not individual defection.'
  }
};
