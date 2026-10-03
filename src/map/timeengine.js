// Zeitsteuerung der Karte ohne Neuladen der Kacheln.
//
// Früher hingen die Filter der Grenzebenen am globalen Kartenzustand "date". MapLibre lädt bei
// jeder Änderung eines solchen Werts die komplette Quelle neu – beim Abspielen oder Ziehen
// viele Male pro Sekunde, sodass die Karte nie hinterherkam. Jetzt bleiben alle Flächen geladen
// und werden per Feature-State ein- und ausgeblendet. Geändert wird nur, was sich zum neuen
// Datum tatsächlich ändert (Binärsuche über alle Zeitgrenzen).
import { toDay, toYmd } from '../lib/dates.js';
import { blocOf, BLOCS, BLOC_BREAKS } from '../data/blocs.js';

const SOVEREIGN = new Set(['ind', 'unrec', 'pup']);

/** Sortierte Zeitgrenzen (Tagesindex), an denen sich die Menge der gültigen Elemente ändert. */
function breakpoints(items) {
  const set = new Set();
  for (const it of items) {
    set.add(it.a);
    set.add(it.b + 1);
  }
  return Float64Array.from([...set].sort((x, y) => x - y));
}

/** Anzahl der Zeitgrenzen <= day (identifiziert den Zeitabschnitt). */
function epochOf(bp, day) {
  let lo = 0;
  let hi = bp.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (bp[mid] <= day) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Hält für eine Quelle den Feature-State `on` passend zum Datum. */
class ActiveSet {
  constructor(map, source, features) {
    this.map = map;
    this.source = source;
    this.items = features.map((f) => ({ id: f.properties.id, a: toDay(f.properties.s), b: toDay(f.properties.e), f }));
    this.bp = breakpoints(this.items);
    this.epoch = -1;
    this.active = new Set();
  }

  /** Liefert true, wenn sich die aktive Menge geändert hat. */
  update(day) {
    const epoch = epochOf(this.bp, day);
    if (epoch === this.epoch) return false;
    this.epoch = epoch;
    const next = new Set();
    for (const it of this.items) if (it.a <= day && it.b >= day) next.add(it.id);
    for (const id of this.active) if (!next.has(id)) this.map.setFeatureState({ source: this.source, id }, { on: false });
    for (const id of next) if (!this.active.has(id)) this.map.setFeatureState({ source: this.source, id }, { on: true });
    this.active = next;
    return true;
  }
}

export function createTimeEngine(map, { states, labels, fronts, admin, events, changeShapes, onBlocs }) {
  const stateSet = new ActiveSet(map, 'states', states.features);
  const frontSet = fronts ? new ActiveSet(map, 'fronts', fronts.features) : null;
  const adminSet = admin ? new ActiveSet(map, 'admin', admin.features) : null;
  const stateById = new Map(states.features.map((f) => [f.properties.id, f.properties]));

  // Beschriftungen: kleine Punktquelle, bleibt filterbasiert, wird aber nur beim Wechsel des
  // Zeitabschnitts neu ausgewertet (ein Neuladen dauert hier nur Millisekunden)
  const labelBp = breakpoints(labels.features.map((f) => ({ a: toDay(f.properties.s), b: toDay(f.properties.e) })));
  let labelEpoch = -1;
  let year = -1;

  // Bündnisfarben je Fläche (nur in der Bündnisansicht gesetzt)
  let mode = 'states';
  const colorSet = new Map();
  let blocKey = '';

  function applyColors(day) {
    const ymd = toYmd(day);
    if (mode !== 'blocs') {
      if (colorSet.size) {
        for (const id of colorSet.keys()) map.removeFeatureState({ source: 'states', id }, 'c');
        colorSet.clear();
      }
      return;
    }
    const used = new Set();
    for (const id of stateSet.active) {
      const p = stateById.get(id);
      const key = p.sov && !SOVEREIGN.has(p.st) ? p.sov : p.k;
      const cat = blocOf(key, ymd, p.lx, p.ly);
      used.add(cat);
      const color = BLOCS[cat].color;
      if (colorSet.get(id) !== color) {
        map.setFeatureState({ source: 'states', id }, { c: color });
        colorSet.set(id, color);
      }
    }
    const k = [...used].sort().join();
    if (k !== blocKey) {
      blocKey = k;
      onBlocs?.(used);
    }
  }

  // Ereignisse: Sichtbarkeit und Ausblenden über Feature-State, Beschriftungen in kleiner Quelle.
  // Mit Schwerpunktthema bleiben nur dessen Ereignisse sichtbar, und auch kleinere werden beschriftet.
  const WINDOW = { 1: 540, 2: 270, 3: 120 };
  const eventItems = events.map((e) => ({ id: e.id, t: e.t, te: e.te, imp: e.imp, ev: e }));
  const eventFade = new Map();
  let selectedEvent = -1;
  let labelIds = '';
  let theme = null;

  function updateEvents(day) {
    const labelled = [];
    for (const it of eventItems) {
      const age = day - it.te;
      const sel = it.id === selectedEvent;
      const offTheme = theme && it.ev.theme !== theme;
      let f = 0;
      if (sel) f = 1;
      else if (!offTheme && it.t <= day && age <= WINDOW[it.imp]) f = age <= 0 ? 1 : Math.max(0.12, 1 - (0.88 * age) / WINDOW[it.imp]);
      f = Math.round(f * 50) / 50;
      const h = f > 0 && (sel || age <= 21) ? 1 : 0;
      const prev = eventFade.get(it.id);
      if (!prev || prev.f !== f || prev.h !== h || prev.sel !== sel) {
        map.setFeatureState({ source: 'events', id: it.id }, { f, h, sel });
        map.setFeatureState({ source: 'event-labels', id: it.id }, { f });
        eventFade.set(it.id, { f, h, sel });
      }
      // ausgewählte Ereignisse mit Teilungsplan nicht beschriften: dann ist der Plan beschriftet
      if (f > 0 && it.ev.lon != null && !(sel && it.ev.plan) && (sel || (age <= 45 && (it.imp <= 2 || theme)))) labelled.push(it.ev);
    }
    const ids = labelled.map((e) => e.id).join();
    if (ids !== labelIds) {
      labelIds = ids;
      map.getSource('event-labels')?.setData({
        type: 'FeatureCollection',
        features: labelled.map((e) => ({ type: 'Feature', properties: { id: e.id, title: e.title, imp: e.imp }, geometry: { type: 'Point', coordinates: [e.lon, e.lat] } })),
      });
    }
  }

  // Hervorgehobene Gebietsänderung: eigene winzige Quelle statt Filter auf alle Änderungsflächen
  const changeById = new Map((changeShapes?.features ?? []).map((f) => [f.properties.id, f]));
  function setFocusChange(id) {
    const f = changeById.get(id);
    map.getSource('focus')?.setData({ type: 'FeatureCollection', features: f ? [f] : [] });
  }

  let lastDay = null;
  function update(day) {
    const statesChanged = stateSet.update(day);
    frontSet?.update(day);
    adminSet?.update(day);
    const le = epochOf(labelBp, day);
    if (le !== labelEpoch) {
      labelEpoch = le;
      map.setGlobalStateProperty('ldate', toYmd(day));
    }
    const y = Math.floor(toYmd(day) / 10000);
    if (y !== year) {
      year = y;
      map.setGlobalStateProperty('year', y);
    }
    if (mode === 'blocs') {
      // immer auswerten (nicht hinter statesChanged kurzschließen), sonst veraltet der gemerkte
      // Bündnisabschnitt und ein späterer Sprung zurück in ihn bliebe unbemerkt
      const blocsChanged = blocEpochChanged(day);
      if (statesChanged || blocsChanged || lastDay === null) applyColors(day);
    }
    if (day !== lastDay) updateEvents(day);
    lastDay = day;
  }

  // Bündniszuordnungen ändern sich auch ohne Grenzänderung (z. B. NATO-Beitritt)
  let blocEpoch = -1;
  const blocBp = Float64Array.from([...new Set(BLOC_BREAKS.map((ymd) => toDay(ymd)))].sort((a, b) => a - b));
  function blocEpochChanged(day) {
    const e = epochOf(blocBp, day);
    if (e === blocEpoch) return false;
    blocEpoch = e;
    return true;
  }

  return {
    update,
    isStateActive: (id) => stateSet.active.has(id),
    isEventVisible: (id) => (eventFade.get(id)?.f ?? 0) > 0,
    setMode(m, day) {
      mode = m;
      blocEpoch = -1;
      applyColors(day);
    },
    setSelection(sel, day) {
      selectedEvent = sel && sel.kind === 'event' ? sel.id : -1;
      setFocusChange(sel && sel.kind === 'change' ? sel.id : -1);
      updateEvents(day);
    },
    setTheme(t, day) {
      theme = t;
      updateEvents(day);
    },
  };
}
