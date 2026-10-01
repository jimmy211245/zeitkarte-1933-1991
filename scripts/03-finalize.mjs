// Schritt 3: Flächen zusammenführen, Namen/Status zuordnen, Farben, Beschriftungen und
// Gebietsänderungen berechnen und die Dateien für die App schreiben.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import * as turf from '@turf/turf';
import { POLITIES, STATUS_LABELS } from './data/polities.mjs';
import { CHANGE_NOTES, HIDDEN_CHANGES } from './data/change-notes.mjs';
import { union, intersect, areaKm2 } from './lib/geo.mjs';
import { D, dayBefore, dayAfter, toIso, dayIndex, START, END } from './lib/dates.mjs';
import { polylabel } from './lib/polylabel.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'data');
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const patched = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', '03-patched.geojson'), 'utf8'));

// ---------------------------------------------------------------- 1. auf 1933–1991 begrenzen
const pieces = [];
for (const f of patched.features) {
  const p = f.properties;
  if (!f.geometry || p.ref) continue;
  const s = Math.max(p.s, START);
  const e = Math.min(p.e, END);
  if (s > e) continue;
  pieces.push({ key: p.gw, s, e, geom: f.geometry, cs: p.cs_name, cap: p.cap ? [p.caplon, p.caplat, p.cap] : null });
}
log('Teilflächen:', pieces.length);

// ---------------------------------------------------------------- 2. je Gebiet und Zeitabschnitt vereinigen
const byKey = new Map();
for (const p of pieces) {
  if (!byKey.has(p.key)) byKey.set(p.key, []);
  byKey.get(p.key).push(p);
}
const merged = [];
const unionCache = new Map();
for (const [key, list] of byKey) {
  const cuts = new Set();
  for (const p of list) {
    cuts.add(p.s);
    cuts.add(dayAfter(p.e));
  }
  const sorted = [...cuts].sort((a, b) => a - b);
  let run = null;
  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i];
    const e = dayBefore(sorted[i + 1]);
    const active = list.filter((p) => p.s <= s && p.e >= e);
    if (active.length === 0) { run = null; continue; }
    const id = active.map((p) => list.indexOf(p)).join(',');
    if (run && run.id === id && dayAfter(run.e) === s) { run.e = e; continue; }
    run = { key, id, s, e, active };
    merged.push(run);
  }
}
for (const m of merged) {
  const cacheKey = `${m.key}|${m.id}`;
  if (!unionCache.has(cacheKey)) {
    const u = m.active.length === 1 ? turf.feature(m.active[0].geom) : union(m.active.map((p) => turf.feature(p.geom)));
    unionCache.set(cacheKey, u ? u.geometry : null);
  }
  m.geom = unionCache.get(cacheKey);
  m.cs = m.active.find((p) => p.cs)?.cs ?? null;
  m.cap = m.active.find((p) => p.cap)?.cap ?? null;
}
log('Zusammengeführte Perioden:', merged.length);

// ---------------------------------------------------------------- 3. Namen, Status, Souverän
const nameAt = (key, d) => {
  const t = POLITIES[key];
  if (!t) return String(key);
  const hit = t.find(([from, to]) => D(from) <= d && D(to) >= d) ?? t[t.length - 1];
  return hit[5] ?? hit[2];
};

const finals = [];
const missing = new Set();
for (const m of merged) {
  if (!m.geom) continue;
  const table = POLITIES[m.key];
  if (!table) {
    missing.add(`${m.key} (${m.cs})`);
    finals.push({ key: m.key, s: m.s, e: m.e, name: m.cs ?? String(m.key), label: m.cs ?? String(m.key), st: 'ind', sov: null, geom: m.geom, gid: m });
    continue;
  }
  let covered = 0;
  for (const [from, to, name, st, sov, label] of table) {
    const s = Math.max(m.s, D(from));
    const e = Math.min(m.e, D(to));
    if (s > e) continue;
    covered++;
    finals.push({ key: m.key, s, e, name, label: label ?? name, st, sov: sov ?? null, geom: m.geom, gid: m, cap: m.cap });
  }
  if (!covered) missing.add(`${m.key} ${toIso(m.s)}–${toIso(m.e)} (keine Tabellenzeile)`);
}
if (missing.size) console.warn('  ! Ohne Namenseintrag:', [...missing].join('; '));
finals.sort((a, b) => a.s - b.s);
log('Endgültige Flächen:', finals.length);

