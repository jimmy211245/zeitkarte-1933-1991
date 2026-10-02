// Nahostkonflikt 1948–1991: Besatzungsgebiete und ihre schrittweisen Veränderungen.
// CShapes führt Israel ab 1967 einschließlich aller besetzten Gebiete und gibt den Sinai 1979
// auf einmal zurück. Hier werden die Gebiete getrennt und die Zwischenstände ergänzt.
// Handgezeichnete Linien (Sinai-Abkommen, Libanon, Golan 1973) sind vereinfacht und können um
// einige Kilometer abweichen. Ost-Jerusalem und die UNDOF-Zone stammen aus Natural Earth.
import fs from 'node:fs';
import path from 'node:path';
import { polyLL, difference, partsInBox } from '../../lib/geo.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..', '..');

/** Polygon aus einer Linie (Nord → Süd, [lat, lon]) und Schließungspunkten auf einer Seite. */
const side = (line, closure) => polyLL([...line, ...closure]);

// --- Suezkrise 1956/57 --------------------------------------------------------------------
// Israel stößt bis etwa 16 km vor den Kanal vor (anglo-französisches Ultimatum)
const LINE_1956 = [[31.40, 32.50], [31.10, 32.50], [30.60, 32.48], [30.30, 32.55], [29.95, 32.72], [29.85, 32.60]];
// Mitte des Golfs von Suez und Rotes Meer bis zur Grenze, damit das afrikanische Ufer draußen bleibt
const GULF_OF_SUEZ = [[29.50, 32.58], [29.00, 32.88], [28.50, 33.18], [28.00, 33.55], [27.70, 33.85], [27.20, 34.00]];
const SINAI_1956 = side(LINE_1956, [...GULF_OF_SUEZ, [27.20, 35.30], [31.40, 35.30]]);
// Bis März 1957 hält Israel noch die Küste am Golf von Akaba bis Scharm el-Scheich
const AQABA_COAST_1957 = polyLL([
  [29.56, 34.70], [29.56, 35.10], [28.50, 34.65], [27.85, 34.45], [27.60, 34.30], [27.72, 34.15],
  [27.95, 34.20], [28.45, 34.40], [29.00, 34.50],
]);
// Britisch-französische Landung: Port Said, Port Fuad und der Kanal bis El Cap
const PORT_SAID_1956 = polyLL([[31.34, 32.18], [31.34, 32.42], [31.03, 32.42], [31.03, 32.18]]);

// --- Jom-Kippur-Krieg 1973 ----------------------------------------------------------------
// Waffenstillstandslage vom 24.10.1973: israelischer Brückenkopf westlich des Kanals …
const SUEZ_WEST_POCKET_1973 = polyLL([
  [30.45, 32.34], [30.40, 32.10], [30.15, 31.95], [29.95, 32.05], [29.85, 32.35], [29.88, 32.49],
  [30.00, 32.52], [30.15, 32.50], [30.30, 32.40], [30.40, 32.36],
]);
// … und die ägyptischen Brückenköpfe der 2. und 3. Armee am Ostufer
const SECOND_ARMY_1973 = polyLL([[30.95, 32.25], [30.95, 32.46], [30.45, 32.48], [30.45, 32.25]]);
const THIRD_ARMY_1973 = polyLL([[30.20, 32.40], [30.20, 32.66], [29.92, 32.70], [29.92, 32.40]]);
// Golan: israelischer Vorstoß Richtung Damaskus („Enklave“) bis zum Entflechtungsabkommen 1974
const GOLAN_SALIENT_1973 = polyLL([
  [33.43, 35.78], [33.43, 35.87], [33.38, 35.95], [33.30, 36.07], [33.24, 36.08], [33.16, 35.98],
  [33.10, 35.90], [33.10, 35.78],
]);

