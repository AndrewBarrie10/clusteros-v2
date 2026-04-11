/* ══════════════════════════════════════════════════════════════════
 * report-writer.js
 *
 * Pure, self-contained report writer extracted from journey.js so it
 * can be reused in other projects.
 *
 * Usage (browser):
 *   <script src="/report-writer.js"></script>
 *   const report = ReportWriter.buildReport({
 *     stalls, stack, detectedStacks,
 *     ecosystem, role, sector, geography,
 *     stallScience, stallFreq, matchedClusters
 *   });
 *   ReportWriter.openReport(report, '/diagnostic-report.html');
 *
 * Inputs are passed explicitly — no DOM, no globals, no coupling to
 * the host page. The host is responsible for cluster matching and
 * supplying the stall-science lookup.
 * ══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const STALL_CODES = {
    'Coordinating': 'S2', 'Narrating': 'S7', 'Scaling': 'S8',
    'Stabilising':  'S6', 'Mediating': 'S5', 'Extracting': 'S4',
    'Forgiving':    'S3', 'Re-proving':'S1', 'Waiting':    'S9'
  };

  const STALL_FREQ_FALLBACK = {
    'Coordinating': 39, 'Narrating':  7, 'Scaling':     8,
    'Stabilising':  68, 'Mediating': 38, 'Extracting': 37,
    'Forgiving':     1, 'Re-proving': 0, 'Waiting':    30
  };

  const STALL_NAMES = {
    'Coordinating': 'Coordinating instead of deciding',
    'Narrating':    'Narrating instead of testing',
    'Scaling':      'Scaling activity instead of throughput',
    'Stabilising':  'Stabilising around incumbents',
    'Mediating':    'Mediating instead of coupling',
    'Extracting':   'Extracting without reinvesting',
    'Forgiving':    'Forgiving instead of redesigning',
    'Re-proving':   'Re-proving instead of narrowing',
    'Waiting':      'Waiting for permission'
  };

  // Full-diagnostic "what you'd get" adds, keyed by sorted stall-pair.
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

  /**
   * Build a ClusterOS diagnostic report object from explicit inputs.
   *
   * @param {Object}   input
   * @param {string[]} input.stalls           Selected stall names, e.g. ['Coordinating','Mediating']
   * @param {Object}   [input.stack]          Stack result: { name, description, leverage }
   * @param {Object[]} [input.detectedStacks] Optional list of detected stack objects
   * @param {string}   [input.ecosystem]      Display name for the ecosystem
   * @param {string}   [input.role]           Role of the person running the diagnostic
   * @param {string}   [input.sector]
   * @param {string}   [input.geography]
   * @param {Object}   [input.stallScience]   Lookup: { [stallName]: { definition, leverage, signal, y, x, cost } }
   * @param {Object}   [input.stallFreq]      Optional frequency override { [stallName]: number }
   * @param {Object[]} [input.matchedClusters] Up to 4 comparator clusters from the host's matcher
   * @returns {Object} Report object
   */
  function buildReport(input) {
    const {
      stalls          = [],
      stack           = {},
      detectedStacks  = [],
      ecosystem       = 'Your Ecosystem',
      role            = '',
      sector          = '',
      geography       = '',
      stallScience    = {},
      stallFreq       = STALL_FREQ_FALLBACK,
      matchedClusters = []
    } = input || {};

    const pattern = stalls.slice(0, 2).join('+');
    const comparators = matchedClusters.slice(0, 4).map(c => ({
      region:  c.name,
      loc:     [c.city, c.country].filter(Boolean).join(' · '),
      sector:  c.sector || '',
      id:      c.id || '',
      stalls:  c.stalls || [],
      pattern
    }));

    const stackKey = stalls.slice().sort().join('+');
    const fullDiagAdds = FULL_DIAG[stackKey] || FULL_DIAG.default;

    return {
      stage: 'behaviours',
      ecosystem,
      sector,
      geography,
      role,
      stalls: stalls.map(s => {
        const sci = stallScience[s] || {};
        return {
          id:         STALL_CODES[s] || s,
          name:       STALL_NAMES[s] || s,
          freq:       stallFreq[s] || 0,
          definition: sci.definition || '',
          leverage:   sci.leverage   || '',
          signal:     sci.signal     || '',
          displaced:  sci.y          || '',
          behaviour:  sci.x          || '',
          cost:       sci.cost       || ''
        };
      }),
      stack: {
        name:        stack.name        || stalls.join(' + '),
        stalls,
        description: stack.description || '',
        leverage:    stack.leverage    || ''
      },
      detectedStacks: detectedStacks.map(s => ({
        id:       s.id || '',
        name:     s.name || '',
        stalls:   s.triggers || s.stalls || [],
        logic:    s.logic || s.reinforcing_logic || '',
        regime:   s.regime || '',
        entry:    s.entry || s.leverage_entry || '',
        effect:   s.effect || '',
        leverage: s.entry || s.leverage || ''
      })),
      comparators,
      fullDiagAdds
    };
  }

  /**
   * Persist the report and open it in a new window.
   *
   * @param {Object} report  Report object from buildReport()
   * @param {string} [url]   URL of the report viewer page
   * @returns {Window|null}
   */
  function openReport(report, url) {
    const target = url || '/diagnostic-report.html';
    try { sessionStorage.setItem('CLUSTEROS_REPORT', JSON.stringify(report)); } catch (e) {}
    try { localStorage.setItem('CLUSTEROS_REPORT', JSON.stringify(report)); } catch (e) {}
    const w = (typeof window !== 'undefined') ? window.open(target, '_blank') : null;
    if (w) w.CLUSTEROS_REPORT = report;
    return w;
  }

  const api = {
    buildReport,
    openReport,
    // Exposed for consumers who want to extend or override
    STALL_CODES,
    STALL_NAMES,
    STALL_FREQ_FALLBACK,
    FULL_DIAG
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.ReportWriter = api;
})(typeof window !== 'undefined' ? window : globalThis);
