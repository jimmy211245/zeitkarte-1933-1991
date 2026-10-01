import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { buildStyle } from './map/style.js';
import { addPatterns } from './map/patterns.js';
import { addEventLayers, addHoverLayer, addFrontLayers } from './map/layers.js';
import { setupInteractions, focusOn } from './map/interactions.js';
import { state, set, subscribe } from './state.js';
import { START, END, toYmd, toIso, fromIso, formatDayMonth, yearOf, addMonths } from './lib/dates.js';
import { createTimeline } from './ui/timeline.js';
import { topoToGeoJSON } from './lib/topojson.js';
import { createPanel } from './ui/panel.js';
import { renderLegend, setBlocLegend } from './ui/legend.js';
import { createTimeEngine } from './map/timeengine.js';
import { setupAbout } from './ui/about.js';

const DATA = new URL(`${import.meta.env.BASE_URL}data`, window.location.href).href.replace(/\/$/, '');

// --- Zustand aus der Adresse lesen (#1939-09-01/4.2/15.00/50.00) -----------------------------
const hash = location.hash.slice(1).split('/');
if (/^\d{4}-\d{2}-\d{2}$/.test(hash[0] ?? '')) state.day = Math.max(START, Math.min(END, fromIso(hash[0])));
const initialView = hash.length >= 4 ? { zoom: +hash[1], center: [+hash[2], +hash[3]] } : { zoom: 3.6, center: [15, 50] };

const map = new maplibregl.Map({
  container: 'map',
  style: buildStyle(DATA, toYmd(state.day)),
  ...initialView,
  minZoom: 1,
  maxZoom: 10,
  attributionControl: false,
  renderWorldCopies: false,
  dragRotate: false,
  pitchWithRotate: false,
});
map.touchZoomRotate.disableRotation();
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
    customAttribution: 'Grenzen: <a href="https://icr.ethz.ch/data/cshapes/" target="_blank" rel="noopener">CShapes 2.0</a> (ETH Zürich, CC BY-NC-SA 4.0), ergänzt · Küsten, Flüsse: Natural Earth',
  }),
);
map.on('styleimagemissing', () => addPatterns(map));
new ResizeObserver(() => map.resize()).observe(document.getElementById('map'));
window.__map = map;

// Datum oder Ausschnitt per Adresszeile ändern (#JJJJ-MM-TT/zoom/länge/breite)
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1).split('/');
  if (/^\d{4}-\d{2}-\d{2}$/.test(h[0] ?? '')) {
    const d = fromIso(h[0]);
    if (Math.abs(d - state.day) > 0) set({ day: d, playing: false });
  }
  if (h.length >= 4) {
    const c = map.getCenter();
    if (Math.abs(c.lng - +h[2]) > 0.01 || Math.abs(c.lat - +h[3]) > 0.01 || Math.abs(map.getZoom() - +h[1]) > 0.01) map.jumpTo({ zoom: +h[1], center: [+h[2], +h[3]] });
  }
});

let ready = false;
const getJson = (f) => fetch(`${DATA}/${f}`).then((r) => {
  if (!r.ok) throw new Error(`${f}: ${r.status}`);
  return r.json();
});
// Grenzen und Änderungsflächen laden parallel zur Karte; die Listen werden sofort gebraucht
const statesPromise = getJson('states.topo.json').then((t) => topoToGeoJSON(t));
const changeShapesPromise = getJson('changes.topo.json').then((t) => topoToGeoJSON(t));
const frontsPromise = getJson('fronts.topo.json').then((t) => {
  const fc = topoToGeoJSON(t);
  fc.features.forEach((f, i) => (f.properties.id = i + 1));
  return fc;
});
const labelsPromise = getJson('labels.json');
const [events, changes] = await Promise.all([getJson('events.json'), getJson('changes-list.json')]);

