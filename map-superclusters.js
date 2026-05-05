// ClusterOS — Supercluster map wrapper
// Loaded AFTER map.js (which is locked, UTF-16 encoded, must not be edited).
//
// Strategy:
//   1. Patch window.fetch so map.js's request to /clusters.json receives a
//      supercluster-level dataset on initial load.
//   2. Patch L.map to capture the Leaflet map instance for our own use.
//   3. After map.js renders, attach click handlers on supercluster pins that
//      replace the rendered markers with the children of the clicked region.
//      Also rewrite super-pin className from 'regime-unknown' (what map.js
//      assigns since it doesn't know 'supercluster') to 'regime-supercluster'
//      (which CSS in index.html styles as a 16px green halo pin).
//   4. Provide a "Back to regions" control to collapse back to the supercluster
//      view. Collapse does a fresh loadDatasets() so it always has the full
//      global view, even if internal caches were somehow lost.

(function () {
  'use strict';

  if (!window.L) return;

  var CLUSTERS_URL = '/clusters.json';
  var SUPERCLUSTERS_URL = '/superclusters.json';

  var allClustersCache = null;
  var allSuperclustersCache = null;
  var leafletMap = null;
  var mode = 'super';        // 'super' | 'expanded'
  var expandedId = null;
  var origView = { center: [28, 12], zoom: 2 };

  var origFetch = window.fetch.bind(window);

  function loadDatasets() {
    if (allClustersCache && allSuperclustersCache) {
      return Promise.resolve({ clusters: allClustersCache, supers: allSuperclustersCache });
    }
    return Promise.all([
      origFetch(CLUSTERS_URL + '?raw=1').then(function (r) { return r.json(); }),
      origFetch(SUPERCLUSTERS_URL).then(function (r) { return r.json(); }).catch(function () { return []; })
    ]).then(function (results) {
      allClustersCache = results[0];
      allSuperclustersCache = results[1];
      return { clusters: allClustersCache, supers: allSuperclustersCache };
    });
  }

  // Map free-form regime values (UK pipeline emits things like
  // "Coordination-Intermediary-Activity", "Permission-Validation" etc) onto
  // map.js's 5-class palette so pins get colored instead of all falling
  // through to regime-unknown grey.
  function normaliseRegime(regime) {
    if (!regime) return 'unknown';
    var r = String(regime).toLowerCase();
    if (r === 'growing' || r === 'mature' || r === 'transitioning' ||
        r === 'emerging' || r === 'stalling' || r === 'unknown') return r;
    if (r === 'supercluster') return 'supercluster';
    // Pipeline regime names — keyword match onto the 5-class palette.
    if (r.indexOf('extraction') !== -1 || r.indexOf('permission') !== -1 ||
        r.indexOf('capture') !== -1   || r.indexOf('stall') !== -1 ||
        r.indexOf('tolerance') !== -1) return 'stalling';
    if (r.indexOf('coordination') !== -1 || r.indexOf('activity') !== -1 ||
        r.indexOf('volume') !== -1     || r.indexOf('process') !== -1 ||
        r.indexOf('governance') !== -1) return 'transitioning';
    if (r.indexOf('intermediary') !== -1 || r.indexOf('mediation') !== -1 ||
        r.indexOf('narrative') !== -1   || r.indexOf('validation') !== -1) return 'emerging';
    if (r.indexOf('scaling') !== -1 || r.indexOf('grow') !== -1) return 'growing';
    if (r.indexOf('mature') !== -1) return 'mature';
    return 'unknown';
  }

  function buildSuperclusterView(clusters, supers) {
    var standalone = clusters.filter(function (c) { return !c.parent; }).map(function (c) {
      // Pass through with regime kept (international clusters already have
      // valid map.js regimes from their original diagnostic).
      return Object.assign({}, c, { regime: normaliseRegime(c.regime) });
    });
    var superPins = supers.map(function (s) {
      // Set regime to 'mature' so map.js renders the pin green (then the
      // post-render fixup promotes the className to regime-supercluster for
      // the larger halo style).
      return {
        id: s.id,
        name: s.name,
        city: s.city,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        regime: 'mature',
        stalls: [],
        summary: s.summary,
        _supercluster: true,
        _cluster_count: s.cluster_count,
        _cluster_ids: s.cluster_ids
      };
    });
    return standalone.concat(superPins);
  }

  // --- 1. Intercept fetch for /clusters.json ---------------------------------
  window.fetch = function (input, init) {
    var url = (typeof input === 'string') ? input : (input && input.url);
    if (url && /\/clusters\.json(\?|$)/.test(url) && url.indexOf('raw=1') === -1) {
      return loadDatasets().then(function (ds) {
        var view = buildSuperclusterView(ds.clusters, ds.supers);
        window._allClusters = view;
        return new Response(JSON.stringify(view), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      });
    }
    return origFetch(input, init);
  };

  // --- 2. Capture the Leaflet map instance -----------------------------------
  var origLMap = L.map;
  L.map = function () {
    var m = origLMap.apply(this, arguments);
    leafletMap = m;
    window._clusterMap = m;
    setupExpandUI(m);
    return m;
  };

  function setupExpandUI(map) {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;
    if (getComputedStyle(mapEl).position === 'static') {
      mapEl.style.position = 'relative';
    }
    var btn = document.createElement('button');
    btn.id = 'sc-back-btn';
    btn.type = 'button';
    btn.textContent = '← Back to regions';
    btn.addEventListener('click', function () { collapse(); });
    mapEl.appendChild(btn);

    buildSuperclusterPanel();

    // Pin handlers and className fixup can only run after map.js renders.
    setTimeout(function () { afterRender(); }, 0);
    map.on('layeradd', function (e) {
      if (e && e.layer instanceof L.Marker) {
        // Defer so map.js finishes its own wiring first.
        setTimeout(function () { afterRender(); }, 0);
      }
    });
  }

  // --- Custom side panel for supercluster pins ------------------------------

  function buildSuperclusterPanel() {
    if (document.getElementById('supercluster-panel')) return;
    var aside = document.createElement('aside');
    aside.id = 'supercluster-panel';
    aside.setAttribute('role', 'complementary');
    aside.setAttribute('aria-label', 'Ecosystem details');
    aside.innerHTML =
      '<div class="scp-header">' +
        '<button class="scp-close" type="button">← Close</button>' +
        '<div class="scp-eyebrow" id="scp-eyebrow">Regional ecosystem</div>' +
        '<div class="scp-name" id="scp-name">—</div>' +
        '<div class="scp-meta" id="scp-meta"></div>' +
      '</div>' +
      '<div class="scp-body">' +
        '<p class="scp-section-label">Summary</p>' +
        '<p class="scp-summary" id="scp-summary">—</p>' +
        '<div class="scp-stat-row">' +
          '<div class="scp-stat-cell"><div class="scp-stat-num" id="scp-cluster-count">—</div><div class="scp-stat-label">Clusters diagnosed</div></div>' +
          '<div class="scp-stat-cell"><div class="scp-stat-num" id="scp-evidence-count">—</div><div class="scp-stat-label">Evidence items</div></div>' +
        '</div>' +
        '<p class="scp-section-label">Dominant configuration</p>' +
        '<div class="scp-config" id="scp-config">—</div>' +
        '<div class="scp-actions">' +
          '<a class="scp-cta scp-cta-primary" id="scp-view-link" href="#">View ecosystem →</a>' +
          '<button class="scp-cta scp-cta-secondary" id="scp-show-on-map" type="button">Show clusters on map →</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(aside);
    aside.querySelector('.scp-close').addEventListener('click', closeSuperclusterPanel);
    aside.querySelector('#scp-show-on-map').addEventListener('click', function () {
      var sid = aside.dataset.scId;
      if (!sid) return;
      closeSuperclusterPanel();
      expand(sid);
    });
  }

  function openSuperclusterPanel(sc) {
    if (!sc) return;
    // Close map.js's cluster panel if it happens to be open.
    if (typeof window.closeClusterPanel === 'function') {
      try { window.closeClusterPanel(); } catch (e) { /* ignore */ }
    }
    var aside = document.getElementById('supercluster-panel');
    if (!aside) return;
    aside.dataset.scId = sc.id;

    aside.querySelector('#scp-name').textContent = sc.name || '';
    aside.querySelector('#scp-summary').textContent = sc.summary || '';

    var meta = aside.querySelector('#scp-meta');
    meta.innerHTML = '';
    function addTag(text) {
      if (!text) return;
      var t = document.createElement('span');
      t.className = 'scp-tag';
      t.textContent = text;
      meta.appendChild(t);
    }
    var country = sc._country || sc.country;
    addTag(country);
    var n = sc.cluster_count != null ? sc.cluster_count : (sc.cluster_ids ? sc.cluster_ids.length : null);
    if (n != null) addTag(n + ' cluster' + (String(n) === '1' ? '' : 's'));

    aside.querySelector('#scp-cluster-count').textContent =
      n != null ? String(n) : '—';
    aside.querySelector('#scp-evidence-count').textContent =
      sc.evidence_count != null ? sc.evidence_count.toLocaleString() : '—';

    // Dominant configuration: use the supercluster's regime (which comes from
    // the diagnostic export — e.g. "Coordination-Intermediary-Activity") if
    // present. Fall back to the top entry of dominant_stacks. Only the
    // Orlando supercluster has neither, in which case suppress the section.
    var configEl = aside.querySelector('#scp-config');
    var configLabel = '';
    if (sc.regime && sc.regime !== 'supercluster' && sc.regime !== 'mature') {
      configLabel = sc.regime;
    } else if (sc.dominant_stacks && sc.dominant_stacks.length) {
      var top = sc.dominant_stacks[0];
      configLabel = top.name + (top.confidence ? ' · ' + top.confidence + ' confidence' : '');
    }
    if (configLabel) {
      configEl.textContent = configLabel;
      configEl.style.display = '';
    } else {
      configEl.textContent = '';
      configEl.style.display = 'none';
    }

    aside.querySelector('#scp-view-link').setAttribute('href', '/superclusters/' + sc.id);
    aside.classList.add('open');
    document.body.classList.add('panel-open');
  }

  function closeSuperclusterPanel() {
    var aside = document.getElementById('supercluster-panel');
    if (!aside) return;
    aside.classList.remove('open');
    document.body.classList.remove('panel-open');
  }

  function afterRender() {
    attachSuperclusterHandlers();
    fixupSuperPinClasses();
    updateCountDisplay();
  }

  // The page header has <div class="map-count"><span id="map-count">N</span>
  // clusters diagnosed</div>. Map.js writes the visible-marker count into
  // #map-count after every render. We rewrite the whole .map-count parent so
  // the default (super) view reads "26 ecosystems · 377 clusters diagnosed",
  // and the expanded view reads "N clusters in {Region}".
  function updateCountDisplay() {
    var countEl = document.getElementById('map-count');
    if (!countEl) return;
    var parent = countEl.parentElement;
    if (!parent) return;
    var supersCount = (allSuperclustersCache || []).length;
    var clustersTotal = (allClustersCache || []).length;

    if (mode === 'expanded' && expandedId) {
      var sc = (allSuperclustersCache || []).find(function (s) { return s.id === expandedId; });
      var n = sc && sc.cluster_count != null ? sc.cluster_count
            : (allClustersCache || []).filter(function (c) { return c.parent === expandedId; }).length;
      var regionLabel = sc ? sc.name : 'this region';
      parent.innerHTML =
        '<span id="map-count">' + n + '</span> cluster' + (String(n) === '1' ? '' : 's') +
        ' in ' + escapeHtml(regionLabel);
    } else {
      // Default supercluster-level view
      parent.innerHTML =
        '<span id="map-count">' + supersCount + '</span> ecosystem' +
        (String(supersCount) === '1' ? '' : 's') + ' · ' +
        '<span class="map-count-secondary">' + clustersTotal +
        ' cluster' + (String(clustersTotal) === '1' ? '' : 's') + ' diagnosed</span>';
    }
  }

  function attachSuperclusterHandlers() {
    if (!leafletMap || !allSuperclustersCache) return;
    leafletMap.eachLayer(function (layer) {
      if (!(layer instanceof L.Marker)) return;
      if (layer._scClickWrapped) return;
      var ll = layer.getLatLng();
      var matched = allSuperclustersCache.find(function (s) {
        return Math.abs(s.lat - ll.lat) < 1e-4 && Math.abs(s.lng - ll.lng) < 1e-4;
      });
      if (!matched) return;
      layer._scClickWrapped = true;
      // Replace map.js's standard cluster panel handler with our custom
      // ecosystem panel. expand() is still callable from the panel's
      // "Show clusters on map" secondary button.
      layer.off('click');
      layer.on('click', function () { openSuperclusterPanel(matched); });
    });
  }

  function fixupSuperPinClasses() {
    if (!leafletMap || !allSuperclustersCache) return;
    leafletMap.eachLayer(function (layer) {
      if (!(layer instanceof L.Marker)) return;
      var ll = layer.getLatLng();
      var matched = allSuperclustersCache.find(function (s) {
        return Math.abs(s.lat - ll.lat) < 1e-4 && Math.abs(s.lng - ll.lng) < 1e-4;
      });
      if (!matched) return;
      var iconEl = layer.getElement();
      if (!iconEl) return;
      var pinDiv = iconEl.querySelector('.cluster-pin');
      if (pinDiv && pinDiv.className.indexOf('regime-supercluster') === -1) {
        pinDiv.className = 'cluster-pin regime-supercluster';
      }
    });
  }

  // --- 3. Expand / collapse --------------------------------------------------

  function clearAllMarkers() {
    if (!leafletMap) return;
    var toRemove = [];
    leafletMap.eachLayer(function (layer) {
      if (layer instanceof L.Marker) toRemove.push(layer);
    });
    toRemove.forEach(function (m) {
      try { leafletMap.removeLayer(m); } catch (e) { /* swallow */ }
    });
  }

  function pinClassFor(c) {
    if (c._supercluster) return 'regime-supercluster';
    return 'regime-' + normaliseRegime(c.regime);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function renderMarkers(items) {
    if (!leafletMap) return;
    items.forEach(function (c) {
      if (c.lat == null || c.lng == null) return;
      var div = document.createElement('div');
      div.className = 'cluster-pin ' + pinClassFor(c);
      var icon = L.divIcon({ html: div, className: '', iconSize: [10, 10], iconAnchor: [5, 5] });
      var marker = L.marker([c.lat, c.lng], { icon: icon }).addTo(leafletMap);
      marker._scClickWrapped = true;  // we attach our own click below; skip auto-rewrap
      marker.bindTooltip(
        '<div class="cluster-tooltip"><strong>' + escapeHtml(c.name) + '</strong>' +
        '<span>' + escapeHtml(c.city || '') + (c.country ? ', ' + escapeHtml(c.country) : '') + '</span></div>',
        { permanent: false, direction: 'top', offset: [0, -8], className: '' }
      );
      if (c._supercluster) {
        // wrapper-rendered super pin (after a collapse): find the full
        // supercluster record and open the custom panel
        marker.on('click', function () {
          var sc = (allSuperclustersCache || []).find(function (s) { return s.id === c.id; });
          openSuperclusterPanel(sc || c);
        });
      } else {
        marker.on('click', function () { window.location.href = '/clusters/' + c.id + '.html'; });
      }
    });
  }

  function expand(superclusterId) {
    if (!leafletMap) return;
    loadDatasets().then(function (ds) {
      var sc = ds.supers.find(function (s) { return s.id === superclusterId; });
      if (!sc) return;

      if (mode === 'super') {
        var c = leafletMap.getCenter();
        origView.center = [c.lat, c.lng];
        origView.zoom = leafletMap.getZoom();
      }

      mode = 'expanded';
      expandedId = superclusterId;

      clearAllMarkers();

      var children = ds.clusters.filter(function (c) { return c.parent === superclusterId; });
      renderMarkers(children);

      if (children.length > 0) {
        var bounds = L.latLngBounds(children.map(function (c) { return [c.lat, c.lng]; }));
        leafletMap.fitBounds(bounds.pad(0.5));
      } else {
        leafletMap.setView([sc.lat, sc.lng], 9);
      }

      var btn = document.getElementById('sc-back-btn');
      if (btn) btn.style.display = 'block';

      updateCountDisplay();
    });
  }

  function collapse() {
    if (!leafletMap) return;
    loadDatasets().then(function (ds) {
      mode = 'super';
      expandedId = null;

      clearAllMarkers();

      var view = buildSuperclusterView(ds.clusters, ds.supers);
      window._allClusters = view;
      renderMarkers(view);

      // setTimeout so the new markers' DOM elements exist before we promote
      // their className.
      setTimeout(function () { fixupSuperPinClasses(); }, 0);

      leafletMap.setView(origView.center || [28, 12], origView.zoom || 2);

      var btn = document.getElementById('sc-back-btn');
      if (btn) btn.style.display = 'none';

      updateCountDisplay();
    });
  }

  window.ClusterOSMap = {
    expand: expand,
    collapse: collapse,
    getMode: function () { return mode; },
    getExpandedId: function () { return expandedId; }
  };
})();
