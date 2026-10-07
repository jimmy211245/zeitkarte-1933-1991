import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';
import { buildStyle, planFilter } from './map/style.js';
import { addPatterns } from './map/patterns.js';
import { addEventLayers, addHoverLayer, addFrontLayers } from './map/layers.js';
import { setupInteractions, focusOn } from './map/interactions.js';
import { state, set, subscribe } from './state.js';
import { START, END, toYmd, toIso, fromIso, formatDayMonth, yearOf, addMonths } from './lib/dates.js';
import { createTimeline } from './ui/timeline.js';
import { topoToGeoJSON } from './lib/topojson.js';
import { createPanel } from './ui/panel.js';
import { getTheme, matchesTheme, itemHasTheme } from './data/themes.js';
import { createThemeMenu } from './ui/themeMenu.js';
import { setupMenu } from './ui/menu.js';
import { renderLegend, setBlocLegend, setPlanLegend } from './ui/legend.js';
import { createTimeEngine } from './map/timeengine.js';
import { setupAbout } from './ui/about.js';
import { t, tf, LANG, translateDocument, setupLangSwitch } from './i18n.js';

translateDocument();
setupLangSwitch(document.getElementById('lang-seg'));

const DATA = new URL(`${import.meta.env.BASE_URL}data`, window.location.href).href.replace(/\/$/, '');

