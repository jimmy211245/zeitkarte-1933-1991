// MapLibre-Stil: eigene historische Basiskarte ohne moderne Hintergrundkacheln.
import { SEA, INK, RIVER } from './palette.js';

const GLYPHS = 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf';

// Grenzflächen, Fronten und Ereignisse werden über den Feature-State "on" ein- und ausgeblendet
// (siehe timeengine.js); das vermeidet ein Neuladen der Kacheln bei jedem Datumswechsel.
export const ON = ['boolean', ['feature-state', 'on'], false];
// Nur die kleine Beschriftungsquelle filtert noch nach Datum ("ldate" ändert sich nur, wenn
// sich die Menge der Beschriftungen ändert)
const LDATE = ['global-state', 'ldate'];
const LABEL_ACTIVE = ['all', ['<=', ['get', 's'], LDATE], ['>=', ['get', 'e'], LDATE]];
const YEAR = ['global-state', 'year'];

const EMPTY = { type: 'FeatureCollection', features: [] };

const DEPENDENT = ['col', 'prot', 'mand', 'trust', 'terr', 'cond'];
const WARTIME = ['ann', 'adm', 'occ'];

export const LABEL_HALO = 'rgba(248,248,245,0.82)';

// Schematische Teilungspläne (nur sichtbar, solange das zugehörige Ereignis ausgewählt ist)
export const PLAN_COLORS = { jewish: '#4a78b5', arab: '#5e9a4b', intl: '#c9b37e', british: '#c9b37e' };
const NO_PLAN = ['==', ['get', 'plan'], ''];
export const planFilter = (plan, geometry) => ['all', ['==', ['geometry-type'], geometry], ['==', ['get', 'plan'], plan ?? '']];

function labelLayer(id, filter, minzoom, layout, paint = {}) {
  return {
    id,
    type: 'symbol',
    source: 'labels',
    minzoom,
    filter: ['all', LABEL_ACTIVE, filter],
    layout: {
      'text-field': ['get', 't'],
      'text-font': ['Noto Sans Medium'],
      'text-max-width': 7,
      'text-padding': 3,
      'symbol-sort-key': ['get', 'r'],
      ...layout,
    },
    paint: { 'text-color': INK, 'text-halo-color': LABEL_HALO, 'text-halo-width': 1.3, ...paint },
  };
}

// Stadtnamen weichen aus (rechts, links, oben, unten vom Punkt), damit Küstenstädte wie Tel Aviv
// ihren Namen aufs Meer statt über das Hinterland legen können
function placeLayer(r, minzoom) {
  return labelLayer(`labels-place-${r}`, ['all', ['==', ['get', 'k'], 'place'], ['==', ['get', 'r'], r]], minzoom, {
    'text-size': ['interpolate', ['linear'], ['zoom'], minzoom, r === 1 ? 11.5 : 10.5, 9, r === 1 ? 15 : 13],
    'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
    'text-radial-offset': 0.55,
    'text-justify': 'auto',
    'text-max-width': 10,
  }, { 'text-color': '#2b2f35', 'text-halo-width': 1.4 });
}

