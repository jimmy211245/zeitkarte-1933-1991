// Schritt 5: Militärlayer (Machtbereich der Achsenmächte und Fronten) zu Stichtagen berechnen.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import * as turf from '@turf/turf';
import { EUROPE, ASIA, AXIS_STATES } from './data/fronts.mjs';
import { union, intersect, difference, polyLL, sidePoly, boxPoly, ll } from './lib/geo.mjs';
import { D, dayBefore } from './lib/dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const finals = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'finals.geojson'), 'utf8')).features;

const first = (line) => line[0];
const last = (line) => line[line.length - 1];

// Seitenflächen zu Linien (alle Linien als [Breite, Länge])
const westOf = (line) => sidePoly(line, [[28, last(line)[1]], [28, -40], [77, -40], [77, first(line)[1]]]);
const eastOf = (line) => sidePoly(line, [[28, last(line)[1]], [28, 100], [77, 100], [77, first(line)[1]]]);
const sovietSide = (line) => sidePoly(line, [[30, last(line)[1]], [30, 100], [77, 100], [77, first(line)[1]]]);
const alliedWest = (line) => sidePoly(line, [[46.2, 6.1], [45.9, 6.8], [45.1, 6.6], [44.4, 6.8], [43.78, 7.48], [35, 7.48], [35, -30], [70, -30], [70, first(line)[1]]]);
const alliedItaly = (line) => {
  const [lat] = last(line);
  const closure = lat < 39 ? [[lat, 16.5], [30, 16.5], [30, first(line)[1]]] : [[41.0, 19.0], [39.5, 18.9], [30, 18.9], [30, first(line)[1]]];
  return sidePoly(line, closure);
};
const northeastOf = (line) => sidePoly(line, [[last(line)[0], 135], [55, 135], [55, first(line)[1]]]);
const demarcation = (line) => sidePoly(line, [[47.3, 7.0], [48.0, 8.0], [52.0, 8.0], [52.0, -6.0], [43.08, -6.0]]);
const tunisiaBridgehead = (line) => sidePoly(line, [[32.0, 10.0], [32.0, 12.0], [38.0, 12.0], [38.0, 9.15]]);

function shape([type, arg]) {
  switch (type) {
    case 'west': return westOf(arg);
    case 'east': return eastOf(arg);
    case 'northeast': return northeastOf(arg);
    case 'demarcation': return demarcation(arg);
    case 'tunisia': return tunisiaBridgehead(arg);
    case 'box': return boxPoly(arg);
    case 'poly': return polyLL(arg);
    default: throw new Error(`Unbekannte Form ${type}`);
  }
}

function activeAt(d) {
  return finals.filter((f) => f.properties.s <= d && f.properties.e >= d);
}

function axisAt(d) {
  return new Set(AXIS_STATES.filter(([, a, b]) => D(a) <= d && D(b) >= d).map(([k]) => k));
}

// bboxClip kann entartete Ringe (< 4 Punkte) erzeugen; diese entfernen
function cleanPolygonal(f) {
  if (!f || !f.geometry) return null;
  const g = f.geometry;
  const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
    .map((rings) => rings.filter((r) => r.length >= 4))
    .filter((rings) => rings.length > 0);
  if (!polys.length) return null;
  return turf.feature(polys.length === 1 ? { type: 'Polygon', coordinates: polys[0] } : { type: 'MultiPolygon', coordinates: polys });
}

const clipToBox = (f, bbox) => cleanPolygonal(turf.bboxClip(f, bbox));

function buildTheater(name, theater) {
  const out = [];
  const snaps = theater.snapshots;
  for (let i = 0; i < snaps.length; i++) {
    const snap = snaps[i];
    const d = D(snap.d);
    const e = i + 1 < snaps.length ? dayBefore(D(snaps[i + 1].d)) : D(theater.end);
    const act = activeAt(d);
    const axis = axisAt(d);

    // Staatsgebiet der Achsenmächte samt Annexionen und Verwaltungsgebieten
    const axisParts = [];
    for (const f of act) {
      const p = f.properties;
      if (axis.has(p.k) || (p.sov && axis.has(p.sov) && p.st !== 'ind')) {
        const c = clipToBox(f, theater.bbox);
        if (c) axisParts.push(c);
      }
    }
    // Von der Achse besetzte fremde Gebiete
    const occParts = [];
    for (const reg of snap.occupied ?? []) {
      const keys = new Set(reg.keys);
      const geoms = act.filter((f) => keys.has(f.properties.k)).map((f) => clipToBox(f, theater.bbox)).filter(Boolean);
      if (!geoms.length) continue;
      let g = union(geoms);
      if (reg.clip) g = intersect(g, shape(reg.clip));
      if (g) occParts.push(g);
    }

    const alliedSides = [];
    if (snap.east) alliedSides.push(sovietSide(snap.east));
    if (snap.west) alliedSides.push(alliedWest(snap.west));
    if (snap.italy) alliedSides.push(alliedItaly(snap.italy));
    if (snap.africa) alliedSides.push(boxPoly([snap.africa, 18, 40, 34]));
    for (const a of snap.allied ?? []) alliedSides.push(shape(a));
    const alliedSide = alliedSides.length ? union(alliedSides) : null;

    let occupied = union(occParts);
    if (occupied && alliedSide) occupied = difference(occupied, alliedSide);
    const axisLand = union(axisParts);
    if (occupied && axisLand) occupied = difference(occupied, axisLand);
    // Gebiete der Achsenmächte, die bereits von den Alliierten gehalten werden (v. a. 1943–1945)
    const captured = axisLand && alliedSide ? intersect(axisLand, alliedSide) : null;

    const push = (geom, k) => {
      if (!geom) return;
      const a = turf.area(geom) / 1e6;
      if (a < 500) return;
      out.push({ type: 'Feature', properties: { th: name, s: d, e, k }, geometry: turf.truncate(geom, { precision: 4 }).geometry });
    };
    push(occupied, 'axis');
    push(captured, 'allied');
    const area = occupied;
    for (const line of snap.lines ?? []) {
      out.push({ type: 'Feature', properties: { th: name, s: d, e, k: 'front' }, geometry: { type: 'LineString', coordinates: ll(line) } });
    }
    log(`${name} ${snap.d}: ${area ? Math.round(turf.area(area) / 1e6).toLocaleString('de-DE') : 0} km²`);
  }
  return out;
}

const features = [...buildTheater('europa', EUROPE), ...buildTheater('asien', ASIA)];
// Als TopoJSON speichern: aufeinanderfolgende Stichtage teilen sich die meisten Grenzlinien
const tmp = path.join(ROOT, 'build', 'fronts.geojson');
fs.writeFileSync(tmp, JSON.stringify({ type: 'FeatureCollection', features }));
const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const outFile = path.join(ROOT, 'public', 'data', 'fronts.topo.json');
execFileSync(process.execPath, [mapshaper, tmp, '-o', outFile, 'format=topojson', 'quantization=200000'], { stdio: ['ignore', 'ignore', 'inherit'] });
log('fronts.topo.json', Math.round(fs.statSync(outFile).size / 1024), 'KB');
