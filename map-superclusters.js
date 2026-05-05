// ClusterOS — Supercluster map wrapper
// Loaded AFTER map.js (which is locked, UTF-16 encoded, must not be edited).
//
// Strategy:
//   1. Patch window.fetch so map.js's request to /clusters.json receives a
//      supercluster-level dataset on initial load.
//   2. Patch L.map to capture the Leaflet map instance for our own use.
//   3. After map.js renders, attach click handlers on supercluster pins that
//      replace the rendered markers with the children of the clicked region.
//   4. Provide a "Back to regions" control to collapse back to the supercluster
//      view.
//
// All map.js's existing behaviour (pin styling driven by regime, side panel,
// filter buttons) continues to work for non-supercluster pins.

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

  function buildSuperclusterView(clusters, supers) {
    var standalone = clusters.filter(function (c) { return !c.parent; });
    var superPins = supers.map(function (s) {
      return {
        id: s.id,
        name: s.name,
        city: s.city,
        country: s.country,
        lat: s.lat,
        lng: s.lng,
        regime: 'supercluster',
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
    var container = mapEl;
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    var btn = document.createElement('button');
    btn.id = 'sc-back-btn';
    btn.type = 'button';
    btn.textContent = '← Back to regions';
    btn.addEventListener('click', function () { collapse(); });
    container.appendChild(btn);

    // Pin handlers can only be attached after map.js renders. Do an initial pass
    // and re-run on layeradd events so subsequent renders are also covered.
    setTimeout(function () { attachSuperclusterHandlers(); }, 0);
    map.on('layeradd', function (e) {
      if (e && e.layer instanceof L.Marker) {
        // Defer to allow map.js to finish wiring its own click handler.
        setTimeout(function () { attachSuperclusterHandlers(); }, 0);
      }
    });
  }

  function attachSuperclusterHandlers() {
    if (!leafletMap || !allSuperclustersCache) return;
    leafletMap.eachLayer(function (layer) {
      if (!(layer instanceof L.Marker)) return;
      if (layer._scWrapped) return;
      var ll = layer.getLatLng();
      var matched = allSuperclustersCache.find(function (s) {
        return Math.abs(s.lat - ll.lat) < 1e-4 && Math.abs(s.lng - ll.lng) < 1e-4;
      });
      if (!matched) return;
      layer._scWrapped = true;
      // Strip map.js's click handler (which would open the side panel) and
      // replace with our expand action.
      layer.off('click');
      layer.on('click', function () { expand(matched.id); });
    });
  }

  // --- 3. Expand / collapse --------------------------------------------------

  function clearAllMarkers() {
    if (!leafletMap) return;
    var toRemove = [];
    leafletMap.eachLayer(function (layer) {
      if (layer instanceof L.Marker) toRemove.push(layer);
    });
    toRemove.forEach(function (m) { leafletMap.removeLayer(m); });
  }

  function pinClassFor(c) {
    if (c._supercluster) return 'regime-supercluster';
    var r = (c.regime || 'unknown').toLowerCase();
    return 'regime-' + r;
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
      marker._scWrapped = true;
      marker.bindTooltip(
        '<div class="cluster-tooltip"><strong>' + escapeHtml(c.name) + '</strong>' +
        '<span>' + escapeHtml(c.city || '') + (c.country ? ', ' + escapeHtml(c.country) : '') + '</span></div>',
        { permanent: false, direction: 'top', offset: [0, -8], className: '' }
      );
      if (c._supercluster) {
        marker.on('click', function () { expand(c.id); });
      } else {
        marker.on('click', function () { window.location.href = '/clusters/' + c.id + '.html'; });
      }
    });
  }

  function expand(superclusterId) {
    if (!leafletMap || !allClustersCache || !allSuperclustersCache) return;
    var sc = allSuperclustersCache.find(function (s) { return s.id === superclusterId; });
    if (!sc) return;

    if (mode === 'super') {
      origView.center = [leafletMap.getCenter().lat, leafletMap.getCenter().lng];
      origView.zoom = leafletMap.getZoom();
    }

    mode = 'expanded';
    expandedId = superclusterId;

    clearAllMarkers();

    var children = allClustersCache.filter(function (c) { return c.parent === superclusterId; });
    renderMarkers(children);

    if (children.length > 0) {
      var bounds = L.latLngBounds(children.map(function (c) { return [c.lat, c.lng]; }));
      leafletMap.fitBounds(bounds.pad(0.5));
    } else {
      leafletMap.setView([sc.lat, sc.lng], 9);
    }

    var btn = document.getElementById('sc-back-btn');
    if (btn) btn.style.display = 'block';

    var countEl = document.getElementById('map-count');
    if (countEl) countEl.textContent = children.length;
  }

  function collapse() {
    if (!leafletMap || !allClustersCache || !allSuperclustersCache) return;
    mode = 'super';
    expandedId = null;

    clearAllMarkers();

    var view = buildSuperclusterView(allClustersCache, allSuperclustersCache);
    window._allClusters = view;
    renderMarkers(view);

    leafletMap.setView(origView.center, origView.zoom);

    var btn = document.getElementById('sc-back-btn');
    if (btn) btn.style.display = 'none';

    var countEl = document.getElementById('map-count');
    if (countEl) countEl.textContent = view.length;
  }

  window.ClusterOSMap = {
    expand: expand,
    collapse: collapse,
    getMode: function () { return mode; },
    getExpandedId: function () { return expandedId; }
  };
})();
