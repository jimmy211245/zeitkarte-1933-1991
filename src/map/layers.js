// Zusätzliche Kartenebenen, die erst nach dem Laden der Daten hinzukommen.
// Sichtbarkeit nach Datum wird über Feature-States gesteuert (siehe timeengine.js).
import { CATEGORIES } from '../data/categories.js';
import { LABEL_HALO, ON } from './style.js';

function categoryColor() {
  const expr = ['match', ['get', 'cat']];
  for (const [k, c] of Object.entries(CATEGORIES)) expr.push(k, c.color);
  expr.push('#5a636d');
  return expr;
}

// Ausblendwert 0…1 je Ereignis (0 = unsichtbar), Halo für frische oder ausgewählte Ereignisse
const FADE = ['coalesce', ['feature-state', 'f'], 0];
const HALO = ['coalesce', ['feature-state', 'h'], 0];
const SELECTED = ['boolean', ['feature-state', 'sel'], false];

export function addEventLayers(map, eventsGeojson) {
  map.addSource('events', { type: 'geojson', data: eventsGeojson, promoteId: 'id' });
  map.addSource('event-labels', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
  map.addLayer({
    id: 'events-halo',
    type: 'circle',
    source: 'events',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 9, 7, 16],
      'circle-color': categoryColor(),
      'circle-opacity': ['*', HALO, ['case', SELECTED, 0.28, 0.18]],
      'circle-stroke-width': ['case', SELECTED, 2, 0],
      'circle-stroke-color': '#a3262a',
      'circle-stroke-opacity': HALO,
    },
  });
  map.addLayer({
    id: 'events-dot',
    type: 'circle',
    source: 'events',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, ['match', ['get', 'imp'], 1, 4.6, 2, 3.6, 2.8], 7, ['match', ['get', 'imp'], 1, 7.5, 2, 6, 4.6]],
      'circle-color': categoryColor(),
      'circle-opacity': FADE,
      'circle-stroke-color': '#f7f7f4',
      'circle-stroke-width': 1.3,
      'circle-stroke-opacity': FADE,
    },
  });
  map.addLayer({
    id: 'events-label',
    type: 'symbol',
    source: 'event-labels',
    layout: {
      'text-field': ['get', 'title'],
      'text-font': ['Noto Sans Medium'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 7, 13.5],
      'text-anchor': 'left',
      'text-offset': [0.9, 0],
      'text-max-width': 14,
      'text-optional': true,
      'symbol-sort-key': ['get', 'imp'],
    },
    paint: { 'text-color': '#2b2124', 'text-halo-color': LABEL_HALO, 'text-halo-width': 1.6, 'text-opacity': FADE },
  });
}

/** Umriss beim Überfahren eines Staates */
export function addHoverLayer(map) {
  map.addLayer(
    {
      id: 'states-hover',
      type: 'line',
      source: 'states',
      paint: {
        'line-color': '#22272e',
        'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.6, 7, 3],
        'line-opacity': ['case', ['all', ON, ['boolean', ['feature-state', 'hover'], false]], 0.85, 0],
      },
    },
    'labels-major',
  );
}

/** Besatzungsgebiete und Frontlinien im Zweiten Weltkrieg (Näherung) */
export function addFrontLayers(map, frontsGeojson) {
  map.addSource('fronts', { type: 'geojson', data: frontsGeojson, promoteId: 'id' });
  const kind = (k) => ['==', ['get', 'k'], k];
  map.addLayer(
    { id: 'fronts-fill', type: 'fill', source: 'fronts', filter: kind('axis'), paint: { 'fill-pattern': 'hatch-occ', 'fill-opacity': ['case', ON, 0.9, 0] } },
    'change-fill',
  );
  map.addLayer(
    { id: 'fronts-allied', type: 'fill', source: 'fronts', filter: kind('allied'), paint: { 'fill-pattern': 'hatch-occ-west', 'fill-opacity': ['case', ON, 0.9, 0] } },
    'change-fill',
  );
  map.addLayer(
    {
      id: 'fronts-casing',
      type: 'line',
      source: 'fronts',
      filter: kind('front'),
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': 'rgba(255,255,255,0.75)', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 3.2, 7, 6], 'line-opacity': ['case', ON, 1, 0] },
    },
    'labels-major',
  );
  map.addLayer(
    {
      id: 'fronts-line',
      type: 'line',
      source: 'fronts',
      filter: kind('front'),
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#a3262a', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.6, 7, 3.2], 'line-opacity': ['case', ON, 1, 0] },
    },
    'labels-major',
  );
}
