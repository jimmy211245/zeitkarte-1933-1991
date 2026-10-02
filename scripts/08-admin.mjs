// Schritt 8: Datierbare Binnengrenzen – Bundesstaaten, Provinzen, Länder und Teilrepubliken.
// Gezeigt werden nur Länder, deren Gliederung sich für 1933–1991 belegen lässt. Grundlage sind
// die heutigen Verwaltungseinheiten von Natural Earth (bei Bedarf für frühere Zeiträume
// zusammengelegt) und für Sowjetunion, Jugoslawien und Tschechoslowakei die heutigen Grenzen der
// Nachfolgestaaten aus CShapes. Alles wird an der jeweils gültigen Staatsgrenze abgeschnitten.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as turf from '@turf/turf';
import { union, intersect, difference, areaKm2 } from './lib/geo.mjs';
import { polylabel } from './lib/polylabel.mjs';
import { D, dayBefore, dayAfter, toIso } from './lib/dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const BUILD = path.join(ROOT, 'build');
const OUT = path.join(ROOT, 'public', 'data');
const TMP = path.join(BUILD, 'admin-tmp');
fs.mkdirSync(TMP, { recursive: true });
const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const ne = JSON.parse(fs.readFileSync(path.join(BUILD, 'ne-admin1.json'), 'utf8')).features;
const finals = JSON.parse(fs.readFileSync(path.join(BUILD, 'finals.geojson'), 'utf8')).features;
const cshapes = JSON.parse(fs.readFileSync(path.join(BUILD, '02-simplified.geojson'), 'utf8')).features;

// --- Bausteine ------------------------------------------------------------------------------
const iso = (code) => {
  const f = ne.find((x) => x.properties.iso_3166_2 === code);
  if (!f) throw new Error(`Natural Earth: ${code} fehlt`);
  return f;
};
/** Heutige Grenze eines Nachfolgestaats (Stand Mitte 1992, sonst jüngste Referenz). */
const successor = (gw) => {
  const all = cshapes.filter((f) => +f.properties.gw === gw);
  const f = all.find((x) => x.properties.s <= 19920601 && x.properties.e >= 19920601) ?? all.find((x) => x.properties.ref);
  if (!f) throw new Error(`CShapes: Nachfolgestaat ${gw} fehlt`);
  return f;
};
const unit = (name, geom) => ({ name, geom });
/**
 * Teil eines CShapes-Staates nach Natural-Earth-Einheiten. Die Einheit wird um 8 km vergrößert
 * (aber nicht in die genannten Nachbareinheiten hinein), damit Küsten und Außengrenzen aus CShapes
 * stammen und keine Splitter an abweichenden Küstenlinien entstehen.
 */
const regionOf = (state, codes, neighborCodes) => {
  const grown = difference(turf.buffer(union(codes.map(iso)), 8, { units: 'kilometers' }), union(neighborCodes.map(iso)));
  return state ? intersect(state, grown) : grown;
};

/** Einheiten eines Landes aus Natural Earth; merge legt Einheiten zusammen (Code → Ziel-Code). */
function neUnits(a3, { merge = {}, names = {}, skip = [] } = {}) {
  const groups = new Map();
  for (const f of ne.filter((x) => x.properties.adm0_a3 === a3)) {
    const code = f.properties.iso_3166_2;
    if (skip.includes(code)) continue;
    const target = merge[code] ?? code;
    if (!groups.has(target)) groups.set(target, []);
    groups.get(target).push(f);
  }
  return [...groups].map(([code, fs]) => {
    const main = fs.find((f) => f.properties.iso_3166_2 === code) ?? fs[0];
    const p = main.properties;
    // deutsche Namen; bei Deutschland und Österreich ist schon „name“ deutsch, bei der Schweiz ohne „Kanton“
    const label = a3 === 'DEU' || a3 === 'AUT' ? p.name : (p.name_de || p.name || '').replace(/^Kanton /, '');
    return unit(names[code] ?? label, union(fs));
  });
}

