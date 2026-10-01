// Datumshelfer: Alle Datumswerte werden als Ganzzahl JJJJMMTT gespeichert (z. B. 19390901).
// So lassen sie sich in MapLibre-Filtern direkt numerisch vergleichen.

export const START = 19330130; // Ernennung Hitlers zum Reichskanzler
export const END = 19911231;   // Ende 1991: Auflösung der UdSSR (26.12.1991)

const p2 = (n) => String(n).padStart(2, '0');

export function ymd(y, m, d) {
  return y * 10000 + m * 100 + d;
}

export function fromIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return ymd(y, m, d);
}

export function toIso(n) {
  const y = Math.floor(n / 10000);
  const m = Math.floor((n % 10000) / 100);
  const d = n % 100;
  return `${y}-${p2(m)}-${p2(d)}`;
}

function toDate(n) {
  const y = Math.floor(n / 10000);
  const m = Math.floor((n % 10000) / 100);
  const d = n % 100;
  return new Date(Date.UTC(y, m - 1, d));
}

function fromDate(dt) {
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function addDays(n, days) {
  const dt = toDate(n);
  dt.setUTCDate(dt.getUTCDate() + days);
  return fromDate(dt);
}

/** Tag vor dem Datum n (für Enddaten: "gültig bis einschließlich"). */
export const dayBefore = (n) => addDays(n, -1);
export const dayAfter = (n) => addDays(n, 1);

/** Normalisiert Eingaben ('1939-09-01' oder 19390901) auf JJJJMMTT. */
export function D(v) {
  return typeof v === 'string' ? fromIso(v) : v;
}

/** Tage seit dem 1.1.1900 (wie in der App), für lineare Zeitabstände in Kartenausdrücken. */
export function dayIndex(n) {
  const y = Math.floor(n / 10000);
  const m = Math.floor((n % 10000) / 100);
  const d = n % 100;
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
}
