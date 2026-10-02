// Zentraler Zustand der App mit einfachem Abonnement-Mechanismus.
import { START, clampDay } from './lib/dates.js';

const listeners = new Set();

export const state = {
  day: START,
  playing: false,
  speed: 91, // Tage pro Sekunde
  mode: 'states', // 'states' | 'blocs'
  theme: null, // Schwerpunktthema: null | 'nahost'
  layers: { events: true, fronts: true, rivers: true, changes: true, admin: true, places: true },
  selection: null, // { kind: 'event' | 'change', id }
  tab: 'events',
  query: '',
  categories: null, // Set der aktiven Kategorien (null = alle)
};

export function set(patch) {
  if ('day' in patch) patch.day = clampDay(Math.round(patch.day));
  const changed = Object.keys(patch).filter((k) => state[k] !== patch[k]);
  if (changed.length === 0) return;
  Object.assign(state, patch);
  for (const fn of listeners) fn(state, changed);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