// --- Sowjetunion: Unionsrepubliken -----------------------------------------------------------
const RUS = successor(365), UKR = successor(369), BLR = successor(370), MDA = successor(359);
const EST = successor(366), LVA = successor(367), LTU = successor(368);
const GEO = successor(372), ARM = successor(371), AZE = successor(373);
const KAZ = successor(705), UZB = successor(704), TKM = successor(701), TJK = successor(702), KGZ = successor(703);
const crimea = regionOf(UKR, ['UA-43', 'UA-40'], ['UA-65', 'UA-23']); // bis 1954 Teil der RSFSR
const karakalpak = regionOf(UZB, ['UZ-QR'], ['UZ-XO', 'UZ-NW', 'UZ-BU']); // bis Dezember 1936 Teil der RSFSR
const karelia = regionOf(RUS, ['RU-KR'], ['RU-MUR', 'RU-ARK', 'RU-VLG', 'RU-LEN']); // 1940–1956 Karelo-Finnische SSR
// Karpatenruthenien (bis 1939 bei der Tschechoslowakei): östlich der heutigen Slowakei
const ruthenia = difference(regionOf(null, ['UA-21'], ['UA-46', 'UA-26']), successor(317));
const ukrNoCrimea = difference(UKR, crimea);

const soviet = (rsfsr, extra) => [
  unit('Russische SFSR', rsfsr),
  unit('Weißrussische SSR', BLR),
  unit('Turkmenische SSR', TKM),
  unit('Tadschikische SSR', TJK),
  ...extra,
];
const baltics = [unit('Estnische SSR', EST), unit('Lettische SSR', LVA), unit('Litauische SSR', LTU)];
const caucasus = [unit('Georgische SSR', GEO), unit('Armenische SSR', ARM), unit('Aserbaidschanische SSR', AZE)];
const centralAsia = [unit('Kasachische SSR', KAZ), unit('Kirgisische SSR', KGZ), unit('Usbekische SSR', UZB)];
// Bis 1940 gehört die Moldauische ASSR zur Ukraine; Bessarabien liegt außerhalb der UdSSR
const ukrWithMoldova = (u) => unit('Ukrainische SSR', union([u, MDA]));

