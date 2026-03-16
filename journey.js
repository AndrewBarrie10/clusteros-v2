// ── ClusterOS Guided Journey v3 ──────────────────────────
// Architecture: Orient → Fork (3 paths) → Deep dive
// Panel = navigator. Frame = content. Escape always visible.

// ── STALL SCIENCE ─────────────────────────────────────────
window.STALL_SCIENCE_DATA = {
  Narrating:    { definition:'The ecosystem produces stories about progress instead of evidence of change. Reporting substitutes for impact — the story of activity becomes the activity.', leverage:'Changing what gets reported — not who reports it — breaks this faster than any governance reform. Require evidence of decisions made and options closed, not events held.' },
  Coordinating: { definition:'Coordination becomes the output rather than the mechanism. Meetings, partnerships and alignment processes substitute for committed action with real consequences.', leverage:'Identify the actor with the most to lose from the current arrangement and change their constraint. The leverage is never more coordination — it is one actor making an exclusionary choice.' },
  'Re-proving': { definition:'The ecosystem repeats the case for its own existence. Resources flow to justification rather than execution — the case is never quite strong enough to unlock committed action.', leverage:'A single credible external commitment — a named anchor investing, a government fund activated — breaks this faster than any internal advocacy. Find who has the least to lose from going first publicly.' },
  Scaling:      { definition:'Early-stage activity is celebrated rather than evaluated. The ecosystem optimises for inputs and starts rather than outcomes — motion is mistaken for momentum.', leverage:'Change what counts as success before the next programme begins. Define scaling milestones specifically and publicly. The intervention is at the measurement layer, not the programme layer.' },
  Mediating:    { definition:'The ecosystem spends its energy managing relationships rather than enabling transactions. Every connection routes through an intermediary — direct actor coupling is structurally unavailable.', leverage:'One direct connection that bypasses the intermediary layer creates a path others can follow. The leverage is not removing the intermediary — it is demonstrating that direct coupling works.' },
  Extracting:   { definition:'Anchor institutions extract value from the ecosystem rather than circulating it. Talent, IP and capital flow outward — the ecosystem produces but does not retain.', leverage:'Changing anchor procurement or spin-out policy changes the constraint without requiring anchors to behave differently by goodwill. The leverage is structural, not relational.' },
  Forgiving:    { definition:'Poor performance is tolerated to preserve relationships. Accountability systems are systematically avoided — the relationship is worth more than the outcome it was supposed to produce.', leverage:'A funder or anchor changing the conditions of continued support breaks this faster than any internal review. External conditions change what internal tolerance costs.' },
  Stabilising:  { definition:'The ecosystem optimises for stability over adaptation. Existing structures are preserved even when they no longer serve the system — change threatens the positions built on the current arrangement.', leverage:'New entry pathways that bypass incumbent gatekeepers are the intervention. The leverage is creating routes that do not require incumbent permission — not changing incumbent behaviour.' },
  Waiting:      { definition:'Action is deferred pending external conditions — funding decisions, policy clarity, anchor commitment. Waiting becomes structural: the system learns to produce deferral as its primary output.', leverage:'The actor with the least to lose from acting without permission is the entry point. One unilateral move creates a path others can follow. The stack survives collective waiting — not individual defection.' }
};

const BEHAVIOURS = [
  { key:'commissioning', label:"We keep commissioning strategies, reports and reviews that don't change what anyone actually does", stall:'Narrating' },
  { key:'convening',     label:'Every decision requires another meeting, working group or alignment process before anything moves', stall:'Coordinating' },
  { key:'reprove',       label:"We're still making the case for why this matters — to funders, to leadership, to partners", stall:'Re-proving' },
  { key:'celebrating',   label:'We celebrate new programmes and cohort launches but struggle to point to things that have actually scaled', stall:'Scaling' },
  { key:'brokering',     label:"Everything routes through us — founders and corporates can't seem to connect without an intermediary", stall:'Mediating' },
  { key:'extracting',    label:'Our best companies, talent and ideas end up benefiting other places more than they benefit us', stall:'Extracting' },
  { key:'forgiving',     label:"Programmes that aren't working keep getting renewed — it's easier than having the difficult conversation", stall:'Forgiving' },
  { key:'stabilising',   label:"The same organisations have been at the table for years — new entrants can't get traction", stall:'Stabilising' },
  { key:'waiting',       label:"We're waiting for a funding decision, a policy signal or an anchor to commit before we can move", stall:'Waiting' }
];

const NAMED_STACKS = {
  'Narrating+Coordinating': { name:'The Activity–Alignment Stack', description:"The ecosystem reports activity to justify continued coordination, and coordinates to generate reportable activity. Each stall provides the other with its raw material. Neither breaks without changing both simultaneously.", leverage:"Change what counts as evidence of progress — require evidence of decisions made and options closed — and the coordination machinery loses its fuel.", tech:"The platform replaces narrative reporting with live signal data. Steward interrogation surfaces actual connection rates and stall indicators automatically." },
  'Narrating+Re-proving':   { name:'The Justification Stack', description:"Resources flow to making the case rather than executing it. The ecosystem produces increasingly sophisticated evidence of its own potential while deferring the bets that would test it.", leverage:"A single credible external commitment breaks this faster than any internal advocacy. Find who has the least to lose from going first publicly.", tech:"The anchor journey surfaces procurement RFIs and commitment signals automatically. The platform creates conditions for a first visible commitment without requiring anyone to negotiate it." },
  'Coordinating+Mediating': { name:'The Intermediary Stack', description:"Coordination creates demand for intermediaries. Intermediaries make coordination manageable. The system coheres around process rather than around value exchange.", leverage:"Direct coupling between actors — a founder talking to corporate procurement without a broker — is the intervention. The intermediary layer needs to be bypassed once, publicly.", tech:"The platform enables direct actor-to-actor signal routing. A corporate RFI reaches matched founders without passing through the cluster body." },
  'Re-proving+Scaling':     { name:'The Evidence–Activity Stack', description:"Early-stage activity is used as proof of concept rather than evaluated against outcomes. The case for scaling is never quite strong enough because the evidence base keeps expanding.", leverage:"Define what scaling means before the next pilot begins — specific, observable, time-bound. The stack breaks when the question shifts from 'does this work?' to 'what would it take to do ten times more?'", tech:"Journey state tracking gives the steward a live view of which founders are progressing versus cycling through early stages." },
  'Mediating+Extracting':   { name:'The Anchor Dependency Stack', description:"The ecosystem organises itself around managing anchor institutions rather than changing their behaviour. Value flows outward while relationships are maintained.", leverage:"Anchor procurement policy is the leverage point — not anchor engagement. Changing what anchors are required to source locally changes the constraint.", tech:"The anchor journey makes local capability visible to anchor procurement before they look elsewhere. Supply chain intelligence and founder readiness levels are surfaced automatically." },
  'Forgiving+Scaling':      { name:'The Tolerance Stack', description:"Poor performance at early stages is tolerated to preserve the narrative of progress. The ecosystem scales activity rather than outcomes because acknowledging which bets failed would disrupt momentum.", leverage:"A funder changing the conditions of continued support — not asking for better performance, but changing what they will fund next — breaks this faster than any internal review.", tech:"The steward interrogation layer surfaces programme performance against outcome milestones rather than activity counts." },
  'Stabilising+Extracting': { name:'The Incumbent Stack', description:"Existing structures are preserved because the actors who benefit from them also control access to the ecosystem's resources. Innovation pathways route through incumbents.", leverage:"New entry pathways that bypass the incumbent orbit are the intervention. The leverage is creating routes that do not require incumbent permission.", tech:"The platform maintains parallel actor journeys that do not route through incumbent gatekeepers." },
  'Coordinating+Re-proving':{ name:'The Alignment–Justification Stack', description:"The ecosystem coordinates to build the case, and builds the case to justify continued coordination. The system produces visible process while deferring decisions that would make process unnecessary.", leverage:"A decision that closes options — committing to a priority, defunding a programme — breaks the coordination loop by creating something real to report on.", tech:"The steward dashboard shows decision velocity alongside activity counts. The diagnostic flags when coordination events are not producing observable commitments." },
  'Waiting+Re-proving':     { name:'The Permission Stack', description:"The ecosystem defers action pending external validation, and uses the waiting period to build a stronger case for permission. The case-building extends the waiting.", leverage:"The actor with the least to lose from acting without permission is the leverage point. One unilateral move creates a path others can follow.", tech:"The platform surfaces support programmes and funding eligibility to actors directly — without requiring steward intermediation." }
};

