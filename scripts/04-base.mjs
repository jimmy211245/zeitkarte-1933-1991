// Basiskarte aus Natural Earth (gemeinfrei): Land, Seen, Flüsse.
// Stauseen bekommen ein "ab"-Jahr, damit sie erst nach ihrer Entstehung erscheinen.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'data-raw');
const OUT = path.join(ROOT, 'public', 'data');
const TMP = path.join(ROOT, 'build');
fs.mkdirSync(OUT, { recursive: true });

const mapshaper = path.join(ROOT, 'node_modules', 'mapshaper', 'bin', 'mapshaper');
const ms = (...args) => execFileSync(process.execPath, [mapshaper, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });

// Land
ms(path.join(RAW, 'ne_50m_land.geojson'), '-simplify', '35%', 'keep-shapes', '-filter-fields', 'scalerank', '-o', path.join(TMP, 'ne-land.json'), 'precision=0.0001');

// Antarktis (keinem Staat zugeordnet) als eigene, neutrale Fläche
{
  const land = JSON.parse(fs.readFileSync(path.join(TMP, 'ne-land.json'), 'utf8'));
  const polys = [];
  for (const f of land.features) {
    const g = f.geometry;
    for (const rings of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) {
      const lat = rings[0].reduce((s, c) => s + c[1], 0) / rings[0].length;
      if (lat < -60) polys.push(rings);
    }
  }
  fs.writeFileSync(path.join(OUT, 'antarctica.json'), JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polys } }] }));
}

// Seen: Stauseen erst ab Fertigstellung (ungefähres Jahr der Flutung)
const RESERVOIR_FROM = {
  'Rybinsk Reservoir': 1941, 'Kremenchuk Reservoir': 1961, 'Kakhovka Reservoir': 1956, 'Samara Reservoir': 1956,
  'Lake Nasser': 1968, 'Lake Kariba': 1959, 'Lake Volta': 1965, 'Kainji Reservoir': 1968, 'Bratsk Reservoir': 1964,
  'Lake Mead': 1936, 'Lake Powell': 1966, 'Smallwood Reservoir': 1971, 'Rés. de La Grande 2': 1979,
  'Rés. de La Grande 3': 1981, 'Réservoir de Caniapiscau': 1981, 'Réservoir Manicouagan': 1970, 'Williston Lake': 1968,
  'Ft. Peck Lake': 1938, 'Fort Peck Lake': 1938, 'Lake Sakakawea': 1954, 'Lake Oahe': 1960, 'Lake Francis Case': 1953,
  'Amistad Reservoir': 1969, 'Falcon Lake': 1954, 'Millerton Lake': 1944, 'Shasta Lake': 1945, 'Kentucky Lake': 1944,
  'J. Strom Thurmond Lake': 1954, 'Wheeler Lake': 1936, 'Kinbasket Lake': 1973, 'Itaipú Reservoir': 1982,
  'Represa de Sobradinho': 1979, 'Represa de Tucuruí': 1984, 'Represa Três Marias': 1962, 'Nam Ngum Reservoir': 1971,
  'Van Blommestein Meer': 1964, 'Lake Argyle': 1972, 'Toktogul Res.': 1974, 'Shardara Bögeni': 1967,
  'Vilyuy Reservoir': 1968, 'Lake Tharthar': 1956,
};
// Der heutige, geschrumpfte Aralsee wird durch eine historische Umrisslinie ersetzt (siehe unten)
const ARAL = new Set(['South Aral Sea', 'North Aral Sea', 'Barsakelmes Lake']);

const lakesTmp = path.join(TMP, 'lakes-simplified.json');
ms(path.join(RAW, 'ne_50m_lakes.geojson'), '-simplify', '40%', 'keep-shapes', '-o', lakesTmp, 'precision=0.0001');
const lakes = JSON.parse(fs.readFileSync(lakesTmp, 'utf8'));
const lakeOut = [];
for (const f of lakes.features) {
  const p = f.properties;
  if (ARAL.has(p.name)) {
    lakeOut.push({ type: 'Feature', properties: { n: p.name_de || p.name, from: 1988, to: 9999 }, geometry: f.geometry });
    continue;
  }
  let from = 0;
  if (p.featurecla === 'Reservoir') from = RESERVOIR_FROM[p.name] ?? 0;
  lakeOut.push({ type: 'Feature', properties: { n: p.name_de || p.name || '', from, to: 9999 }, geometry: f.geometry });
}
// Aralsee um 1960 (vereinfachte historische Uferlinie, ca. 67 000 km²) bis 1975,
// danach ein mittlerer Zustand bis zur Teilung 1987/88.
const ring = (pts) => [[...pts.map(([lat, lon]) => [lon, lat]), [pts[0][1], pts[0][0]]]];
const ARAL_1960 = [
  [46.75, 61.05], [46.62, 61.55], [46.30, 61.75], [45.95, 61.62], [45.55, 61.35], [45.15, 61.10], [44.75, 60.95],
  [44.30, 60.55], [43.95, 60.05], [43.65, 59.55], [43.45, 59.05], [43.55, 58.55], [43.90, 58.25], [44.35, 58.20],
  [44.85, 58.30], [45.30, 58.55], [45.65, 58.75], [45.95, 59.05], [46.15, 59.55], [46.30, 60.05], [46.55, 60.45],
];
const ARAL_1980 = [
  [46.65, 61.05], [46.45, 61.40], [46.10, 61.45], [45.75, 61.15], [45.30, 60.85], [44.85, 60.60], [44.40, 60.25],
  [44.05, 59.85], [43.85, 59.35], [43.90, 58.85], [44.25, 58.50], [44.75, 58.45], [45.25, 58.65], [45.65, 58.90],
  [45.95, 59.30], [46.15, 59.75], [46.35, 60.20], [46.55, 60.55],
];
lakeOut.push({ type: 'Feature', properties: { n: 'Aralsee', from: 0, to: 1975 }, geometry: { type: 'Polygon', coordinates: ring(ARAL_1960) } });
lakeOut.push({ type: 'Feature', properties: { n: 'Aralsee', from: 1976, to: 1987 }, geometry: { type: 'Polygon', coordinates: ring(ARAL_1980) } });
fs.writeFileSync(path.join(OUT, 'lakes.json'), JSON.stringify({ type: 'FeatureCollection', features: lakeOut }));

// Flüsse
ms(path.join(RAW, 'ne_50m_rivers_lake_centerlines.geojson'), '-simplify', '40%', '-filter-fields', 'scalerank,name', '-o', path.join(OUT, 'rivers.json'), 'precision=0.0001');

for (const f of ['antarctica.json', 'lakes.json', 'rivers.json']) {
  console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), 'KB');
}