// --- Schrittweiser Rückzug aus dem Sinai ----------------------------------------------------
// Sinai I (18.1.1974, umgesetzt bis 5.3.1974): israelische Linie rund 20–30 km östlich des Kanals
const LINE_1974 = [[31.40, 32.73], [31.16, 32.73], [30.90, 32.62], [30.60, 32.58], [30.35, 32.65], [30.15, 32.75], [29.95, 32.80], [29.80, 32.78], [29.70, 32.66]];
const WEST_1974 = side(LINE_1974, [[29.60, 32.50], [29.60, 31.80], [31.40, 31.80]]);
// Sinai II (4.9.1975, umgesetzt bis 22.2.1976): östlich der Mitla- und Gidi-Pässe, dazu der
// Küstenstreifen am Golf von Suez mit den Ölfeldern von Abu Rudeis
const LINE_1976 = [
  [31.40, 33.00], [31.10, 33.00], [30.80, 32.95], [30.50, 33.02], [30.30, 33.12], [30.05, 33.13], [29.85, 33.08],
  [29.60, 33.02], [29.35, 33.10], [29.10, 33.22], [28.90, 33.30], [28.80, 33.27],
];
const WEST_1976 = side(LINE_1976, [[28.80, 33.15], [29.50, 32.58], [29.60, 31.80], [31.40, 31.80]]);
const EAST_1976 = side(LINE_1976, [[28.50, 33.18], [28.00, 33.55], [27.70, 33.85], [27.20, 34.00], [27.20, 35.30], [31.40, 35.30]]);
// Friedensvertrag 1979: bis 25.1.1980 Rückzug hinter die Linie El Arisch–Ras Muhammad,
// das letzte Drittel mit Scharm el-Scheich und Jamit bis 25.4.1982
const LINE_1980 = [[31.40, 33.85], [31.14, 33.85], [30.50, 33.95], [29.80, 34.03], [29.00, 34.12], [28.30, 34.20], [27.73, 34.25], [27.40, 34.25]];
const EAST_1980 = side(LINE_1980, [[27.40, 35.30], [31.40, 35.30]]);

// --- Libanon --------------------------------------------------------------------------------
// Litani-Operation 1978: Süden bis zum Litani, ohne die Stadt Tyros
const SOUTH_OF_LITANI_1978 = difference(
  polyLL([
    [33.34, 35.05], [33.338, 35.249], [33.335, 35.29], [33.32, 35.36], [33.305, 35.47], [33.33, 35.53],
    [33.40, 35.58], [33.45, 35.65], [33.45, 35.95], [33.00, 35.95], [33.00, 35.05],
  ]),
  polyLL([[33.34, 35.12], [33.34, 35.26], [33.24, 35.26], [33.24, 35.12]]),
);
// Libanonkrieg 1982: bis vor Beirut, ins Schuf-Gebirge und in die südliche Bekaa-Ebene
const SOUTH_LEBANON_1982 = polyLL([
  [33.80, 35.05], [33.80, 35.50], [33.82, 35.60], [33.81, 35.70], [33.72, 35.76], [33.63, 35.80], [33.58, 35.90],
  [33.50, 36.00], [33.00, 36.00], [33.00, 35.05],
]);
// September 1983: Rückzug an den Awali nördlich von Sidon
const SOUTH_OF_AWALI_1983 = polyLL([
  [33.60, 35.05], [33.60, 35.40], [33.61, 35.47], [33.62, 35.55], [33.58, 35.64], [33.57, 35.72], [33.50, 35.85],
  [33.42, 35.95], [33.00, 35.95], [33.00, 35.05],
]);
// Juni 1985: „Sicherheitszone“ entlang der Grenze mit dem Vorsprung um Dschezzin
const SECURITY_ZONE_1985 = polyLL([
  [33.20, 35.05], [33.20, 35.16], [33.21, 35.26], [33.19, 35.36], [33.23, 35.43], [33.29, 35.48], [33.37, 35.52],
  [33.46, 35.53], [33.55, 35.55], [33.56, 35.62], [33.50, 35.64], [33.44, 35.66], [33.40, 35.73], [33.35, 35.80],
  [33.30, 35.85], [33.00, 35.95], [33.00, 35.05],
]);

