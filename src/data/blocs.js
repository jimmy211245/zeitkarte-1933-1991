// Bündniszugehörigkeit je Zeitraum für die Ansicht "Bündnisse".
// Regeln werden in Reihenfolge geprüft; die erste passende gewinnt.
// Abhängige Gebiete (Kolonien, Annexionen) erhalten die Farbe ihres Souveräns.
import { toDay, toYmd } from '../lib/dates.js';

export const BLOCS = {
  achse: { name: 'Achsenmächte und Verbündete', color: '#b5655b' },
  alliierte: { name: 'Alliierte', color: '#5d86ad' },
  neutral: { name: 'Neutral', color: '#ddd6c6' },
  nato: { name: 'NATO', color: '#4a77a8' },
  westlich: { name: 'Mit dem Westen verbündet', color: '#a3bfdb' },
  ostblock: { name: 'Warschauer Pakt / Ostblock', color: '#c4504a' },
  kommunistisch: { name: 'Andere kommunistische Staaten', color: '#e0956a' },
  blockfrei: { name: 'Blockfreie Staaten (Näherung)', color: '#94b98c' },
  sonstige: { name: 'Sonstige', color: '#e4e1da' },
};

const WW2_END = '1945-09-02';
const CW_START = '1945-09-03';
const CW_END = '2100-01-01';

// [Kategorie, [Gebietsschlüssel], von, bis]
export const RULES = [
  // --- Zweiter Weltkrieg ---------------------------------------------------------------------
  ['achse', ['255'], '1936-10-25', '1945-05-08'],
  ['achse', ['325'], '1936-10-25', '1943-09-08'],
  ['alliierte', ['325'], '1943-10-13', WW2_END],
  ['achse', ['740'], '1936-11-25', WW2_END],
  ['achse', ['310'], '1940-11-20', '1945-04-04'],
  ['achse', ['360'], '1940-11-23', '1944-08-23'],
  ['alliierte', ['360'], '1944-08-24', WW2_END],
  ['achse', ['355'], '1941-03-01', '1944-09-08'],
  ['alliierte', ['355'], '1944-09-09', WW2_END],
  ['achse', ['SLOWAKEI'], '1940-11-24', '1945-05-08'],
  ['achse', ['NDH'], '1941-04-10', '1945-05-08'],
  ['achse', ['375'], '1941-06-25', '1944-09-19'],
  ['alliierte', ['375'], '1944-09-20', WW2_END],
  ['achse', ['800'], '1941-12-21', '1945-08-15'],
  ['achse', ['MANCHU'], '1932-03-01', WW2_END],
  ['alliierte', ['290'], '1939-09-01', WW2_END],
  ['alliierte', ['200', '900', '920', '560'], '1939-09-03', WW2_END],
  ['alliierte', ['20'], '1939-09-10', WW2_END],
  ['alliierte', ['220'], '1939-09-03', '1940-06-22'],
  ['alliierte', ['220'], '1944-08-25', WW2_END],
  ['alliierte', ['390', '385'], '1940-04-09', WW2_END],
  ['alliierte', ['210', '211', '212'], '1940-05-10', WW2_END],
  ['alliierte', ['350'], '1940-10-28', WW2_END],
  ['alliierte', ['345'], '1941-04-06', WW2_END],
  ['alliierte', ['365'], '1941-06-22', WW2_END],
  ['alliierte', ['2'], '1941-12-08', WW2_END],
  ['alliierte', ['710'], '1937-07-07', WW2_END],
  ['alliierte', ['40', '42', '41', '90', '91', '92', '93', '94', '95'], '1941-12-09', WW2_END],
  ['alliierte', ['70'], '1942-05-22', WW2_END],
  ['alliierte', ['140'], '1942-08-22', WW2_END],
  ['alliierte', ['530'], '1941-05-05', WW2_END],
  ['alliierte', ['645'], '1943-01-16', WW2_END],
  ['alliierte', ['145'], '1943-04-07', WW2_END],
  ['alliierte', ['630'], '1943-09-09', WW2_END],
  ['alliierte', ['100'], '1943-11-26', WW2_END],
  ['alliierte', ['450'], '1944-01-27', WW2_END],
  ['alliierte', ['130', '135', '150', '165', '101', '155'], '1945-02-12', WW2_END],
  ['alliierte', ['640'], '1945-02-23', WW2_END],
  ['alliierte', ['651', '652', '660', '670'], '1945-02-24', WW2_END],
  ['alliierte', ['160'], '1945-03-27', WW2_END],
  ['alliierte', ['712'], '1945-08-10', WW2_END],

  // --- Kalter Krieg ---------------------------------------------------------------------------
  ['westlich', ['2', '20', '200', '220', '211', '210', '212', '385', '390', '395', '325', '235', '350', '640'], CW_START, '1949-04-03'],
  ['nato', ['2', '20', '200', '220', '211', '210', '212', '385', '390', '395', '325', '235'], '1949-04-04', CW_END],
  ['nato', ['350', '640'], '1952-02-18', CW_END],
  ['nato', ['260'], '1955-05-09', CW_END],
  ['nato', ['230'], '1982-05-30', CW_END],
  ['westlich', ['260'], '1945-05-08', '1955-05-08'],
  ['westlich', ['230'], '1953-09-26', '1982-05-29'],
  ['ostblock', ['365'], CW_START, '1991-12-25'],
  ['ostblock', ['290'], CW_START, '1991-06-30'],
  ['ostblock', ['265'], '1945-05-08', '1990-10-02'],
  ['ostblock', ['355'], '1946-09-15', '1991-06-30'],
  ['ostblock', ['310'], '1947-05-31', '1991-06-30'],
  ['ostblock', ['360'], '1947-12-30', '1991-06-30'],
  ['ostblock', ['315'], '1948-02-25', '1991-06-30'],
  ['ostblock', ['339'], '1946-01-11', '1961-11-30'],
  ['kommunistisch', ['339'], '1961-12-01', CW_END],
  ['ostblock', ['731'], '1945-08-15', '1948-09-08'],
  ['kommunistisch', ['731'], '1948-09-09', CW_END],
  ['kommunistisch', ['712'], CW_START, '1990-07-29'],
  ['kommunistisch', ['710'], '1949-10-01', CW_END],
  ['kommunistisch', ['816'], '1954-05-01', CW_END],
  ['kommunistisch', ['40'], '1961-04-16', CW_END],
  ['kommunistisch', ['811'], '1975-04-17', '1989-04-29'],
  ['kommunistisch', ['812'], '1975-12-02', CW_END],
  ['kommunistisch', ['680'], '1969-06-22', '1990-05-21'],
  ['kommunistisch', ['700'], '1978-04-27', CW_END],
  ['kommunistisch', ['530'], '1974-09-12', '1991-05-28'],
  ['kommunistisch', ['540'], '1975-11-11', CW_END],
  ['kommunistisch', ['541'], '1975-06-25', '1990-11-30'],
  ['kommunistisch', ['484'], '1969-12-31', '1991-06-01'],
  ['kommunistisch', ['434'], '1975-11-30', '1990-03-01'],
  ['kommunistisch', ['520'], '1969-10-21', '1977-11-13'],
  ['blockfrei', ['345'], '1948-06-28', CW_END],
  ['westlich', ['740'], CW_START, CW_END],
  ['westlich', ['732'], '1945-08-15', CW_END],
  ['westlich', ['713'], '1949-12-08', CW_END],
  ['westlich', ['840'], '1946-07-04', CW_END],
  ['westlich', ['800'], '1954-09-08', CW_END],
  ['westlich', ['770'], '1954-09-08', '1979-03-12'],
  ['westlich', ['630'], '1955-11-03', '1979-02-11'],
  ['westlich', ['645'], '1955-02-24', '1958-07-14'],
  ['westlich', ['817'], '1954-05-01', '1975-04-30'],
  ['westlich', ['900', '920'], '1951-09-01', CW_END],
  ['neutral', ['225', '380', '205', '375'], CW_START, CW_END],
  ['neutral', ['305'], '1955-07-27', CW_END],
];

