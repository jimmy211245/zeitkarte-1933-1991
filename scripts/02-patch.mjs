// Schritt 2: CShapes-Grenzen korrigieren und ergänzen (Inseln, Annexionen 1938–1945, Nachkriegsdetails).
import fs from 'node:fs';
import path from 'node:path';
import * as turf from '@turf/turf';
import { Store } from './lib/store.mjs';
import { addIslands } from './lib/islands.mjs';
import { union, intersect, areaKm2 } from './lib/geo.mjs';
import { toIso } from './lib/dates.mjs';
import { basicFixes } from './data/patches/basic.mjs';
import { interwarPatches } from './data/patches/interwar.mjs';
import { ww2Patches } from './data/patches/ww2.mjs';
import { postwarPatches } from './data/patches/postwar.mjs';
import { nahostPatches } from './data/patches/nahost.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const BUILD = path.join(ROOT, 'build');
const t0 = Date.now();

const simplified = JSON.parse(fs.readFileSync(path.join(BUILD, '02-simplified.geojson'), 'utf8'));
const land = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'ne-land.json'), 'utf8'));
const st = new Store(simplified.features);

const landParts = [];
for (const f of land.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const rings of polys) {
    const p = turf.polygon(rings);
    landParts.push({ p, b: turf.bbox(p) });
  }
}

const ctx = {
  ref: (code) => st.ref(code),
  /** Natural-Earth-Land innerhalb eines Rechtecks (für Küsten handgezeichneter Gebiete). */
  landIn(bbox) {
    const pieces = landParts
      .filter(({ b }) => !(b[2] < bbox[0] || bbox[2] < b[0] || b[3] < bbox[1] || bbox[3] < b[1]))
      .map(({ p }) => turf.bboxClip(p, bbox))
      .filter((p) => p.geometry.coordinates.length && turf.area(p) > 1e5);
    return union(pieces);
  },
};

console.log('Datumskorrekturen …');
basicFixes(st);

console.log('Inseln aus Natural Earth …');
const report = addIslands(st, land);
fs.writeFileSync(
  path.join(BUILD, 'islands-report.txt'),
  report.map((r) => `${String(r.area).padStart(8)} km²  ${r.c}  ${r.how}  ${r.periods ?? ''}`).join('\n'),
);
console.log(`  ${report.length} Flächen ergänzt (siehe build/islands-report.txt)`);

console.log('Zwischenkriegszeit …');
interwarPatches(st, ctx);
console.log('Zweiter Weltkrieg …');
ww2Patches(st, ctx);
console.log('Nachkriegszeit …');
postwarPatches(st, ctx);
console.log('Nahostkonflikt …');
nahostPatches(st);

// Plausibilitätsprüfung: Überlappungen zwischen gleichzeitig gültigen Flächen
const CHECK = process.argv.includes('--check');
const CHECK_DATES = [19330201, 19381201, 19391101, 19410601, 19420601, 19440101, 19450601, 19480101, 19550101, 19680101, 19800101, 19911215];
let problems = 0;
for (const d of CHECK ? CHECK_DATES : []) {
  const act = st.features.filter((f) => f.properties.s <= d && f.properties.e >= d).map((f) => ({ f, b: turf.bbox(f) }));
  for (let i = 0; i < act.length; i++) {
    for (let j = i + 1; j < act.length; j++) {
      const A = act[i], B = act[j];
      if (A.b[2] < B.b[0] || B.b[2] < A.b[0] || A.b[3] < B.b[1] || B.b[3] < A.b[1]) continue;
      if (A.f.properties.gw === B.f.properties.gw) continue;
      const a = areaKm2(intersect(A.f, B.f));
      if (a > 150) {
        problems++;
        console.warn(`  ! Überlappung ${toIso(d)}: ${A.f.properties.gw} × ${B.f.properties.gw} = ${Math.round(a)} km²`);
      }
    }
  }
}

fs.writeFileSync(path.join(BUILD, '03-patched.geojson'), JSON.stringify({ type: 'FeatureCollection', features: st.features }));
console.log(`Fertig: ${st.features.length} Flächen, ${problems} Überlappungen, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
