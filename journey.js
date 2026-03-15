// ── ClusterOS Guided Journey ──────────────────────────────
// Panel = navigator/guide. Frame = content/interactions.

window.STALL_SCIENCE_DATA = {
  Narrating:    { definition: 'The ecosystem produces stories about progress instead of evidence of change. Reporting substitutes for impact — the story of activity becomes the activity.', leverage: 'Changing what gets reported — not who reports it — breaks this faster than any governance reform. Require evidence of decisions made and options closed, not events held.' },
  Coordinating: { definition: 'Coordination becomes the output rather than the mechanism. Meetings, partnerships and alignment processes substitute for committed action with real consequences.', leverage: 'Identify the actor with the most to lose from the current arrangement and change their constraint. The leverage is never more coordination — it is one actor making an exclusionary choice.' },
  'Re-proving': { definition: 'The ecosystem repeats the case for its own existence. Resources flow to justification rather than execution — the case is never quite strong enough to unlock committed action.', leverage: 'A single credible external commitment — a named anchor investing, a government fund activated — breaks this faster than any internal advocacy. Find who has the least to lose from going first publicly.' },
  Scaling:      { definition: 'Early-stage activity is celebrated rather than evaluated. The ecosystem optimises for inputs and starts rather than outcomes — motion is mistaken for momentum.', leverage: 'Change what counts as success before the next programme begins. Define scaling milestones specifically and publicly. The intervention is at the measurement layer, not the programme layer.' },
  Mediating:    { definition: 'The ecosystem spends its energy managing relationships rather than enabling transactions. Every connection routes through an intermediary — direct actor coupling is structurally unavailable.', leverage: 'One direct connection that bypasses the intermediary layer creates a path others can follow. The leverage is not removing the intermediary — it is demonstrating that direct coupling works.' },
  Extracting:   { definition: 'Anchor institutions extract value from the ecosystem rather than circulating it. Talent, IP and capital flow outward — the ecosystem produces but does not retain.', leverage: 'Changing anchor procurement or spin-out policy changes the constraint without requiring anchors to behave differently by goodwill. The leverage is structural, not relational.' },
  Forgiving:    { definition: 'Poor performance is tolerated to preserve relationships. Accountability systems are systematically avoided — the relationship is worth more than the outcome it was supposed to produce.', leverage: 'A funder or anchor changing the conditions of continued support breaks this faster than any internal review. External conditions change what internal tolerance costs.' },
  Stabilising:  { definition: 'The ecosystem optimises for stability over adaptation. Existing structures are preserved even when they no longer serve the system — change threatens the positions built on the current arrangement.', leverage: 'New entry pathways that bypass incumbent gatekeepers are the intervention. The leverage is creating routes that do not require incumbent permission — not changing incumbent behaviour.' },
  Waiting:      { definition: 'Action is deferred pending external conditions — funding decisions, policy clarity, anchor commitment. Waiting becomes structural: the system learns to produce deferral as its primary output.', leverage: 'The actor with the least to lose from acting without permission is the entry point. One unilateral move creates a path others can follow. The stack survives collective waiting — not individual defection.' }
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
  'Narrating+Coordinating': { name:'The Activity-Alignment Stack', description:"The ecosystem reports activity to justify continued coordination, and coordinates to generate reportable activity. Each stall provides the other with its raw material. Neither breaks without changing both simultaneously.", leverage:"Change what counts as evidence of progress — require evidence of decisions made and options closed — and the coordination machinery loses its fuel.", tech:"The platform replaces narrative reporting with live signal data. Steward interrogation tools surface actual connection rates and stall indicators automatically." },
  'Narrating+Re-proving':   { name:'The Justification Stack', description:"Resources flow to making the case rather than executing it. The ecosystem produces increasingly sophisticated evidence of its own potential while deferring the bets that would test it. Each validation cycle is followed by a request for more validation.", leverage:"A single credible external commitment — a named anchor investing, a government fund activated — breaks this faster than any internal advocacy. Find who has the least to lose from going first publicly.", tech:"The anchor journey surfaces procurement RFIs and commitment signals automatically. The platform creates the conditions for a first visible commitment without requiring anyone to negotiate it manually." },
  'Coordinating+Mediating': { name:'The Intermediary Stack', description:"Coordination creates demand for intermediaries. Intermediaries make coordination manageable. The ecosystem develops sophisticated brokerage infrastructure that becomes load-bearing — every connection routes through it, every decision requires its blessing.", leverage:"Direct coupling between actors — a founder talking to corporate procurement without a broker — is the intervention. The intermediary layer does not need to be removed. It needs to be bypassed once, publicly.", tech:"The platform enables direct actor-to-actor signal routing. A corporate RFI reaches matched founders without passing through the cluster body. A research output reaches commercial audiences without a matchmaking event." },
  'Re-proving+Scaling':     { name:'The Evidence-Activity Stack', description:"Early-stage activity is used as proof of concept rather than evaluated against outcomes. The case for scaling is never quite strong enough because the evidence base keeps expanding rather than narrowing. More pilots are commissioned to strengthen the case.", leverage:"Define what scaling means before the next pilot begins — specific, observable, time-bound. The stack breaks when the question shifts from 'does this work?' to 'what would it take to do ten times more of this?'", tech:"Journey state tracking gives the steward a live view of which founders are progressing through defined milestones versus cycling through early stages." },
  'Mediating+Extracting':   { name:'The Anchor Dependency Stack', description:"The ecosystem organises itself around managing anchor institutions rather than changing their behaviour. Intermediaries absorb the friction of anchor relationships, which makes those relationships sustainable without requiring anchors to reinvest.", leverage:"Anchor procurement policy is the leverage point — not anchor engagement. Changing what anchors are required to source locally changes the constraint. Relationship management without constraint change produces more relationship management.", tech:"The anchor journey makes local capability visible to anchor procurement before they look elsewhere. Supply chain intelligence and founder readiness levels are surfaced automatically." },
  'Forgiving+Scaling':      { name:'The Tolerance Stack', description:"Poor performance at early stages is tolerated to preserve the narrative of progress. The ecosystem scales activity rather than outcomes because scaling outcomes would require acknowledging which early bets failed. Accountability is deferred to avoid disrupting momentum.", leverage:"A funder or anchor changing the conditions of continued support — not asking for better performance, but changing what they will fund next — breaks this faster than any internal review.", tech:"The steward interrogation layer surfaces programme performance against outcome milestones rather than activity counts. The diagnostic makes the tolerance visible as a structural choice, not a management failure." },
  'Stabilising+Extracting': { name:'The Incumbent Stack', description:"Existing structures are preserved because the actors who benefit from them also control access to the ecosystem's resources. Innovation pathways route through incumbents, which absorb and filter what reaches the market.", leverage:"New entry pathways that bypass the incumbent orbit — direct government procurement from startups, independent research commercialisation routes — are the intervention. The leverage is creating routes that do not require incumbent permission.", tech:"The platform maintains parallel actor journeys that do not route through incumbent gatekeepers. Founder pathways to procurement and researcher pathways to commercial application operate independently of anchor endorsement." },
  'Coordinating+Re-proving':{ name:'The Alignment-Justification Stack', description:"The ecosystem coordinates to build the case, and builds the case to justify continued coordination. The system becomes very good at producing visible process while deferring the decisions that would make process unnecessary.", leverage:"A decision that closes options — committing to a priority, defunding a programme, naming a lead — breaks the coordination loop by creating something real to report on.", tech:"The steward dashboard shows decision velocity alongside activity counts. The diagnostic flags when coordination events are not producing observable commitments." },
  'Waiting+Re-proving':     { name:'The Permission Stack', description:"The ecosystem defers action pending external validation, and uses the waiting period to build a stronger case for permission. The case-building extends the waiting. The waiting legitimises more case-building.", leverage:"The actor with the least to lose from acting without permission is the leverage point. One unilateral move creates a path others can follow. The permission stack survives collective waiting — not individual defection.", tech:"The platform surfaces support programmes, funding eligibility and connection opportunities to actors directly — without requiring steward intermediation." }
};