// ── JOURNEY STATE ─────────────────────────────────────────
const journey = {
  fork: null,
  selectedKeys: [], selectedStalls: [], stackResult: null,

  // ── SURFACES ──────────────────────────────────────────
  panel()  { return document.getElementById('dashboard-body'); },
  frame()  { return document.getElementById('journey-frame'); },

  _setPanel(html) { const p=this.panel(); if(p) p.innerHTML=html; },
  _setFrame(html) { const f=this.frame(); if(f) f.innerHTML=`<div class="jf-section">${html}</div>`; },
  _setPanelHeader(t) {
    const l=document.querySelector('.db-label'); if(l) l.textContent=t;
    const o=document.getElementById('dashboard-opening'); if(o) o.style.display='none';
  },

  // Escape hatch — always in panel
  _escape(label) {
    return `<div class="jnav-escape"><button class="jnav-escape-btn" onclick="journey._renderIntro()">← ${label||'Back to overview'}</button></div>`;
  },

  // ── ENTRY POINT ───────────────────────────────────────
  start() {
    const p=document.getElementById('dashboard-panel');
    if(p) p.classList.add('open');
    document.body.classList.add('dashboard-open','journey-active');
    if(window._setBarMode) window._setBarMode('journey');
    // Close handler
    const cb=document.getElementById('dashboard-close');
    const nb=cb?.cloneNode(true); if(cb&&nb) cb.parentNode.replaceChild(nb,cb);
    document.getElementById('dashboard-close')?.addEventListener('click',()=>{
      p?.classList.remove('open');
      document.body.classList.remove('dashboard-open','journey-active');
      if(window._setBarMode) window._setBarMode('default');
    });
    this.fork=null; this.selectedKeys=[]; this.selectedStalls=[]; this.stackResult=null;
    this._renderIntro();
  },

  // ── INTRO + FORK CHOICE ───────────────────────────────
  _renderIntro() {
    this._setPanelHeader('Your pathway');
    const frame=window.dashboard?.frame||null;
    const greet=this._frameGreeting(frame);

    this._setPanel(`
      <div>
        ${greet?`<p class="jnav-context" style="padding:8px 10px;background:rgba(42,122,79,0.06);border-left:2px solid var(--green);border-radius:2px;margin-bottom:12px">${greet}</p>`:''}
        <p class="jnav-context">Three paths through the platform. Each can be taken independently — or in sequence.</p>
        <div class="jnav-fork-list">
          <button class="jnav-fork-item jnav-fork-diag" onclick="journey._startDiag()">
            <span class="jnav-fork-num">01</span>
            <span class="jnav-fork-name">The Diagnostic</span>
          </button>
          <button class="jnav-fork-item jnav-fork-infra" onclick="journey._startInfra()">
            <span class="jnav-fork-num">02</span>
            <span class="jnav-fork-name">The Infrastructure</span>
          </button>
          <button class="jnav-fork-item jnav-fork-cas" onclick="journey._startCAS()">
            <span class="jnav-fork-num">03</span>
            <span class="jnav-fork-name">Complex Adaptive Systems</span>
          </button>
        </div>
      </div>`);

    this._setFrame(`
      <div class="jf-intro-head">
        <p class="jf-intro-eyebrow">ClusterOS · Three paths</p>
        <h1 class="jf-intro-heading">Choose your angle.<br><em>Take all three if you want.</em></h1>
        <p class="jf-intro-sub">Each path is self-contained. The Diagnostic explains why clusters stall and how to fix them. The Infrastructure shows what ClusterOS actually runs on. The Complex Adaptive Systems path explains why ecosystems behave the way they do — and why most interventions fail to change that.</p>
      </div>
      <div class="jf-fork-grid-intro">
        <button class="jf-fork-intro-card" onclick="journey._startDiag()">
          <span class="jf-fork-intro-num">01</span>
          <div class="jf-fork-intro-label">The Diagnostic</div>
          <div class="jf-fork-intro-title">Why clusters stall — and where leverage sits</div>
          <p class="jf-fork-intro-desc">Pick the behaviours you recognise. The system names the structural pattern, matches it to real diagnosed clusters, and surfaces where intervention will actually compound.</p>
          <div class="jf-fork-intro-steps">
            <span>Identify your stalls</span><span>›</span>
            <span>Name the stack</span><span>›</span>
            <span>Find the leverage</span>
          </div>
          <div class="jf-fork-intro-cta">Start →</div>
        </button>
        <button class="jf-fork-intro-card jf-fork-intro-card-infra" onclick="journey._startInfra()">
          <span class="jf-fork-intro-num">02</span>
          <div class="jf-fork-intro-label">The Infrastructure</div>
          <div class="jf-fork-intro-title">What ClusterOS runs on</div>
          <p class="jf-fork-intro-desc">MCP substrate, sovereign database, actor journeys generated at runtime. Not a community platform with AI features added. The architecture is the product.</p>
          <div class="jf-fork-intro-steps">
            <span>Platform vs infrastructure</span><span>›</span>
            <span>Signal cascade</span><span>›</span>
            <span>Actor journeys</span>
          </div>
          <div class="jf-fork-intro-cta">Start →</div>
        </button>
        <button class="jf-fork-intro-card jf-fork-intro-card-cas" onclick="journey._startCAS()">
          <span class="jf-fork-intro-num">03</span>
          <div class="jf-fork-intro-label">Complex Adaptive Systems</div>
          <div class="jf-fork-intro-title">Why ecosystems behave the way they do</div>
          <p class="jf-fork-intro-desc">Ecosystems aren't organisations. They're CAS — self-organising, emergent, driven by selfish actors. ClusterOS works because it doesn't try to coordinate actors. It changes what their self-interest produces.</p>
          <div class="jf-fork-intro-steps">
            <span>The CAS argument</span><span>›</span>
            <span>Selfishness principle</span><span>›</span>
            <span>Signals & stewardship</span>
          </div>
          <div class="jf-fork-intro-cta">Start →</div>
        </button>
      </div>`);
  },

  _frameGreeting(frame) {
    return {steward:'You\'re a steward or EDA lead. The Diagnostic path is probably your starting point.',digital:'You\'re coming at this technically. The Infrastructure path shows you the architecture.',investor:'You\'re an investor. The Diagnostic path shows what structural health looks like in the data.',consultant:'You\'re a consultant. The Diagnostic path covers the framework and what it produces.',anchor:'You represent an anchor institution. The CAS path explains why your signals matter most.',politician:'You\'re thinking about this at a policy level. The CAS path covers why interventions keep failing.',government:'You\'re looking at this as an infrastructure investment. Start with Infrastructure, then CAS.'}[frame]||'';
  },

  // ══ FORK 1: DIAGNOSTIC ════════════════════════════════

  _startDiag() {
    this.fork='diagnostic';
    this.selectedKeys=[]; this.selectedStalls=[]; this.stackResult=null;
    this._renderDiagBehaviours();
  },

  _diagNav(steps, active) {
    return `<div class="jnav-steps">${steps.map((s,i)=>`<div class="jnav-step ${i===active?'active':i<active?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>`;
  },

  _renderDiagBehaviours() {
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    this._setPanel(`
      <span class="jnav-stage">Step 1 · What are you seeing?</span>
      <p class="jnav-context">Pick everything that sounds familiar. Combinations reveal stacks.</p>
      ${this._diagNav(steps,0)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" id="jnav-diag-next" disabled onclick="journey._commitDiagBehaviours()">Name my stalls →</button>
      </div>
      ${this._escape('Back to overview')}`);

    this._setFrame(`
      <h2 class="jf-stage-heading">What does your ecosystem<br><em>keep doing?</em></h2>
      <p class="jf-stage-sub">Select all the patterns that sound familiar. These are observable behaviours — not diagnoses. The system names what's beneath them.</p>
      <div class="jf-behaviour-grid">
        ${BEHAVIOURS.map(b=>`<button class="jf-behaviour ${this.selectedKeys.includes(b.key)?'selected':''}" data-key="${b.key}">${b.label}</button>`).join('')}
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" id="jf-diag-next" disabled onclick="journey._commitDiagBehaviours()" style="padding:12px 28px;font-size:12px">Name my stalls →</button>
        <span id="jf-select-count" style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:0.08em;text-transform:uppercase"></span>
      </div>`);

    document.querySelectorAll('.jf-behaviour').forEach(btn=>{
      btn.addEventListener('click',()=>{
        btn.classList.toggle('selected');
        this.selectedKeys=[...document.querySelectorAll('.jf-behaviour.selected')].map(b=>b.dataset.key);
        const disabled=this.selectedKeys.length===0;
        ['jnav-diag-next','jf-diag-next'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=disabled;});
        const c=document.getElementById('jf-select-count'); if(c) c.textContent=this.selectedKeys.length>0?`${this.selectedKeys.length} selected`:'';
      });
    });
  },

  _commitDiagBehaviours() {
    this.selectedStalls=this.selectedKeys.map(k=>BEHAVIOURS.find(b=>b.key===k)?.stall).filter(Boolean);
    this._renderDiagStalls();
  },

  _renderDiagStalls() {
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    this._setPanel(`
      <span class="jnav-stage">Step 2 · The structural pattern</span>
      <p class="jnav-context">${this.selectedStalls.length} stall${this.selectedStalls.length>1?'s identified — these rarely travel alone':' identified'}.</p>
      ${this._diagNav(steps,1)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderDiagStack()">${this.selectedStalls.length>1?'See how they interact →':'See where leverage sits →'}</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagBehaviours()">← Back</button>
      </div>
      ${this._escape()}`);

    this._setFrame(`
      <h2 class="jf-stage-heading">Here's what<br><em>that means.</em></h2>
      <p class="jf-stage-sub">These are the structural patterns beneath the behaviours you selected. Each is a substitution — the ecosystem doing something observable instead of something harder.</p>
      <div class="jf-stall-grid">${this.selectedStalls.map(n=>{const sc=window.STALL_SCIENCE_DATA[n]||{};return`<div class="jf-stall-card"><div class="jf-stall-name">${n}</div><p class="jf-stall-def">${sc.definition||''}</p></div>`;}).join('')}</div>
      ${this.selectedStalls.length>1?`<div class="jf-multi-note">You've identified ${this.selectedStalls.length} stalls. Stalls rarely travel alone — they form stabilisation stacks that resist single interventions.</div>`:''}
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderDiagStack()" style="padding:12px 28px;font-size:12px">${this.selectedStalls.length>1?'See how they interact →':'Find the leverage →'}</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagBehaviours()">← Back</button>
      </div>`);
  },

  _renderDiagStack() {
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    const stack=this._findStack(this.selectedStalls); this.stackResult=stack;

    this._setPanel(`
      <span class="jnav-stage">Step 3 · Your stack</span>
      <p class="jnav-context">${stack?.named?`<strong>${stack.name}</strong> — a known configuration.`:'Analysing how these stalls reinforce each other...'}</p>
      ${this._diagNav(steps,2)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" id="jnav-stack-next" ${stack?.named?'':'disabled'} onclick="journey._renderDiagClusters()">See real examples →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagStalls()">← Back</button>
      </div>
      ${this._escape()}`);

    if(stack?.named) {
      this._setFrame(`
        <h2 class="jf-stage-heading">This is why<br><em>single fixes fail.</em></h2>
        <p class="jf-stage-sub">Two or more stalls reinforcing each other form a stack. Each provides cover for the other. Removing one without changing the other produces temporary relief, not structural change.</p>
        <div class="jf-stack-card">
          <div class="jf-stack-name">${stack.name}</div>
          <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
          <p class="jf-stack-desc">${stack.description}</p>
        </div>
        <div class="jf-sticky-bottom">
          <button class="jnav-btn-primary" onclick="journey._renderDiagClusters()" style="padding:12px 28px;font-size:12px">See real examples →</button>
          <button class="jnav-btn-secondary" onclick="journey._renderDiagStalls()">← Back</button>
        </div>`);
    } else {
      this._setFrame(`
        <h2 class="jf-stage-heading">Reasoning about<br><em>your combination.</em></h2>
        <p class="jf-stage-sub">This combination doesn't have a canonical name in the dataset. Analysing the reinforcement logic now.</p>
        <div class="jf-stack-card">
          <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
          <div class="jf-ai-loading"><span class="jny-loading-dot"></span><span>Analysing reinforcement logic...</span></div>
        </div>`);
      this._generateStack();
    }
  },

  _generateStack() {
    // Stack lookup — no API required
    const stalls = this.selectedStalls.slice().sort();
    const key = stalls.join('+');

    const STACKS = {
      // ── PAIRS ──────────────────────────────────────────────
      'Narrating+Scaling': {
        name: 'Narrative × Activity',
        description: 'The ecosystem produces stories about activity and activity that generates stories. Each legitimises the other — neither requires narrowing, committing, or exposing anyone to market consequence. It is the most stable of all stall combinations.',
        leverage: 'Change what gets reported, not who reports it. Introduce one metric that cannot be gamed by activity — revenue, retention, or market validation — and the stack begins to destabilise.'
      },
      'Coordinating+Mediating': {
        name: 'Coordination × Mediation',
        description: 'Alignment mechanisms create demand for intermediaries. Intermediaries make alignment manageable. The system coheres without ever narrowing — and both stalls protect the roles that depend on them continuing.',
        leverage: 'Introduce direct coupling between two actors who currently only connect through the intermediary. One direct relationship breaks the dependency loop faster than any governance change.'
      },
      'Coordinating+Stabilising': {
        name: 'Incumbent Anchor Lock-In',
        description: 'Large incumbents define what coordination is for, and coordination structures form around their needs. New entrants optimise for incumbent partnership. Emergence outside the incumbent orbit remains structurally weak.',
        leverage: 'Fund one thing that does not require incumbent validation to proceed. The goal is not to displace incumbents — it is to demonstrate that the system can produce value without routing through them.'
      },
      'Extracting+Scaling': {
        name: 'Activity-Extraction Regime',
        description: 'Programmes expand and activity metrics grow, but value — talent, companies, IP — exits the ecosystem. More programmes are launched to compensate. Activity scales but throughput does not.',
        leverage: 'Target the retention constraint directly. The hole is at the bottom of the funnel — more early-stage activity widens the top while the bottom stays open.'
      },
      'Coordinating+Re-proving': {
        name: 'Legitimacy Loop',
        description: 'Every decision requires alignment, and alignment requires demonstrating the case again. Re-proving feeds the coordination requirement — nothing can move until everyone agrees, and agreement requires re-establishing the rationale.',
        leverage: 'Find one decision that can be made unilaterally without consensus. Execute it visibly. A single completed action carries more legitimacy than any number of aligned strategies.'
      },
      'Narrating+Re-proving': {
        name: 'Strategy-Validation Stack',
        description: 'Documents are produced to make the case, and the case is made in documents. Neither produces market evidence. The system mistakes internal persuasion for external validation.',
        leverage: 'Replace one report with a test. A small, bounded market experiment produces evidence that no strategy document can — and breaks the loop that substitutes narrative for proof.'
      },
      'Mediating+Stabilising': {
        name: 'Gatekeeping Configuration',
        description: 'Established actors control access and intermediaries manage flow. New entrants must demonstrate fit with existing priorities before getting traction. The configuration is stable precisely because it rewards incumbents and intermediaries equally.',
        leverage: 'Create one pathway that bypasses the intermediary layer entirely. Even a single direct connection — founder to corporate, researcher to market — demonstrates the dependency is structural, not necessary.'
      },
      'Coordinating+Forgiving': {
        name: 'Alignment Without Accountability',
        description: 'Programmes keep running because stopping them requires a conversation nobody wants to have, and coordination structures make that conversation even harder. The system protects everyone from difficult decisions.',
        leverage: 'Introduce a sunset clause on one programme. Not a review — a date. The prospect of an automatic end forces the evidence conversation that ongoing renewal avoids.'
      },
      'Waiting+Re-proving': {
        name: 'Permission Deadlock',
        description: 'The ecosystem waits for a signal before moving, and re-proves the case while waiting. Each iteration of the case restarts the waiting period. Nothing accumulates except documents.',
        leverage: 'Identify one action that does not require the awaited signal. Execute it. The waiting is structural — breaking it requires demonstrating that movement is possible before permission arrives.'
      },
      'Extracting+Mediating': {
        name: 'Value Leakage Through Intermediation',
        description: 'Value is brokered out of the ecosystem before it compounds locally. Intermediaries facilitate connections but the resulting relationships — talent, capital, partnerships — benefit other places.',
        leverage: 'Map where value goes after the introduction is made. The leakage point is usually a single structural gap — a missing late-stage investor, an absent anchor customer — not a general intermediary problem.'
      },
      'Forgiving+Scaling': {
        name: 'Proliferation Without Pruning',
        description: 'Programmes multiply and activity grows, but nothing is stopped. The system cannot distinguish between what is working and what is not because nothing is ever tested against a meaningful threshold.',
        leverage: 'Introduce one explicit discontinuation. The goal is not to save money — it is to demonstrate that the system can make a negative decision. That capacity changes what the positive decisions mean.'
      },
      'Narrating+Waiting': {
        name: 'Documented Paralysis',
        description: 'The ecosystem produces increasingly detailed accounts of its situation while waiting for conditions to change. Documents accumulate. Action does not. The narrative of readiness substitutes for readiness itself.',
        leverage: 'Set a deadline. Not for the awaited signal — for the first action that does not require it. Paralysis is partly a coordination problem: nobody wants to move first.'
      },
      // ── TRIPLES ────────────────────────────────────────────
      'Coordinating+Narrating+Scaling': {
        name: 'Full Legitimacy Stack',
        description: 'Coordination produces documents. Documents legitimate activity. Activity justifies continued coordination. Each stall absorbs the pressure the others expose — and the system coheres without anyone needing to narrow, commit, or expose themselves to market consequence.',
        leverage: 'The entry point is almost never where the stack is most visible. Introduce one metric that tracks throughput rather than activity, and apply it to the highest-profile programme first.'
      },
      'Coordinating+Re-proving+Waiting': {
        name: 'Consensus-Permission Deadlock',
        description: 'Nothing moves without alignment, alignment requires making the case, and making the case triggers a wait for the signal that justifies proceeding. Three stalls each providing cover for the other — a closed loop.',
        leverage: 'Break the sequence at its weakest point. Find one actor with the authority to proceed without consensus and give them a small, bounded mandate. One completed action dissolves the loop faster than any governance reform.'
      },
      'Extracting+Mediating+Scaling': {
        name: 'Growth Without Retention',
        description: 'Activity and connections scale but value exits the ecosystem through the same intermediary layer that facilitates growth. The system looks healthy by activity metrics while systematically exporting its best outcomes.',
        leverage: 'Target the first exit point — usually a growth-stage capital gap. The intermediary and activity stalls are symptoms; extraction is the structural problem that makes the others self-reinforcing.'
      },
    };

    // Find best match
    let match = STACKS[key];

    // If no exact match, find the closest (most overlapping stalls)
    if (!match) {
      let bestScore = 0;
      let bestKey = null;
      Object.keys(STACKS).forEach(k => {
        const kStalls = k.split('+');
        const overlap = stalls.filter(s => kStalls.includes(s)).length;
        const score = overlap / Math.max(stalls.length, kStalls.length);
        if (score > bestScore) { bestScore = score; bestKey = k; }
      });
      if (bestKey && bestScore >= 0.5) match = STACKS[bestKey];
    }

    // Fallback
    if (!match) {
      match = {
        name: stalls.length === 1 ? stalls[0] : `${stalls[0]} × ${stalls[1]}`,
        description: 'These stalls reinforce each other by providing mutual cover — addressing one without the other produces temporary change. The combination is more stable than either stall alone.',
        leverage: 'Identify which stall is providing the most cover for the others. That is the entry point. Removing it does not require the others to change — it removes the protection that makes them self-sustaining.'
      };
    }

    this.stackResult = { named: false, ...match };
    this._setFrame(`
      <h2 class="jf-stage-heading">This is why<br><em>single fixes fail.</em></h2>
      <p class="jf-stage-sub">Two or more stalls reinforcing each other form a stack.</p>
      <div class="jf-stack-card">
        <div class="jf-stack-name">${match.name}</div>
        <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
        <p class="jf-stack-desc">${match.description}</p>
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderDiagClusters()" style="padding:12px 28px;font-size:12px">See real examples →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagStalls()">← Back</button>
      </div>`);
    const nb=document.getElementById('jnav-stack-next'); if(nb) nb.disabled=false;
  },

  _renderDiagClusters() {
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    const matched=this._matchClusters(4);
    this._setPanel(`
      <span class="jnav-stage">Step 4 · Global comparators</span>
      <p class="jnav-context">${matched.length?`${matched.length} clusters share your configuration — already fully diagnosed.`:'No strong cluster matches for this combination.'}</p>
      ${this._diagNav(steps,3)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderDiagLeverage()">Where does leverage sit? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagStack()">← Back</button>
      </div>
      ${this._escape()}`);

    if(!matched.length) {
      this._setFrame(`<h2 class="jf-stage-heading">Who else has<br><em>been here.</em></h2><p class="jf-stage-sub">No strong cluster matches found. The leverage principles still apply — continue to see where the entry point sits.</p><div class="jf-sticky-bottom"><button class="jnav-btn-primary" onclick="journey._renderDiagLeverage()" style="padding:12px 28px;font-size:12px">Where does leverage sit? →</button></div>`);
      return;
    }
    const cards=matched.map(c=>{
      const top=(c.stalls||[]).sort((a,b)=>(b.intensity||0)-(a.intensity||0)).slice(0,2).map(s=>{
        const pct=Math.round((s.intensity||0.3)*100),col=pct>65?'#d4695a':pct>40?'#d4a94a':'#2a7a4f',w=Math.round(pct*0.7);
        const nm=(s.name||'').replace(/ instead of.*/i,'').replace(/ without.*/i,'').replace(/ around.*/i,'');
        return`<div class="jf-cc-stall"><div class="jf-cc-bar" style="width:${w}px;background:${col}"></div><span class="jf-cc-stall-name">${nm}</span></div>`;
      }).join('');
      return`<div class="jf-cluster-card"><div class="jf-cc-name">${c.name}</div><div class="jf-cc-meta">${c.city||''} · ${c.country||''} ${c.regime?`<span class="jf-cc-regime">${c.regime}</span>`:''}</div><div class="jf-cc-stalls">${top}</div><div id="radar-${c.id}" style="margin:8px 0"></div><a class="jf-cc-link" href="/clusters/${c.id||''}.html" target="_blank">Full profile →</a></div>`;
    }).join('');
    this._setFrame(`
      <h2 class="jf-stage-heading">Who else has<br><em>been here.</em></h2>
      <p class="jf-stage-sub">These clusters from the dataset share your stall configuration. Each has been through the full diagnostic — stalls, stacks, and leverage hypotheses are live data.</p>
      <div class="jf-cluster-grid">${cards}</div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderDiagLeverage()" style="padding:12px 28px;font-size:12px">Where does leverage sit? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagStack()">← Back</button>
      </div>`);
    // Draw radars
    const _draw=()=>{ matched.forEach(c=>{ if(window.drawRadar) window.drawRadar(c,'radar-'+c.id); }); };
    if(window.drawRadar) setTimeout(_draw,80);
    else { const _t=setInterval(()=>{ if(window.drawRadar){clearInterval(_t);_draw();} },100); setTimeout(()=>clearInterval(_t),5000); }
  },

  _renderDiagLeverage() {
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    const lev=this.stackResult?.leverage||(this.selectedStalls.length===1?(window.STALL_SCIENCE_DATA[this.selectedStalls[0]]?.leverage||''):'');
    this._setPanel(`
      <span class="jnav-stage">Step 5 · Where leverage sits</span>
      <p class="jnav-context">The entry point is almost never where the stall is most visible. Most interventions target urgency. The diagnostic targets dependency.</p>
      ${this._diagNav(steps,4)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderDiagCTA()">What next? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagClusters()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">The entry point<br><em>that shifts the configuration.</em></h2>
      <p class="jf-stage-sub">Stacks stabilise because each element provides cover for the other. The leverage point is the element whose removal makes the stack structurally unavailable — not the one that feels most urgent.</p>
      <p class="jf-leverage-text">${lev}</p>
      <div class="jf-leverage-principle"><div class="jf-lev-label">Why this works</div><p class="jf-lev-body">The diagnostic looks for the load-bearing stall — the one whose change makes the stack structurally unavailable. Change that, and the others lose their function.</p></div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderDiagCTA()" style="padding:12px 28px;font-size:12px">What next? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagClusters()">← Back</button>
      </div>`);
  },


  _buildReport() {
    const matched = this._matchClusters(3);
    const stack   = this.stackResult || {};
    const stalls  = this.selectedStalls;

    const STALL_CODES = {
      'Coordinating':'S2','Narrating':'S7','Scaling':'S8',
      'Stabilising':'S6','Mediating':'S5','Extracting':'S4',
      'Forgiving':'S3','Re-proving':'S1','Waiting':'S9'
    };
    const STALL_FREQ = {
      'Coordinating':97,'Narrating':91,'Scaling':88,
      'Stabilising':76,'Mediating':68,'Extracting':61,
      'Forgiving':54,'Re-proving':47,'Waiting':38
    };
    const STALL_NAMES = {
      'Coordinating':'Coordinating instead of deciding',
      'Narrating':'Narrating instead of testing',
      'Scaling':'Scaling activity instead of throughput',
      'Stabilising':'Stabilising around incumbents',
      'Mediating':'Mediating instead of coupling',
      'Extracting':'Extracting without reinvesting',
      'Forgiving':'Forgiving instead of redesigning',
      'Re-proving':'Re-proving instead of narrowing',
      'Waiting':'Waiting for permission'
    };

    // Full-diag adds per stack
    const FULL_DIAG = {
      'Coordinating+Mediating': [
        'Verification of coordination structure depth — layers, tenure, decision authority',
        'Intermediary volume analysis — brokered vs direct connections over time',
        'Decision record analysis — which decisions required full alignment',
        'Confidence tier for each stall (Tier 1 / 2 / 3)',
        'Cross-cluster synthesis if the pattern spans multiple clusters',
        'Leverage hypothesis tested against comparable ecosystem evidence'
      ],
      'Narrating+Scaling': [
        'Document production analysis — strategy volume vs output evidence',
        'Programme throughput analysis — what scaled vs what produced market outcomes',
        'Funder incentive mapping — what the reporting structure rewards',
        'Confidence tier for each stall (Tier 1 / 2 / 3)',
        'Comparator ecosystem evidence — where Narrative × Activity has shifted and how',
        'Leverage hypothesis with specific metric recommendations'
      ],
      'Coordinating+Stabilising': [
        'Incumbent network mapping — who controls access to what',
        'New entrant traction analysis — conversion rates inside vs outside incumbent orbit',
        'Procurement flow analysis — where RFIs originate and who they reach',
        'Confidence tier for each stall (Tier 1 / 2 / 3)',
        'Comparator ecosystem evidence — how similar configurations have opened',
        'Leverage hypothesis with specific direct-coupling recommendations'
      ],
      default: [
        'Evidence collection across 50-170 structured items per cluster',
        'Confidence tier rating for each stall (Tier 1: Robust / Tier 2: Adequate / Tier 3: Indicative)',
        'Cross-actor signal analysis — what each actor type is generating',
        'Comparator ecosystem evidence specific to your configuration',
        'Verified leverage hypothesis with comparable ecosystem precedent',
        'Full configuration document for ClusterOS substrate setup'
      ]
    };

    const stackKey = stalls.slice().sort().join('+');
    const fullDiagAdds = FULL_DIAG[stackKey] || FULL_DIAG.default;

    // Build comparators from matched clusters
    const comparators = matched.slice(0,2).map(c => ({
      a: { region: c.name, sector: (c.sector||c.country||'') },
      b: { region: 'Your ecosystem', sector: 'Self-diagnostic' },
      pattern: stalls.slice(0,2).join('-')
    }));

    window.CLUSTEROS_REPORT = {
      ecosystem: document.getElementById('jf-eco-name')?.value?.trim() || 'Your Ecosystem',
      sector:    '',
      geography: '',
      role:      document.getElementById('jf-eco-role')?.value?.trim() || 'Cluster Steward',
      stalls:    stalls.map(s => ({
        id:   STALL_CODES[s] || s,
        name: STALL_NAMES[s] || s,
        freq: STALL_FREQ[s]  || 50
      })),
      stack: {
        name:        stack.name        || stalls.join(' + '),
        stalls:      stalls,
        description: stack.description || '',
        leverage:    stack.leverage    || ''
      },
      comparators,
      fullDiagAdds
    };

    return window.CLUSTEROS_REPORT;
  },

  _renderDiagCTA() {
    this._buildReport();
    const sn=this.stackResult?.name||this.selectedStalls.join(' + ');
    this._setPanelHeader('01 · The Diagnostic');
    const steps=['Pick behaviours','Name stalls','Build stack','See examples','Leverage','Next steps'];
    this._setPanel(`
      <span class="jnav-stage">Step 6 · Next steps</span>
      ${this._diagNav(steps,5)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._openReport()" style="background:var(--green-dim)">Get your report →</button>
        <a class="jnav-btn-primary" href="/request.html" target="_blank" style="display:block;text-align:center;text-decoration:none;background:transparent;color:var(--green);border:1px solid var(--green)">Request a full diagnostic →</a>
        <button class="jnav-btn-secondary" onclick="journey._startInfra()">02 · The Infrastructure</button>
        <button class="jnav-btn-secondary" onclick="journey._startCAS()">03 · Complex Adaptive Systems</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <div class="jf-cta-stage">
        <h2 class="jf-cta-heading">Your report<br><em>is ready.</em></h2>
        <p class="jf-cta-body">You've identified a <strong>${sn}</strong> configuration. Name your ecosystem and get your self-diagnostic report — stalls named, stack described, comparator clusters, leverage hypothesis, and what a full diagnostic would add.</p>
        <div style="margin:20px 0;display:flex;flex-direction:column;gap:8px">
          <input id="jf-eco-name" type="text" placeholder="Ecosystem name (e.g. Belfast Cyber Cluster)"
            style="padding:12px 14px;border:1px solid var(--border-2);border-radius:3px;font-family:var(--font-sans);font-size:14px;color:var(--ink);background:var(--surface);width:100%;outline:none"
            onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border-2)'">
          <input id="jf-eco-role" type="text" placeholder="Your role (e.g. Cluster Manager)"
            style="padding:12px 14px;border:1px solid var(--border-2);border-radius:3px;font-family:var(--font-sans);font-size:14px;color:var(--ink);background:var(--surface);width:100%;outline:none"
            onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border-2)'">
        </div>
        <p class="jf-cta-sub">Printable · Shareable · Yours to keep</p>
        <button class="jf-cta-btn" onclick="journey._openReport()" style="cursor:pointer;border:none">Get your report →</button>
        <a class="jf-cta-btn" href="/request.html" target="_blank" style="background:transparent;color:var(--green);border:2px solid var(--green);display:inline-block;margin-top:10px">Request a full diagnostic →</a>
        <div style="margin-top:28px;padding-top:24px;border-top:1px solid var(--border)">
          <p style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);margin:0 0 12px">Continue exploring</p>
          <button class="jnav-btn-secondary" style="width:100%;margin-bottom:8px" onclick="journey._startInfra()">02 · The Infrastructure →</button>
          <button class="jnav-btn-secondary" style="width:100%" onclick="journey._startCAS()">03 · Complex Adaptive Systems →</button>
        </div>
      </div>`);
  },

  _openReport() {
    window.open('/diagnostic-report.html', '_blank');
  },

  // ══ FORK 2: INFRASTRUCTURE ════════════════════════════

  _startInfra() {
    this.fork='infrastructure';
    this._renderInfra1();
  },

  _infraNav(steps,active) {
    return `<div class="jnav-steps">${steps.map((s,i)=>`<div class="jnav-step ${i===active?'active':i<active?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>`;
  },

  _renderInfra1() {
    this._setPanelHeader('02 · The Infrastructure');
    const steps=['Not a platform','Signal cascade','Actor journeys','Intelligence layer','What it costs'];
    this._setPanel(`
      <span class="jnav-stage">Stage 1 · Not a platform</span>
      <p class="jnav-context">The fundamental distinction — why ClusterOS is infrastructure, not a community platform with AI features added.</p>
      ${this._infraNav(steps,0)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderInfra2()">Signal cascade →</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Not a platform.<br><em>An infrastructure layer.</em></h2>
      <p class="jf-stage-sub">The distinction matters because it determines what's possible. A platform is a place you go to. An infrastructure layer is what your ecosystem runs on.</p>
      <div class="jf-contrast">
        <div class="jf-contrast-col jf-contrast-bad"><span class="jf-contrast-label">Community platform</span><p>Actors log in to add value. Intelligence is built into the interface — frozen at build time. Dashboards show what happened. Everyone sees the same surface. Value depends on active participation.</p></div>
        <div class="jf-contrast-col jf-contrast-good"><span class="jf-contrast-label">ClusterOS infrastructure</span><p>Actors pursue their own goals. Intelligence lives in the protocol layer — assembled at runtime from live data. Every actor sees a different surface. Value compounds from selfish behaviour. The system improves whenever the AI model improves.</p></div>
      </div>
      <p class="jf-pull">"No actor needs to care about the ecosystem for the ecosystem to function as a system."</p>
      <div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">The cold start is solved</div>
        <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">Autonomous bots ingest external signals continuously. The platform arrives pre-populated. No actor is ever asked to fill a blank page.</p>
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderInfra2()" style="padding:12px 28px;font-size:12px">Signal cascade →</button>
      </div>`);
  },

  _renderInfra2() {
    this._setPanelHeader('02 · The Infrastructure');
    const steps=['Not a platform','Signal cascade','Actor journeys','Intelligence layer','What it costs'];
    this._setPanel(`
      <span class="jnav-stage">Stage 2 · Signal cascade</span>
      <p class="jnav-context">The same event reaches every actor differently. This is what coordination infrastructure actually does.</p>
      ${this._infraNav(steps,1)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderInfra3()">Actor journeys →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra1()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">One event.<br><em>Four reframings.</em></h2>
      <p class="jf-stage-sub">A corporate partner posts a procurement RFI. In a connected substrate, that single selfish act cascades — and each actor sees something completely different.</p>
      <div style="padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px;margin-bottom:20px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink-muted);margin-bottom:6px">The triggering event</div>
        <div style="font-size:14px;color:var(--ink);font-weight:400">Corporate partner posts open RFI: advanced sensing technology for autonomous systems, 6-month procurement window</div>
      </div>
      <div class="jf-reframings">
        ${[
          {a:'founder',    l:'Founder',    t:"The system matches the RFI to three founders by technology type and readiness level. Each sees why they're a match and what the corporate needs to see to progress."},
          {a:'researcher', l:'Researcher', t:"A recently published paper on sensor fusion is matched to the RFI and distributed across three clusters. The researcher didn't network. Their paper did."},
          {a:'steward',    l:'Steward',    t:"The infrastructure registers a research-to-industry connection forming — updates the cluster health score. The steward sees a bridging opportunity and an available intervention. Not an activity log — a diagnostic signal."},
          {a:'anchor',     l:'Anchor',     t:"A founder-researcher collaboration qualifies for a government innovation fund. The system identified the eligibility, surfaced the deadline, and pre-filled the application."}
        ].map(r=>`<div class="jf-reframing"><span class="jf-reframing-actor jf-actor-${r.a}">${r.l}</span><p class="jf-reframing-text">${r.t}</p></div>`).join('')}
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderInfra3()" style="padding:12px 28px;font-size:12px">Actor journeys →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra1()">← Back</button>
      </div>`);
  },

  _renderInfra3() {
    this._setPanelHeader('02 · The Infrastructure');
    const steps=['Not a platform','Signal cascade','Actor journeys','Intelligence layer','What it costs'];
    this._setPanel(`
      <span class="jnav-stage">Stage 3 · Actor journeys</span>
      <p class="jnav-context">Each actor type sees a different surface. Select one to see what their experience looks like.</p>
      ${this._infraNav(steps,2)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderInfra4()">Intelligence layer →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra2()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Each actor sees<br><em>a different surface.</em></h2>
      <p class="jf-stage-sub">Same infrastructure beneath. Select a role to see what onboarding and the platform experience looks like from that seat. This is the actual onboarding interface.</p>
      <div style="margin-top:24px;border:1px solid var(--border);border-radius:6px;overflow:hidden">
        <section id="demo">
  <div class="demo-inner">
    <div class="demo-intro">
      <div class="section-label reveal">The platform</div>
      <h2 class="section-headline reveal reveal-delay-1">Each actor sees a <em>different surface.</em><br>Same infrastructure beneath.</h2>
      <p class="section-sub reveal reveal-delay-2" style="margin-bottom:0">
        Choose your role below. The system asks three questions, then builds your personalised pathway. This is what onboarding looks like from each seat.
      </p>
    </div>

    <!-- Single app window -->
    <div class="app-window reveal">

      <!-- macOS-style window chrome -->
      <div class="window-chrome">
        <div class="chrome-dot red"></div>
        <div class="chrome-dot amber"></div>
        <div class="chrome-dot green"></div>
        <div class="chrome-address">app.clusteros-v2.vercel.app/onboarding</div>
      </div>

      <!-- Window body: left panel + right panel -->
      <div class="window-body">

        <!-- LEFT: role selector or chat -->
        <div class="panel-left" id="panel-left">

          <!-- Phase 0: role selector -->
          <div class="role-selector" id="role-selector">
            <div class="role-selector-label">Select your role to begin</div>
            <div class="role-selector-title">Who are you in this ecosystem?</div>
            <div class="role-selector-sub">ClusterOS looks different depending on where you sit. Choose your role to see your personalised onboarding.</div>
            <div class="role-cards">
              <div class="role-card steward" onclick="startActor('steward')">
                <div class="role-card-icon">⚙</div>
                <div>
                  <div class="role-card-name">Cluster Steward</div>
                  <div class="role-card-desc">Managing the ecosystem, accountable for its health</div>
                </div>
                <div class="role-card-arrow">→</div>
              </div>
              <div class="role-card corporate" onclick="startActor('corporate')">
                <div class="role-card-icon">🏢</div>
                <div>
                  <div class="role-card-name">Corporate Partner</div>
                  <div class="role-card-desc">Sourcing technology, validating startups, building pipeline</div>
                </div>
                <div class="role-card-arrow">→</div>
              </div>
              <div class="role-card founder" onclick="startActor('founder')">
                <div class="role-card-icon">🚀</div>
                <div>
                  <div class="role-card-name">Startup Founder</div>
                  <div class="role-card-desc">Seeking customers, validation and funding</div>
                </div>
                <div class="role-card-arrow">→</div>
              </div>
              <div class="role-card researcher" onclick="startActor('researcher')">
                <div class="role-card-icon">🔬</div>
                <div>
                  <div class="role-card-name">Researcher</div>
                  <div class="role-card-desc">Turning published research into commercial reach</div>
                </div>
                <div class="role-card-arrow">→</div>
              </div>
            </div>
          </div>

          <!-- Phase 1+: chat -->
          <div class="chat-panel" id="chat-panel" style="display:none;">
            <div class="chat-actor-header">
              <div class="chat-actor-dot" id="chat-actor-dot"></div>
              <div>
                <div class="chat-actor-name" id="chat-actor-name"></div>
                <div class="chat-actor-role" id="chat-actor-role"></div>
              </div>
              <button class="chat-back" onclick="resetToSelector()">← Change role</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div id="chat-options-wrap">
              <div class="chat-prompt-hint" id="prompt-hint">Select your response</div>
              <div class="chat-options" id="chat-options"></div>
            </div>
          </div>

        </div><!-- /panel-left -->

        <!-- RIGHT: waiting → building → dashboard -->
        <div class="panel-right">

          <!-- Waiting -->
          <div class="panel-right-waiting" id="panel-waiting">
            <div class="waiting-icon">⬡</div>
            <div class="waiting-title">Your dashboard will appear here</div>
            <div class="waiting-sub">Answer the questions on the left — the system builds your personalised ecosystem view as you go.</div>
          </div>

          <!-- Building -->
          <div class="panel-right-building" id="panel-building">
            <div class="building-spinner"></div>
            <div class="building-lines">
              <div class="building-line"></div>
              <div class="building-line"></div>
              <div class="building-line"></div>
            </div>
            <div class="building-label" id="building-label">Building your pathway...</div>
          </div>

          <!-- Dashboard -->
          <div class="panel-right-dashboard" id="panel-dashboard">
            <!-- populated by JS -->
          </div>

        </div><!-- /panel-right -->

      </div><!-- /window-body -->

      <!-- Switch strip — shown after dashboard reveals -->
      <div class="switch-strip" id="switch-strip">
        <span class="switch-strip-label">Try another role →</span>
        <div class="switch-strip-btns">
          <button class="switch-btn steward" onclick="switchActor('steward')">Steward</button>
          <button class="switch-btn corporate" onclick="switchActor('corporate')">Corporate</button>
          <button class="switch-btn founder" onclick="switchActor('founder')">Founder</button>
          <button class="switch-btn researcher" onclick="switchActor('researcher')">Researcher</button>
        </div>
      </div>

    </div><!-- /app-window -->

  </div>
</section>
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderInfra4()" style="padding:12px 28px;font-size:12px">Intelligence layer →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra2()">← Back</button>
      </div>`);
    setTimeout(()=>{ if(typeof resetToSelector==='function'){resetToSelector(); document.querySelectorAll('#journey-frame .role-card').forEach(card=>{ ['steward','corporate','founder','researcher'].forEach(role=>{ if(card.classList.contains(role)) card.onclick=()=>typeof startActor==='function'&&startActor(role); }); }); } },200);
  },

  _renderInfra4() {
    this._setPanelHeader('02 · The Infrastructure');
    const steps=['Not a platform','Signal cascade','Actor journeys','Intelligence layer','What it costs'];
    this._setPanel(`
      <span class="jnav-stage">Stage 4 · Intelligence layer</span>
      <p class="jnav-context">MCP substrate, sovereign database, autonomous bot network.</p>
      ${this._infraNav(steps,3)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderInfra5()">What it costs →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra3()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Intelligence at<br><em>the protocol layer.</em></h2>
      <p class="jf-stage-sub">Where does intelligence live? In the interface (hardcoded, frozen, role-generic) or in the protocol (live, role-aware, improving automatically)?</p>
      <p class="jf-pull">When the AI model improves, everything the platform produces improves automatically. No rebuild required.</p>
      <div style="margin-bottom:24px;overflow-x:auto">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--ink-muted);margin-bottom:12px">Architecture overview — read from bottom up</div>
        <div style="background:#09101f;border-radius:6px;padding:16px;overflow-x:auto">
          <svg viewBox="0 0 960 680" xmlns="http://www.w3.org/2000/svg" font-family="'Geist Mono', monospace">
      <defs>
        <marker id="arrow-signal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c8f0d0"/></marker>
        <marker id="arrow-chalk" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#1a1a1a"/></marker>
        <marker id="arrow-muted" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7a95b0"/></marker>
      </defs>

      <rect x="0" y="0" width="960" height="680" fill="#f7f4ef"/>
      <rect x="0" y="10" width="960" height="110" fill="#111c2e" opacity="0.7"/>
      <rect x="0" y="130" width="960" height="110" fill="#0d1625" opacity="0.9"/>
      <rect x="0" y="250" width="960" height="110" fill="#111c2e" opacity="0.7"/>
      <rect x="0" y="370" width="960" height="110" fill="#0d1625" opacity="0.9"/>
      <rect x="0" y="490" width="960" height="110" fill="#111c2e" opacity="0.7"/>
      <rect x="0" y="600" width="960" height="80" fill="#0d1625" opacity="0.9"/>

      <text x="14" y="76" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,76)">ACTOR EXPERIENCE</text>
      <text x="14" y="196" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,196)">INTELLIGENCE</text>
      <text x="14" y="316" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,316)">PROTOCOL</text>
      <text x="14" y="436" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,436)">DATA LAYER</text>
      <text x="14" y="556" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,556)">EXTERNAL SIGNALS</text>
      <text x="14" y="656" fill="#3a5570" font-size="8.5" letter-spacing="1.5" text-anchor="start" transform="rotate(-90,14,656)">GOVERNANCE</text>
      <line x1="30" y1="10" x2="30" y2="670" stroke="#ddd8cf" stroke-width="0.5"/>

      <!-- Actor experience cards -->
      <rect x="50" y="22" width="170" height="96" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="50" y="22" width="170" height="18" rx="2" fill="#1e3a28"/>
      <rect x="50" y="34" width="170" height="6" fill="#1e3a28"/>
      <text x="135" y="34" fill="#c8f0d0" font-size="7.5" font-weight="500" letter-spacing="0.8" text-anchor="middle">FOUNDER JOURNEY</text>
      <text x="60" y="58" fill="#c2cfe0" font-size="7.5">Personalised pathway</text>
      <text x="60" y="72" fill="#c2cfe0" font-size="7.5">Step unlock logic</text>
      <text x="60" y="86" fill="#c2cfe0" font-size="7.5">Matched connections</text>
      <text x="60" y="100" fill="#c2cfe0" font-size="7.5">Support programme alerts</text>
      <text x="60" y="113" fill="#3a5570" font-size="7" font-style="italic">Generated at runtime</text>

      <rect x="240" y="22" width="170" height="96" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="240" y="22" width="170" height="18" rx="2" fill="#2e2a14"/>
      <rect x="240" y="34" width="170" height="6" fill="#2e2a14"/>
      <text x="325" y="34" fill="#f5d97a" font-size="7.5" font-weight="500" letter-spacing="0.8" text-anchor="middle">ANCHOR JOURNEY</text>
      <text x="250" y="58" fill="#c2cfe0" font-size="7.5">Capability scouting</text>
      <text x="250" y="72" fill="#c2cfe0" font-size="7.5">RFI signal management</text>
      <text x="250" y="86" fill="#c2cfe0" font-size="7.5">Supply chain visibility</text>
      <text x="250" y="100" fill="#c2cfe0" font-size="7.5">No premature disclosure</text>
      <text x="250" y="113" fill="#3a5570" font-size="7" font-style="italic">Generated at runtime</text>

      <rect x="430" y="22" width="170" height="96" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="430" y="22" width="170" height="18" rx="2" fill="#162e2d"/>
      <rect x="430" y="34" width="170" height="6" fill="#162e2d"/>
      <text x="515" y="34" fill="#7dd3c8" font-size="7.5" font-weight="500" letter-spacing="0.8" text-anchor="middle">RESEARCHER JOURNEY</text>
      <text x="440" y="58" fill="#c2cfe0" font-size="7.5">Demand signal translation</text>
      <text x="440" y="72" fill="#c2cfe0" font-size="7.5">Commercial opportunity map</text>
      <text x="440" y="86" fill="#c2cfe0" font-size="7.5">IP boundary controls</text>
      <text x="440" y="100" fill="#c2cfe0" font-size="7.5">Research partner matching</text>
      <text x="440" y="113" fill="#3a5570" font-size="7" font-style="italic">Generated at runtime</text>

      <rect x="620" y="22" width="310" height="96" rx="2" fill="#111c2e" stroke="#c8f0d0" stroke-width="1.5"/>
      <rect x="620" y="22" width="310" height="18" rx="2" fill="#f0ece4"/>
      <rect x="620" y="34" width="310" height="6" fill="#f0ece4"/>
      <text x="775" y="34" fill="#1a1a1a" font-size="7.5" font-weight="500" letter-spacing="0.8" text-anchor="middle">STEWARD INTERROGATION</text>
      <text x="630" y="58" fill="#c2cfe0" font-size="7.5">System health signals (4 per cluster)</text>
      <text x="630" y="72" fill="#c2cfe0" font-size="7.5">Stall detection · Stack analysis</text>
      <text x="630" y="86" fill="#c2cfe0" font-size="7.5">Open-ended diagnostic interrogation</text>
      <text x="630" y="100" fill="#c2cfe0" font-size="7.5">Leverage hypothesis surfacing</text>
      <text x="630" y="113" fill="#3a5570" font-size="7" font-style="italic">Not a dashboard — questions nobody designed for</text>

      <!-- AI Reasoning -->
      <rect x="50" y="142" width="880" height="88" rx="2" fill="#1a3a28"/>
      <text x="490" y="163" fill="#c8f0d0" font-size="8" font-weight="500" letter-spacing="1.5" text-anchor="middle">AI REASONING ENGINE</text>
      <line x1="50" y1="170" x2="930" y2="170" stroke="#2a5038" stroke-width="0.5"/>
      <text x="140" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Journey Construction</text>
      <text x="280" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Signal Propagation</text>
      <text x="420" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Role-Aware Reframing</text>
      <text x="560" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Actor Matching</text>
      <text x="700" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Stall Detection</text>
      <text x="840" y="190" fill="#7ecf96" font-size="7.5" text-anchor="middle">Steward Interrogation</text>
      <line x1="210" y1="174" x2="210" y2="220" stroke="#2a5038" stroke-width="0.5"/>
      <line x1="350" y1="174" x2="350" y2="220" stroke="#2a5038" stroke-width="0.5"/>
      <line x1="490" y1="174" x2="490" y2="220" stroke="#2a5038" stroke-width="0.5"/>
      <line x1="630" y1="174" x2="630" y2="220" stroke="#2a5038" stroke-width="0.5"/>
      <line x1="770" y1="174" x2="770" y2="220" stroke="#2a5038" stroke-width="0.5"/>
      <text x="490" y="223" fill="#c8f0d0" font-size="7" text-anchor="middle">The AI is the runtime, not a feature. Every actor experience is constructed here, from live data, on demand.</text>

      <!-- MCP Protocol -->
      <rect x="50" y="262" width="880" height="98" rx="2" fill="#111c2e" stroke="#1a1a1a" stroke-width="1.5"/>
      <rect x="50" y="262" width="880" height="16" rx="2" fill="#f0ece4"/>
      <rect x="50" y="272" width="880" height="6" fill="#f0ece4"/>
      <text x="490" y="273" fill="#1a1a1a" font-size="7.5" font-weight="500" letter-spacing="1.5" text-anchor="middle">MODEL CONTEXT PROTOCOL (MCP) — INTELLIGENCE SUBSTRATE</text>
      <rect x="65" y="288" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="130" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_actor_profile()</text>
      <rect x="205" y="288" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="270" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_cluster_signals()</text>
      <rect x="345" y="288" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="410" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">detect_stalls()</text>
      <rect x="485" y="288" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="550" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_matched_connections()</text>
      <rect x="625" y="288" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="690" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">propagate_signal()</text>
      <rect x="765" y="288" width="150" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="840" y="301" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_steward_diagnostic()</text>
      <rect x="65" y="316" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="130" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_journey_state()</text>
      <rect x="205" y="316" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="270" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">search_support_programmes()</text>
      <rect x="345" y="316" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="410" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_open_funding()</text>
      <rect x="485" y="316" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="550" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">ingest_evidence()</text>
      <rect x="625" y="316" width="130" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="690" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">enrich_actor_profile()</text>
      <rect x="765" y="316" width="150" height="20" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="840" y="329" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">get_leverage_hypotheses()</text>
      <text x="490" y="354" fill="#3a5570" font-size="7" text-anchor="middle">Each tool is a structured call from the AI to the live database. Intelligence is not pre-baked — it is assembled from real data, at the moment it is needed.</text>

      <!-- Data Layer -->
      <rect x="50" y="382" width="450" height="98" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="50" y="382" width="450" height="16" rx="2" fill="#f0ece4"/>
      <rect x="50" y="392" width="450" height="6" fill="#f0ece4"/>
      <text x="275" y="393" fill="#1a1a1a" font-size="7.5" font-weight="500" letter-spacing="1" text-anchor="middle">SOVEREIGN ECOSYSTEM DATABASE</text>
      <text x="65" y="414" fill="#c2cfe0" font-size="7.5">Supercluster  ·  Clusters  ·  Groups  ·  Actors</text>
      <text x="65" y="428" fill="#c2cfe0" font-size="7.5">Actor profiles  ·  Signal history  ·  Journey state  ·  Evidence base</text>
      <text x="65" y="442" fill="#c2cfe0" font-size="7.5">Diagnostic outputs  ·  Stall records  ·  Leverage hypotheses</text>
      <text x="65" y="460" fill="#3a5570" font-size="7">One dedicated instance per regional EDA. Data does not leave the regional tenant.</text>
      <text x="65" y="472" fill="#3a5570" font-size="7">No cross-region model training without explicit consent. Full role-based access control.</text>

      <rect x="515" y="382" width="415" height="98" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="515" y="382" width="415" height="16" rx="2" fill="#1e3a28"/>
      <rect x="515" y="392" width="415" height="6" fill="#1e3a28"/>
      <text x="722" y="393" fill="#c8f0d0" font-size="7.5" font-weight="500" letter-spacing="1" text-anchor="middle">AUTONOMOUS BOT NETWORK</text>
      <rect x="528" y="406" width="90" height="34" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="573" y="420" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Evidence</text>
      <text x="573" y="431" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Ingestion Bot</text>
      <rect x="628" y="406" width="90" height="34" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="673" y="420" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Signal</text>
      <text x="673" y="431" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Monitoring Bot</text>
      <rect x="728" y="406" width="90" height="34" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="773" y="420" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Actor</text>
      <text x="773" y="431" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Enrichment Bot</text>
      <rect x="828" y="406" width="90" height="34" rx="2" fill="#0d1625" stroke="#ddd8cf" stroke-width="0.8"/>
      <text x="873" y="420" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Health</text>
      <text x="873" y="431" fill="#c8f0d0" font-size="7" text-anchor="middle" font-weight="500">Monitoring Bot</text>
      <text x="722" y="460" fill="#3a5570" font-size="7" text-anchor="middle">Scheduled AI agents. Write structured signals into the database on a defined cadence.</text>
      <text x="722" y="472" fill="#3a5570" font-size="7" text-anchor="middle">Cold-start solved: the platform knows the ecosystem before any actor joins.</text>

      <!-- External Signals -->
      <rect x="50" y="502" width="200" height="88" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="50" y="502" width="200" height="14" rx="2" fill="#ddd8cf"/>
      <text x="150" y="512" fill="#7a95b0" font-size="7" font-weight="500" letter-spacing="0.8" text-anchor="middle">GOVT SUPPORT DIRECTORY</text>
      <text x="62" y="530" fill="#c2cfe0" font-size="7.5">Live programme listings</text>
      <text x="62" y="543" fill="#c2cfe0" font-size="7.5">Funding routes by stage</text>
      <text x="62" y="556" fill="#c2cfe0" font-size="7.5">Advisor networks</text>
      <text x="62" y="570" fill="#3a5570" font-size="7">Ingested weekly via scrape · Open licence</text>

      <rect x="265" y="502" width="200" height="88" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="265" y="502" width="200" height="14" rx="2" fill="#ddd8cf"/>
      <text x="365" y="512" fill="#7a95b0" font-size="7" font-weight="500" letter-spacing="0.8" text-anchor="middle">COMMUNITY SERVICES API</text>
      <text x="277" y="530" fill="#c2cfe0" font-size="7.5">Wellbeing services by location</text>
      <text x="277" y="543" fill="#c2cfe0" font-size="7.5">Founder peer networks</text>
      <text x="277" y="556" fill="#c2cfe0" font-size="7.5">Community assets</text>
      <text x="277" y="570" fill="#3a5570" font-size="7">REST API · CC BY 4.0</text>

      <rect x="480" y="502" width="200" height="88" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="480" y="502" width="200" height="14" rx="2" fill="#ddd8cf"/>
      <text x="580" y="512" fill="#7a95b0" font-size="7" font-weight="500" letter-spacing="0.8" text-anchor="middle">PUBLICATION DATABASES</text>
      <text x="492" y="530" fill="#c2cfe0" font-size="7.5">Research outputs</text>
      <text x="492" y="543" fill="#c2cfe0" font-size="7.5">Grant announcements</text>
      <text x="492" y="556" fill="#c2cfe0" font-size="7.5">Patent filings</text>
      <text x="492" y="570" fill="#3a5570" font-size="7">Feeds researcher journey signals</text>

      <rect x="695" y="502" width="235" height="88" rx="2" fill="#111c2e" stroke="#ddd8cf" stroke-width="1"/>
      <rect x="695" y="502" width="235" height="14" rx="2" fill="#ddd8cf"/>
      <text x="812" y="512" fill="#7a95b0" font-size="7" font-weight="500" letter-spacing="0.8" text-anchor="middle">PROFESSIONAL IDENTITY</text>
      <text x="707" y="530" fill="#c2cfe0" font-size="7.5">Professional profile import</text>
      <text x="707" y="543" fill="#c2cfe0" font-size="7.5">Research identity (ORCID)</text>
      <text x="707" y="556" fill="#c2cfe0" font-size="7.5">Behavioural enrichment</text>
      <text x="707" y="570" fill="#3a5570" font-size="7">Progressive — never compulsory</text>

      <!-- Governance -->
      <rect x="50" y="610" width="880" height="58" rx="2" fill="#f0ece4"/>
      <text x="490" y="630" fill="#1a1a1a" font-size="7.5" font-weight="500" letter-spacing="1.5" text-anchor="middle">FEDERATED GOVERNANCE LAYER</text>
      <line x1="50" y1="636" x2="930" y2="636" stroke="#ddd8cf" stroke-width="0.5"/>
      <text x="220" y="650" fill="#3a5570" font-size="7" text-anchor="middle">Supercluster  ›  Cluster  ›  Group  ›  Actor</text>
      <text x="490" y="650" fill="#3a5570" font-size="7" text-anchor="middle">Identity-first · Role-based access · Full audit trail</text>
      <text x="760" y="650" fill="#3a5570" font-size="7" text-anchor="middle">Institutional autonomy preserved at every level</text>
      <text x="490" y="662" fill="#c8f0d0" font-size="7" text-anchor="middle">Data residency is jurisdictional. Each EDA operates a sovereign instance. The platform does not centralise regional data.</text>

      <!-- Wires -->
      <line x1="135" y1="118" x2="135" y2="142" stroke="#c8f0d0" stroke-width="1.5" marker-end="url(#arrow-signal)"/>
      <line x1="325" y1="118" x2="325" y2="142" stroke="#c8f0d0" stroke-width="1.5" marker-end="url(#arrow-signal)"/>
      <line x1="515" y1="118" x2="515" y2="142" stroke="#c8f0d0" stroke-width="1.5" marker-end="url(#arrow-signal)"/>
      <line x1="775" y1="118" x2="775" y2="142" stroke="#1a1a1a" stroke-width="2" marker-end="url(#arrow-chalk)"/>
      <line x1="490" y1="230" x2="490" y2="262" stroke="#c8f0d0" stroke-width="1.5" marker-end="url(#arrow-signal)"/>
      <line x1="480" y1="262" x2="480" y2="232" stroke="#c8f0d0" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow-signal)"/>
      <line x1="275" y1="360" x2="275" y2="382" stroke="#1a1a1a" stroke-width="1.5" marker-end="url(#arrow-chalk)"/>
      <line x1="265" y1="382" x2="265" y2="362" stroke="#7a95b0" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow-muted)"/>
      <line x1="700" y1="360" x2="700" y2="382" stroke="#c8f0d0" stroke-width="1.5" marker-end="url(#arrow-signal)"/>
      <line x1="573" y1="480" x2="573" y2="502" stroke="#7a95b0" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow-muted)"/>
      <line x1="690" y1="480" x2="690" y2="502" stroke="#7a95b0" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow-muted)"/>
      <line x1="810" y1="480" x2="810" y2="502" stroke="#7a95b0" stroke-width="1" stroke-dasharray="3,2" marker-end="url(#arrow-muted)"/>
      <line x1="150" y1="502" x2="150" y2="480" stroke="#c8f0d0" stroke-width="1.2" marker-end="url(#arrow-signal)"/>
      <line x1="365" y1="502" x2="365" y2="480" stroke="#c8f0d0" stroke-width="1.2" marker-end="url(#arrow-signal)"/>
      <line x1="275" y1="480" x2="275" y2="610" stroke="#1a1a1a" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow-chalk)"/>

      <!-- Legend -->
      <line x1="52" y1="132" x2="62" y2="132" stroke="#c8f0d0" stroke-width="2"/>
      <text x="66" y="135" fill="#3a5570" font-size="6.5">Active signal flow</text>
      <line x1="140" y1="132" x2="150" y2="132" stroke="#7a95b0" stroke-width="1" stroke-dasharray="2,1.5"/>
      <text x="154" y="135" fill="#3a5570" font-size="6.5">Data retrieval (MCP call)</text>
      <line x1="265" y1="132" x2="275" y2="132" stroke="#1a1a1a" stroke-width="2"/>
      <text x="279" y="135" fill="#3a5570" font-size="6.5">Governance / auth boundary</text>
    </svg>
        </div>
      </div>
      <div class="jf-sovereign"><span class="jf-sovereign-label">Sovereign by design</span>One dedicated database per regional EDA. Data residency is jurisdictional. The intelligence layer improves centrally via model updates. Full role-based access control.</div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderInfra5()" style="padding:12px 28px;font-size:12px">What it costs →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderInfra3()">← Back</button>
      </div>`);
  },

  _renderInfra5() {
    this._setPanelHeader('02 · The Infrastructure');
    const steps=['Not a platform','Signal cascade','Actor journeys','Intelligence layer','What it costs'];
    this._setPanel(`
      <span class="jnav-stage">Stage 5 · What it costs</span>
      <p class="jnav-context">Three ways into the platform. One direction.</p>
      ${this._infraNav(steps,4)}
      <div class="jnav-actions">
        <a class="jnav-btn-primary" href="/pricing.html" target="_blank" style="display:block;text-align:center;text-decoration:none">See full pricing →</a>
        <button class="jnav-btn-secondary" onclick="journey._startDiag()">01 · The Diagnostic</button>
        <button class="jnav-btn-secondary" onclick="journey._startCAS()">03 · Complex Adaptive Systems</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Three ways in.<br><em>One direction.</em></h2>
      <p class="jf-stage-sub">ClusterOS is designed to be entered at the right level for where you are. The diagnostic confirms whether the structural conditions exist for platform investment.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px">
        ${[
          {n:'01',name:'Snapshot diagnostic',price:'Fixed price',time:'4-5 weeks',body:"The full 5-stage pipeline against your specific cluster. Named configuration, stack analysis, leverage hypothesis, comparative context, briefing document."},
          {n:'02',name:'Full diagnostic run',price:'Project price',time:'8-12 weeks',body:"Extended evidence review across the full cluster portfolio. Multiple cluster comparisons, regime mapping, prioritised intervention sequencing."},
          {n:'03',name:'Platform procurement',price:'Annual licence',time:'Ongoing',body:"One sovereign instance per EDA. Full infrastructure — diagnostic capability, actor journeys, signal ingestion, bot network, federated governance. Diagnostic runs included."}
        ].map(s=>`<div style="display:flex;gap:16px;padding:20px 24px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--green);flex-shrink:0;padding-top:2px">${s.n}</div><div style="flex:1"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><div style="font-size:15px;font-weight:500;color:var(--ink)">${s.name}</div><div style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted)">${s.price} · ${s.time}</div></div><p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">${s.body}</p></div></div>`).join('')}
      </div>
      <div>
        <a class="jf-cta-btn" href="/pricing.html" target="_blank">See full pricing →</a>
        <a class="jf-cta-btn" href="mailto:andrew@communitylab.app?subject=ClusterOS%20infrastructure%20conversation" style="background:transparent;color:var(--green);border:2px solid var(--green);display:inline-block;margin-left:10px">Talk to Andrew →</a>
      </div>`);
  },

  // ══ FORK 3: COMPLEX ADAPTIVE SYSTEMS ═════════════════

  _startCAS() {
    this.fork='cas';
    this._renderCAS1();
  },

  _casNav(steps,active) {
    return `<div class="jnav-steps">${steps.map((s,i)=>`<div class="jnav-step ${i===active?'active':i<active?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>`;
  },

  _renderCAS1() {
    this._setPanelHeader('03 · Complex Adaptive Systems');
    const steps=['Why CAS matters','The selfishness principle','Signal propagation','Steward interrogation','What this means'];
    this._setPanel(`
      <span class="jnav-stage">Stage 1 · Why CAS matters</span>
      <p class="jnav-context">Ecosystems aren't organisations. The implications of that are more radical than most people account for.</p>
      ${this._casNav(steps,0)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderCAS2()">The selfishness principle →</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Ecosystems aren't organisations.<br><em>That changes everything.</em></h2>
      <p class="jf-stage-sub">A complex adaptive system is self-organising. It doesn't respond to top-down direction the way an organisation does. Interventions that would work in an organisation — strategy, restructuring, performance management — either don't work or produce the opposite of what's intended.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
        ${[
          {title:'What makes a CAS',body:'Actors are autonomous. They respond to local incentives, not central direction. The system\'s behaviour emerges from millions of local decisions — not from a plan. No actor can see the whole system. No actor controls it.'},
          {title:'Why top-down fails',body:'When you try to manage a CAS as if it were an organisation, you produce compliance, not change. Actors learn to report what you want to hear. The system adapts around your intervention. The stall survives the strategy.'},
          {title:'The diagnostic implication',body:'Stalls aren\'t failures of management. They\'re rational adaptations by actors responding sensibly to local incentives. Understanding why each actor benefits from the current arrangement is the precondition for changing it.'},
          {title:'Why ClusterOS is different',body:'ClusterOS doesn\'t try to coordinate actors. It changes what their self-interested behaviour produces. Every actor pursues their own goals. The infrastructure captures that as compounding intelligence. No actor needs to care about the ecosystem for the ecosystem to function as a system.'}
        ].map(s=>`<div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">${s.title}</div><p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">${s.body}</p></div>`).join('')}
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderCAS2()" style="padding:12px 28px;font-size:12px">The selfishness principle →</button>
      </div>`);
  },

  _renderCAS2() {
    this._setPanelHeader('03 · Complex Adaptive Systems');
    const steps=['Why CAS matters','The selfishness principle','Signal propagation','Steward interrogation','What this means'];
    this._setPanel(`
      <span class="jnav-stage">Stage 2 · The selfishness principle</span>
      <p class="jnav-context">Every actor pursues their own interest. ClusterOS captures that as signal. Stewardship is not control.</p>
      ${this._casNav(steps,1)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderCAS3()">Signal propagation →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS1()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Selfish actors.<br><em>Collective intelligence.</em></h2>
      <p class="jf-stage-sub">The selfishness principle is the foundation of the ClusterOS architecture. It is not a cynical observation. It is a design constraint that makes the system work.</p>
      <p class="jf-pull">"No actor needs to care about the ecosystem for the ecosystem to function as a system."</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:28px">
        ${[
          {actor:'Founder',    col:'#8b6914', bg:'rgba(245,217,122,0.08)', text:'Seeks customers, funding and validation. Every action they take — connecting, applying, progressing — generates signals about what the ecosystem lacks and what it can offer.'},
          {actor:'Researcher', col:'#c0392b', bg:'rgba(240,128,128,0.08)', text:'Wants commercial application for their work. Their publications, collaborations and IP decisions generate signals about research-to-market gaps and emerging capability.'},
          {actor:'Anchor',     col:'#2a7a4f', bg:'rgba(42,122,79,0.08)',   text:'Needs capability and wants to reduce procurement risk. Their RFIs, procurement decisions and hiring signals generate the strongest demand-side intelligence in the ecosystem.'},
          {actor:'Steward',    col:'#0d7377', bg:'rgba(125,211,200,0.08)', text:'Needs to demonstrate impact and identify interventions. Their interrogation queries and interpretation decisions generate signals about what matters and what\'s being watched.'}
        ].map(a=>`<div style="padding:16px 18px;background:${a.bg};border:1px solid var(--border);border-radius:4px;display:flex;gap:12px;align-items:flex-start"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${a.col};white-space:nowrap;padding-top:2px;min-width:70px">${a.actor}</div><p style="font-size:13px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">${a.text}</p></div>`).join('')}
      </div>
      <div style="padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px;border-left:3px solid var(--green)">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">The membrane principle</div>
        <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">The ecosystem has a membrane — the boundary between what's inside the system and what's outside. Outside actors (investors, diaspora, global clients, knowledge institutions) are participants, not visitors. Their signals matter. The infrastructure captures them.</p>
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderCAS3()" style="padding:12px 28px;font-size:12px">Signal propagation →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS1()">← Back</button>
      </div>`);
  },

  _renderCAS3() {
    this._setPanelHeader('03 · Complex Adaptive Systems');
    const steps=['Why CAS matters','The selfishness principle','Signal propagation','Steward interrogation','What this means'];
    this._setPanel(`
      <span class="jnav-stage">Stage 3 · Signal propagation</span>
      <p class="jnav-context">How a single typed signal cascades through the infrastructure — and why that's different from broadcast.</p>
      ${this._casNav(steps,2)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderCAS4()">Steward interrogation →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS2()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Signals propagate.<br><em>They don't broadcast.</em></h2>
      <p class="jf-stage-sub">In a broadcast system, one message goes to everyone. In the ClusterOS infrastructure, a single signal is typed, matched, and reframed for each actor based on what it means to them specifically. The same underlying data. Different intelligence surfaces.</p>
      <div style="padding:20px 24px;background:var(--surface);border:1px solid var(--border);border-radius:4px;margin-bottom:20px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink-muted);margin-bottom:12px">Signal types the infrastructure captures</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${['Procurement intent','Research output','Funding eligibility','Capability gap','Partnership formation','Hiring signal','Milestone progression','IP disclosure level','Support programme match','Stall indicator','Health score change','Leverage position'].map(s=>`<div style="font-family:var(--font-mono);font-size:10px;color:var(--green);padding:4px 8px;background:rgba(42,122,79,0.06);border:1px solid rgba(42,122,79,0.15);border-radius:2px">${s}</div>`).join('')}
        </div>
      </div>
      <div style="padding:18px 20px;background:rgba(42,122,79,0.06);border:1px solid rgba(42,122,79,0.2);border-radius:4px;margin-bottom:20px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">Why propagation beats broadcast</div>
        <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">A procurement RFI broadcast to 400 cluster members produces noise. The same RFI propagated through the infrastructure reaches 3 matched founders, 2 relevant researchers, the steward with a bridging score update, and the anchor with a supply chain intelligence note. Same signal. Four times the value. Zero additional effort from the sender.</p>
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderCAS4()" style="padding:12px 28px;font-size:12px">Steward interrogation →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS2()">← Back</button>
      </div>`);
  },

  _renderCAS4() {
    this._setPanelHeader('03 · Complex Adaptive Systems');
    const steps=['Why CAS matters','The selfishness principle','Signal propagation','Steward interrogation','What this means'];
    this._setPanel(`
      <span class="jnav-stage">Stage 4 · Steward interrogation</span>
      <p class="jnav-context">The steward doesn't manage the CAS. They interrogate it. The difference is structural.</p>
      ${this._casNav(steps,3)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderCAS5()">What this means →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS3()">← Back</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Not a dashboard.<br><em>An interrogation layer.</em></h2>
      <p class="jf-stage-sub">A dashboard shows you what happened. An interrogation layer lets you ask questions nobody designed for — and reason against live data to answer them. The difference determines what interventions are possible.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px">
        ${[
          {q:"What's actually happening in the Advanced Manufacturing cluster?",a:"Bridging score: 34/100. Re-proving stall active at 71% intensity. Three founders have relevant capability for current corporate RFIs — none have been matched yet. Intervention available."},
          {q:"Which clusters are approaching leverage position?",a:"Glasgow Life Sciences and Research Triangle show stack configurations with known leverage hypotheses. Both have high-confidence stall detection. Snapshot diagnostic recommended for both within 60 days."},
          {q:"Where is the ecosystem generating compounding vs cycling value?",a:"Fintech cluster: velocity +12% month on month, 4 new university-industry connections, 2 series A completions with local follow-on. Advanced Manufacturing: velocity flat, coordination events up 40%, committed outputs down."},
          {q:"What would happen if the anchor changed their procurement threshold?",a:"Modelling procurement threshold change: 4 founders currently below threshold would become eligible. Projected impact: +2 pilot contracts, +£340k in cluster-retained value, bridging score increase of 18 points over 6 months."}
        ].map(s=>`<div style="padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:4px">
          <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);margin-bottom:6px">Steward query</div>
          <div style="font-size:13px;color:var(--ink);margin-bottom:10px;font-style:italic">"${s.q}"</div>
          <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--green);margin-bottom:6px">System response</div>
          <p style="font-size:13px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">${s.a}</p>
        </div>`).join('')}
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._renderCAS5()" style="padding:12px 28px;font-size:12px">What this means →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderCAS3()">← Back</button>
      </div>`);
  },

  _renderCAS5() {
    this._setPanelHeader('03 · Complex Adaptive Systems');
    const steps=['Why CAS matters','The selfishness principle','Signal propagation','Steward interrogation','What this means'];
    this._setPanel(`
      <span class="jnav-stage">Stage 5 · What this means</span>
      ${this._casNav(steps,4)}
      <div class="jnav-actions">
        <a class="jnav-btn-primary" href="/signals-systems.html" target="_blank" style="display:block;text-align:center;text-decoration:none">Explore Signals & Systems →</a>
        <button class="jnav-btn-secondary" onclick="journey._startDiag()">01 · The Diagnostic</button>
        <button class="jnav-btn-secondary" onclick="journey._startInfra()">02 · The Infrastructure</button>
      </div>
      ${this._escape()}`);
    this._setFrame(`
      <h2 class="jf-stage-heading">The system compounds<br><em>because actors are selfish.</em></h2>
      <p class="jf-stage-sub">Not despite it. The architecture works because it routes self-interest into collective intelligence rather than trying to replace self-interest with collective action.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
        ${[
          {title:'Why other approaches fail',body:'Platforms that require actors to contribute for the collective good fail because self-interest wins. Community platforms produce lurkers and a small number of power users. The 90-9-1 rule is not a behaviour problem. It is an architectural one.'},
          {title:'Why ClusterOS works',body:'Every actor is a power user of their own journey. The founder maximising their chances of a pilot contract is simultaneously generating procurement intelligence for the steward and demand signals for the researcher. Self-interest and collective value are structurally aligned.'},
          {title:'What stewardship actually is',body:'In a CAS, stewardship is not control. It is the identification of which constraints, if changed, would produce different emergent behaviour. The steward doesn\'t direct the ecosystem. They change the conditions under which actors make their selfish decisions.'},
          {title:'The diagnostic as CAS intervention',body:'A stall is a rational adaptation. The diagnostic identifies which actor is adapting in a way that prevents compounding — and what constraint change would make a different adaptation rational for them. That is a CAS intervention. It is the only kind that works.'}
        ].map(s=>`<div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">${s.title}</div><p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">${s.body}</p></div>`).join('')}
      </div>
      <div style="padding:20px 24px;background:rgba(42,122,79,0.06);border:1px solid rgba(42,122,79,0.2);border-radius:4px;margin-bottom:24px">
        <p style="font-family:var(--font-serif);font-size:16px;font-style:italic;color:var(--ink);line-height:1.6;margin:0">"The question is never: how do we get actors to care about the ecosystem? The question is always: what constraint change makes the behaviour we want the rational choice for actors who don't?"</p>
      </div>
      <div>
        <a class="jf-cta-btn" href="/signals-systems.html" target="_blank">Explore Signals & Systems in full →</a>
        <a class="jf-cta-btn" href="/request.html" target="_blank" style="background:transparent;color:var(--green);border:2px solid var(--green);display:inline-block;margin-top:10px">Request a diagnostic →</a>
      </div>`);
  },

  // ── UTILITIES ─────────────────────────────────────────
  _findStack(stalls) {
    if(stalls.length<2) return null;
    for(let i=0;i<stalls.length;i++) for(let j=i+1;j<stalls.length;j++){
      const k1=stalls[i]+'+'+stalls[j], k2=stalls[j]+'+'+stalls[i];
      if(NAMED_STACKS[k1]) return{named:true,...NAMED_STACKS[k1]};
      if(NAMED_STACKS[k2]) return{named:true,...NAMED_STACKS[k2]};
    }
    return{named:false};
  },

  _matchClusters(limit) {
    const all=window._allClusters||[]; if(!all.length) return[];
    const targets=this.selectedStalls.map(s=>s.toLowerCase());
    const A={'narrating':['narrating instead'],'coordinating':['coordinating instead'],'re-proving':['re-proving instead'],'scaling':['scaling activity'],'mediating':['mediating instead'],'extracting':['extracting without'],'forgiving':['forgiving instead'],'stabilising':['stabilising around','stabilizing around'],'waiting':['waiting for']};
    return all.map(c=>{
      const ns=(c.stalls||[]).map(s=>(s.name||'').toLowerCase());
      let sc=0; targets.forEach(t=>{const al=A[t]||[t];if(ns.some(n=>al.some(a=>n.includes(a))))sc++;});
      return{cluster:c,score:sc};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.cluster);
  }
};

window.journey=journey;
