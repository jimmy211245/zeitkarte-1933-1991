// Annexionen, Protektorate und Aufteilungen 1938–1945 (CShapes enthält sie nicht, weil sie
// nach dem Krieg rückgängig gemacht wurden). Alle Linien sind vereinfacht (± 5–15 km).
import { polyLL, sidePoly, boxPoly, union, intersect, difference } from '../../lib/geo.mjs';

// --- Polen 1939 -------------------------------------------------------------------------
// Deutsch-sowjetische Grenze nach dem Grenz- und Freundschaftsvertrag vom 28.9.1939:
// nördlich von Augustów zur ostpreußischen Grenze, Pisa, Narew bis Ostrołęka, zum Bug,
// Bug aufwärts bis Krystynopol, westwärts zum San, San aufwärts bis zur Quelle.
export const GERMAN_SOVIET_LINE_1939 = [
  [54.10, 24.10], [53.98, 23.85], [53.95, 23.50], [53.92, 23.10], [53.90, 22.90], [53.85, 22.55],
  [53.75, 22.30], [53.55, 22.00], [53.42, 21.80], [53.30, 21.86], [53.23, 21.88], [53.15, 21.75],
  [53.07, 21.62], [52.95, 21.78], [52.85, 21.95], [52.78, 22.05], [52.70, 22.10], [52.68, 22.30],
  [52.62, 22.45], [52.43, 22.62], [52.33, 23.05], [52.27, 23.35], [52.18, 23.55], [52.07, 23.65],
  [51.90, 23.62], [51.70, 23.60], [51.55, 23.55], [51.35, 23.65], [51.17, 23.82], [51.00, 24.00],
  [50.85, 24.10], [50.70, 24.05], [50.55, 24.15], [50.47, 24.27], [50.38, 24.22], [50.35, 24.00],
  [50.33, 23.70], [50.30, 23.45], [50.25, 23.20], [50.15, 23.00], [50.05, 22.85], [49.98, 22.80],
  [49.88, 22.79], [49.78, 22.77], [49.76, 22.60], [49.80, 22.42], [49.81, 22.23], [49.65, 22.20],
  [49.56, 22.21], [49.47, 22.33], [49.35, 22.52], [49.22, 22.72], [49.08, 22.85], [49.00, 22.90], [48.90, 22.95],
];
const SOVIET_SIDE_1939 = sidePoly(GERMAN_SOVIET_LINE_1939, [[48.0, 30.0], [56.0, 30.0], [56.0, 24.10]]);

// Grenze zwischen den ins Reich eingegliederten Gebieten (Danzig-Westpreußen, Wartheland,
// Ost-Oberschlesien, Zichenau, Sudauen) und dem Generalgouvernement.
const ANNEXED_SIDE_1939 = sidePoly(
  [
    [49.40, 19.55], [49.60, 19.55], [49.85, 19.62], [50.10, 19.70], [50.30, 19.80], [50.50, 19.55],
    [50.62, 19.20], [50.85, 18.98], [50.95, 18.95], [51.15, 19.12], [51.42, 19.52], [51.65, 19.70],
    [51.88, 19.88], [52.05, 19.82], [52.22, 20.12], [52.35, 20.45], [52.45, 20.75], [52.62, 21.10],
    [52.85, 21.40], [52.98, 21.70], [53.10, 22.30],
  ],
  [[53.00, 26.0], [55.0, 26.0], [55.0, 14.0], [49.4, 14.0]],
);

// --- Memelland (23.3.1939) ------------------------------------------------------------------
const MEMEL = polyLL([
  [55.88, 21.06], [55.85, 21.30], [55.72, 21.45], [55.60, 21.60], [55.45, 21.80], [55.35, 22.05],
  [55.25, 22.35], [55.12, 22.62], [55.06, 22.70], [55.00, 22.70], [55.00, 20.80], [55.95, 20.80],
]);

// --- Nordsiebenbürgen (Zweiter Wiener Schiedsspruch, 30.8.1940) -------------------------------
const NORTH_TRANSYLVANIA = polyLL([
  [46.97, 21.20], [46.90, 21.80], [46.85, 22.20], [46.80, 22.60], [46.72, 23.05], [46.68, 23.45],
  [46.68, 23.70], [46.62, 24.00], [46.50, 24.30], [46.42, 24.62], [46.30, 24.95], [46.18, 25.15],
  [46.05, 25.25], [45.92, 25.35], [45.78, 25.50], [45.72, 25.70], [45.70, 25.95], [45.62, 26.20],
  [45.55, 26.40], [45.80, 26.35], [46.10, 26.40], [46.40, 26.28], [46.62, 26.12], [46.82, 25.90],
  [47.00, 25.68], [47.25, 25.35], [47.45, 25.10], [47.62, 24.90], [47.80, 24.95], [48.10, 24.90],
  [48.40, 21.00], [47.10, 21.00],
]);