// ---------------------------------------------------------------- 4. Farben
const DEPENDENT = new Set(['col', 'prot', 'mand', 'trust', 'terr', 'cond', 'part', 'ann', 'adm', 'occ']);
const colorKey = (f) => (f.sov != null && (DEPENDENT.has(f.st) || f.st === 'pup') ? f.sov : f.key);

// Feste Farben für Kolonialmächte und Großmächte (klassische Atlaskonventionen)
const FIXED = {
  200: '#e7b3bb', // Britisches Empire: Rosa
  220: '#b4c3e4', // Frankreich: Blau
  235: '#b6d6a0', // Portugal: Grün
  230: '#eed387', // Spanien: Gelb
  210: '#f1bd88', // Niederlande: Orange
  211: '#d3bc9b', // Belgien: Ocker
  325: '#a7d0c0', // Italien: Graugrün
  255: '#c9bca2', // Deutsches Reich: Graubraun
  260: '#d2c6a4', // Bundesrepublik
  265: '#e3b39f', // DDR
  365: '#e8c0a3', // Sowjetunion: Lachs
  2: '#c5bfe0', // USA: Lavendel
  740: '#f0d0a8', // Japan: Hellorange
  710: '#e9dc9f', // China: Hellgelb
  560: '#cfc3dc', // Südafrika
  900: '#d9c7a6', // Australien
};
const BASE = ['#e2c29d', '#bcd2a3', '#e5b1aa', '#c4bfdf', '#e8d48f', '#a8ccbe', '#d8b2cf', '#efbd8a', '#b9c7de', '#d3c8a2', '#c8d9b4', '#e9c7b9'];

// Nachbarschaften über gemeinsame Stützpunkte (CShapes-Grenzen sind topologisch konsistent)
const vertexKeys = new Map();
const seenGeom = new Set();
for (const f of finals) {
  const ck = colorKey(f);
  const gk = `${ck}|${merged.indexOf(f.gid)}`;
  if (seenGeom.has(gk)) continue;
  seenGeom.add(gk);
  turf.coordEach(turf.feature(f.geom), ([x, y]) => {
    const vk = `${x.toFixed(3)},${y.toFixed(3)}`;
    let set = vertexKeys.get(vk);
    if (!set) vertexKeys.set(vk, (set = new Set()));
    set.add(ck);
  });
}
const shared = new Map();
for (const set of vertexKeys.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    const pk = arr[i] < arr[j] ? `${arr[i]}§${arr[j]}` : `${arr[j]}§${arr[i]}`;
    shared.set(pk, (shared.get(pk) ?? 0) + 1);
  }
}
const neighbors = new Map();
for (const [pk, n] of shared) {
  if (n < 3) continue;
  const [a, b] = pk.split('§');
  if (!neighbors.has(a)) neighbors.set(a, new Set());
  if (!neighbors.has(b)) neighbors.set(b, new Set());
  neighbors.get(a).add(b);
  neighbors.get(b).add(a);
}
const colorOf = new Map(Object.entries(FIXED).map(([k, v]) => [String(k), v]));
const keysByDegree = [...new Set(finals.map((f) => String(colorKey(f))))].sort((a, b) => (neighbors.get(b)?.size ?? 0) - (neighbors.get(a)?.size ?? 0));
for (const k of keysByDegree) {
  if (colorOf.has(k)) continue;
  const used = new Set([...(neighbors.get(k) ?? [])].map((n) => colorOf.get(n)).filter(Boolean));
  // stabiler Startindex je Gebiet, damit Farben nicht nur nach Grad verteilt werden
  let h = 0;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  let pick = null;
  for (let i = 0; i < BASE.length; i++) {
    const c = BASE[(h + i) % BASE.length];
    if (!used.has(c)) { pick = c; break; }
  }
  colorOf.set(k, pick ?? BASE[h % BASE.length]);
}
log('Farben vergeben:', colorOf.size);