export function nahostPatches(st) {
  const ne = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'ne-admin1.json'), 'utf8')).features;
  const neUnit = (name) => {
    const f = ne.find((x) => x.properties.name === name);
    if (!f) throw new Error(`Natural Earth: ${name} fehlt`);
    return f;
  };

  const egypt = st.one(651, '1960-01-01');
  const gaza = st.one(6511, '1960-01-01');
  const westBank = st.one(6631, '1960-01-01');
  const syria = st.one(652, '1960-01-01');

  // Suezkrise: Sinai und Gaza von Israel besetzt, Port Said von Großbritannien und Frankreich
  st.carve(651, SINAI_1956, '1956-11-05', '1957-01-21', { gw: 'SINAI-ISR' });
  st.carve(651, AQABA_COAST_1957, '1957-01-22', '1957-03-07', { gw: 'SINAI-ISR' });
  st.carve(6511, gaza, '1956-11-03', '1957-03-07', { gw: 'GAZA-ISR' });
  st.carve(651, PORT_SAID_1956, '1956-11-06', '1956-12-22', { gw: 'SUEZ-UKFR' });

  // Sechstagekrieg: CShapes zählt die besetzten Gebiete zu Israel – hier getrennt
  st.carve(666, egypt, '1967-06-10', '1979-05-25', { gw: 'SINAI-ISR' });
  st.carve(666, gaza, '1967-06-10', '2019-12-31', { gw: 'GAZA-ISR' });
  st.carve(666, westBank, '1967-06-10', '2019-12-31', { gw: 'WB-ISR' });
  st.carve(666, syria, '1967-06-10', '2019-12-31', { gw: 'GOLAN-ISR' });

  // Ost-Jerusalem (Stadtgrenze nach der Annexion vom 28.6.1967): der Teil des Westjordanlands,
  // den Natural Earth als heutiges israelisches Verwaltungsgebiet nicht zum Westjordanland zählt
  const eastJerusalem = partsInBox(difference(westBank, neUnit('West Bank')), [35.15, 31.72, 35.30, 31.88]);
  st.carve('WB-ISR', eastJerusalem, '1967-06-28', '2019-12-31', { gw: 'EJER-ISR' });

  // Jom-Kippur-Krieg: Lage beim Waffenstillstand bis zu den Entflechtungsabkommen
  st.carve(651, SUEZ_WEST_POCKET_1973, '1973-10-24', '1974-03-04', { gw: 'SUEZW-ISR' });
  st.carve('SINAI-ISR', SECOND_ARMY_1973, '1973-10-24', '1974-03-04', { gw: 651 });
  st.carve('SINAI-ISR', THIRD_ARMY_1973, '1973-10-24', '1974-03-04', { gw: 651 });
  st.carve(652, GOLAN_SALIENT_1973, '1973-10-14', '1974-06-25', { gw: 'GOLAN-ISR' });
  // Golan-Abkommen: Quneitra und die Pufferzone (UNDOF) zurück an Syrien. Innerhalb des 1967
  // besetzten Gebiets ist das nur ein schmaler Saum aus Stücken von 3–9 km², daher kleinere Mindestgröße
  st.carve('GOLAN-ISR', neUnit('UNDOF'), '1974-06-26', '2019-12-31', { gw: 652 }, { minKm2: 2 });

  // Sinai: Rückgabe in Stufen
  st.carve('SINAI-ISR', WEST_1974, '1974-03-05', '1979-05-25', { gw: 651 });
  st.carve('SINAI-ISR', WEST_1976, '1976-02-22', '1979-05-25', { gw: 651 });
  st.carve(651, EAST_1976, '1979-05-26', '1980-01-25', { gw: 'SINAI-ISR' });
  st.carve(651, EAST_1980, '1980-01-26', '1982-04-24', { gw: 'SINAI-ISR' });

  // Libanon
  st.carve(660, SOUTH_OF_LITANI_1978, '1978-03-15', '1978-06-13', { gw: 'LBN-ISR' });
  st.carve(660, SOUTH_LEBANON_1982, '1982-06-10', '1983-09-03', { gw: 'LBN-ISR' });
  st.carve(660, SOUTH_OF_AWALI_1983, '1983-09-04', '1985-06-09', { gw: 'LBN-ISR' });
  st.carve(660, SECURITY_ZONE_1985, '1985-06-10', '2000-05-24', { gw: 'LBN-ISR' });
}