// --- Jugoslawien 1941 ------------------------------------------------------------------------
// Slowenien: Norden (Oberkrain, Untersteiermark, Save-Streifen) deutsch, Süden mit Laibach italienisch
const SLOVENIA_GERMAN_PART = sidePoly(
  [[46.06, 13.90], [46.10, 14.20], [46.12, 14.40], [46.10, 14.55], [46.07, 14.70], [46.00, 14.85],
    [45.95, 15.05], [45.88, 15.30], [45.85, 15.55], [45.88, 15.75]],
  [[47.0, 16.8], [47.0, 13.5], [46.06, 13.5]],
);
// Batschka und Baranya (an Ungarn): zwischen Theiß, Donau und Drau
const BACKA_BARANJA = polyLL([
  [46.40, 20.25], [46.10, 20.10], [45.93, 20.10], [45.78, 20.15], [45.62, 20.07], [45.40, 20.20],
  [45.20, 20.30], [45.22, 20.10], [45.25, 19.84], [45.22, 19.60], [45.24, 19.39], [45.30, 19.15],
  [45.45, 19.05], [45.53, 19.00], [45.56, 18.80], [45.57, 18.68], [45.62, 18.45], [45.72, 18.25],
  [45.78, 18.10], [46.20, 18.10],
]);
// Syrmien (an den Unabhängigen Staat Kroatien) zwischen Donau und Save bis Semlin
const SYRMIA = polyLL([
  [45.30, 19.05], [45.24, 19.39], [45.22, 19.60], [45.25, 19.84], [45.20, 20.05], [45.10, 20.25],
  [44.95, 20.35], [44.83, 20.42], [44.80, 20.30], [44.70, 20.15], [44.67, 19.95], [44.75, 19.70],
  [44.90, 19.55], [44.95, 19.30], [45.00, 19.00],
]);
// Westmakedonien an Albanien (italienisch), Rest an Bulgarien
const WEST_MACEDONIA = sidePoly(
  [[42.30, 21.20], [42.05, 21.15], [41.85, 21.05], [41.60, 21.00], [41.40, 20.98], [41.20, 20.82], [41.00, 20.75], [40.85, 20.75]],
  [[40.85, 20.0], [42.30, 20.0]],
);
// Südostserbien (Pirot, Vranje) an Bulgarien
const SOUTHEAST_SERBIA = polyLL([
  [42.30, 21.75], [42.55, 21.75], [42.75, 21.95], [43.00, 22.15], [43.20, 22.35], [43.35, 22.60],
  [43.45, 23.00], [42.20, 23.00], [42.20, 21.75],
]);
const SOUTH_KOSOVO = boxPoly([19.5, 41.5, 22.0, 42.82]);

// --- Griechenland: Ostmakedonien und Westthrakien an Bulgarien (östlich der Struma) ----------
const BULGARIAN_GREECE = sidePoly(
  [[41.45, 23.32], [41.25, 23.22], [41.15, 23.30], [41.00, 23.48], [40.90, 23.70], [40.80, 23.86], [40.70, 23.95]],
  [[40.35, 24.40], [40.30, 25.80], [41.0, 26.8], [42.0, 26.8], [42.0, 23.32]],
);

// --- Elsass-Lothringen (faktisch annektiert, CdZ-Gebiet) --------------------------------------
const ALSACE_LORRAINE = polyLL([
  [49.48, 5.95], [49.30, 5.95], [49.15, 6.00], [49.00, 6.05], [48.90, 6.30], [48.75, 6.55],
  [48.65, 6.85], [48.58, 7.05], [48.50, 7.12], [48.35, 7.15], [48.20, 7.10], [48.00, 7.00],
  [47.85, 6.90], [47.70, 6.95], [47.55, 7.05], [47.45, 7.10], [47.40, 7.20], [47.40, 8.50],
  [49.60, 8.50], [49.60, 6.00],
]);

const WWII_END = '1945-05-07';

