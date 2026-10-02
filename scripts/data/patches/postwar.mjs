// Nachkriegs- und Kalter-Krieg-Details, die CShapes nicht als eigene Flächen führt.
import { polyLL, boxPoly } from '../../lib/geo.mjs';
import { SAAR } from './interwar.mjs';

// Berlin: Umriss von Groß-Berlin und von West-Berlin (Sektorengrenze), vereinfacht
const WEST_BERLIN_LL = [
  [52.675, 13.29], [52.655, 13.35], [52.625, 13.36], [52.615, 13.40], [52.595, 13.39], [52.57, 13.37],
  [52.555, 13.40], [52.54, 13.40], [52.533, 13.385], [52.527, 13.375], [52.522, 13.376], [52.516, 13.377],
  [52.509, 13.377], [52.507, 13.39], [52.506, 13.41], [52.502, 13.445], [52.49, 13.46], [52.475, 13.47],
  [52.455, 13.49], [52.43, 13.515], [52.405, 13.50], [52.39, 13.44], [52.37, 13.41], [52.37, 13.38],
  [52.39, 13.33], [52.405, 13.27], [52.40, 13.20], [52.42, 13.13], [52.413, 13.09], [52.44, 13.11],
  [52.48, 13.12], [52.51, 13.12], [52.55, 13.12], [52.58, 13.17], [52.62, 13.20], [52.65, 13.25],
];
export const WEST_BERLIN = polyLL(WEST_BERLIN_LL);
export const GREATER_BERLIN = polyLL([
  [52.675, 13.29], [52.66, 13.36], [52.645, 13.42], [52.66, 13.47], [52.64, 13.52], [52.60, 13.56],
  [52.57, 13.60], [52.54, 13.64], [52.50, 13.66], [52.46, 13.68], [52.43, 13.76], [52.39, 13.74],
  [52.35, 13.70], [52.37, 13.60], [52.39, 13.55], [52.405, 13.50], [52.39, 13.44], [52.37, 13.41],
  [52.37, 13.38], [52.39, 13.33], [52.405, 13.27], [52.40, 13.20], [52.42, 13.13], [52.413, 13.09],
  [52.44, 13.11], [52.48, 13.12], [52.51, 13.12], [52.55, 13.12], [52.58, 13.17], [52.62, 13.20], [52.65, 13.25],
]);

const NORTH_OF_38 = boxPoly([123.5, 38.0, 131.5, 43.5]);
const SOUTH_OF_38 = boxPoly([123.5, 32.5, 131.5, 38.0]);

const TRIESTE_ZONE_A = boxPoly([13.58, 45.55, 13.95, 45.82]);
const TRIESTE_ZONE_B = polyLL([[45.62, 13.60], [45.62, 13.95], [45.48, 13.98], [45.38, 13.85], [45.30, 13.70], [45.30, 13.45], [45.50, 13.45]]);

export function postwarPatches(st, ctx) {
  // Groß-Berlin unter Viermächteverwaltung, ab der Spaltung der Stadtverwaltung (Dez. 1948) West-Berlin
  st.carve(265, GREATER_BERLIN, '1945-05-08', '1948-11-30', { gw: 'BERLIN' });
  st.carve(265, WEST_BERLIN, '1948-12-01', '1990-10-02', { gw: 'WBERLIN' });

  // Korea: Demarkation am 38. Breitengrad bis zum Waffenstillstand (27.7.1953)
  st.carve(731, SOUTH_OF_38, '1945-08-15', '1953-07-26', { gw: 732 });
  st.carve(732, NORTH_OF_38, '1945-08-15', '1953-07-26', { gw: 731 });

  // Saarprotektorat (Verfassung vom 17.12.1947) bis zur Eingliederung in die Bundesrepublik am 1.1.1957
  st.carve(260, SAAR, '1947-12-17', '1956-12-31', { gw: 'SAAR' });

  // Freies Territorium Triest (15.9.1947–25.10.1954)
  st.carve(325, TRIESTE_ZONE_A, '1947-09-15', '1954-10-25', { gw: 'TRIEST-A' });
  st.carve(345, TRIESTE_ZONE_B, '1947-09-15', '1954-10-25', { gw: 'TRIEST-B' });

  // Ryūkyū-Inseln (Okinawa) unter US-Verwaltung bis 15.5.1972, Amami-Inseln bis 25.12.1953
  st.carve(740, boxPoly([122.5, 24.0, 131.5, 27.95]), '1945-09-02', '1972-05-14', { gw: 'RYUKYU' });
  st.carve(740, boxPoly([128.8, 27.95, 130.2, 28.6]), '1946-02-02', '1953-12-24', { gw: 'RYUKYU' });

  // Nahostkonflikt: siehe nahost.mjs

  // Westsahara: 1975/76 zwischen Marokko und Mauretanien aufgeteilt, 1979 ganz von Marokko besetzt
  const westernSahara = st.one(609, '1970-01-01');
  st.carve(600, westernSahara, '1975-11-14', '2019-12-31', { gw: 'ESH-MA' });
  st.carve(435, westernSahara, '1975-11-14', '1979-08-04', { gw: 'ESH-MR' });

  // Osttimor: 1976 von Indonesien annektiert (international nicht anerkannt)
  const eastTimor = st.one(860, '1970-01-01');
  st.carve(850, eastTimor, '1976-07-17', '2019-12-31', { gw: 'TLS-ID' });

  // Slowenien und Kroatien: Unabhängigkeit wirksam nach Ablauf des Moratoriums (8.10.1991)
  st.carve(345, ctx.ref('SVN'), '1991-10-08', '1992-04-26', { gw: 349 });
  st.carve(345, ctx.ref('HRV'), '1991-10-08', '1992-04-26', { gw: 344 });
}
