/* ─────────────────────────────────────────────────────────────────────
   chrome.js — single source of truth for site nav, intel-bar, footer,
   and Mixpanel. Loaded by every standard page; lifts these out of
   per-page HTML so they can't drift. See STYLEGUIDE.md.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  // Pages that own their own chrome (React apps etc) — DO NOT INJECT.
  // Both the .html and clean-URL form are checked because Vercel's
  // cleanUrls: true strips the extension on served URLs.
  var EXCLUDED_PAGES = [
    '/diagnostic-journey.html', '/diagnostic-journey',
    '/diagnostic-report.html',  '/diagnostic-report'
  ];
  var path = location.pathname;
  var isExcluded = EXCLUDED_PAGES.some(function (p) {
    return path === p || path.endsWith(p);
  });
  if (isExcluded) return;

  // ── Canonical nav (lifted from index.html) ─────────────────────────
  var NAV_HTML = ''
    + '<nav>'
    +   '<a href="/" class="nav-logo">Cluster<span>OS</span></a>'
    +   '<ul class="nav-links">'
    +     '<li class="nav-dropdown">'
    +       '<span class="nav-dropdown-toggle">Product ▾</span>'
    +       '<ul class="nav-dropdown-menu">'
    +         '<li><a href="/digital-infrastructure.html">Digital Infrastructure</a></li>'
    +         '<li><a href="/signals-systems.html">Signals &amp; Systems</a></li>'
    +         '<li><a href="/diagnostic.html">The Diagnostic</a></li>'
    +         '<li><a href="/leverage.html">Leverage</a></li>'
    +         '<li><a href="/data.html">Cluster Data</a></li>'
    +         '<li><a href="/get-started.html">Get Started</a></li>'
    +       '</ul>'
    +     '</li>'
    +     '<li><a href="/findings.html">Findings</a></li>'
    +     '<li class="nav-dropdown">'
    +       '<span class="nav-dropdown-toggle">Lab Notes ▾</span>'
    +       '<ul class="nav-dropdown-menu">'
    +         '<li><a href="/notes.html">All Notes</a></li>'
    +         '<li class="nav-dropdown-divider"></li>'
    +         '<li><a href="/ln-01-coordinating.html">S2 · Coordinating</a></li>'
    +         '<li><a href="/ln-02-narrating.html">S7 · Narrating</a></li>'
    +         '<li><a href="/ln-10-narrative-activity-stack.html">Narrative × Activity</a></li>'
    +         '<li><a href="/ln-12-leverage.html">What Leverage Looks Like</a></li>'
    +         '<li><a href="/ln-13-diagnosis.html">Why Diagnosis Fails</a></li>'
    +       '</ul>'
    +     '</li>'
    +     '<li><a href="/about.html">About</a></li>'
    +   '</ul>'
    +   '<button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">'
    +     '<span></span><span></span><span></span>'
    +   '</button>'
    + '</nav>'
    + '<div class="nav-mobile-menu" id="nav-mobile-menu">'
    +   '<a href="/digital-infrastructure.html">Digital Infrastructure</a>'
    +   '<a href="/signals-systems.html">Signals &amp; Systems</a>'
    +   '<a href="/diagnostic.html">The Diagnostic</a>'
    +   '<a href="/leverage.html">Leverage</a>'
    +   '<a href="/findings.html">Findings</a>'
    +   '<a href="/data.html">Cluster Data</a>'
    +   '<a href="/get-started.html">Get Started</a>'
    +   '<div class="nav-mobile-divider"></div>'
    +   '<a href="/notes.html">Lab Notes</a>'
    +   '<a href="/about.html">About</a>'
    +   '<a href="/request.html">Request a Diagnostic</a>'
    + '</div>';

  // ── Canonical footer (lifted from index.html) ──────────────────────
  var FOOTER_HTML = ''
    + '<footer>'
    +   '<div class="footer-inner">'
    +     '<div>'
    +       '<a href="/" class="footer-logo">Cluster<span>OS</span></a>'
    +       '<p class="footer-tagline">Diagnostic intelligence for regional economies.<br>Why clusters stall — and what to do about it.</p>'
    +       '<p class="footer-copy">© 2026 Community Lab · Built in Edinburgh</p>'
    +     '</div>'
    +     '<div class="footer-col">'
    +       '<div class="footer-col-label">Product</div>'
    +       '<a href="/digital-infrastructure.html">Digital Infrastructure</a>'
    +       '<a href="/signals-systems.html">Signals &amp; Systems</a>'
    +       '<a href="/diagnostic.html">The Diagnostic</a>'
    +       '<a href="/leverage.html">Leverage</a>'
    +       '<a href="/findings.html">Findings</a>'
    +       '<a href="/get-started.html">Get Started</a>'
    +     '</div>'
    +     '<div class="footer-col">'
    +       '<div class="footer-col-label">Lab Notes</div>'
    +       '<a href="/notes.html">All Notes</a>'
    +       '<a href="/ln-01-coordinating.html">S2 · Coordinating</a>'
    +       '<a href="/ln-02-narrating.html">S7 · Narrating</a>'
    +       '<a href="/ln-12-leverage.html">What Leverage Looks Like</a>'
    +       '<a href="/ln-13-diagnosis.html">Why Diagnosis Fails</a>'
    +     '</div>'
    +     '<div class="footer-col">'
    +       '<div class="footer-col-label">Company</div>'
    +       '<a href="/about.html">About</a>'
    +       '<a href="/request.html">Request a Diagnostic</a>'
    +       '<a href="/get-started.html">Get Started</a>'
    +       '<a href="/contact.html">Contact</a>'
    +     '</div>'
    +   '</div>'
    + '</footer>';

  // ── Canonical intel-bar (lifted from index.html) ───────────────────
  var BAR_HTML = ''
    + '<div id="intel-bar">'
    +   '<div id="bar-default-state">'
    +     '<span class="bar-icon">ClusterOS</span>'
    +     '<span class="bar-default-links">'
    +       '<a href="/diagnostic.html">The Diagnostic</a>'
    +       '<a href="/findings.html">Findings</a>'
    +       '<a href="/notes.html">Lab Notes</a>'
    +       '<a href="/get-started.html">Get Started</a>'
    +     '</span>'
    +     '<span id="intel-bar-status"></span>'
    +   '</div>'
    +   '<div id="bar-journey-state" style="display:none">'
    +     '<span class="bar-journey-label" id="bar-journey-label">Your pathway</span>'
    +     '<div class="bar-journey-steps" id="bar-journey-steps"></div>'
    +     '<button id="briefing-btn" onclick="window.briefing && window.briefing.generate()">↓ Briefing</button>'
    +   '</div>'
    +   '<div class="bar-actions" id="bar-actions-diagnostic">'
    +     '<a class="bar-action bar-action-amber" href="/diagnostic-journey.html">Diagnose your ecosystem →</a>'
    +     '<a class="bar-action bar-action-case bar-case-hide" href="/clusters/glasgow-fintech.html">See a diagnostic →</a>'
    +     '<a class="bar-action bar-action-primary" href="/request.html">Request a Diagnostic →</a>'
    +   '</div>'
    +   '<div class="bar-actions" id="bar-actions-platform" style="display:none">'
    +     '<a class="bar-action bar-action-amber" href="/diagnostic-journey.html">Diagnose your ecosystem →</a>'
    +     '<a class="bar-action bar-action-case bar-case-hide" href="/signals-systems.html">See how it works →</a>'
    +     '<a class="bar-action bar-action-primary bar-action-platform" href="/request.html?subject=Platform+conversation">Map your OS →</a>'
    +   '</div>'
    + '</div>';

  // ── Mixpanel snippet (token + EU host preserved exactly) ───────────
  function initMixpanel() {
    (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
    e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);
    window.mixpanel.init('a5cac1b920750b79ab02f9cbf02c8f89', {
      autocapture: true,
      record_sessions_percent: 100,
      api_host: 'https://api-eu.mixpanel.com'
    });
    try { window.mixpanel.track_pageview(); } catch (e) {}
  }

  // ── Wire up nav interactions (dropdown + hamburger) ────────────────
  function wireNav() {
    document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
      var t = dd.querySelector('.nav-dropdown-toggle');
      var m = dd.querySelector('.nav-dropdown-menu');
      if (!t || !m) return;
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = m.classList.contains('open');
        document.querySelectorAll('.nav-dropdown-menu').forEach(function (x) { x.classList.remove('open'); });
        document.querySelectorAll('.nav-dropdown-toggle').forEach(function (x) { x.classList.remove('active'); });
        if (!open) { m.classList.add('open'); t.classList.add('active'); }
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-dropdown-menu').forEach(function (x) { x.classList.remove('open'); });
      document.querySelectorAll('.nav-dropdown-toggle').forEach(function (x) { x.classList.remove('active'); });
    });
    var h = document.getElementById('nav-hamburger');
    var mob = document.getElementById('nav-mobile-menu');
    if (h && mob) {
      h.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = mob.classList.contains('open');
        mob.classList.toggle('open', !o);
        h.classList.toggle('open', !o);
      });
      document.addEventListener('click', function () {
        mob.classList.remove('open');
        h.classList.remove('open');
      });
    }
  }

  // ── Intel-bar mode (default ↔ journey) ─────────────────────────────
  function applyBarMode(mode) {
    var def = document.getElementById('bar-default-state');
    var jny = document.getElementById('bar-journey-state');
    if (mode === 'journey') {
      if (def) def.style.display = 'none';
      if (jny) jny.style.display = 'flex';
    } else {
      if (def) def.style.display = 'flex';
      if (jny) jny.style.display = 'none';
    }
  }

  // Exposed for the journey React app to call when starting/finishing.
  window._setBarMode = function (mode) {
    if (mode === 'journey') {
      try { localStorage.setItem('clusteros_journey_active', 'true'); } catch (e) {}
    } else {
      try { localStorage.removeItem('clusteros_journey_active'); } catch (e) {}
    }
    applyBarMode(mode);
  };

  // Journey step labels for bar (used by the React app).
  window._updateBarJourneySteps = function (stages, activeIndex) {
    var container = document.getElementById('bar-journey-steps');
    if (!container || !stages) return;
    container.innerHTML = stages.map(function (s, i) {
      var cls = i < activeIndex ? 'complete' : i === activeIndex ? 'active' : '';
      return '<span class="bar-journey-step ' + cls + '">' + s + '</span>';
    }).join('<span style="color:var(--border-2);margin:0 2px">›</span>');
  };

  // ── Intel-bar zone (diagnostic ↔ platform CTAs) ────────────────────
  function isHomepage() {
    return path === '/' || path === '/index.html' || path.endsWith('/index.html');
  }

  function applyZone(zone) {
    var diag = document.getElementById('bar-actions-diagnostic');
    var plat = document.getElementById('bar-actions-platform');
    if (!diag || !plat) return;
    var platformOn = zone === 'platform';
    diag.style.display = platformOn ? 'none' : 'flex';
    plat.style.display = platformOn ? 'flex' : 'none';
  }

  function wireHomepageZoneScroll() {
    var bridge = document.getElementById('platform-bridge');
    var diag = document.getElementById('bar-actions-diagnostic');
    var plat = document.getElementById('bar-actions-platform');
    if (!bridge || !diag || !plat) return;
    var inPlatformZone = false;
    function checkZone() {
      var rect = bridge.getBoundingClientRect();
      var nowPlatform = rect.top <= window.innerHeight * 0.6;
      if (nowPlatform !== inPlatformZone) {
        inPlatformZone = nowPlatform;
        diag.style.display = nowPlatform ? 'none' : 'flex';
        plat.style.display = nowPlatform ? 'flex' : 'none';
      }
    }
    window.addEventListener('scroll', checkZone, { passive: true });
    checkZone();
  }

  // ── Boot ───────────────────────────────────────────────────────────
  function inject(id, html) {
    var slot = document.getElementById(id);
    if (slot) slot.innerHTML = html;
  }

  function boot() {
    inject('site-nav', NAV_HTML);
    inject('site-intel-bar', BAR_HTML);
    inject('site-footer', FOOTER_HTML);

    wireNav();

    var journeyActive = false;
    try { journeyActive = localStorage.getItem('clusteros_journey_active') === 'true'; } catch (e) {}
    applyBarMode(journeyActive ? 'journey' : 'default');

    if (isHomepage()) {
      wireHomepageZoneScroll();
    } else {
      var zone = document.body.getAttribute('data-bar-zone') || 'diagnostic';
      applyZone(zone);
    }

    initMixpanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