const dateNum = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return y * 10000 + m * 100 + d;
};
const COMPILED = RULES.map(([cat, keys, from, to]) => ({ cat, keys: new Set(keys), a: dateNum(from), b: dateNum(to) }));

const inLatinAmerica = (x, y) => x > -120 && x < -30 && y > -60 && y < 33;
const inAfricaOrAsia = (x, y) => (x > -26 && x < 160 && y > -40 && y < 42) && !(x > -26 && x < 30 && y > 36);

/** Bündniskategorie eines Gebiets zum Datum (JJJJMMTT). */
export function blocOf(key, ymd, lx, ly) {
  for (const r of COMPILED) {
    if (r.keys.has(key) && r.a <= ymd && r.b >= ymd) return r.cat;
  }
  if (ymd < 19361025) return 'sonstige';
  if (ymd <= 19450902) return 'neutral';
  if (lx != null && inLatinAmerica(lx, ly) && ymd >= 19470902) return 'westlich';
  if (lx != null && inAfricaOrAsia(lx, ly) && ymd >= 19550418) return 'blockfrei';
  return 'sonstige';
}

/** Alle Stichtage, an denen sich eine Zuordnung ändern kann (für effizientes Neuzeichnen).
 *  Regeln gelten bis einschließlich `bis`, die Änderung tritt also erst am Folgetag ein. */
const nextDay = (ymd) => toYmd(toDay(ymd) + 1);
export const BLOC_BREAKS = [...new Set([...COMPILED.flatMap((r) => [r.a, nextDay(r.b)]), 19361025, nextDay(19450902), 19470902, 19550418])].sort((a, b) => a - b);
