// Schritt 7: Schwerpunkt Nahost – schematische Teilungspläne und Städte.
// Die Pläne werden an der Grenze des Mandatsgebiets (CShapes) abgeschnitten, Seen ausgespart.
import fs from 'node:fs';
import path from 'node:path';
import * as turf from '@turf/turf';
import { UN_1947, PEEL_1937 } from './data/plans.mjs';
import { PLACES } from './data/places.mjs';
import { union, intersect, difference, dropSmallParts, areaKm2 } from './lib/geo.mjs';
import { polylabel } from './lib/polylabel.mjs';
import { D } from './lib/dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'data');

const finals = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'finals.geojson'), 'utf8')).features;
const mandate = finals.find((f) => f.properties.k === '665' && f.properties.s <= 19470101 && f.properties.e >= 19470101);
if (!mandate) throw new Error('Mandatsgebiet Palästina (665) fehlt');
const box = turf.bbox(mandate);
const lakes = JSON.parse(fs.readFileSync(path.join(OUT, 'lakes.json'), 'utf8')).features
  .filter((f) => { const b = turf.bbox(f); return !(b[2] < box[0] || box[2] < b[0] || b[3] < box[1] || box[3] < b[1]); });
const land = lakes.length ? difference(mandate, union(lakes)) : mandate;

const poly = (rings) => union(rings.map((r) => {
  const ring = [...r];
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push([...ring[0]]);
  return turf.polygon([ring]);
}));
const clean = (f) => dropSmallParts(f, 3);
/** Splitter (< 10 km²) des Restgebiets, die nur durch ungenaue Vorlagenlinien entstehen, dem Nachbarn zuschlagen. */
function settle(rest, neighbor) {
  const g = rest.geometry;
  const parts = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map((p) => turf.polygon(p));
  const small = parts.filter((p) => areaKm2(p) < 10);
  if (!small.length) return [rest, neighbor];
  return [union(parts.filter((p) => areaKm2(p) >= 10)), union([neighbor, ...small])];
}

// Bestandteile je Plan; ein Teil erhält jeweils den Rest des Mandatsgebiets
const plans = {
  un1947: (() => {
    const intl = clean(intersect(land, poly(UN_1947.intl)));
    let arab = clean(difference(intersect(land, union([poly(UN_1947.arab), poly(UN_1947.jaffa)])), intl));
    let jewish = clean(difference(difference(land, arab), intl));
    [jewish, arab] = settle(jewish, arab);
    return [
      ['jewish', 'Jüdischer Staat', jewish],
      ['arab', 'Arabischer Staat', arab],
      ['intl', 'Jerusalem (international)', intl],
    ];
  })(),
  peel1937: (() => {
    const british = clean(intersect(land, poly(PEEL_1937.british)));
    let jewish = clean(difference(intersect(land, poly(PEEL_1937.jewish)), british));
    let arab = clean(difference(difference(land, jewish), british));
    [arab, jewish] = settle(arab, jewish);
    return [
      ['jewish', 'Jüdischer Staat', jewish],
      ['arab', 'Arabischer Staat (mit Transjordanien)', arab],
      ['british', 'Britisches Mandat', british],
    ];
  })(),
};

const features = [];
for (const [plan, parts] of Object.entries(plans)) {
  for (const [part, name, geom] of parts) {
    if (!geom) throw new Error(`${plan}/${part}: leer`);
    features.push({ type: 'Feature', properties: { plan, part }, geometry: turf.truncate(geom, { precision: 4 }).geometry });
    // Beschriftung im größten Teilstück
    const g = geom.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const largest = polys.reduce((a, b) => (turf.area(turf.polygon(a)) >= turf.area(turf.polygon(b)) ? a : b));
    const [x, y] = polylabel(largest);
    features.push({ type: 'Feature', properties: { plan, part, name }, geometry: { type: 'Point', coordinates: [+x.toFixed(3), +y.toFixed(3)] } });
    console.log(`${plan.padEnd(9)} ${part.padEnd(7)} ${String(Math.round(areaKm2(geom))).padStart(6)} km²  ${polys.length} Teil(e)`);
  }
}
fs.writeFileSync(path.join(OUT, 'plans.json'), JSON.stringify({ type: 'FeatureCollection', features }));

const places = PLACES.map((p, i) => ({
  type: 'Feature',
  properties: { id: i + 1, n: p.n, r: p.r, s: p.s ? D(p.s) : 19000101, e: p.e ? D(p.e) : 21001231 },
  geometry: { type: 'Point', coordinates: p.at },
}));
fs.writeFileSync(path.join(OUT, 'places.json'), JSON.stringify({ type: 'FeatureCollection', features: places }));
for (const f of ['plans.json', 'places.json']) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), 'KB');