// --- Konfigurationen -----------------------------------------------------------------------
// key: Staat in den Kartendaten (Abschneiden an dessen Grenze), simplify: Natural-Earth-Einheiten
// vereinfachen (Meter), units: Funktion → Einheiten
const CONFIGS = [
  // Sowjetunion
  { c: 'SU', key: '365', s: '1933-01-30', e: '1936-12-04', units: () => soviet(union([RUS, KAZ, KGZ, karakalpak, crimea]), [
    ukrWithMoldova(ukrNoCrimea), unit('Transkaukasische SFSR', union([GEO, ARM, AZE])), unit('Usbekische SSR', difference(UZB, karakalpak)),
  ]) },
  { c: 'SU', key: '365', s: '1936-12-05', e: '1940-03-30', units: () => soviet(union([RUS, crimea]), [ukrWithMoldova(ukrNoCrimea), ...caucasus, ...centralAsia, ...baltics]) },
  { c: 'SU', key: '365', s: '1940-03-31', e: '1940-08-01', units: () => soviet(union([difference(RUS, karelia), crimea]), [
    unit('Karelo-Finnische SSR', karelia), ukrWithMoldova(ukrNoCrimea), ...caucasus, ...centralAsia, ...baltics,
  ]) },
  { c: 'SU', key: '365', s: '1940-08-02', e: '1954-02-18', units: () => soviet(union([difference(RUS, karelia), crimea]), [
    unit('Karelo-Finnische SSR', karelia), unit('Ukrainische SSR', ukrNoCrimea), unit('Moldauische SSR', MDA), ...caucasus, ...centralAsia, ...baltics,
  ]) },
  { c: 'SU', key: '365', s: '1954-02-19', e: '1956-07-15', units: () => soviet(difference(RUS, karelia), [
    unit('Karelo-Finnische SSR', karelia), unit('Ukrainische SSR', UKR), unit('Moldauische SSR', MDA), ...caucasus, ...centralAsia, ...baltics,
  ]) },
  { c: 'SU', key: '365', s: '1956-07-16', e: '1991-12-31', units: () => soviet(RUS, [
    unit('Ukrainische SSR', UKR), unit('Moldauische SSR', MDA), ...caucasus, ...centralAsia, ...baltics,
  ]) },
  // Jugoslawien: Teilrepubliken und die Provinz Kosovo
  { c: 'YU', key: '345', s: '1945-11-29', e: '1991-12-31', units: () => [
    unit('Slowenien', successor(349)), unit('Kroatien', successor(344)), unit('Bosnien und Herzegowina', successor(346)),
    unit('Serbien', successor(340)), unit('Kosovo', successor(347)), unit('Montenegro', successor(341)), unit('Mazedonien', successor(343)),
  ] },
  // Tschechoslowakei: Länder, ab 1969 Teilrepubliken
  { c: 'CS', key: '315', s: '1933-01-30', e: '1939-03-14', units: () => [
    unit('Böhmen und Mähren-Schlesien', successor(316)), unit('Slowakei', successor(317)), unit('Karpatenruthenien', ruthenia),
  ] },
  { c: 'CS', key: '315', s: '1945-05-09', e: '1968-12-31', units: () => [unit('Tschechische Länder', successor(316)), unit('Slowakei', successor(317))] },
  { c: 'CS', key: '315', s: '1969-01-01', e: '1991-12-31', units: () => [unit('Tschechische SR', successor(316)), unit('Slowakische SR', successor(317))] },
  // Amerika und Australien
  { c: 'USA', key: '2', s: '1933-01-30', e: '1991-12-31', simplify: 1500, units: () => neUnits('USA') },
  { c: 'CAN', key: '20', s: '1933-01-30', e: '1991-12-31', simplify: 1500, units: () => neUnits('CAN', {
    merge: { 'CA-NU': 'CA-NT' }, names: { 'CA-NL': 'Neufundland' },
  }) },
  { c: 'MEX', key: '70', s: '1935-01-16', e: '1991-12-31', simplify: 1500, units: () => neUnits('MEX', { names: { 'MX-DIF': 'Distrito Federal' } }) },
  { c: 'BRA', key: '140', s: '1933-01-30', e: '1943-09-12', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-AP': 'BR-PA', 'BR-RR': 'BR-AM', 'BR-RO': 'BR-MT', 'BR-MS': 'BR-MT', 'BR-TO': 'BR-GO', 'BR-DF': 'BR-GO' },
  }) },
  { c: 'BRA', key: '140', s: '1943-09-13', e: '1956-02-16', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-MS': 'BR-MT', 'BR-TO': 'BR-GO', 'BR-DF': 'BR-GO' }, names: { 'BR-RO': 'Guaporé', 'BR-RR': 'Rio Branco' },
  }) },
  { c: 'BRA', key: '140', s: '1956-02-17', e: '1960-04-20', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-MS': 'BR-MT', 'BR-TO': 'BR-GO', 'BR-DF': 'BR-GO' }, names: { 'BR-RR': 'Rio Branco' },
  }) },
  { c: 'BRA', key: '140', s: '1960-04-21', e: '1962-12-12', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-MS': 'BR-MT', 'BR-TO': 'BR-GO' }, names: { 'BR-RR': 'Rio Branco', 'BR-DF': 'Distrito Federal' },
  }) },
  { c: 'BRA', key: '140', s: '1962-12-13', e: '1978-12-31', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-MS': 'BR-MT', 'BR-TO': 'BR-GO' }, names: { 'BR-DF': 'Distrito Federal' },
  }) },
  { c: 'BRA', key: '140', s: '1979-01-01', e: '1988-10-04', simplify: 1500, units: () => neUnits('BRA', {
    merge: { 'BR-TO': 'BR-GO' }, names: { 'BR-DF': 'Distrito Federal' },
  }) },
  { c: 'BRA', key: '140', s: '1988-10-05', e: '1991-12-31', simplify: 1500, units: () => neUnits('BRA', { names: { 'BR-DF': 'Distrito Federal' } }) },
  { c: 'AUS', key: '900', s: '1933-01-30', e: '1991-12-31', simplify: 1500, units: () => neUnits('AUS', { skip: ['AU-X03~'] }) },
  // Deutschland: Länder der Bundesrepublik (ab Gründung), der DDR bis zur Bezirksreform 1952,
  // danach nur Ost-Berlin; ab der Wiedervereinigung alle 16 Länder
  // bis April 1952 bestehen im Südwesten noch drei Länder, deren Grenzen hier fehlen: ohne Namen
  { c: 'DE', key: '260', s: '1949-05-23', e: '1952-04-24', simplify: 300, units: () => neUnits('DEU', { names: { 'DE-BW': '' } }) },
  { c: 'DE', key: '260', s: '1952-04-25', e: '1990-10-02', simplify: 300, units: () => neUnits('DEU') },
  { c: 'DE', key: '265', s: '1949-10-07', e: '1952-07-24', simplify: 300, units: () => neUnits('DEU', { names: { 'DE-BE': 'Ost-Berlin', 'DE-MV': 'Mecklenburg' } }) },
  { c: 'DE', key: '265', s: '1952-07-25', e: '1990-10-02', simplify: 300, units: () => neUnits('DEU', {
    merge: { 'DE-BB': 'DE-XX', 'DE-MV': 'DE-XX', 'DE-SN': 'DE-XX', 'DE-ST': 'DE-XX', 'DE-TH': 'DE-XX' }, names: { 'DE-BE': 'Ost-Berlin', 'DE-XX': '' },
  }) },
  { c: 'DE', key: '260', s: '1990-10-03', e: '1991-12-31', simplify: 300, units: () => neUnits('DEU') },
  { c: 'AT', key: '305', s: '1933-01-30', e: '1938-03-12', simplify: 300, units: () => neUnits('AUT') },
  { c: 'AT', key: '305', s: '1945-04-27', e: '1991-12-31', simplify: 300, units: () => neUnits('AUT') },
  { c: 'CH', key: '225', s: '1933-01-30', e: '1978-12-31', simplify: 300, units: () => neUnits('CHE', { merge: { 'CH-JU': 'CH-BE' } }) },
  { c: 'CH', key: '225', s: '1979-01-01', e: '1991-12-31', simplify: 300, units: () => neUnits('CHE') },
];

