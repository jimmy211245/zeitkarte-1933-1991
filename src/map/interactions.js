// Mausinteraktion mit Staaten und Ereignissen auf der Karte.
import maplibregl from 'maplibre-gl';
import { state } from '../state.js';
import { STATUS_LABELS } from '../data/status.js';
import { formatShort, toDay } from '../lib/dates.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Alle Zeitstände bleiben geladen (unsichtbare per Feature-State) – Abfragen deshalb filtern
export function setupInteractions(map, { onEvent, isStateActive, isEventVisible }) {
  let hoverId = null;
  const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 6 });

  const setHover = (id) => {
    if (hoverId === id) return;
    if (hoverId != null) map.setFeatureState({ source: 'states', id: hoverId }, { hover: false });
    hoverId = id;
    if (id != null) map.setFeatureState({ source: 'states', id }, { hover: true });
  };

  const eventAt = (point) =>
    map.getLayer('events-dot') ? map.queryRenderedFeatures(point, { layers: ['events-dot'] }).find((f) => isEventVisible(f.id)) : null;
  const stateAt = (point) => map.queryRenderedFeatures(point, { layers: ['states-fill'] }).find((f) => isStateActive(f.id));

  map.on('mousemove', (e) => {
    if (eventAt(e.point)) {
      map.getCanvas().style.cursor = 'pointer';
      setHover(null);
      return;
    }
    const f = stateAt(e.point);
    map.getCanvas().style.cursor = f ? 'pointer' : '';
    setHover(f ? f.id : null);
  });
  map.on('mouseout', () => setHover(null));

  map.on('click', (e) => {
    const ev = eventAt(e.point);
    if (ev) {
      onEvent(ev.properties.id);
      return;
    }
    const f = stateAt(e.point);
    if (!f) return;
    popup.setLngLat(e.lngLat).setHTML(stateHtml(f.properties)).addTo(map);
  });
}

function stateHtml(p) {
  const status = STATUS_LABELS[p.st] ?? '';
  const ruler = p.sn && p.st !== 'ind' ? (p.st === 'ann' ? ` durch ${p.sn}` : ` · ${p.sn}`) : '';
  const from = p.s <= 19330130 ? 'vor 1933' : formatShort(toDay(p.s));
  const to = p.e >= 19911231 ? 'nach 1991' : formatShort(toDay(p.e));
  return `
    <div class="pop-title">${esc(p.n)}</div>
    <div class="pop-sub">${esc(status)}${esc(ruler)}</div>
    <div class="pop-facts">
      ${p.cap ? `<span>Hauptstadt</span><b>${esc(p.cap)}</b>` : ''}
      ${p.a ? `<span>Fläche</span><b>ca. ${Number(p.a).toLocaleString('de-DE')} km²</b>` : ''}
      <span>Grenzen</span><b>${esc(from)} bis ${esc(to)}</b>
    </div>`;
}

/** Karte auf ein Ereignis oder eine Gebietsänderung ausrichten (Platz für die Seitenleiste lassen). */
export function focusOn(map, kind, it, { force = false, panelOpen = true } = {}) {
  const padLeft = panelOpen && window.innerWidth > 860 ? 380 : 20;
  const padding = { top: 70, bottom: 30, left: padLeft, right: 30 };
  if (kind === 'event') {
    if (it.lon == null) return;
    const zoom = it.zoom ?? (it.imp === 1 ? 4.6 : 5.4);
    const p = map.project([it.lon, it.lat]);
    const c = map.getCanvas();
    const inView = p.x > padLeft + 20 && p.x < c.clientWidth - 40 && p.y > 80 && p.y < c.clientHeight - 40;
    if (!force && inView && Math.abs(map.getZoom() - zoom) < 1.6) return;
    map.flyTo({ center: [it.lon, it.lat], zoom: force ? Math.max(zoom, map.getZoom()) : zoom, padding, duration: 1200, essential: true });
  } else if (it.bbox) {
    const [w, s, e, n] = it.bbox;
    map.fitBounds([[w, s], [e, n]], { padding, maxZoom: 6.5, duration: 1200, essential: true });
  }
}
