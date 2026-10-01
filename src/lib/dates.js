// Datumshilfen. Intern zählt die App Tage ab dem 1.1.1900 (UTC), für Kartenfilter
// wird das Datum als Ganzzahl JJJJMMTT verwendet (z. B. 19390901).

const DAY = 86400000;
const EPOCH = Date.UTC(1900, 0, 1);

export const START = toDay(19330130);
export const END = toDay(19911231);

export function toDay(ymd) {
  const y = Math.floor(ymd / 10000);
  const m = Math.floor((ymd % 10000) / 100);
  const d = ymd % 100;
  return Math.round((Date.UTC(y, m - 1, d) - EPOCH) / DAY);
}

export function toYmd(day) {
  const dt = new Date(EPOCH + day * DAY);
  return dt.getUTCFullYear() * 10000 + (dt.getUTCMonth() + 1) * 100 + dt.getUTCDate();
}

export function fromIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return toDay(y * 10000 + (m || 1) * 100 + (d || 1));
}

export function toIso(day) {
  const n = toYmd(day);
  const y = Math.floor(n / 10000);
  const m = String(Math.floor((n % 10000) / 100)).padStart(2, '0');
  const d = String(n % 100).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function yearOf(day) {
  return Math.floor(toYmd(day) / 10000);
}

/** Erster Tag des Jahres als Tagesindex. */
export function yearStart(y) {
  return toDay(y * 10000 + 101);
}

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

export function parts(day) {
  const n = toYmd(day);
  return { y: Math.floor(n / 10000), m: Math.floor((n % 10000) / 100), d: n % 100 };
}

/** "1. September 1939" */
export function formatLong(day) {
  const { y, m, d } = parts(day);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

/** "1. September" */
export function formatDayMonth(day) {
  const { m, d } = parts(day);
  return `${d}. ${MONTHS[m - 1]}`;
}

/** "1. Sept. 1939" */
export function formatShort(day) {
  const { y, m, d } = parts(day);
  return `${d}. ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** Formatiert ein Datum gemäß Genauigkeit: 'd' Tag, 'm' Monat, 'y' Jahr. */
export function formatPrecision(day, precision = 'd') {
  const { y, m } = parts(day);
  if (precision === 'y') return String(y);
  if (precision === 'm') return `${MONTHS[m - 1]} ${y}`;
  return formatLong(day);
}

export function addMonths(day, n) {
  const { y, m, d } = parts(day);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
  return Math.round((Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), Math.min(d, last)) - EPOCH) / DAY);
}

export const clampDay = (day) => Math.max(START, Math.min(END, day));