// ---------------------------------------------------------------- 5. Beschriftungspunkte
const largestPart = (geom) => {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let best = null, bestA = -1;
  for (const rings of polys) {
    const a = turf.area(turf.polygon(rings));
    if (a > bestA) { bestA = a; best = rings; }
  }
  return { rings: best, area: bestA / 1e6 };
};
const labelCache = new Map();
const labels = [];
for (const f of finals) {
  const gk = merged.indexOf(f.gid);
  if (!labelCache.has(gk)) {
    const { rings, area } = largestPart(f.geom);
    labelCache.set(gk, { pt: polylabel(rings), area, total: areaKm2(turf.feature(f.geom)) });
  }
  const { pt, total } = labelCache.get(gk);
  const r = total > 1.5e6 ? 1 : total > 2.5e5 ? 2 : total > 6e4 ? 3 : total > 1.2e4 ? 4 : 5;
  const kind = f.st === 'ind' || f.st === 'unrec' ? 'state' : f.st === 'pup' ? 'state' : ['ann', 'adm', 'occ'].includes(f.st) ? 'region' : 'dep';
  f.area = Math.round(total);
  f.lp = pt;
  labels.push({
    type: 'Feature',
    properties: { s: f.s, e: f.e, t: f.label, r, k: kind },
    geometry: { type: 'Point', coordinates: pt.map((v) => +v.toFixed(3)) },
  });
}
log('Beschriftungen:', labels.length);

// ---------------------------------------------------------------- 6. Gebietsänderungen erkennen
const bboxOf = new Map();
const bb = (f) => {
  if (!bboxOf.has(f.gid)) bboxOf.set(f.gid, turf.bbox(turf.feature(f.geom)));
  return bboxOf.get(f.gid);
};
const overlap = (a, b) => !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
const endingOn = new Map();
for (const f of finals) {
  if (!endingOn.has(f.e)) endingOn.set(f.e, []);
  endingOn.get(f.e).push(f);
}
const COLONIAL = new Set(['col', 'prot', 'mand', 'trust', 'terr', 'cond']);
const SOVEREIGN = new Set(['ind', 'unrec']);
const firstStart = new Map();
for (const f of finals) if (!firstStart.has(f.key) || f.s < firstStart.get(f.key)) firstStart.set(f.key, f.s);

const rawChanges = [];
for (const s of finals) {
  if (s.s <= START) continue;
  const before = endingOn.get(dayBefore(s.s)) ?? [];
  for (const e of before) {
    if (!overlap(bb(e), bb(s))) continue;
    if (e.key === s.key) {
      if (e.name === s.name && e.st === s.st && e.sov === s.sov) continue; // nur Geometrie geändert
      let type = 'status';
      if (e.st === s.st && e.sov === s.sov) type = 'umbenennung';
      else if (SOVEREIGN.has(s.st) && COLONIAL.has(e.st)) type = 'unabhaengigkeit';
      else if (SOVEREIGN.has(s.st)) type = 'wiederherstellung';
      else if (s.st === 'ann') type = 'annexion';
      else if (['occ', 'adm'].includes(s.st)) type = 'besetzung';
      rawChanges.push({ d: s.s, type, from: e, to: s, geom: s.geom });
      continue;
    }
    const inter = intersect(turf.feature(e.geom), turf.feature(s.geom));
    const a = areaKm2(inter);
    if (a < 250) continue;
    let type = 'gebiet';
    const isNew = firstStart.get(s.key) === s.s;
    if (s.st === 'ann') type = 'annexion';
    else if (['occ', 'adm'].includes(s.st)) type = 'besetzung';
    else if (isNew && SOVEREIGN.has(s.st)) type = 'unabhaengigkeit';
    rawChanges.push({ d: s.s, type, from: e, to: s, geom: inter.geometry });
  }
}
// gleiche Übergänge am selben Tag zusammenfassen
const grouped = new Map();
for (const c of rawChanges) {
  const gk = `${c.d}|${c.from.key}|${c.to.key}`;
  if (!grouped.has(gk)) grouped.set(gk, { ...c, geoms: [] });
  grouped.get(gk).geoms.push(c.geom);
}
const sovName = (key, d) => (key == null ? null : nameAt(key, d));
const changes = [];
let cid = 0;
for (const c of grouped.values()) {
  const gk = `${toIso(c.d)}|${c.from.key}|${c.to.key}`;
  if (HIDDEN_CHANGES.has(gk)) continue;
  const geom = c.geoms.length === 1 ? turf.feature(c.geoms[0]) : union(c.geoms.map((g) => turf.feature(g)));
  if (!geom) continue;
  const area = Math.round(areaKm2(geom));
  const simplified = turf.simplify(geom, { tolerance: 0.01, highQuality: false });
  const note = CHANGE_NOTES[gk] ?? {};
  const fromL = c.from.label, toL = c.to.label;
  const sov = sovName(c.to.sov, c.d);
  let title;
  if (c.type === 'unabhaengigkeit') title = `Unabhängigkeit: ${toL}`;
  else if (c.type === 'umbenennung') title = `Umbenennung: ${c.from.name} → ${c.to.name}`;
  else if (c.type === 'wiederherstellung') title = `${toL}: wieder ${STATUS_LABELS[c.to.st]}`;
  else if (c.from.key === c.to.key && c.type === 'annexion') title = `${toL} → ${sov}`;
  else if (c.from.key === c.to.key) title = `${toL}: ${STATUS_LABELS[c.from.st]} → ${STATUS_LABELS[c.to.st]}`;
  else if (c.type === 'annexion' && sov) title = `${toL} → ${sov}`;
  else title = `${fromL} → ${toL}`;
  changes.push({
    type: 'Feature',
    id: ++cid,
    properties: {
      id: cid,
      key: gk,
      d: c.d,
      t: dayIndex(c.d),
      type: note.type ?? c.type,
      title: note.title ?? title,
      text: note.text ?? '',
      from: fromL,
      to: toL,
      toFull: c.to.name,
      sov,
      area,
      imp: note.imp ?? (area > 100000 ? 1 : area > 15000 ? 2 : 3),
      bbox: turf.bbox(simplified).map((v) => +v.toFixed(2)),
    },
    geometry: simplified.geometry,
  });
}
changes.sort((a, b) => a.properties.d - b.properties.d);
log('Gebietsänderungen:', changes.length);

