// Schritt 1: Relevante Länderperioden aus CShapes 2.0 extrahieren.
// Behalten werden alle Perioden, die 1933–1991 berühren, plus die heutigen Grenzen
// einiger Staaten, die später als Schnittvorlagen dienen (z. B. Tschechien/Slowakei
// für die Zerschlagung der Tschechoslowakei 1939).
import fs from 'node:fs';
import path from 'node:path';
import { ymd, START, END } from './lib/dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'data-raw', 'CShapes-2.0.geojson');
const OUT_DIR = path.join(ROOT, 'build');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Heutige Grenzen (Stand 2019) als Schnittvorlagen, Schlüssel = CShapes-gwcode
const REFERENCE = {
  316: 'CZE', 317: 'SVK', 369: 'UKR', 368: 'LTU', 349: 'SVN', 344: 'HRV',
  346: 'BIH', 340: 'SRB', 341: 'MNE', 347: 'KOS', 343: 'MKD', 359: 'MDA',
  370: 'BLR', 365: 'RUS', 290: 'POL', 260: 'DEU', 310: 'HUN', 360: 'ROU',
};

const gj = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const out = [];
for (const f of gj.features) {
  const p = f.properties;
  const s = ymd(p.gwsyear, p.gwsmonth, p.gwsday);
  const e = ymd(p.gweyear, p.gwemonth, p.gweday);
  const inRange = e >= START && s <= END;
  const isReference = e >= 20191231 && REFERENCE[p.gwcode];
  if (!inRange && !isReference) continue;
  const props = {
    gw: p.gwcode,
    cs_name: p.cntry_name,
    s,
    e,
    cap: p.capname || null,
    caplon: p.caplong ?? null,
    caplat: p.caplat ?? null,
  };
  if (isReference) {
    // Referenzpolygone bekommen eine eigene Kennung, damit sie nie angezeigt werden
    out.push({ type: 'Feature', properties: { ...props, ref: REFERENCE[p.gwcode] }, geometry: f.geometry });
    if (!inRange) continue;
    // Falls die heutige Periode schon vor 1992 beginnt, zusätzlich als normale Periode behalten
  }
  out.push({ type: 'Feature', properties: props, geometry: f.geometry });
}

fs.writeFileSync(path.join(OUT_DIR, '01-cshapes-subset.geojson'), JSON.stringify({ type: 'FeatureCollection', features: out }));
console.log(`Extrahiert: ${out.length} Features (inkl. ${out.filter((f) => f.properties.ref).length} Referenzpolygone)`);