export function ww2Patches(st, ctx) {
  // Memelland: 23.3.1939 an das Deutsche Reich
  st.carve(368, MEMEL, '1939-03-23', '1940-08-02', { gw: 'MEMEL' });
  st.carve(365, MEMEL, '1940-08-03', WWII_END, { gw: 'MEMEL' });

  // Zerschlagung der Rest-Tschechoslowakei (14.–16.3.1939)
  st.carve(315, ctx.ref('SVK'), '1939-03-15', WWII_END, { gw: 'SLOWAKEI' });
  st.carve(315, ctx.ref('UKR'), '1939-03-15', WWII_END, { gw: 'KARPATO' });
  st.setProps(315, '1939-03-15', WWII_END, { gw: 'PROTEKTORAT' });

  // Danzig: am 1.9.1939 vom Deutschen Reich annektiert
  const danzig = st.one(291, '1935-01-01');
  st.carve(255, danzig, '1939-09-01', WWII_END, { gw: 'DANZIG' });
  st.add(danzig, { gw: 'DANZIG', s: '1939-09-01', e: WWII_END });

  // Teilung Polens (Grenzvertrag 28.9.1939; Eingliederungserlasse Okt./Nov. 1939)
  st.carve(290, ctx.ref('LTU'), '1939-09-29', '1939-10-27', { gw: 'PL-SU' });
  st.carve(290, ctx.ref('LTU'), '1939-10-28', '1940-08-02', { gw: 368 }); // Wilna an Litauen
  st.carve(290, ctx.ref('LTU'), '1940-08-03', WWII_END, { gw: 365 });
  st.carve(290, SOVIET_SIDE_1939, '1939-09-29', WWII_END, { gw: 'PL-SU' });
  st.carve(290, ANNEXED_SIDE_1939, '1939-09-29', WWII_END, { gw: 'PL-DE' });
  st.setProps(290, '1939-09-29', WWII_END, { gw: 'GG' });

  // Sudetenland und Erster Wiener Schiedsspruch: in CShapes Teil des Reichs bzw. Ungarns,
  // hier als annektierte Gebiete gekennzeichnet
  const sudeten = difference(st.largest(255, '1939-01-01'), st.largest(255, '1937-01-01'));
  st.carve(255, sudeten, '1938-09-30', WWII_END, { gw: 'SUDETEN' });
  const felvidek = difference(st.largest(310, '1939-01-01'), st.largest(310, '1937-01-01'));
  st.carve(310, felvidek, '1938-11-02', '1947-02-09', { gw: 'FELVIDEK' });

  // Baltikum: 1940 von der UdSSR annektiert, von den meisten westlichen Staaten nie anerkannt
  // (Grenzen der Sowjetrepubliken wie 1991, d. h. ohne die 1944/45 an die RSFSR abgetretenen Randgebiete)
  for (const [key, gw] of [[366, 'EST-SU'], [367, 'LAT-SU'], [368, 'LIT-SU']]) {
    st.carve(365, st.largest(key, '1991-10-01'), '1940-08-03', '1991-09-05', { gw });
  }

  // Nordsiebenbürgen an Ungarn (rechtlich bis zum Pariser Frieden 1947, wie die Erste Wiener Schiedsspruch-Grenze in CShapes)
  st.carve(360, NORTH_TRANSYLVANIA, '1940-08-30', '1947-02-09', { gw: 'NSIEB' });

  // Elsass-Lothringen: faktische Annexion ab August 1940 bis zur Befreiung (Straßburg 23.11.1944)
  st.carve(220, ALSACE_LORRAINE, '1940-08-07', '1944-11-22', { gw: 'ELSASS' });

  // Aufteilung Jugoslawiens nach der Kapitulation (17./18.4.1941)
  const Y0 = '1941-04-18';
  const Y1 = '1945-05-08';
  const slovenia = ctx.ref('SVN');
  st.carve(345, intersect(slovenia, SLOVENIA_GERMAN_PART), Y0, Y1, { gw: 'SLO-DE' });
  st.carve(345, slovenia, Y0, Y1, { gw: 'SLO-IT' });
  st.carve(345, BACKA_BARANJA, Y0, Y1, { gw: 'BACSKA' });
  st.carve(345, union([ctx.ref('HRV'), ctx.ref('BIH')]), Y0, Y1, { gw: 'NDH' });
  st.carve(345, intersect(ctx.ref('SRB'), SYRMIA), Y0, Y1, { gw: 'NDH' });
  st.carve(345, intersect(ctx.ref('KOS'), SOUTH_KOSOVO), Y0, Y1, { gw: 339 });
  st.carve(345, intersect(ctx.ref('MKD'), WEST_MACEDONIA), Y0, Y1, { gw: 339 });
  st.carve(345, ctx.ref('MKD'), Y0, Y1, { gw: 'MAK-BG' });
  st.carve(345, intersect(ctx.ref('SRB'), SOUTHEAST_SERBIA), Y0, Y1, { gw: 'MAK-BG' });
  st.carve(345, ctx.ref('MNE'), Y0, Y1, { gw: 'MONTENEGRO' });
  st.setProps(345, Y0, Y1, { gw: 'SERBIEN' });

  // Ostmakedonien und Westthrakien: bulgarisch annektiert (14.5.1941) bis zum Rückzug (Okt. 1944)
  st.carve(350, BULGARIAN_GREECE, '1941-05-14', '1944-10-25', { gw: 'THRAKIEN-BG' });
}

