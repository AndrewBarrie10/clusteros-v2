const RADAR_AXES = [
  'Coordinating','Narrating','Forgiving','Reproving',
  'Extracting','Validating','Mediating','Incumbents','Permission'
];

function drawRadar(c, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const stalls = c.stalls || [];
  // Map stall names → intensity (fuzzy match on first word)
  const vals = RADAR_AXES.map(axis => {
    const match = stalls.find(s =>
      s.name && s.name.toLowerCase().includes(axis.toLowerCase().slice(0,5))
    );
    return match ? Math.min(1, match.intensity || 0.3) : 0;
  });

  const N   = RADAR_AXES.length;
  const cx  = 90, cy = 88, r = 64;
  const step = (2 * Math.PI) / N;
  const offset = -Math.PI / 2;

  function pt(i, radius) {
    const a = offset + i * step;
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
  }

  // Grid rings
  let rings = '';
  [0.25, 0.5, 0.75, 1].forEach(t => {
    const pts = RADAR_AXES.map((_, i) => pt(i, r * t).join(',')).join(' ');
    rings += `<polygon points="${pts}" fill="none" stroke="#ddd8cf" stroke-width="0.8"/>`;
  });

  // Axes
  let axes = '';
  RADAR_AXES.forEach((label, i) => {
    const [x2, y2] = pt(i, r);
    const [lx, ly] = pt(i, r + 14);
    const anchor = lx < cx - 4 ? 'end' : lx > cx + 4 ? 'start' : 'middle';
    axes += `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ddd8cf" stroke-width="0.8"/>`;
    axes += `<text x="${lx.toFixed(1)}" y="${(ly+3).toFixed(1)}" text-anchor="${anchor}" font-family="Geist Mono,monospace" font-size="6.5" fill="#8c8780" letter-spacing="0.02em">${label.toUpperCase()}</text>`;
  });

  // Data polygon
  const dataPts = vals.map((v, i) => pt(i, r * v).join(',')).join(' ');

  el.innerHTML = `<svg viewBox="0 0 180 176" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:200px;display:block;margin:0 auto">
    ${rings}${axes}
    <polygon points="${dataPts}" fill="rgba(42,122,79,0.18)" stroke="#2a7a4f" stroke-width="1.5" stroke-linejoin="round"/>
    ${vals.map((v,i) => { const [px,py]=pt(i,r*v); return v>0?`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.5" fill="#2a7a4f"/>`:'' }).join('')}
  </svg>`;
}
window.drawRadar = drawRadar;


// ── ClusterOS Map & Panel Logic ───────────────────────────

document.addEventListener('DOMContentLoaded', function () {
if (!document.getElementById('map')) return;

// ── MAP INIT ──────────────────────────────────────────────
const map = L.map('map', {
  center: [28, 12],
  zoom: 2,
  zoomControl: true,
  attributionControl: true,
  scrollWheelZoom: false
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 14
}).addTo(map);

let allClusters = [];
let markers     = [];
let activeFilter = 'all';

function inferSector(c) {
  const name = (c.name + ' ' + (c.sector || '')).toLowerCase();
  if (/cyber|security|infosec/.test(name))               return 'cyber';
  if (/life.sci|biotech|medtech|health|pharma/.test(name)) return 'life';
  if (/manufactur|industrial|engineer/.test(name))       return 'manufacturing';
  if (/space|deep.tech|quantum|photon|satel/.test(name)) return 'space';
  return 'other';
}

function pinClass(cluster) {
  if (!cluster.stalls || !cluster.stalls.length) return 'stall-low';
  const max = Math.max(...cluster.stalls.map(s => s.intensity || 0));
  if (max > 0.65) return 'stall-high';
  if (max > 0.4)  return 'stall-med';
  return 'stall-low';
}

function createPin(cluster) {
  const div = document.createElement('div');
  div.className = `cluster-pin ${pinClass(cluster)}`;
  return L.divIcon({ html: div, className: '', iconSize: [10, 10], iconAnchor: [5, 5] });
}

function renderMarkers(clusters) {
  markers.forEach(m => m.remove());
  markers = [];
  clusters.forEach(c => {
    if (!c.lat || !c.lng) return;
    const marker = L.marker([c.lat, c.lng], { icon: createPin(c) });
    marker.bindTooltip(
      `<div class="cluster-tooltip"><strong>${c.name}</strong><span>${c.city}, ${c.country}</span></div>`,
      { permanent: false, direction: 'top', offset: [0, -8], className: '' }
    );
    marker.on('click', () => openClusterPanel(c));
    marker.addTo(map);
    markers.push(marker);
  });
  const countEl = document.getElementById('map-count');
  if (countEl) countEl.textContent = clusters.length;
}

function filterClusters() {
  if (activeFilter === 'all') return allClusters;
  return allClusters.filter(c => inferSector(c) === activeFilter);
}

// Load clusters
fetch('/clusters.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    allClusters = data;
    window._allClusters = data; // expose for similar clusters panel
    renderMarkers(allClusters);
  })
  .catch(err => console.warn('clusters.json error:', err));

// Filter buttons
document.querySelectorAll('.map-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderMarkers(filterClusters());
  });
});

// ── CLUSTER SIDE PANEL ────────────────────────────────────

// ── RADAR CHART ────────────────────────────────────────────
// ── END RADAR ───────────────────────────────────────────────

function openClusterPanel(c) {
  document.getElementById('cp-name')?.textContent    = c.name;
  document.getElementById('cp-meta')?.textContent    = `${c.city} · ${c.country}`;
  document.getElementById('cp-summary')?.textContent = c.summary || 'Diagnostic profile available on request.';

  const badge = document.getElementById('cp-regime-badge');
  if (badge) badge.innerHTML = c.regime
    ? `<span class="cp-regime ${c.regime}">${c.regime}</span>` : '';

  // Radar chart
  drawRadar(c, 'cp-radar');

  const stallsEl = document.getElementById('cp-stalls');
  if (stallsEl) {
    stallsEl.innerHTML = '';
    (c.stalls || []).slice(0, 5).forEach(s => {
      const row  = document.createElement('div');
      row.className = 'cp-stall';
      const barW = Math.round((s.intensity || 0.3) * 80);
      row.innerHTML = `<div class="cp-stall-bar" style="width:${barW}px"></div><span>${s.name}</span>`;
      stallsEl.appendChild(row);
    });
  }

  const slug = c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const link = document.getElementById('cp-full-link');
  if (link) link.href = `/clusters/${slug}.html`;

  document.getElementById('cluster-panel')?.classList.add('open');

  // Signal to behaviour layer
  if (window.behaviour) window.behaviour.recordCluster(c);
}

function closeClusterPanel() {
  document.getElementById('cluster-panel')?.classList.remove('open');
}

// ── JOURNEY PANELS ────────────────────────────────────────
function closePanel(id) {
  const panel = document.getElementById(`panel-${id}`);
  if (panel) panel.classList.remove('open');
  if (window.behaviour) window.behaviour.recordClose(id);
  document.getElementById('forks')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openPanel(id) {
  document.querySelectorAll('.journey-panel').forEach(p => p.classList.remove('open'));
  const panel = document.getElementById(`panel-${id}`);
  if (panel) {
    panel.classList.add('open');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (window.behaviour) {
    window.behaviour.recordFork(id);
    window.behaviour.updateAll();
  }
  if (window.dashboard) window.dashboard.onForkOpen(id);
}

function switchPanel(from, to) {
  const fromPanel = document.getElementById(`panel-${from}`);
  if (fromPanel) fromPanel.classList.remove('open');
  openPanel(to);
}

// Expose to global scope for onclick attributes in HTML
window.closePanel       = closePanel;
window.openPanel        = openPanel;
window.switchPanel      = switchPanel;
window.closeClusterPanel = closeClusterPanel;

// Fork thread click handlers
document.querySelectorAll('.fork-thread').forEach(thread => {
  thread.addEventListener('click', () => {
    const id    = thread.dataset.panel;
    const panel = document.getElementById(`panel-${id}`);
    if (panel?.classList.contains('open')) {
      closePanel(id);
    } else {
      openPanel(id);
    }
  });
});

// ── INTELLIGENCE BAR ──────────────────────────────────────
const barInput  = document.getElementById('intel-bar-input');
const barSubmit = document.getElementById('intel-bar-submit');
const barStatus = document.getElementById('intel-bar-status');

if (barInput) {
  barInput.addEventListener('input', () => {
    if (barSubmit) {
      barSubmit.style.display = barInput.value.trim().length > 2 ? 'block' : 'none';
    }
  });

  barInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBar();
  });
}

if (barSubmit) barSubmit.addEventListener('click', submitBar);

function submitBar() {
  const val = barInput?.value.trim();
  if (!val) return;

  if (window.behaviour) window.behaviour.declareCluster(val);

  if (barInput)  barInput.style.display  = 'none';
  if (barSubmit) barSubmit.style.display = 'none';
  if (barStatus) {
    barStatus.style.display = 'block';
    barStatus.textContent   = val + ' — reading the map';
  }

  // Reset adaptive blocks
  document.querySelectorAll('.adaptive-cta-wrap').forEach(w => w.classList.remove('visible'));
  if (window.behaviour) window.behaviour.updateAll();
}

// ── DASHBOARD PANEL CLOSE / REOPEN ───────────────────────
const dbClose = document.getElementById('dashboard-close');
if (dbClose) {
  dbClose.addEventListener('click', () => {
    document.getElementById('dashboard-panel')?.classList.remove('open');
    document.body.classList.remove('dashboard-open');
    // Show the tab so they can reopen
    document.getElementById('dashboard-tab')?.classList.add('visible');
  });
}

window.dashboardReopen = function() {
  document.getElementById('dashboard-panel')?.classList.add('open');
  document.body.classList.add('dashboard-open');
  document.getElementById('dashboard-tab')?.classList.remove('visible');
};

}); // end DOMContentLoaded