// --- Binnenlinien über die Topologie von mapshaper ------------------------------------------
let tmpId = 0;
function innerLines(units, simplifyMeters) {
  const file = path.join(TMP, `u${++tmpId}.geojson`);
  const topo = path.join(TMP, `u${tmpId}.topojson`);
  fs.writeFileSync(file, JSON.stringify({ type: 'FeatureCollection', features: units.map((u, i) => ({ type: 'Feature', properties: { i }, geometry: u.geom.geometry })) }));
  const args = [mapshaper, '-i', file, 'snap'];
  if (simplifyMeters) args.push('-simplify', `interval=${simplifyMeters}`, 'keep-shapes');
  args.push('-o', topo, 'format=topojson', 'quantization=1000000');
  execFileSync(process.execPath, args, { stdio: ['ignore', 'ignore', 'inherit'] });
  const t = JSON.parse(fs.readFileSync(topo, 'utf8'));
  const geoms = Object.values(t.objects)[0].geometries;
  const users = new Map();
  geoms.forEach((g, gi) => {
    const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
    for (const rings of polys) for (const ring of rings) for (const a of ring) {
      const k = a < 0 ? ~a : a;
      if (!users.has(k)) users.set(k, new Set());
      users.get(k).add(gi);
    }
  });
  const [sx, sy] = t.transform.scale, [tx, ty] = t.transform.translate;
  const lines = [];
  for (const [k, set] of users) {
    if (set.size < 2) continue;
    let x = 0, y = 0;
    lines.push(t.arcs[k].map(([dx, dy]) => { x += dx; y += dy; return [+(x * sx + tx).toFixed(4), +(y * sy + ty).toFixed(4)]; }));
  }
  return lines;
}

