// Geometrie-Hilfsfunktionen auf Basis von Turf.
import * as turf from '@turf/turf';

export const fc = (features) => turf.featureCollection(features);

export function asFeature(g) {
  if (!g) return null;
  return g.type === 'Feature' ? g : turf.feature(g);
}

function isEmpty(f) {
  return !f || !f.geometry || !f.geometry.coordinates || f.geometry.coordinates.length === 0;
}

// Polyclip kann an fast entarteten Geometrien scheitern; dann einmal mit gerundeten
// Koordinaten wiederholen.
function robust(op, a, b) {
  try {
    return op(a, b);
  } catch (err) {
    const ta = turf.truncate(a, { precision: 5, mutate: false });
    const tb = turf.truncate(b, { precision: 5, mutate: false });
    return op(ta, tb);
  }
}

export function intersect(a, b) {
  a = asFeature(a); b = asFeature(b);
  if (isEmpty(a) || isEmpty(b)) return null;
  if (!bboxOverlap(turf.bbox(a), turf.bbox(b))) return null;
  const r = robust((x, y) => turf.intersect(fc([x, y])), a, b);
  return isEmpty(r) ? null : r;
}

export function difference(a, b) {
  a = asFeature(a); b = asFeature(b);
  if (isEmpty(a)) return null;
  if (isEmpty(b) || !bboxOverlap(turf.bbox(a), turf.bbox(b))) return a;
  const r = robust((x, y) => turf.difference(fc([x, y])), a, b);
  return isEmpty(r) ? null : r;
}

export function union(list) {
  const fs = list.map(asFeature).filter((f) => !isEmpty(f));
  if (fs.length === 0) return null;
  if (fs.length === 1) return fs[0];
  try {
    return turf.union(fc(fs));
  } catch (err) {
    // schrittweise vereinigen, falls die Sammelvereinigung scheitert
    let acc = fs[0];
    for (let i = 1; i < fs.length; i++) {
      acc = robust((x, y) => turf.union(fc([x, y])), acc, fs[i]);
    }
    return acc;
  }
}

export function bboxOverlap(a, b) {
  return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
}

export function areaKm2(f) {
  return isEmpty(f) ? 0 : turf.area(asFeature(f)) / 1e6;
}

/** Entfernt Teilflächen unter minKm2 (Splitter aus Verschneidungen). */
export function dropSmallParts(f, minKm2 = 30) {
  if (isEmpty(f)) return null;
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const keep = polys.filter((rings) => turf.area(turf.polygon(rings)) / 1e6 >= minKm2);
  if (keep.length === 0) return null;
  return {
    ...f,
    geometry: keep.length === 1 ? { type: 'Polygon', coordinates: keep[0] } : { type: 'MultiPolygon', coordinates: keep },
  };
}

/** Wandelt [[lat, lon], ...] in GeoJSON-Reihenfolge [[lon, lat], ...] um. */
export function ll(points) {
  return points.map(([lat, lon]) => [lon, lat]);
}

/** Polygon aus [[lat, lon], ...]; der Ring wird automatisch geschlossen. */
export function polyLL(points) {
  const ring = ll(points);
  const [f, l] = [ring[0], ring[ring.length - 1]];
  if (f[0] !== l[0] || f[1] !== l[1]) ring.push([...f]);
  // Orientierung ist für Turf egal, aber Selbstüberschneidungen nicht
  return turf.polygon([ring]);
}

/** Linie (lat/lon) plus Schließungspunkte (lat/lon) → Polygon "auf einer Seite der Linie". */
export function sidePoly(lineLL, closureLL) {
  return polyLL([...lineLL, ...closureLL]);
}

/** Rechteck aus [west, süd, ost, nord]. */
export function boxPoly([w, s, e, n]) {
  return turf.bboxPolygon([w, s, e, n]);
}

/** Alle Teilpolygone einer Fläche, deren Schwerpunkt in der Box liegt. */
export function partsInBox(f, [w, s, e, n]) {
  if (isEmpty(f)) return null;
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const keep = polys.filter((rings) => {
    const [x, y] = turf.centroid(turf.polygon(rings)).geometry.coordinates;
    return x >= w && x <= e && y >= s && y <= n;
  });
  if (keep.length === 0) return null;
  return turf.feature(keep.length === 1 ? { type: 'Polygon', coordinates: keep[0] } : { type: 'MultiPolygon', coordinates: keep });
}

export { turf };