// ---------------------------------------------------------------- 7. Ausgabe
const round = (geom) => turf.truncate(turf.feature(geom), { precision: 4, coordinates: 2 }).geometry;
const states = finals.map((f, i) => ({
  type: 'Feature',
  id: i + 1,
  properties: {
    id: i + 1,
    k: String(f.key),
    s: f.s,
    e: f.e,
    n: f.name,
    l: f.label,
    st: f.st,
    sov: f.sov == null ? null : String(f.sov),
    sn: sovName(f.sov, f.s),
    fc: colorOf.get(String(colorKey(f))),
    a: f.area,
    cap: f.cap ? f.cap[2] : null,
    lx: +f.lp[0].toFixed(2),
    ly: +f.lp[1].toFixed(2),
  },
  geometry: round(f.geom),
}));

// Volle Geometrie mit Attributen für die Berechnung des Militärlayers
fs.writeFileSync(path.join(ROOT, 'build', 'finals.geojson'), JSON.stringify({
  type: 'FeatureCollection',
  features: finals.map((f) => ({ type: 'Feature', properties: { k: String(f.key), s: f.s, e: f.e, st: f.st, sov: f.sov == null ? null : String(f.sov) }, geometry: f.geom })),
}));

const write = (file, data) => {
  fs.writeFileSync(path.join(OUT, file), JSON.stringify(data));
  log(file, Math.round(fs.statSync(path.join(OUT, file)).size / 1024), 'KB');
};
// Als TopoJSON speichern: gemeinsame Grenzlinien aller Zeitstände werden nur einmal abgelegt
const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const writeTopo = (name, fc, q) => {
  const tmp = path.join(ROOT, 'build', `${name}.geojson`);
  fs.writeFileSync(tmp, JSON.stringify(fc));
  execFileSync(process.execPath, [mapshaper, tmp, '-o', path.join(OUT, `${name}.topo.json`), 'format=topojson', `quantization=${q}`], { stdio: ['ignore', 'ignore', 'inherit'] });
  log(`${name}.topo.json`, Math.round(fs.statSync(path.join(OUT, `${name}.topo.json`)).size / 1024), 'KB');
};
writeTopo('states', { type: 'FeatureCollection', features: states }, 400000);
write('labels.json', { type: 'FeatureCollection', features: labels });
writeTopo('changes', { type: 'FeatureCollection', features: changes }, 200000);
write('changes-list.json', changes.map((c) => { const { key, ...p } = c.properties; return p; }));

// Änderungsliste zur Kontrolle
fs.writeFileSync(
  path.join(ROOT, 'build', 'changes-report.txt'),
  changes.map((c) => {
    const p = c.properties;
    return `${p.type.padEnd(15)} ${String(p.area).padStart(8)} km²  ${p.title.padEnd(60)} ${p.key}`;
  }).join('\n'),
);