// --- Zustand aus der Adresse lesen (#1939-09-01/4.2/15.00/50.00) -----------------------------
// Ausschnitt nur übernehmen, wenn die Zahlen gültig sind – sonst bricht MapLibre beim Start ab
function viewFromHash(h) {
  if (h.length < 4) return null;
  const [zoom, lng, lat] = h.slice(1, 4).map(Number);
  if (![zoom, lng, lat].every(Number.isFinite) || Math.abs(lat) > 90) return null;
  return { zoom, center: [lng, lat] };
}
const hash = location.hash.slice(1).split('/');
const hashHasDate = /^\d{4}-\d{2}-\d{2}$/.test(hash[0] ?? '');
if (hashHasDate) state.day = Math.max(START, Math.min(END, fromIso(hash[0])));
const initialView = viewFromHash(hash) ?? { zoom: 3.6, center: [15, 50] };
// Schwerpunktthema per Link (?thema=<Theme-ID>); unbekannte IDs werden ignoriert
const urlTheme = getTheme(new URLSearchParams(location.search).get('thema'));
if (urlTheme) state.theme = urlTheme.id;

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
    customAttribution: tf(
      'Grenzen: <a href="https://icr.ethz.ch/data/cshapes/" target="_blank" rel="noopener">CShapes 2.0</a> (ETH Zürich, CC BY-NC-SA 4.0), ergänzt · Küsten, Flüsse, Binnengrenzen: Natural Earth',
      'Borders: <a href="https://icr.ethz.ch/data/cshapes/" target="_blank" rel="noopener">CShapes 2.0</a> (ETH Zurich, CC BY-NC-SA 4.0), supplemented · Coasts, rivers, internal borders: Natural Earth',
    ),
  }),
);
// Auf schmalen Bildschirmen startet die Quellenangabe eingeklappt (Knopf „i“), sonst verdeckt sie
// die Legende; MapLibre selbst klappt sie erst beim ersten Verschieben der Karte ein
if (window.matchMedia('(max-width: 860px)').matches) {
  map.once('load', () => map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'));
}
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
  const view = viewFromHash(h);
  if (view) {
    const c = map.getCenter();
    if (Math.abs(c.lng - view.center[0]) > 0.01 || Math.abs(c.lat - view.center[1]) > 0.01 || Math.abs(map.getZoom() - view.zoom) > 0.01) map.jumpTo(view);
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
// Staatsnamen, Provinz- und Teilrepubliknamen und Städte teilen sich eine nach Datum gefilterte Quelle
const labelsPromise = Promise.all([getJson('labels.json'), getJson('admin-labels.json'), getJson('places.json')]).then(([states, admin, places]) => {
  for (const f of admin.features) states.features.push({ ...f, properties: { ...f.properties, k: 'admin' } });
  for (const f of places.features) states.features.push({ ...f, properties: { s: f.properties.s, e: f.properties.e, t: f.properties.n, r: f.properties.r, k: 'place' } });
  return states;
});
const adminPromise = getJson('admin.topo.json').then((t) => topoToGeoJSON(t));
const plansPromise = getJson('plans.json');
const [events, changes, eventsEn] = await Promise.all([
  getJson('events.json'),
  getJson('changes-list.json'),
  LANG === 'en' ? getJson('events.en.json').catch(() => []) : [],
]);
// Englische Fassung der Ereignisse (public/data/events.en.json, nach id): Titel, Ort und Text ersetzen
for (const tr of eventsEn) {
  const ev = events.find((e) => e.id === tr.id);
  if (ev) Object.assign(ev, { title: tr.title, place: tr.place, text: tr.text });
}
const eventsById = new Map(events.map((e) => [e.id, e]));

// --- Seitenleiste und Zeitband ----------------------------------------------------------------
const panel = createPanel({
  events,
  changes,
  onFocus(kind, it, { forceFly = false } = {}) {
    if (!ready) return;
    // Ereignisse mit Teilungsplan: auf den Plan statt auf den Ort des Beschlusses ausrichten
    if (kind === 'event' && it.plan && planBounds[it.plan]) focusOn(map, 'change', { bbox: planBounds[it.plan] }, { inset: mapInset() });
    else focusOn(map, kind, it, { force: forceFly, inset: mapInset() });
  },
});
const planBounds = {};

// Ränder der Karte, die Kopfzeile und Liste verdecken (für das Ausrichten auf ein Ziel)
function mapInset() {
  const stage = document.getElementById('stage').getBoundingClientRect();
  const top = document.querySelector('.masthead').getBoundingClientRect().bottom - stage.top + 12;
  const covered = panel.coveredHeight();
  if (covered) return { top, left: 20, bottom: covered + 20 };
  return { top, left: panel.isCollapsed() ? 20 : 380, bottom: 30 };
}

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
// Zeitband: Marken außerhalb des Schwerpunktthemas abgeschwächt
function setTimelineMarkers() {
  timeline.setMarkers(
    events.map((e) => ({ id: e.id, t: e.t, prec: e.prec, cat: e.cat, imp: e.imp, title: e.title, dim: !matchesTheme(e, state.theme) })),
    changes.map((c) => ({ id: c.id, t: c.t, imp: c.imp, title: c.title, dim: !matchesTheme(c, state.theme) })),
  );
}
setTimelineMarkers();

// --- Karte ------------------------------------------------------------------------------------
let engine = null;
map.on('load', async () => {
  addPatterns(map);
  const [statesData, labelsData, frontsData, changeShapes, adminData, plansData] = await Promise.all([
    statesPromise, labelsPromise, frontsPromise, changeShapesPromise, adminPromise, plansPromise,
  ]);
  map.getSource('states').setData(statesData);
  map.getSource('labels').setData(labelsData);
  map.getSource('admin').setData(adminData);
  map.getSource('plans').setData(plansData);
  for (const f of plansData.features) {
    if (f.geometry.type === 'Point') continue;
    const b = (planBounds[f.properties.plan] ??= [180, 90, -180, -90]);
    const walk = (c) => (typeof c[0] === 'number' ? (b[0] = Math.min(b[0], c[0]), b[1] = Math.min(b[1], c[1]), b[2] = Math.max(b[2], c[0]), b[3] = Math.max(b[3], c[1])) : c.forEach(walk));
    walk(f.geometry.coordinates);
  }
  addFrontLayers(map, frontsData);
  addHoverLayer(map);
  addEventLayers(map, {
    type: 'FeatureCollection',
    features: events
      .filter((e) => e.lon != null)
      .map((e) => ({ type: 'Feature', properties: { id: e.id, imp: e.imp, cat: e.cat, title: e.title }, geometry: { type: 'Point', coordinates: [e.lon, e.lat] } })),
  });
  engine = createTimeEngine(map, { states: statesData, labels: labelsData, fronts: frontsData, admin: adminData, events, changeShapes, onBlocs: setBlocLegend });
  setupInteractions(map, {
    onEvent: (id) => {
      // wie beim Zeitband: beim Wechsel zur Ereignisliste die Filter der Gebietsänderungen verwerfen,
      // sonst filtern Änderungsarten die Ereignisliste und sie bleibt leer
      if (state.tab !== 'events') set({ tab: 'events', categories: null });
      panel.open('event', id, { jump: false });
    },
    isStateActive: engine.isStateActive,
    isEventVisible: engine.isEventVisible,
  });
  ready = true;
  syncMap(state, ['day', 'selection', 'layers', 'mode', 'theme']);
  map.once('idle', () => {
    document.getElementById('loading').hidden = true;
    // Link mit Schwerpunkt, aber ohne Ausschnitt im Fragment: auf dessen Region ausrichten
    if (urlTheme && !viewFromHash(hash)) showTheme(urlTheme, { duration: 0 });
  });
});

let shownPlan = null;
function syncMap(s, changed) {
  if (!ready) return;
  if (changed.includes('day')) engine.update(s.day);
  if (changed.includes('mode')) engine.setMode(s.mode, s.day);
  if (changed.includes('theme')) engine.setTheme(s.theme, s.day);
  if (changed.includes('selection')) {
    engine.setSelection(s.selection, s.day);
    // Teilungsplan einblenden, solange sein Ereignis ausgewählt ist
    const plan = s.selection?.kind === 'event' ? eventsById.get(s.selection.id)?.plan ?? null : null;
    if (plan !== shownPlan) {
      shownPlan = plan;
      map.setFilter('plan-fill', planFilter(plan, 'Polygon'));
      map.setFilter('plan-line', planFilter(plan, 'Polygon'));
      map.setFilter('plan-label', planFilter(plan, 'Point'));
      setPlanLegend(plan);
    }
  }
  if (changed.includes('layers')) {
    const vis = (on) => (on ? 'visible' : 'none');
    for (const id of ['events-halo', 'events-dot', 'events-label']) map.getLayer(id) && map.setLayoutProperty(id, 'visibility', vis(s.layers.events));
    for (const id of ['rivers', 'lakes']) map.setLayoutProperty(id, 'visibility', vis(s.layers.rivers));
    for (const id of ['change-fill', 'change-line']) map.setLayoutProperty(id, 'visibility', vis(s.layers.changes));
    for (const id of ['fronts-fill', 'fronts-allied', 'fronts-casing', 'fronts-line']) map.getLayer(id) && map.setLayoutProperty(id, 'visibility', vis(s.layers.fronts));
    for (const id of ['admin-line', 'labels-admin-1', 'labels-admin-2']) map.setLayoutProperty(id, 'visibility', vis(s.layers.admin));
    for (const id of ['places-dot', 'labels-place-1', 'labels-place-2', 'labels-place-3']) map.setLayoutProperty(id, 'visibility', vis(s.layers.places));
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
// zuletzt vom Abspielen gesetztes Datum, um Sprünge von außen (z. B. Übersichtsleiste) zu erkennen
let tickDay = state.day;
function tick(now) {
  if (!state.playing) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (state.day !== tickDay) playDay = state.day;
  playDay += state.speed * dt;
  if (playDay >= END) set({ day: END, playing: false });
  else set({ day: playDay });
  tickDay = state.day;
  raf = requestAnimationFrame(tick);
}

playBtn.addEventListener('click', () => set({ playing: !state.playing }));
document.getElementById('speed').addEventListener('change', (e) => set({ speed: Number(e.target.value) }));

function jumpEvent(dir) {
  // mit Schwerpunkt nur zwischen dessen Ereignissen springen
  const list = state.theme ? events.filter((e) => matchesTheme(e, state.theme)) : events;
  let target = null;
  if (dir > 0) target = list.find((e) => e.t > state.day);
  else for (let i = list.length - 1; i >= 0; i--) if (list[i].t < state.day) { target = list[i]; break; }
  if (target) {
    if (state.tab !== 'events') set({ tab: 'events', categories: null });
    // auf dem Handy bleibt die Karte frei, das Ereignis erscheint im eingeklappten Blatt
    panel.open('event', target.id, { reveal: false });
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

// --- Kopfzeile: Ansicht, Schwerpunkt und Ebenen -----------------------------------------------
document.querySelectorAll('.seg [data-mode]').forEach((b) => b.addEventListener('click', () => set({ mode: b.dataset.mode })));
// Zeitraum eines Schwerpunkts: vom ersten bis zum letzten zugeordneten Ereignis oder Gebietswechsel
function themeSpan(theme) {
  const ts = [...events, ...changes].filter((it) => itemHasTheme(it, theme.id)).flatMap((it) => [it.t, it.te ?? it.t]);
  return ts.length ? [Math.min(...ts), Math.max(...ts)] : null;
}
// Liegt das Datum außerhalb des Zeitraums, an dessen Anfang springen
function enterThemePeriod(theme) {
  const span = theme && themeSpan(theme);
  if (span && (state.day < span[0] || state.day > span[1])) set({ day: span[0], playing: false });
}
// Karte auf den Ausschnitt eines Schwerpunkts ausrichten, sofern er nicht schon im Blick ist
function showTheme(theme, { duration = 1400 } = {}) {
  if (!theme || !ready) return;
  const [[w, s], [e, n]] = theme.viewBounds;
  const c = map.getCenter();
  const inView = map.getZoom() >= 5 && c.lng > w && c.lng < e && c.lat > s && c.lat < n;
  const inset = mapInset();
  if (!inView) map.fitBounds(theme.viewBounds, { padding: { top: inset.top, bottom: inset.bottom, left: inset.left, right: 40 }, duration, essential: true });
}
createThemeMenu({
  button: document.getElementById('theme-btn'),
  menu: document.getElementById('theme-menu'),
  events,
  changes,
  onSelect(theme) {
    enterThemePeriod(theme);
    showTheme(theme);
  },
});
function renderThemeUrl() {
  // Thema in der Adresse festhalten (?thema=<Theme-ID>), Datum und Ausschnitt bleiben im Fragment
  const url = new URL(location.href);
  if (state.theme) url.searchParams.set('thema', state.theme);
  else url.searchParams.delete('thema');
  history.replaceState(null, '', url);
}
renderThemeUrl();
const layersMenu = document.getElementById('layers-menu');
setupMenu(document.getElementById('layers-btn'), layersMenu);
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
    playBtn.title = s.playing ? t('Anhalten (Leertaste)') : t('Abspielen (Leertaste)');
    if (s.playing) {
      if (s.day >= END) set({ day: START });
      playDay = tickDay = state.day;
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }
  }
  if (changed.includes('mode')) {
    document.querySelectorAll('.seg [data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === s.mode)));
  }
  if (changed.includes('theme')) {
    renderThemeUrl();
    setTimelineMarkers();
  }
});

// Link mit Schwerpunkt, aber ohne Datum im Fragment: im Zeitraum des Schwerpunkts beginnen
if (urlTheme && !hashHasDate) enterThemePeriod(urlTheme);
renderDate();