// --- Berechnung je Konfiguration und Zeitstand des Staates ----------------------------------
const lineFeatures = [];
const labels = [];
for (const cfg of CONFIGS) {
  const s = D(cfg.s), e = D(cfg.e);
  const periods = finals.filter((f) => f.properties.k === cfg.key && f.properties.s <= e && f.properties.e >= s);
  if (!periods.length) { console.warn(`  ! ${cfg.c} ${cfg.s}: kein Staatsgebiet ${cfg.key}`); continue; }
  const units = cfg.units().map((u) => ({ ...u, full: areaKm2(u.geom) }));
  for (const p of periods) {
    const ps = Math.max(s, p.properties.s), pe = Math.min(e, p.properties.e);
    // Natural Earth und CShapes weichen an Grenzen um einige hundert Meter ab: schmale Reststücke
    // von Nachbareinheiten (unter einem Viertel ihrer Fläche) erzeugen sonst falsche Doppellinien
    const clipped = units
      .map((u) => ({ ...u, geom: intersect(u.geom, p) }))
      .filter((u) => u.geom && areaKm2(u.geom) >= Math.max(1, 0.25 * u.full));
    if (clipped.length < 2) continue;
    for (const coords of innerLines(clipped, cfg.simplify)) {
      lineFeatures.push({ type: 'Feature', properties: { s: ps, e: pe, c: cfg.c }, geometry: { type: 'LineString', coordinates: coords } });
    }
    for (const u of clipped) {
      if (!u.name) continue;
      const g = u.geom.geometry;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      const largest = polys.reduce((a, b) => (turf.area(turf.polygon(a)) >= turf.area(turf.polygon(b)) ? a : b));
      const [x, y] = polylabel(largest);
      const a = areaKm2(u.geom);
      labels.push({ s: ps, e: pe, t: u.name, c: cfg.c, r: a > 400000 ? 1 : a > 60000 ? 2 : a > 8000 ? 3 : 4, x: +x.toFixed(3), y: +y.toFixed(3) });
    }
    log(`${cfg.c.padEnd(3)} ${toIso(ps)}–${toIso(pe)}: ${clipped.length} Einheiten`);
  }
}

// Beschriftungen zusammenfassen, die sich nur durch angrenzende Zeiträume unterscheiden
labels.sort((a, b) => a.t.localeCompare(b.t) || a.x - b.x || a.y - b.y || a.s - b.s);
const merged = [];
for (const l of labels) {
  const prev = merged[merged.length - 1];
  if (prev && prev.t === l.t && prev.x === l.x && prev.y === l.y && dayAfter(prev.e) === l.s) prev.e = l.e;
  else merged.push({ ...l });
}

// Gleiche Linien aufeinanderfolgender Zeitstände zu einer zusammenfassen
const byShape = new Map();
const lines = [];
for (const f of lineFeatures.sort((a, b) => a.properties.s - b.properties.s)) {
  const k = `${f.properties.c}|${JSON.stringify(f.geometry.coordinates)}`;
  const prev = byShape.get(k);
  if (prev && dayAfter(prev.properties.e) === f.properties.s) prev.properties.e = f.properties.e;
  else { byShape.set(k, f); lines.push(f); }
}

// Linien als TopoJSON: gemeinsame Abschnitte verschiedener Zeitstände werden nur einmal gespeichert
lines.forEach((f, i) => (f.properties.id = i + 1));
const linesFile = path.join(BUILD, 'admin-lines.geojson');
fs.writeFileSync(linesFile, JSON.stringify({ type: 'FeatureCollection', features: lines }));
execFileSync(process.execPath, [mapshaper, linesFile, '-o', path.join(OUT, 'admin.topo.json'), 'format=topojson', 'quantization=400000'], { stdio: ['ignore', 'ignore', 'inherit'] });
fs.writeFileSync(path.join(OUT, 'admin-labels.json'), JSON.stringify({
  type: 'FeatureCollection',
  features: merged.map((l, i) => ({ type: 'Feature', properties: { id: i + 1, s: l.s, e: l.e, t: l.t, r: l.r }, geometry: { type: 'Point', coordinates: [l.x, l.y] } })),
}));
fs.rmSync(TMP, { recursive: true, force: true });
log(`admin.topo.json: ${lines.length} Linien, ${Math.round(fs.statSync(path.join(OUT, 'admin.topo.json')).size / 1024)} KB`);
log(`admin-labels.json: ${merged.length} Beschriftungen, ${Math.round(fs.statSync(path.join(OUT, 'admin-labels.json')).size / 1024)} KB`);