// --- Seitenleiste und Zeitband ----------------------------------------------------------------
const panelEl = document.getElementById('panel');
const panel = createPanel({
  events,
  changes,
  onFocus(kind, it, { forceFly = false } = {}) {
    if (!ready) return;
    focusOn(map, kind, it, { force: forceFly, panelOpen: !panelEl.classList.contains('collapsed') });
  },
});

const timeline = createTimeline({
  tape: document.getElementById('tape'),
  overview: document.getElementById('overview'),
  tooltip: document.getElementById('tape-tooltip'),
  onPick(h) {
    if (h.kind === 'change') set({ tab: 'changes', categories: null, query: '' });
    else if (state.tab !== 'events') set({ tab: 'events', categories: null, query: '' });
    panel.open(h.kind, h.id);
  },
});
timeline.setMarkers(
  events.map((e) => ({ id: e.id, t: e.t, cat: e.cat, imp: e.imp, title: e.title })),
  changes.map((c) => ({ id: c.id, t: c.t, imp: c.imp, title: c.title })),
);

// --- Karte ------------------------------------------------------------------------------------
let engine = null;
map.on('load', async () => {
  addPatterns(map);
  const [statesData, labelsData, frontsData, changeShapes] = await Promise.all([statesPromise, labelsPromise, frontsPromise, changeShapesPromise]);
  map.getSource('states').setData(statesData);
  map.getSource('labels').setData(labelsData);
  addFrontLayers(map, frontsData);
  addHoverLayer(map);
  addEventLayers(map, {
    type: 'FeatureCollection',
    features: events
      .filter((e) => e.lon != null)
      .map((e) => ({ type: 'Feature', properties: { id: e.id, imp: e.imp, cat: e.cat, title: e.title }, geometry: { type: 'Point', coordinates: [e.lon, e.lat] } })),
  });
  engine = createTimeEngine(map, { states: statesData, labels: labelsData, fronts: frontsData, events, changeShapes, onBlocs: setBlocLegend });
  setupInteractions(map, {
    onEvent: (id) => { set({ tab: 'events' }); panel.open('event', id, { jump: false }); },
    isStateActive: engine.isStateActive,
    isEventVisible: engine.isEventVisible,
  });
  ready = true;
  syncMap(state, ['day', 'selection', 'layers', 'mode']);
  map.once('idle', () => (document.getElementById('loading').hidden = true));
});

function syncMap(s, changed) {
  if (!ready) return;
  if (changed.includes('day')) engine.update(s.day);
  if (changed.includes('mode')) engine.setMode(s.mode, s.day);
  if (changed.includes('selection')) engine.setSelection(s.selection, s.day);
  if (changed.includes('layers')) {
    const vis = (on) => (on ? 'visible' : 'none');
    for (const id of ['events-halo', 'events-dot', 'events-label']) map.getLayer(id) && map.setLayoutProperty(id, 'visibility', vis(s.layers.events));
    for (const id of ['rivers', 'lakes']) map.setLayoutProperty(id, 'visibility', vis(s.layers.rivers));
    for (const id of ['change-fill', 'change-line']) map.setLayoutProperty(id, 'visibility', vis(s.layers.changes));
    for (const id of ['fronts-fill', 'fronts-allied', 'fronts-casing', 'fronts-line']) map.getLayer(id) && map.setLayoutProperty(id, 'visibility', vis(s.layers.fronts));
  }
}

// --- Datumsanzeige ----------------------------------------------------------------------------
const dm = document.getElementById('date-daymonth');
const yr = document.getElementById('date-year');
function renderDate() {
  dm.textContent = formatDayMonth(state.day);
  yr.textContent = yearOf(state.day);
}

// --- Abspielen --------------------------------------------------------------------------------
const playBtn = document.getElementById('play-btn');
let last = 0;
let raf = 0;
// Tagesbruchteile beim Abspielen separat mitführen, damit auch langsame Geschwindigkeiten laufen
let playDay = state.day;
function tick(now) {
  if (!state.playing) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  playDay += state.speed * dt;
  if (playDay >= END) set({ day: END, playing: false });
  else set({ day: playDay });
  raf = requestAnimationFrame(tick);
}