const NAV_STEPS = ['What are you seeing?','Name the pattern','Who else has been here','Where leverage sits','Two paths forward'];

const journey = {
  stage:0, fork:null, selectedKeys:[], selectedStalls:[], stackResult:null, stepsComplete:[],

  panel() { return document.getElementById('dashboard-body'); },
  frame() { return document.getElementById('journey-frame'); },

  _setPanel(html) { const p=this.panel(); if(p) p.innerHTML=html; },
  _setFrame(html) { const f=this.frame(); if(f) f.innerHTML=`<div class="jf-section">${html}</div>`; },
  _setPanelHeader(t) {
    const l=document.querySelector('.db-label'); if(l) l.textContent=t;
    const o=document.getElementById('dashboard-opening'); if(o) o.style.display='none';
  },

  _nav(active) {
    // Update bar steps
    if(window._updateBarJourneySteps) window._updateBarJourneySteps(NAV_STEPS, active);
    return `<div class="jnav-steps">${NAV_STEPS.map((s,i)=>`<div class="jnav-step ${i===active?'active':i<active||this.stepsComplete.includes(i+1)?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>`;
  },

  start() {
    const p=document.getElementById('dashboard-panel');
    if(p) p.classList.add('open');
    document.body.classList.add('dashboard-open','journey-active');
    // Switch bar to journey mode
    if(window._setBarMode) window._setBarMode('journey');
    if(window._updateBarJourneySteps) window._updateBarJourneySteps(
      ['Intro','Behaviours','Stalls','Stack','Clusters','Leverage','Fork'],0
    );
    // Remove close handler first to avoid duplicates
    const closeBtn = document.getElementById('dashboard-close');
    const newClose = closeBtn?.cloneNode(true);
    if(closeBtn && newClose) closeBtn.parentNode.replaceChild(newClose, closeBtn);
    document.getElementById('dashboard-close')?.addEventListener('click',()=>{
      p?.classList.remove('open');
      document.body.classList.remove('dashboard-open','journey-active');
      if(window._setBarMode) window._setBarMode('default');
    });
    this.stage=0; this.fork=null; this.selectedKeys=[]; this.selectedStalls=[]; this.stackResult=null; this.stepsComplete=[];
    this._renderIntro();
  },

  _frameGreeting(frame) {
    return {steward:"You're a steward or EDA lead. The walkthrough is built around what you're likely observing.",digital:"You're coming at this technically. Stage 5 takes you through the architecture in depth.",investor:"You're looking at ecosystems as an investor. The walkthrough shows what structural health looks like in the data.",consultant:"You're a consultant. The walkthrough covers the diagnostic framework and what it produces.",anchor:"You represent an anchor institution. The walkthrough covers ecosystem dynamics from your seat.",politician:"You're thinking about this at a policy level. The walkthrough shows the structural evidence behind transformation.",government:"You're looking at this as an infrastructure investment. Stage 5 covers the platform procurement model."}[frame]||'';
  },

  _renderIntro() {
    this._setPanelHeader('Your pathway');
    const frame=window.dashboard?.frame||null, fg=this._frameGreeting(frame);
    this._setPanel(`<div>
      ${fg?`<p class="jnav-context" style="padding:8px 10px;background:rgba(42,122,79,0.06);border-left:2px solid var(--green);border-radius:2px;margin-bottom:12px">${fg}</p>`:''}
      <p class="jnav-context">The panel guides you. The space to the right hosts the full content at each stage.</p>
      ${this._nav(-1)}
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._startJourney()">Start the walkthrough →</button></div>
    </div>`);
    this._setFrame(`
      <div class="jf-intro-head">
        <p class="jf-intro-eyebrow">ClusterOS · Guided walkthrough</p>
        <h1 class="jf-intro-heading">Five stages.<br><em>One structural diagnosis.</em></h1>
        <p class="jf-intro-sub">Work through what you're observing. The system names the structural pattern, matches it to real diagnosed clusters, finds where leverage sits, and then takes you through the diagnostic or the full infrastructure story.</p>
      </div>
      <div class="jf-timeline">
        ${[
          {n:1,title:'What are you seeing?',desc:"Pick the observable behaviours that sound familiar. The system names what's structurally beneath them."},
          {n:2,title:'Name the structural pattern',desc:"The stall names and definitions — what's actually happening beneath the surface you're observing."},
          {n:3,title:'Who else has been here',desc:'Real clusters from the dataset that share your configuration — stalls, regimes, leverage hypotheses.'},
          {n:4,title:'Where leverage sits',desc:'The specific entry point that shifts the configuration. Not the most visible problem — the most load-bearing one.'},
          {n:5,title:'Diagnostic or infrastructure',desc:'Two paths forward. The diagnostic names your configuration. The infrastructure story shows what ClusterOS runs on.'}
        ].map((s,i)=>{
          const fn=['_startJourney','_renderStage2','_renderStage35','_renderStage4','_renderStage5Fork'][i];
          return`<div class="jf-timeline-step ${i===0?'active':''}" onclick="journey.${fn}&&journey.${fn}()"><div class="jf-tl-num">${s.n}</div><div class="jf-tl-content"><div class="jf-tl-title">${s.title}</div><div class="jf-tl-desc">${s.desc}</div></div></div>`;
        }).join('')}
      </div>
      <div class="jf-intro-cta">
        <button class="jnav-btn-primary" style="font-size:12px;padding:14px 28px" onclick="journey._startJourney()">Start the walkthrough →</button>
      </div>`);
  },

  _startJourney() { this.stage=1; this._renderStage1(); },

  _renderStage1() {
    this._setPanelHeader('Stage 1 of 5');
    this._setPanel(`
      <span class="jnav-stage">What are you seeing?</span>
      <p class="jnav-context">Select everything that sounds familiar. Combinations reveal stacks.</p>
      ${this._nav(0)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" id="jnav-next-1" disabled onclick="journey._commitBehaviours()">Name my stalls →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderIntro()">← Overview</button>
      </div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">What does your ecosystem<br><em>keep doing?</em></h2>
      <p class="jf-stage-sub">Select all the patterns that sound familiar. These are observable behaviours — not diagnoses. The system names what's beneath them.</p>
      <div class="jf-behaviour-grid">
        ${BEHAVIOURS.map(b=>`<button class="jf-behaviour ${this.selectedKeys.includes(b.key)?'selected':''}" data-key="${b.key}">${b.label}</button>`).join('')}
      </div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" id="jf-next-1" disabled onclick="journey._commitBehaviours()" style="padding:12px 28px;font-size:12px">Name my stalls →</button>
        <span id="jf-select-count" style="font-family:var(--font-mono);font-size:10px;color:var(--ink-muted);letter-spacing:0.08em;text-transform:uppercase"></span>
      </div>`);
    document.querySelectorAll('.jf-behaviour').forEach(btn=>{
      btn.addEventListener('click',()=>{
        btn.classList.toggle('selected');
        this.selectedKeys=[...document.querySelectorAll('.jf-behaviour.selected')].map(b=>b.dataset.key);
        const nb1=document.getElementById('jnav-next-1');
        const nb2=document.getElementById('jf-next-1');
        const count=document.getElementById('jf-select-count');
        const disabled=this.selectedKeys.length===0;
        if(nb1) nb1.disabled=disabled;
        if(nb2) nb2.disabled=disabled;
        if(count) count.textContent=this.selectedKeys.length>0?`${this.selectedKeys.length} selected`:'';
      });
    });
  },

  _commitBehaviours() {
    this.selectedStalls=this.selectedKeys.map(k=>BEHAVIOURS.find(b=>b.key===k)?.stall).filter(Boolean);
    this.stepsComplete.push(1); this.stage=2; this._renderStage2();
  },

  _renderStage2() {
    this._setPanelHeader('Stage 2 of 5');
    this._setPanel(`
      <span class="jnav-stage">The structural pattern</span>
      <p class="jnav-context">You identified ${this.selectedStalls.length} stall${this.selectedStalls.length>1?'s — these rarely travel alone':''}.${this.selectedStalls.length>1?' That combination is significant.':''}</p>
      ${this._nav(1)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._toStage3()">${this.selectedStalls.length>1?'See how they interact →':'See where leverage sits →'}</button>
        <button class="jnav-btn-secondary" onclick="journey._renderStage1()">← Back</button>
      </div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Here's what<br><em>that means.</em></h2>
      <p class="jf-stage-sub">These are the structural patterns beneath the behaviours you selected. Each is a substitution — the ecosystem doing something observable instead of something harder.</p>
      <div class="jf-stall-grid">${this.selectedStalls.map(n=>{const sc=window.STALL_SCIENCE_DATA[n]||{};return`<div class="jf-stall-card"><div class="jf-stall-name">${n}</div><p class="jf-stall-def">${sc.definition||''}</p></div>`;}).join('')}</div>
      ${this.selectedStalls.length>1?`<div class="jf-multi-note">You've identified ${this.selectedStalls.length} stalls. Stalls rarely travel alone — they form stabilisation stacks that resist single interventions. The next stage shows you the combination.</div>`:''}
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._toStage3()" style="padding:12px 28px;font-size:12px">${this.selectedStalls.length>1?'See how they interact →':'See where leverage sits →'}</button>
        <button class="jnav-btn-secondary" onclick="journey._renderStage1()">← Back</button>
      </div>`);
  },

  _toStage3() {
    this.stepsComplete.push(2);
    if(this.selectedStalls.length>1){this.stage=3;this._renderStage3();}
    else{this.stage=3.5;this._renderStage35();}
  },

  _renderStage3() {
    this._setPanelHeader('Stage 3 of 5');
    const stack=this._findStack(this.selectedStalls); this.stackResult=stack;
    this._setPanel(`
      <span class="jnav-stage">Your stack</span>
      <p class="jnav-context">${stack?.named?`Named configuration: <strong>${stack.name}</strong>. Reinforcement logic is well understood.`:'Unnamed combination — the system is reasoning about how these stalls reinforce each other.'}</p>
      ${this._nav(2)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" id="jnav-next-3" ${stack?.named?'':'disabled'} onclick="journey._toStage35()">Who else has been here →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderStage2()">← Back</button>
      </div>`);
    if(stack?.named){
      this._setFrame(`
        <h2 class="jf-stage-heading">This is why<br><em>single fixes fail.</em></h2>
        <p class="jf-stage-sub">Two or more stalls reinforcing each other form a stack. Each stall provides cover for the other. Removing one without changing the other produces temporary relief, not structural change.</p>
        <div class="jf-stack-card">
          <div class="jf-stack-name">${stack.name}</div>
          <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
          <p class="jf-stack-desc">${stack.description}</p>
        </div>
        <div class="jf-sticky-bottom">
          <button class="jnav-btn-primary" id="jnav-next-3" onclick="journey._toStage35()" style="padding:12px 28px;font-size:12px">Who else has been here →</button>
          <button class="jnav-btn-secondary" onclick="journey._renderStage2()">← Back</button>
        </div>`);
    } else {
      this._setFrame(`
        <h2 class="jf-stage-heading">Reasoning about<br><em>your combination.</em></h2>
        <p class="jf-stage-sub">This combination does not have a canonical name in the dataset. The system is working out the reinforcement logic now.</p>
        <div class="jf-stack-card">
          <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
          <div class="jf-ai-loading"><span class="jny-loading-dot"></span><span>Analysing reinforcement logic...</span></div>
        </div>`);
      this._generateStack();
    }
  },

  async _generateStack() {
    const details=this.selectedStalls.map(s=>{const sc=window.STALL_SCIENCE_DATA[s]||{};return`${s}: ${sc.definition||''} Leverage: ${sc.leverage||''}`;}).join('\n');
    const prompt=`You are ClusterOS diagnostic intelligence. Analyse this stall combination.\n\nSTALLS:\n${details}\n\nReturn ONLY valid JSON, no markdown:\n{"name":"Short evocative name (3-5 words)","description":"2-3 sentences. How do these stalls reinforce each other? Why does changing one without the other fail? No em-dashes.","leverage":"2 sentences. Specific entry point. What changes first and why? No em-dashes.","tech":"2 sentences. What does ClusterOS specifically do about this? No em-dashes."}`;
    try {
      const res=await fetch(`${window.RAILWAY}/api/intelligence`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
      const data=await res.json();
      const parsed=JSON.parse((data.text||'').replace(/```json|```/g,'').trim());
      this.stackResult={named:false,...parsed};
      this._setFrame(`
        <h2 class="jf-stage-heading">This is why<br><em>single fixes fail.</em></h2>
        <p class="jf-stage-sub">Two or more stalls reinforcing each other form a stack.</p>
        <div class="jf-stack-card">
          <div class="jf-stack-name">${parsed.name}</div>
          <div class="jf-stack-tags">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span class="jf-stack-plus">+</span>')}</div>
          <p class="jf-stack-desc">${parsed.description}</p>
        </div>
        <div class="jf-sticky-bottom">
          <button class="jnav-btn-primary" onclick="journey._toStage35()" style="padding:12px 28px;font-size:12px">Who else has been here →</button>
          <button class="jnav-btn-secondary" onclick="journey._renderStage2()">← Back</button>
        </div>`);
      const nb=document.getElementById('jnav-next-3'); if(nb) nb.disabled=false;
    } catch(e) {
      const f=this.frame(); if(f){const l=f.querySelector('.jf-ai-loading');if(l)l.textContent='Analysis unavailable — continue.';}
      const nb=document.getElementById('jnav-next-3'); if(nb) nb.disabled=false;
    }
  },

  _toStage35() { this.stepsComplete.push(3); this.stage=3.5; this._renderStage35(); },

  _renderStage35() {
    this._setPanelHeader('Stage 3 of 5');
    const matched=this._matchClusters(4);
    this._setPanel(`
      <span class="jnav-stage">Global comparators</span>
      <p class="jnav-context">${matched.length?`${matched.length} clusters share your configuration — already diagnosed, stacks and leverage mapped.`:'No strong cluster matches for this combination.'}</p>
      ${this._nav(2)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._toStage4()">Where does leverage sit? →</button>
        <button class="jnav-btn-secondary" onclick="journey.${this.selectedStalls.length>1?'_renderStage3':'_renderStage2'}()">← Back</button>
      </div>`);
    if(!matched.length){
      this._setFrame(`<h2 class="jf-stage-heading">Who else has<br><em>been here.</em></h2><p class="jf-stage-sub">No strong cluster matches found for this specific combination. The leverage principles still apply — continue to see where the entry point sits.</p>`);
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
        <button class="jnav-btn-primary" onclick="journey._toStage4()" style="padding:12px 28px;font-size:12px">Where does leverage sit? →</button>
        <button class="jnav-btn-secondary" onclick="journey.${this.selectedStalls.length>1?'_renderStage3':'_renderStage2'}()">← Back</button>
      </div>`);
    // Draw radar charts — wait for map.js to be ready
    const _drawRadars = () => {
      matched.forEach(c => {
        if (window.drawRadar) window.drawRadar(c, 'radar-' + c.id);
      });
    };
    if (window.drawRadar) {
      setTimeout(_drawRadars, 80);
    } else {
      // map.js not yet loaded — wait for it
      const _radarCheck = setInterval(() => {
        if (window.drawRadar) { clearInterval(_radarCheck); _drawRadars(); }
      }, 100);
      setTimeout(() => clearInterval(_radarCheck), 5000);
    }
  },

  _toStage4() { this.stepsComplete.push(3); this.stage=4; this._renderStage4(); },

  _renderStage4() {
    this._setPanelHeader('Stage 4 of 5');
    const lev=this.stackResult?.leverage||(this.selectedStalls.length===1?(window.STALL_SCIENCE_DATA[this.selectedStalls[0]]?.leverage||''):'');
    this._setPanel(`
      <span class="jnav-stage">Where leverage sits</span>
      <p class="jnav-context">The entry point is almost never where the stall is most visible. Most interventions target urgency. The diagnostic targets dependency.</p>
      ${this._nav(3)}
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._toStage5()">Diagnostic or infrastructure? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderStage35()">← Back</button>
      </div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">The entry point<br><em>that shifts the configuration.</em></h2>
      <p class="jf-stage-sub">Stacks stabilise because each element provides cover for the other. The leverage point is the element that, if changed, removes that cover — not the element that feels most urgent.</p>
      <p class="jf-leverage-text">${lev}</p>
      <div class="jf-leverage-principle"><div class="jf-lev-label">Why this works</div><p class="jf-lev-body">Most interventions fail because they address the most visible symptom. The diagnostic looks for the element whose removal makes the stack structurally unavailable — the load-bearing stall. Change that, and the others lose their function.</p></div>
      <div class="jf-sticky-bottom">
        <button class="jnav-btn-primary" onclick="journey._toStage5()" style="padding:12px 28px;font-size:12px">Diagnostic or infrastructure? →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderStage35()">← Back</button>
      </div>`);
  },

  _toStage5() { this.stepsComplete.push(4); this.stage=5; this._renderStage5Fork(); },

  _renderStage5Fork() {
    this._setPanelHeader('Stage 5 of 5');
    const sn=this.stackResult?.name||this.selectedStalls.join(' + ');
    this._setPanel(`
      <span class="jnav-stage">Two paths forward</span>
      <p class="jnav-context">Choose based on what you need. You can come back and take the other path.</p>
      ${this._nav(4)}
      <div class="jnav-actions"><button class="jnav-btn-secondary" onclick="journey._renderStage4()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Two ways to<br><em>go deeper.</em></h2>
      <p class="jf-fork-intro">You've seen the structural pattern — ${sn}. ClusterOS goes further than diagnosis. The two paths below reflect what different people need at this point.</p>
      <div class="jf-fork-grid">
        <button class="jf-fork-card" onclick="journey._startDiagnosticFork()">
          <span class="jf-fork-label">The diagnostic</span>
          <div class="jf-fork-title">How the diagnostic works and what it produces</div>
          <p class="jf-fork-desc">For stewards, consultants and anyone commissioning a diagnostic — the 5-stage pipeline and what comes out of it.</p>
          <div class="jf-fork-steps"><div class="jf-fork-step">How the evidence pipeline works</div><div class="jf-fork-step">Stall detection and stack analysis</div><div class="jf-fork-step">What the leverage hypothesis delivers</div><div class="jf-fork-step">What you receive and what it costs</div></div>
          <div class="jf-fork-cta">Start this path →</div>
        </button>
        <button class="jf-fork-card jf-fork-card-infra" onclick="journey._startInfraFork()">
          <span class="jf-fork-label">The infrastructure</span>
          <div class="jf-fork-title">ClusterOS as the substrate your ecosystem runs on</div>
          <p class="jf-fork-desc">For heads of digital, government buyers and anchor institutions — what the platform actually is and what running it means.</p>
          <div class="jf-fork-steps"><div class="jf-fork-step">Platform vs substrate — the distinction</div><div class="jf-fork-step">One event, four reframings</div><div class="jf-fork-step">Actor journeys — see each seat</div><div class="jf-fork-step">MCP, sovereign database, procurement model</div></div>
          <div class="jf-fork-cta">Start this path →</div>
        </button>
      </div>`);
  },

  _startDiagnosticFork() { this.fork='diagnostic'; this._renderDiag1(); },

  _renderDiag1() {
    this._setPanelHeader('The diagnostic');
    this._setPanel(`
      <span class="jnav-stage">Stage 1 · Evidence pipeline</span>
      <p class="jnav-context">The 5-stage pipeline — how the diagnostic moves from raw evidence to a testable leverage hypothesis.</p>
      <div class="jnav-steps">${['Evidence pipeline','Stall detection','Stack analysis','Leverage hypothesis','What you receive'].map((s,i)=>`<div class="jnav-step ${i===0?'active':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderDiag2()">Stall detection →</button><button class="jnav-btn-secondary" onclick="journey._renderStage5Fork()">← Fork</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Five stages.<br><em>One evidence pipeline.</em></h2>
      <p class="jf-stage-sub">The ClusterOS diagnostic doesn't score your cluster or benchmark it against others. It works through a structured evidence pipeline that ends with a named configuration and a testable leverage hypothesis.</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px">
        ${[
          {n:'01',name:'Evidence',desc:'Structured review of publicly available signals — publications, procurement, funding, hiring, company formation. 40-60 sources per cluster, tagged and typed.'},
          {n:'02',name:'Patterns',desc:'Evidence is grouped into recurring behavioural patterns. Not individual events — structural tendencies that appear consistently across multiple actor types and time periods.'},
          {n:'03',name:'Stalls',desc:"Patterns are matched to stall types. Each stall is a substitution — the ecosystem doing something observable instead of something harder. Intensity and confidence scored."},
          {n:'04',name:'Stacks',desc:"Active stalls are tested for reinforcement relationships. Two stalls that lower each other's cost form a stack. The configuration and reinforcement logic are documented."},
          {n:'05',name:'Leverage',desc:'For the identified stack, the diagnostic surfaces a leverage hypothesis — the specific entry point most likely to shift the configuration. Testable and calibrated to context.'}
        ].map(s=>`<div style="display:flex;gap:16px;padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--green);flex-shrink:0;padding-top:2px">${s.n}</div><div><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:4px">${s.name}</div><div style="font-size:13px;color:var(--ink-dim);line-height:1.6;font-weight:300">${s.desc}</div></div></div>`).join('')}
      </div>`);
  },

  _renderDiag2() {
    this._setPanelHeader('The diagnostic');
    this._setPanel(`
      <span class="jnav-stage">Stage 2 · Stall detection</span>
      <p class="jnav-context">How the system identifies which stalls are active — not from a survey, from evidence.</p>
      <div class="jnav-steps">${['Evidence pipeline','Stall detection','Stack analysis','Leverage hypothesis','What you receive'].map((s,i)=>`<div class="jnav-step ${i===1?'active':i<1?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderDiag3()">Stack analysis →</button><button class="jnav-btn-secondary" onclick="journey._renderDiag1()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Stalls are detected,<br><em>not declared.</em></h2>
      <p class="jf-stage-sub">The diagnostic doesn't ask you which stalls are active — it finds them in the evidence. This matters because the people closest to a stall are often the least able to name it.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
        ${[
          {title:"What the system looks for",body:"Substitution signals — cases where observable activity is replacing harder action. Coordination events without commitment outputs. Reports without decisions. Funding rounds without local reinvestment."},
          {title:"What it doesn't ask",body:"The diagnostic doesn't use surveys as its primary evidence source. Self-reported data is shaped by the stall. The ecosystem will describe its coordination activity as a strength, not a substitution."},
          {title:"Confidence scoring",body:"Each identified stall is scored for intensity (how dominant?) and confidence (how strong is the evidence?). High intensity, low confidence stalls are flagged for further investigation."},
          {title:"The 9 canonical stalls",body:"Re-proving, Coordinating, Narrating, Scaling, Mediating, Extracting, Forgiving, Stabilising, Waiting. Each has a defined signal pattern. The diagnostic scores the ecosystem against all nine."}
        ].map(s=>`<div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">${s.title}</div><p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">${s.body}</p></div>`).join('')}
      </div>`);
  },

  _renderDiag3() {
    const sn=this.stackResult?.name||'the active configuration';
    this._setPanelHeader('The diagnostic');
    this._setPanel(`
      <span class="jnav-stage">Stage 3 · Stack analysis</span>
      <p class="jnav-context">Why ${sn} resists single interventions — and what the analysis reveals.</p>
      <div class="jnav-steps">${['Evidence pipeline','Stall detection','Stack analysis','Leverage hypothesis','What you receive'].map((s,i)=>`<div class="jnav-step ${i===2?'active':i<2?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderDiag4()">Leverage hypothesis →</button><button class="jnav-btn-secondary" onclick="journey._renderDiag2()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Stacks are why<br><em>single fixes keep failing.</em></h2>
      <p class="jf-stage-sub">A stack forms when one stall lowers the cost of another. Once established, pressure to change one stall is absorbed by the other.</p>
      <div style="padding:28px 32px;background:var(--surface);border:1px solid var(--border);border-radius:4px;margin-bottom:24px">
        <div style="font-family:var(--font-serif);font-size:22px;color:var(--ink);margin-bottom:16px">${sn}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${this.selectedStalls.map(s=>`<span class="jf-stack-tag">${s}</span>`).join('<span style="color:var(--ink-muted)">+</span>')}</div>
        <p style="font-size:14px;color:var(--ink-dim);line-height:1.7;margin:0;font-weight:300">${this.stackResult?.description||'The reinforcement logic for this configuration has been identified.'}</p>
      </div>
      <div style="padding:18px 20px;background:rgba(245,217,122,0.06);border:1px solid rgba(245,217,122,0.2);border-radius:4px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#8b6914;margin-bottom:6px">Why single interventions fail</div>
        <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">Addressing one stall without changing the conditions that make the other sustainable produces temporary relief. The untouched stall reactivates the changed one. This is why so many ecosystem interventions need to be repeated on an 18-month cycle.</p>
      </div>`);
  },

  _renderDiag4() {
    this._setPanelHeader('The diagnostic');
    const lev=this.stackResult?.leverage||(window.STALL_SCIENCE_DATA[this.selectedStalls[0]]?.leverage||'');
    this._setPanel(`
      <span class="jnav-stage">Stage 4 · Leverage hypothesis</span>
      <p class="jnav-context">The specific entry point — calibrated to your configuration.</p>
      <div class="jnav-steps">${['Evidence pipeline','Stall detection','Stack analysis','Leverage hypothesis','What you receive'].map((s,i)=>`<div class="jnav-step ${i===3?'active':i<3?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderDiag5()">What you receive →</button><button class="jnav-btn-secondary" onclick="journey._renderDiag3()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">The leverage hypothesis<br><em>is specific, not generic.</em></h2>
      <p class="jf-stage-sub">The diagnostic produces one leverage hypothesis — the single most likely entry point for shifting the configuration. Testable, time-bound, calibrated to the actual evidence.</p>
      <p class="jf-leverage-text">${lev}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
        <div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">What makes a good leverage hypothesis</div><p style="font-size:12px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">Names a specific actor, action or constraint. States what changes and in what order. Identifies why this point is load-bearing rather than symptomatic. Is falsifiable.</p></div>
        <div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">What it isn't</div><p style="font-size:12px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">Not a strategy. Not a recommendation to coordinate more or narrate better. The leverage hypothesis names what needs to change at the constraint level — not the activity level.</p></div>
      </div>`);
  },

  _renderDiag5() {
    this._setPanelHeader('The diagnostic');
    this._setPanel(`
      <span class="jnav-stage">Stage 5 · What you receive</span>
      <p class="jnav-context">The output of a snapshot diagnostic — 4-5 weeks, fixed price.</p>
      <div class="jnav-steps">${['Evidence pipeline','Stall detection','Stack analysis','Leverage hypothesis','What you receive'].map((s,i)=>`<div class="jnav-step ${i===4?'active':i<4?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions">
        <button class="jnav-btn-primary" onclick="journey._renderDiagCTA()">See pricing →</button>
        <button class="jnav-btn-secondary" onclick="journey._renderDiag4()">← Back</button>
      </div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">What the diagnostic<br><em>actually delivers.</em></h2>
      <p class="jf-stage-sub">A snapshot diagnostic runs the full 5-stage pipeline against your specific cluster. 4-5 weeks, fixed price.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px">
        ${[
          {n:'01',t:'Named stall configuration',b:"The specific stalls active in your ecosystem, scored by intensity and confidence. Not a list of everything — a ranked, evidenced picture of what's structural."},
          {n:'02',t:'Stack identification',b:"Whether your active stalls form a stabilisation stack, which stacks, and what the reinforcement logic is in your specific context."},
          {n:'03',t:'Leverage hypothesis',b:"One specific, testable entry point for shifting the configuration. Named actor or constraint, sequenced intervention, falsifiable outcome."},
          {n:'04',t:'Comparative context',b:"How your configuration compares to analogous clusters in the dataset — same sector, similar regime, comparable maturity stage."},
          {n:'05',t:'Briefing document',b:"A structured briefing ready to present to a board, funder or leadership team. Names the problem in a way strategy documents never quite manage to."}
        ].map(s=>`<div style="display:flex;gap:16px;padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--green);flex-shrink:0;padding-top:2px">${s.n}</div><div><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:4px">${s.t}</div><p style="font-size:13px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">${s.b}</p></div></div>`).join('')}
      </div>`);
  },

  _renderDiagCTA() {
    const sn=this.stackResult?.name||this.selectedStalls.join(' + ');
    this._setPanelHeader('Request a diagnostic');
    this._setPanel(`
      <span class="jnav-stage">Ready to commission</span>
      <p class="jnav-context">4-5 weeks, fixed price. The diagnostic confirms whether this configuration is active in your cluster and where leverage sits.</p>
      <div class="jnav-actions">
        <a class="jnav-btn-primary" href="/pricing.html" target="_blank" style="display:block;text-align:center;text-decoration:none">See pricing →</a>
        <a class="jnav-btn-primary" href="/request.html" target="_blank" style="display:block;text-align:center;text-decoration:none;background:transparent;color:var(--green);border:1px solid var(--green)">Request a diagnostic →</a>
        <button class="jnav-btn-secondary" onclick="journey._startInfraFork()">See the infrastructure instead</button>
        <button class="jnav-btn-secondary" onclick="journey.start()">Start again</button>
      </div>`);
    this._setFrame(`
      <div class="jf-cta-stage">
        <h2 class="jf-cta-heading">Confirm it<br><em>in yours.</em></h2>
        <p class="jf-cta-body">You've identified a <strong>${sn}</strong> in your ecosystem. A snapshot diagnostic confirms it — names the specific configuration active in your cluster and surfaces a testable leverage hypothesis calibrated to your context.</p>
        <p class="jf-cta-sub">4–5 weeks · Fixed price · Structured briefing included</p>
        <a class="jf-cta-btn" href="/pricing.html" target="_blank">See how it's priced →</a>
        <a class="jf-cta-btn" href="/request.html" target="_blank" style="background:transparent;color:var(--green);border:2px solid var(--green);display:inline-block;margin-top:10px">Request a snapshot diagnostic →</a>
        <button class="jf-cta-restart" onclick="journey._startInfraFork()">Or explore the infrastructure story instead</button>
        <button class="jf-cta-restart" onclick="journey.start()">Start again with different behaviours</button>
      </div>`);
  },

  _startInfraFork() { this.fork='infrastructure'; this._renderInfra1(); },

  _renderInfra1() {
    this._setPanelHeader('The infrastructure');
    this._setPanel(`
      <span class="jnav-stage">Stage 1 · Not a platform</span>
      <p class="jnav-context">The fundamental distinction — why ClusterOS is infrastructure, not a community platform with AI features added.</p>
      <div class="jnav-steps">${['Not a platform','Signal cascade','Choose your seat','Intelligence layer','What it costs'].map((s,i)=>`<div class="jnav-step ${i===0?'active':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderInfra2()">Signal cascade →</button><button class="jnav-btn-secondary" onclick="journey._renderStage5Fork()">← Fork</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Not a platform.<br><em>A substrate.</em></h2>
      <p class="jf-stage-sub">The distinction matters because it determines what's possible. A platform is a place you go to. A substrate is what your ecosystem runs on.</p>
      <div class="jf-contrast">
        <div class="jf-contrast-col jf-contrast-bad"><span class="jf-contrast-label">Community platform</span><p>Actors log in to add value. Intelligence is built into the interface — frozen at build time. Dashboards show what happened. Everyone sees the same surface. Value depends on active participation.</p></div>
        <div class="jf-contrast-col jf-contrast-good"><span class="jf-contrast-label">ClusterOS substrate</span><p>Actors pursue their own goals. Intelligence lives in the protocol layer — assembled at runtime from live data. Every actor sees a different surface. Value compounds from selfish behaviour. The system improves whenever the AI model improves.</p></div>
      </div>
      <p class="jf-pull">"No actor needs to care about the ecosystem for the ecosystem to function as a system."</p>
      <div style="padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--green);margin-bottom:8px">The cold start is solved</div>
        <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin:0;font-weight:300">Autonomous bots ingest external signals continuously — government support directories, community service APIs, publication databases, professional identity systems. The platform arrives pre-populated. No actor is ever asked to fill a blank page.</p>
      </div>`);
  },

  _renderInfra2() {
    this._setPanelHeader('The infrastructure');
    this._setPanel(`
      <span class="jnav-stage">Stage 2 · Signal cascade</span>
      <p class="jnav-context">The same event reaches every actor differently — this is what coordination infrastructure actually does.</p>
      <div class="jnav-steps">${['Not a platform','Signal cascade','Choose your seat','Intelligence layer','What it costs'].map((s,i)=>`<div class="jnav-step ${i===1?'active':i<1?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderInfra3()">Choose your seat →</button><button class="jnav-btn-secondary" onclick="journey._renderInfra1()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">One event.<br><em>Four reframings.</em></h2>
      <p class="jf-stage-sub">A corporate partner posts a procurement RFI. In a connected substrate, that single selfish act cascades — and each actor sees something completely different.</p>
      <div style="padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:4px;margin-bottom:20px">
        <div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--ink-muted);margin-bottom:6px">The triggering event</div>
        <div style="font-size:14px;color:var(--ink);font-weight:400">Corporate partner posts open RFI: advanced sensing technology for autonomous systems, 6-month procurement window</div>
      </div>
      <div class="jf-reframings">
        ${[
          {a:'founder',    l:'Founder',    t:"The system matches the RFI to three founders by technology type and readiness level. Each sees why they're a match and what the corporate needs to see to progress. Real procurement intent, not a general announcement."},
          {a:'researcher', l:'Researcher', t:"A recently published paper on sensor fusion is matched to the RFI and distributed across three clusters. The researcher didn't network. Their paper did. It reaches 19 industry readers without any action from the researcher."},
          {a:'steward',    l:'Steward',    t:"The substrate registers a research-to-industry connection forming — updates the cluster health score. The steward sees a bridging opportunity, current score, and an available intervention. Not an activity log — a diagnostic signal."},
          {a:'anchor',     l:'Anchor',     t:"A founder-researcher collaboration qualifies for a government innovation fund. The system identified the eligibility, surfaced the deadline, and pre-filled the application with collaboration data it already holds."}
        ].map(r=>`<div class="jf-reframing"><span class="jf-reframing-actor jf-actor-${r.a}">${r.l}</span><p class="jf-reframing-text">${r.t}</p></div>`).join('')}
      </div>
      <div style="padding:12px 16px;background:rgba(42,122,79,0.06);border:1px solid rgba(42,122,79,0.2);border-radius:3px">
        <p style="font-size:12px;color:var(--ink-dim);margin:0;line-height:1.6;font-weight:300">Result: 7 new signals · 4 new relationships · 1 new funding pathway · cluster health +4 — all from one corporate posting an RFI they were going to post anyway.</p>
      </div>`);
  },

  _renderInfra3() {
    this._setPanelHeader('The infrastructure');
    this._setPanel(`
      <span class="jnav-stage">Stage 3 · Actor journeys</span>
      <p class="jnav-context">Each actor type sees a different surface. Select one to see what their journey looks like.</p>
      <div class="jnav-steps">${['Not a platform','Signal cascade','Choose your seat','Intelligence layer','What it costs'].map((s,i)=>`<div class="jnav-step ${i===2?'active':i<2?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderInfra4()">The intelligence layer →</button><button class="jnav-btn-secondary" onclick="journey._renderInfra2()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Each actor sees<br><em>a different surface.</em></h2>
      <p class="jf-stage-sub">Same substrate beneath. Select your role below to see what onboarding and the platform experience looks like from that seat. This is the actual onboarding interface.</p>
      <div style="margin-top:24px;border:1px solid var(--border);border-radius:6px;overflow:hidden">
        <section id="demo">
  <div class="demo-inner">
    <div class="demo-intro">
      <div class="section-label reveal">The platform</div>
      <h2 class="section-headline reveal reveal-delay-1">Each actor sees a <em>different surface.</em><br>Same substrate beneath.</h2>
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
      </div>`);
    // Init the demo JS after frame renders
    // Re-init demo after frame renders
    const _initDemo = () => {
      if (typeof resetToSelector === 'function') resetToSelector();
      // Ensure role cards fire startActor
      document.querySelectorAll('#journey-frame .role-card').forEach(card => {
        ['steward','corporate','founder','researcher'].forEach(role => {
          if (card.classList.contains(role)) {
            card.onclick = () => typeof startActor === 'function' && startActor(role);
          }
        });
      });
    };
    setTimeout(_initDemo, 200);
  },

  _showActorJourney(id, btn) {
    document.querySelectorAll('.jf-actor-card').forEach(c=>c.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const J={
      steward:{h:"The Steward sees the system.",i:"The steward doesn't get a dashboard — they get an interrogation layer. They ask questions. The system reasons against live data to answer them.",s:[
        {q:"What's actually happening in the Advanced Manufacturing cluster?",a:"Bridging score: 34/100. Re-proving stall active at 71% intensity. Three founders have relevant capability for current corporate RFIs — none have been matched yet. Intervention available."},
        {q:"Which clusters are approaching leverage position?",a:"Glasgow Life Sciences and Research Triangle show stack configurations with known leverage hypotheses. Both have high-confidence stall detection. Snapshot diagnostic recommended for both within 60 days."},
        {q:"Where is the ecosystem generating compounding vs cycling value?",a:"Fintech cluster: velocity +12% month on month, 4 new university-industry connections. Advanced Manufacturing: velocity flat, coordination events up 40%, committed outputs down."}
      ]},
      corporate:{h:"The Corporate sees opportunity, not overhead.",i:"The corporate doesn't manage their cluster relationship — the substrate manages it for them. Their existing behaviour generates intelligence automatically.",s:[
        {q:"What happens when they post an RFI?",a:"The system matches it to founders by technology readiness and cluster fit. Three matched founders are surfaced with pre-filled capability profiles. The corporate receives pre-screened responses, not a general inbox."},
        {q:"What do they get without asking?",a:"Supply chain intelligence: which local founders have capability gaps that create procurement risk. Research alerts: published work relevant to their technology roadmap. Founder readiness signals: who is approaching the right stage."},
        {q:"What don't they have to disclose?",a:"Commercial intent is never surfaced until the corporate explicitly releases it. Founders see that the corporate is interested in a capability area — not what they're building or what they'd pay."}
      ]},
      founder:{h:"The Founder gets a guide, not a form.",i:"The founder's journey is generated at runtime from their profile and the live ecosystem data — not a static onboarding flow.",s:[
        {q:"What does onboarding look like?",a:"Three questions: what you're building, what stage you're at, what you need most. The system generates a personalised pathway from those answers — matched connections, open funding, relevant research."},
        {q:"What does the system surface automatically?",a:"When a corporate posts an RFI that matches their capability, they see it ranked by fit — not as a general announcement. When a relevant research paper is published, they see it."},
        {q:"What does progress look like?",a:"Journey steps unlock based on real milestones, not time. The steward can see which founders are progressing and where they're stalling — not to manage them, but to understand what's structurally limiting movement."}
      ]},
      researcher:{h:"The Researcher reaches industry without outreach.",i:"The researcher's published work is continuously matched to live commercial signals — procurement needs, founder capability gaps, corporate technology roadmaps.",s:[
        {q:"How does their work reach industry?",a:"Every published paper is indexed and matched to active procurement signals. When a corporate posts an RFI in their area, their work is surfaced to the corporate's intelligence feed and to matched founders — without the researcher doing anything."},
        {q:"How do they find commercial partners?",a:"The system identifies founders with commercial applications for their research and surfaces the match to both parties. The introduction is warm — both sides already know why they're a match before they speak."},
        {q:"What about IP?",a:"IP boundary controls are explicit and progressive. The researcher defines what's public, what's shareable with verified ecosystem actors, and what's confidential. The substrate routes accordingly."}
      ]}
    };
    const j=J[id]; if(!j) return;
    const c=document.getElementById('jf-actor-journey-content'); if(!c) return;
    c.innerHTML=`<div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--border)">
      <h3 style="font-family:var(--font-serif);font-size:20px;color:var(--ink);margin-bottom:8px">${j.h}</h3>
      <p style="font-size:13px;color:var(--ink-dim);line-height:1.65;margin-bottom:20px;font-weight:300">${j.i}</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${j.s.map(s=>`<div style="padding:16px 18px;background:var(--surface);border:1px solid var(--border);border-radius:4px">
          <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--ink-muted);margin-bottom:6px">Query</div>
          <div style="font-size:13px;color:var(--ink);margin-bottom:10px;font-style:italic">"${s.q}"</div>
          <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--green);margin-bottom:6px">System response</div>
          <p style="font-size:13px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">${s.a}</p>
        </div>`).join('')}
      </div>
    </div>`;
  },

  _renderInfra4() {
    this._setPanelHeader('The infrastructure');
    this._setPanel(`
      <span class="jnav-stage">Stage 4 · Intelligence layer</span>
      <p class="jnav-context">How MCP works, what the sovereign database means, and why the intelligence improves automatically.</p>
      <div class="jnav-steps">${['Not a platform','Signal cascade','Choose your seat','Intelligence layer','What it costs'].map((s,i)=>`<div class="jnav-step ${i===3?'active':i<3?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions"><button class="jnav-btn-primary" onclick="journey._renderInfra5()">What it costs →</button><button class="jnav-btn-secondary" onclick="journey._renderInfra3()">← Back</button></div>`);
    this._setFrame(`
      <h2 class="jf-stage-heading">Intelligence at<br><em>the protocol layer.</em></h2>
      <p class="jf-stage-sub">The key architectural decision: where does intelligence live? In the interface (hardcoded, frozen, role-generic) or in the protocol (live, role-aware, improving automatically)?</p>
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
      <div class="jf-sovereign">
        <span class="jf-sovereign-label">Sovereign by design</span>
        One dedicated database per regional EDA. Data residency is jurisdictional — it does not leave the region. The intelligence layer improves centrally via model updates. Full role-based access control. Active signal flow, data retrieval, and governance boundaries are all explicit and auditable.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">
        <div style="padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--teal);margin-bottom:6px">The bot network</div><p style="font-size:12px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">Autonomous bots ingest external signals continuously. Evidence bots, signal monitoring bots, actor enrichment bots, health monitoring bots. The platform arrives pre-populated — cold start is solved.</p></div>
        <div style="padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:4px"><div style="font-family:var(--font-mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--teal);margin-bottom:6px">Federated governance</div><p style="font-size:12px;color:var(--ink-dim);line-height:1.6;margin:0;font-weight:300">Supercluster to Cluster to Group to Actor hierarchy. Identity-first, role-based access, full audit trail. Institutional autonomy preserved at every level.</p></div>
      </div>`);
  },

  _renderInfra5() {
    this._setPanelHeader('The infrastructure');
    this._setPanel(`
      <span class="jnav-stage">Stage 5 · What it costs</span>
      <p class="jnav-context">Three ways into the platform. One direction.</p>
      <div class="jnav-steps">${['Not a platform','Signal cascade','Choose your seat','Intelligence layer','What it costs'].map((s,i)=>`<div class="jnav-step ${i===4?'active':i<4?'complete':''}"><span class="jnav-step-dot"></span>${s}</div>`).join('')}</div>
      <div class="jnav-actions">
        <a class="jnav-btn-primary" href="/pricing.html" target="_blank" style="display:block;text-align:center;text-decoration:none">See full pricing →</a>
        <button class="jnav-btn-secondary" onclick="journey._renderDiagCTA()">See the diagnostic instead</button>
        <button class="jnav-btn-secondary" onclick="journey.start()">Start again</button>
      </div>`);
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
