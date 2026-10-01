// Gebiete der Zwischenkriegszeit, die CShapes wegen der 10 000-km²-Schwelle oder als
// "später rückgängig gemacht" nicht enthält. Linien sind vereinfacht (± einige km).
import { polyLL, sidePoly, boxPoly, union, intersect } from '../../lib/geo.mjs';

// Grenze Italien–Jugoslawien 1920/24–1947 (Vertrag von Rapallo, Vertrag von Rom),
// dazu Cres/Lošinj; Krk blieb jugoslawisch.
const ITALIAN_JULIAN_MARCH = polyLL([
  [46.53, 13.70], [46.47, 13.73], [46.38, 13.84], [46.28, 13.92], [46.18, 13.98], [46.08, 14.05],
  [45.98, 14.12], [45.90, 14.18], [45.82, 14.26], [45.73, 14.33], [45.64, 14.40], [45.59, 14.44],
  [45.50, 14.47], [45.42, 14.44], [45.36, 14.44], [45.33, 14.445], [45.28, 14.44], [45.10, 14.425],
  [44.95, 14.44], [44.70, 14.55], [44.40, 14.60], [44.40, 14.10], [45.00, 13.20], [45.80, 13.20], [46.60, 13.30],
]);

const DODECANESE = union([boxPoly([26.4, 35.3, 28.4, 37.5]), boxPoly([29.4, 36.0, 29.7, 36.25])]);

const HATAY = polyLL([
  [35.75, 35.70], [36.40, 35.75], [36.60, 36.00], [36.80, 36.08], [37.05, 36.12],
  [37.05, 36.45], [36.85, 36.60], [36.50, 36.75], [35.75, 36.75],
]);

export const SAAR = polyLL([
  [49.47, 6.35], [49.50, 6.50], [49.53, 6.70], [49.58, 6.88], [49.64, 7.02], [49.60, 7.18],
  [49.56, 7.30], [49.45, 7.40], [49.32, 7.42], [49.18, 7.33], [49.05, 7.25], [49.05, 6.35],
]);

// Tuwa (Volksrepublik Tannu-Tuwa bis 1944); Südgrenze = Grenze zur Mongolei aus CShapes
const TUVA = polyLL([
  [50.0, 88.0], [51.2, 88.6], [51.75, 89.6], [52.15, 91.2], [52.45, 92.8], [52.75, 94.4], [53.35, 95.8],
  [53.75, 97.1], [53.35, 98.3], [52.6, 99.1], [51.9, 99.25], [50.6, 98.6], [49.5, 98.5], [49.5, 88.0],
]);

// Westgrenze Mandschukuos (inkl. Jehol) von der Ostspitze der Mongolei bis zur Großen Mauer bei Shanhaiguan
const MANCHUKUO = sidePoly(
  [
    [46.72, 119.93], [45.80, 119.30], [44.80, 118.60], [43.60, 117.90], [42.60, 117.30], [42.05, 116.85],
    [41.55, 116.50], [41.00, 116.75], [40.68, 117.20], [40.45, 117.95], [40.30, 118.80], [40.10, 119.50],
    [39.98, 119.78], [39.80, 119.95],
  ],
  [[38.0, 121.5], [38.0, 136.0], [54.5, 136.0], [54.5, 114.5], [48.5, 114.5], [47.3, 119.0]],
);

// Hongkong (Kronkolonie): Festland bis zum Shenzhen-Fluss, Lantau und Hongkong-Insel
export const HONG_KONG = polyLL([
  [22.56, 113.83], [22.51, 113.90], [22.53, 114.05], [22.55, 114.15], [22.56, 114.25], [22.52, 114.42],
  [22.20, 114.45], [22.15, 114.20], [22.18, 113.83],
]);

export function interwarPatches(st, ctx) {
  // Julisch Venetien, Istrien, Fiume, Cres/Lošinj: italienisch bis zum Pariser Frieden (in Kraft 15.9.1947)
  st.carve(345, ITALIAN_JULIAN_MARCH, '1920-06-04', '1947-09-14', { gw: 325 });

  // Dodekanes: italienisch bis zum Pariser Friedensvertrag (10.2.1947)
  st.carve(350, DODECANESE, '1919-11-27', '1947-02-09', { gw: 325 });

  // Sandschak Alexandrette / Hatay: Teil Syriens (frz. Mandat), 1938/39 Staat Hatay, ab 29.6.1939 türkisch
  st.carve(640, HATAY, '1923-10-14', '1938-09-01', { gw: 652 });
  st.carve(640, HATAY, '1938-09-02', '1939-06-28', { gw: 'HATAY' });

  // Saargebiet unter Völkerbundsverwaltung bis zur Rückgliederung am 1.3.1935
  st.carve(255, SAAR, '1920-02-10', '1935-02-28', { gw: 'SAAR' });

  // Tuwa: formal unabhängig, 1944 von der UdSSR annektiert (11.10.1944)
  st.carve(365, TUVA, '1921-03-18', '1944-10-10', { gw: 'TUVA' });

  // Mandschukuo (1.3.1932–Aug. 1945), japanischer Marionettenstaat, Jehol ab März 1933
  st.carve(710, MANCHUKUO, '1932-03-01', '1945-08-14', { gw: 'MANCHU' });

  // Hongkong fehlt in CShapes als Fläche: Umriss mit der Natural-Earth-Küste verschneiden
  const hkLand = intersect(ctx.landIn([113.7, 22.0, 114.6, 22.7]), HONG_KONG);
  st.carve(710, HONG_KONG, '1921-03-13', '1997-06-30', { gw: 'HKG' });
  if (hkLand) st.add(hkLand, { gw: 'HKG', s: '1898-07-01', e: '1997-06-30' });

  // Sikkim (britisches, ab 1950 indisches Protektorat; 1975 indischer Bundesstaat)
  const SIKKIM = polyLL([
    [28.13, 88.60], [28.02, 88.92], [27.55, 88.92], [27.28, 88.82], [27.08, 88.62], [27.05, 88.20],
    [27.28, 88.00], [27.75, 88.03], [28.05, 88.15],
  ]);
  st.carve(750, SIKKIM, '1931-02-13', '1975-05-15', { gw: 'SIKKIM' });

  // Goa (Portugiesisch-Indien) bis zur indischen Annexion am 19.12.1961
  const GOA = polyLL([
    [15.80, 73.60], [15.76, 74.10], [15.50, 74.33], [15.08, 74.28], [14.88, 74.10], [14.88, 73.80], [15.40, 73.60],
  ]);
  st.carve(750, GOA, '1931-02-13', '1961-12-18', { gw: 'GOA' });
}