playBtn.addEventListener('click', () => set({ playing: !state.playing }));
document.getElementById('speed').addEventListener('change', (e) => set({ speed: Number(e.target.value) }));

function jumpEvent(dir) {
  const list = events;
  let target = null;
  if (dir > 0) target = list.find((e) => e.t > state.day);
  else for (let i = list.length - 1; i >= 0; i--) if (list[i].t < state.day) { target = list[i]; break; }
  if (target) {
    if (state.tab !== 'events') set({ tab: 'events', categories: null });
    panel.open('event', target.id);
  }
}
document.getElementById('prev-btn').addEventListener('click', () => jumpEvent(-1));
document.getElementById('next-btn').addEventListener('click', () => jumpEvent(1));

// --- Tastatur ---------------------------------------------------------------------------------
window.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea, dialog')) return;
  const step = e.altKey ? 1 : null;
  switch (e.key) {
    case ' ':
      e.preventDefault();
      set({ playing: !state.playing });
      break;
    case 'ArrowRight':
      e.preventDefault();
      set({ playing: false, day: step ? state.day + 1 : addMonths(state.day, e.shiftKey ? 12 : 1) });
      break;
    case 'ArrowLeft':
      e.preventDefault();
      set({ playing: false, day: step ? state.day - 1 : addMonths(state.day, e.shiftKey ? -12 : -1) });
      break;
    case 'PageDown':
      e.preventDefault();
      jumpEvent(1);
      break;
    case 'PageUp':
      e.preventDefault();
      jumpEvent(-1);
      break;
    case 'Escape':
      if (state.selection) set({ selection: null });
      break;
    default:
  }
});

// --- Kopfzeile: Ansicht und Ebenen ------------------------------------------------------------
document.querySelectorAll('.seg [data-mode]').forEach((b) => b.addEventListener('click', () => set({ mode: b.dataset.mode })));
const layersBtn = document.getElementById('layers-btn');
const layersMenu = document.getElementById('layers-menu');
layersBtn.addEventListener('click', () => {
  layersMenu.hidden = !layersMenu.hidden;
  layersBtn.setAttribute('aria-expanded', String(!layersMenu.hidden));
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-wrap')) {
    layersMenu.hidden = true;
    layersBtn.setAttribute('aria-expanded', 'false');
  }
});
layersMenu.addEventListener('change', (e) => {
  const key = e.target.dataset.layer;
  if (key) set({ layers: { ...state.layers, [key]: e.target.checked } });
});

renderLegend(document.getElementById('legend'));
setupAbout(document.getElementById('about'), document.getElementById('about-btn'), { events: events.length, changes: changes.length });

// --- Adresse aktualisieren --------------------------------------------------------------------
let hashTimer = 0;
function writeHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const c = map.getCenter();
    history.replaceState(null, '', `#${toIso(state.day)}/${map.getZoom().toFixed(2)}/${c.lng.toFixed(2)}/${c.lat.toFixed(2)}`);
  }, 400);
}
map.on('moveend', writeHash);

// --- Reaktion auf Zustandsänderungen ----------------------------------------------------------
subscribe((s, changed) => {
  syncMap(s, changed);
  if (changed.includes('day')) {
    renderDate();
    writeHash();
  }
  if (changed.includes('playing')) {
    playBtn.innerHTML = `<svg><use href="#i-${s.playing ? 'pause' : 'play'}"/></svg>`;
    playBtn.title = s.playing ? 'Anhalten (Leertaste)' : 'Abspielen (Leertaste)';
    if (s.playing) {
      if (s.day >= END) set({ day: START });
      playDay = state.day;
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }
  }
  if (changed.includes('mode')) {
    document.querySelectorAll('.seg [data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === s.mode)));
  }
});

renderDate();
