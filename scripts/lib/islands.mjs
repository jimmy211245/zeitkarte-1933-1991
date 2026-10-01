// Ergänzt Landflächen aus Natural Earth, die in CShapes fehlen (v. a. Inseln).
import * as turf from '@turf/turf';
import { MAJOR_RULES, RULES } from '../data/islands.mjs';
import { D, dayBefore, dayAfter, toIso } from './dates.mjs';

const REF_DATES = [19340101, 19500101, 19800101];

function partsOf(fc) {
  const parts = [];
  for (const f of fc.features) {
    const g = f.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const rings of polys) parts.push(turf.polygon(rings));
  }
  return parts;
}

function inBox([x, y], [w, s, e, n]) {
  return x >= w && x <= e && y >= s && y <= n;
}

// Pseudozufall mit festem Startwert, damit der Build reproduzierbar ist
function rng(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function samplePoints(part, n = 24) {
  const b = turf.bbox(part);
  const rnd = rng(12345);
  const pts = [];
  for (let i = 0; i < 3000 && pts.length < n; i++) {
    const p = [b[0] + rnd() * (b[2] - b[0]), b[1] + rnd() * (b[3] - b[1])];
    if (turf.booleanPointInPolygon(p, part)) pts.push(p);
  }
  return pts;
}

function coverage(part, features) {
  const pts = samplePoints(part);
  if (pts.length === 0) return 1;
  let best = 0;
  for (const d of REF_DATES) {
    const act = features.filter((x) => x.f.properties.s <= d && x.f.properties.e >= d);
    let hit = 0;
    for (const p of pts) {
      if (act.some((x) => inBox(p, x.b) && turf.booleanPointInPolygon(p, x.f))) hit++;
    }
    best = Math.max(best, hit / pts.length);
  }
  return best;
}

function periodsToProps(periods) {
  return periods.map(([s, e, key]) => ({ s: D(s), e: D(e), gw: key }));
}

/** Zeitabhängig nächstgelegener Staat: liefert [{s, e, gw}, ...]. */
function nearestPeriods(point, candidates, start, end) {
  const near = candidates.filter((x) => {
    const [w, s, e, n] = x.b;
    return point[0] >= w - 6 && point[0] <= e + 6 && point[1] >= s - 6 && point[1] <= n + 6;
  });
  if (near.length === 0) return [];
  // Abschnittsgrenzen: jeder Beginn und jeder Tag nach einem Ende eines Kandidaten
  const cuts = new Set([start]);
  for (const x of near) {
    const p = x.f.properties;
    if (p.s > start && p.s <= end) cuts.add(p.s);
    const after = dayAfter(p.e);
    if (after > start && after <= end) cuts.add(after);
  }
  const sorted = [...cuts].sort((a, b) => a - b);
  const result = [];
  for (const from of sorted) {
    const act = near.filter((x) => x.f.properties.s <= from && x.f.properties.e >= from);
    let best = null;
    let bestD = Infinity;
    for (const x of act) {
      const dist = turf.pointToPolygonDistance(point, x.f, { units: 'kilometers' });
      if (dist < bestD) {
        bestD = dist;
        best = x.f.properties.gw;
      }
    }
    if (best === null || bestD > 400) continue;
    const last = result[result.length - 1];
    if (last && last.gw === best) continue;
    if (last) last.e = dayBefore(from);
    result.push({ s: from, e: end, gw: best });
  }
  return result;
}

export function addIslands(store, land, { minKm2 = 15, start = 19330101, end = 19911231 } = {}) {
  const report = [];
  const indexed = () => store.features.map((f) => ({ f, b: turf.bbox(f) }));
  let features = indexed();
  const parts = partsOf(land)
    .map((p) => ({ p, a: turf.area(p) / 1e6, b: turf.bbox(p), c: turf.pointOnFeature(p).geometry.coordinates }))
    .filter((x) => x.a >= minKm2 && x.b[1] > -60);

  const missing = parts.filter((x) => coverage(x.p, features) < 0.4);

  const add = (x, periods, how) => {
    for (const per of periods) store.add(x.p, { ...per, island: true });
    report.push({ how, area: Math.round(x.a), c: x.c.map((v) => +v.toFixed(2)), periods: periods.map((p) => `${toIso(p.s)}..${toIso(p.e)}:${p.gw}`).join(' ') });
  };

  // 1. große Gebiete mit fester Zuordnung
  const rest = [];
  for (const x of missing) {
    const rule = MAJOR_RULES.find((r) => x.a >= r.minArea && inBox(x.c, r.bbox));
    if (rule) add(x, periodsToProps(rule.periods), rule.name);
    else rest.push(x);
  }
  features = indexed();

  // 2. Sonderregeln, sonst nächstgelegener Staat
  for (const x of rest) {
    const rule = RULES.find((r) => inBox(x.c, r.bbox));
    if (rule) {
      add(x, periodsToProps(rule.periods), rule.name);
      continue;
    }
    const per = nearestPeriods(x.c, features, start, end);
    if (per.length) add(x, per, 'nächstgelegen');
    else report.push({ how: 'NICHT ZUGEORDNET', area: Math.round(x.a), c: x.c });
  }
  return report;
}