export function buildStyle(dataUrl, startYmd) {
  return {
    version: 8,
    glyphs: GLYPHS,
    state: { ldate: { default: startYmd }, year: { default: Math.floor(startYmd / 10000) } },
    sources: {
      antarctica: { type: 'geojson', data: `${dataUrl}/antarctica.json` },
      lakes: { type: 'geojson', data: `${dataUrl}/lakes.json` },
      rivers: { type: 'geojson', data: `${dataUrl}/rivers.json` },
      states: { type: 'geojson', data: EMPTY, promoteId: 'id' },
      labels: { type: 'geojson', data: EMPTY },
      focus: { type: 'geojson', data: EMPTY },
      admin: { type: 'geojson', data: EMPTY, promoteId: 'id' },
      plans: { type: 'geojson', data: EMPTY },
    },
    layers: [
      { id: 'sea', type: 'background', paint: { 'background-color': SEA } },
      { id: 'antarctica', type: 'fill', source: 'antarctica', paint: { 'fill-color': '#eef0ef' } },
      {
        id: 'states-fill',
        type: 'fill',
        source: 'states',
        paint: {
          // Feature-State "c" = Bündnisfarbe; sonst politische Farbe aus den Daten
          'fill-color': ['to-color', ['coalesce', ['feature-state', 'c'], ['get', 'fc']]],
          'fill-opacity': ['case', ON, 1, 0],
        },
      },
      {
        id: 'states-pattern',
        type: 'fill',
        source: 'states',
        filter: ['all', ['!=', ['get', 'st'], 'ind'], ['!=', ['get', 'st'], 'part']],
        paint: {
          'fill-opacity': ['case', ON, 1, 0],
          'fill-pattern': [
            'case',
            ['in', ['get', 'st'], ['literal', DEPENDENT]], 'hatch-dep',
            ['in', ['get', 'st'], ['literal', WARTIME]], 'hatch-war',
            'dots-pup',
          ],
        },
      },
      {
        id: 'lakes',
        type: 'fill',
        source: 'lakes',
        filter: ['all', ['<=', ['get', 'from'], YEAR], ['>=', ['get', 'to'], YEAR]],
        paint: { 'fill-color': SEA },
      },
      {
        id: 'rivers',
        type: 'line',
        source: 'rivers',
        minzoom: 2.5,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': RIVER,
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.35, 6, 0.9, 9, 1.6],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 2.5, 0, 3.5, 0.75],
        },
      },
      // Binnengrenzen (Bundesstaaten, Provinzen, Teilrepubliken), gestrichelt unter den Staatsgrenzen
      {
        id: 'admin-line',
        type: 'line',
        source: 'admin',
        minzoom: 2.5,
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': '#5c534a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2.5, 0.35, 5, 0.7, 8, 1.2],
          'line-dasharray': [3, 2],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 2.5, ['case', ON, 0.22, 0], 5, ['case', ON, 0.5, 0]],
        },
      },
      {
        id: 'change-fill',
        type: 'fill',
        source: 'focus',
        paint: { 'fill-color': '#a3262a', 'fill-opacity': 0.18 },
      },
      {
        id: 'states-line',
        type: 'line',
        source: 'states',
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': INK,
          'line-opacity': ['case', ON, ['case', ['in', ['get', 'st'], ['literal', ['ind', 'unrec', 'pup']]], 0.62, 0.38], 0],
          'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.3, 4, 0.75, 7, 1.5, 9, 2.2],
        },
      },
      {
        id: 'change-line',
        type: 'line',
        source: 'focus',
        layout: { 'line-join': 'round' },
        paint: { 'line-color': '#a3262a', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.2, 7, 2.6], 'line-dasharray': [2, 1.2] },
      },
      {
        id: 'plan-fill',
        type: 'fill',
        source: 'plans',
        filter: NO_PLAN,
        paint: {
          'fill-color': ['match', ['get', 'part'], 'jewish', PLAN_COLORS.jewish, 'arab', PLAN_COLORS.arab, PLAN_COLORS.intl],
          'fill-opacity': 0.72,
        },
      },
      {
        id: 'plan-line',
        type: 'line',
        source: 'plans',
        filter: NO_PLAN,
        layout: { 'line-join': 'round' },
        paint: { 'line-color': '#1f2a36', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 8, 1.6], 'line-opacity': 0.8 },
      },
      // Beschriftungen: MapLibre platziert von der obersten Ebene abwärts, spätere Ebenen haben
      // also Vorrang. Provinznamen liegen ganz unten, kleine unter großen.
      labelLayer('labels-admin-2', ['all', ['==', ['get', 'k'], 'admin'], ['>=', ['get', 'r'], 3]], 5, {
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 8, 12],
        'text-letter-spacing': 0.04,
      }, { 'text-color': '#6b6157', 'text-halo-width': 1.1 }),
      labelLayer('labels-admin-1', ['all', ['==', ['get', 'k'], 'admin'], ['<=', ['get', 'r'], 2]], 3.6, {
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3.6, 9, 7, 12],
        'text-letter-spacing': 0.04,
      }, { 'text-color': '#6b6157', 'text-halo-width': 1.1 }),
      {
        id: 'places-dot',
        type: 'circle',
        source: 'labels',
        minzoom: 5,
        filter: ['all', LABEL_ACTIVE, ['==', ['get', 'k'], 'place']],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, ['match', ['get', 'r'], 1, 2.6, 2], 9, ['match', ['get', 'r'], 1, 4.2, 3.2]],
          'circle-color': '#ffffff',
          'circle-stroke-color': INK,
          'circle-stroke-width': 1.2,
          // Punkte erscheinen zusammen mit ihrer Beschriftung (gleiche Zoomstufen wie labels-place-*)
          'circle-opacity': ['step', ['zoom'], ['case', ['==', ['get', 'r'], 1], 1, 0], 6, ['case', ['<=', ['get', 'r'], 2], 1, 0], 7, 1],
          'circle-stroke-opacity': ['step', ['zoom'], ['case', ['==', ['get', 'r'], 1], 1, 0], 6, ['case', ['<=', ['get', 'r'], 2], 1, 0], 7, 1],
        },
      },
      // Beschriftungen: große Staaten zuerst, kleine erst bei höherem Zoom
      labelLayer('labels-major', ['all', ['==', ['get', 'k'], 'state'], ['<=', ['get', 'r'], 2]], 1.3, {
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.14,
        'text-size': ['interpolate', ['linear'], ['zoom'], 1.5, ['match', ['get', 'r'], 1, 10.5, 9], 5, ['match', ['get', 'r'], 1, 17, 14]],
      }),
      labelLayer('labels-mid', ['all', ['==', ['get', 'k'], 'state'], ['==', ['get', 'r'], 3]], 2.6, {
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
        'text-size': ['interpolate', ['linear'], ['zoom'], 2.6, 9, 6, 13],
      }),
      labelLayer('labels-minor', ['all', ['==', ['get', 'k'], 'state'], ['>=', ['get', 'r'], 4]], 3.8, {
        'text-size': ['interpolate', ['linear'], ['zoom'], 3.8, 9.5, 7, 13],
      }),
      labelLayer('labels-dep', ['==', ['get', 'k'], 'dep'], 2.4, {
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 2.4, ['match', ['get', 'r'], [1, 2], 10, 8.5], 6, 12.5],
      }, { 'text-color': '#3c434c' }),
      // Städte (nur Nahost) unter den Namen besetzter oder annektierter Gebiete, große vor kleinen
      ...[[3, 7], [2, 6], [1, 5]].map(([r, minzoom]) => placeLayer(r, minzoom)),
      labelLayer('labels-region', ['==', ['get', 'k'], 'region'], 3.2, {
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 3.2, 9, 7, 13],
      }, { 'text-color': '#2f3540' }),
      {
        id: 'plan-label',
        type: 'symbol',
        source: 'plans',
        filter: NO_PLAN,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Medium'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 8, 15],
          'text-max-width': 8,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#14202c', 'text-halo-color': 'rgba(255,255,255,0.88)', 'text-halo-width': 1.6 },
      },
    ],
  };
}
