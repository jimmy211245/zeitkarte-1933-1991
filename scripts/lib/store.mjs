// Kleiner "Zeit-Geometrie-Speicher": eine Liste von Flächen mit Gültigkeitszeitraum [s, e].
// Damit lassen sich Gebiete für einen Zeitraum aus einem Staat herausschneiden und
// einem anderen Staat zuordnen, ohne dass sich Flächen überlappen.
import { intersect, difference, dropSmallParts, union, areaKm2 } from './geo.mjs';
import { D, dayBefore, dayAfter, toIso } from './dates.mjs';

export class Store {
  constructor(features) {
    this.features = [];
    this.refs = {};
    for (const f of features) {
      if (f.properties.ref) this.refs[f.properties.ref] = f;
      else this.features.push(f);
    }
  }

  ref(code) {
    const r = this.refs[code];
    if (!r) throw new Error(`Referenzpolygon fehlt: ${code}`);
    return r;
  }

  of(key) {
    return this.features.filter((f) => f.properties.gw === key);
  }

  at(key, date) {
    const d = D(date);
    return this.of(key).filter((f) => f.properties.s <= d && f.properties.e >= d);
  }

  /** Genau eine Fläche von `key` am Datum, sonst Fehler. */
  one(key, date) {
    const r = this.at(key, date);
    if (r.length !== 1) throw new Error(`${key} am ${toIso(D(date))}: ${r.length} Treffer statt 1`);
    return r[0];
  }

  /** Größte Fläche von `key` am Datum (Hauptgebiet ohne ergänzte Inseln). */
  largest(key, date) {
    const r = this.at(key, date);
    if (!r.length) throw new Error(`${key} am ${toIso(D(date))}: keine Fläche`);
    return r.reduce((a, b) => (areaKm2(a) >= areaKm2(b) ? a : b));
  }

  /** Teilt alle Perioden von `key`, die über `date` hinweg laufen, in [s, date-1] und [date, e]. */
  splitAt(key, date) {
    const d = D(date);
    for (const f of this.of(key)) {
      const p = f.properties;
      if (p.s < d && p.e >= d) {
        const g = { type: 'Feature', properties: { ...p, s: d }, geometry: structuredClone(f.geometry) };
        f.properties = { ...p, e: dayBefore(d) };
        this.features.push(g);
      }
    }
  }

  inRange(key, s, e) {
    return this.of(key).filter((f) => f.properties.s >= s && f.properties.e <= e);
  }

  /**
   * Schneidet `geom` im Zeitraum [s, e] aus allen Perioden von `key` heraus und legt das
   * herausgeschnittene Stück als neue Fläche mit `props` an.
   */
  carve(key, geom, s, e, props, { minKm2 = 20 } = {}) {
    s = D(s); e = D(e);
    this.splitAt(key, s);
    this.splitAt(key, dayAfter(e));
    const created = [];
    for (const f of this.inRange(key, s, e)) {
      const piece = dropSmallParts(intersect(f, geom), minKm2);
      if (!piece) continue;
      const rest = dropSmallParts(difference(f, geom), minKm2);
      if (rest) f.geometry = rest.geometry;
      else this.features.splice(this.features.indexOf(f), 1);
      created.push({ type: 'Feature', properties: { ...props, s: f.properties.s, e: f.properties.e }, geometry: piece.geometry });
    }
    if (created.length === 0) console.warn(`  ! carve ${props.gw ?? ''} aus ${key}: kein Überlapp`);
    this.features.push(...created);
    return created;
  }

  /** Setzt Eigenschaften für alle Perioden von `key` im Zeitraum [s, e]. */
  setProps(key, s, e, props) {
    s = D(s); e = D(e);
    this.splitAt(key, s);
    this.splitAt(key, dayAfter(e));
    const hit = this.inRange(key, s, e);
    for (const f of hit) Object.assign(f.properties, props);
    if (hit.length === 0) console.warn(`  ! setProps ${key}: nichts im Zeitraum`);
    return hit;
  }

  /** Ändert Start/Ende der Periode von `key`, die bisher am `oldStart` begann. */
  setDates(key, oldStart, { s, e }) {
    const f = this.of(key).find((x) => x.properties.s === D(oldStart));
    if (!f) throw new Error(`setDates: ${key} ab ${oldStart} nicht gefunden`);
    if (s !== undefined) f.properties.s = D(s);
    if (e !== undefined) f.properties.e = D(e);
    return f;
  }

  remove(key, start) {
    const f = this.of(key).find((x) => x.properties.s === D(start));
    if (!f) throw new Error(`remove: ${key} ab ${start} nicht gefunden`);
    this.features.splice(this.features.indexOf(f), 1);
  }

  add(geom, props) {
    const g = geom.type === 'Feature' ? geom.geometry : geom;
    const f = { type: 'Feature', properties: { ...props, s: D(props.s), e: D(props.e) }, geometry: structuredClone(g) };
    this.features.push(f);
    return f;
  }

  /** Vereinigt mehrere Flächen (z. B. zum Abziehen). */
  static union(list) {
    return union(list);
  }

  static area(f) {
    return areaKm2(f);
  }
}
