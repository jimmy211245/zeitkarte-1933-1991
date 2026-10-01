// Inseln und Gebiete, die in CShapes fehlen, werden aus Natural Earth ergänzt.
// Standard: Zuordnung zum nächstgelegenen Staat (zeitabhängig). Für Gegenden, in denen
// "nächstgelegen" falsch wäre, gelten diese Regeln (erste passende Regel gewinnt).
// bbox = [West, Süd, Ost, Nord]; periods = [[von, bis, Schlüssel], ...]
// Schlüssel: CShapes-gwcode (Zahl) oder ein eigener Gebietsschlüssel (Text).

const ALL = ['1886-01-01', '2019-12-31'];
const always = (key) => [[...ALL, key]];

// Große Gebiete werden zuerst angelegt, damit kleine Nachbarinseln per "nächstgelegen" folgen.
export const MAJOR_RULES = [
  { name: 'Grönland', bbox: [-74, 59, -11, 84], minArea: 100000, periods: always('GRL') },
  { name: 'Spitzbergen', bbox: [10, 76, 34, 81], minArea: 5000, periods: always(385) },
  { name: 'Franz-Josef-Land', bbox: [44, 79.5, 66, 82], minArea: 500, periods: always(365) },
  { name: 'Sewernaja Semlja', bbox: [89, 77.5, 108, 81.5], minArea: 1000, periods: always(365) },
  { name: 'Tschukotka östl. 180°', bbox: [-180, 64, -168.8, 72], minArea: 50000, periods: always(365) },
];

export const RULES = [
  // Europa
  { name: 'Färöer', bbox: [-7.8, 61.3, -6.2, 62.45], periods: always('FRO') },
  { name: 'Isle of Man', bbox: [-4.9, 54.0, -4.25, 54.45], periods: always(200) },
  { name: 'Kanalinseln', bbox: [-2.8, 49.1, -2.0, 49.75], periods: always(200) },
  { name: 'Åland', bbox: [19.2, 59.7, 21.2, 60.6], periods: always(375) },
  { name: 'Jan Mayen', bbox: [-9.2, 70.7, -7.8, 71.2], periods: always(385) },
  { name: 'Imbros und Tenedos', bbox: [25.6, 39.7, 26.15, 40.3], periods: always(640) },
  { name: 'Marmarameer-Inseln', bbox: [27.3, 40.3, 29.6, 41.1], periods: always(640) },
  { name: 'Inseln bei Ayvalık', bbox: [26.55, 39.2, 26.85, 39.45], periods: always(640) },
  { name: 'Inseln im Golf von Izmir', bbox: [26.55, 38.3, 27.1, 38.7], periods: always(640) },
  { name: 'Ägäische Inseln', bbox: [19.3, 34.7, 28.5, 41.2], periods: always(350) },
  { name: 'Pantelleria', bbox: [11.85, 36.7, 12.1, 36.9], periods: always(325) },
  { name: 'Pelagische Inseln', bbox: [12.3, 35.4, 12.9, 35.9], periods: always(325) },
  { name: 'Kastelorizo', bbox: [29.4, 36.0, 29.7, 36.25], periods: always(350) },
  // Atlantik
  { name: 'Falklandinseln', bbox: [-61.6, -52.6, -57.4, -50.9], periods: always('FLK') },
  { name: 'Südgeorgien', bbox: [-38.5, -55.1, -35.5, -53.8], periods: always('FLK') },
  { name: 'Saint-Pierre und Miquelon', bbox: [-56.6, 46.7, -56.1, 47.2], periods: always('SPM') },
  { name: 'São Tomé und Príncipe', bbox: [6.3, -0.1, 7.6, 1.8], periods: always('STP') },
  { name: 'Feuerland-Inseln (Chile)', bbox: [-71, -56.5, -66.6, -54.9], periods: always(155) },
  // Karibik
  { name: 'Turks- und Caicosinseln', bbox: [-72.6, 21.0, -70.9, 22.1], periods: always('TCA') },
  { name: 'Bahamas', bbox: [-79.6, 20.8, -72.6, 27.5], periods: always(31) },
  { name: 'Kaimaninseln', bbox: [-81.5, 19.2, -79.7, 19.8], periods: always('CYM') },
  { name: 'Ambergris Caye', bbox: [-88.1, 17.0, -87.4, 18.25], periods: always(80) },
  { name: 'Amerikanische Jungferninseln', bbox: [-65.1, 17.6, -64.55, 18.42], periods: always('VIR') },
  { name: 'Britische Jungferninseln', bbox: [-64.85, 18.3, -64.25, 18.8], periods: always('VGB') },
  { name: 'Anguilla', bbox: [-63.2, 18.15, -62.95, 18.3], periods: always('KNA') },
  { name: 'Saint-Martin', bbox: [-63.2, 17.95, -62.95, 18.14], periods: always(65) },
  { name: 'St. Kitts und Nevis', bbox: [-62.9, 17.05, -62.5, 17.45], periods: always('KNA') },
  { name: 'Antigua und Barbuda', bbox: [-62.0, 16.9, -61.6, 17.75], periods: always('ATG') },
  { name: 'Montserrat', bbox: [-62.3, 16.6, -62.1, 16.85], periods: always('MSR') },
  { name: 'Dominica', bbox: [-61.55, 15.15, -61.2, 15.65], periods: always('DMA') },
  { name: 'St. Lucia', bbox: [-61.1, 13.65, -60.85, 14.15], periods: always('LCA') },
  { name: 'St. Vincent', bbox: [-61.3, 12.95, -61.05, 13.4], periods: always('VCT') },
  { name: 'Grenada', bbox: [-61.85, 11.95, -61.35, 12.55], periods: always('GRD') },
  { name: 'Niederländische Antillen', bbox: [-70.2, 11.9, -68.1, 12.7], periods: always('ANT') },
  // Indischer Ozean und Afrika
  { name: 'Seychellen', bbox: [55.2, -4.9, 56.0, -4.2], periods: always('SYC') },
  { name: 'Mayotte', bbox: [44.9, -13.1, 45.4, -12.55], periods: [['1886-01-01', '1946-10-26', 580], ['1946-10-27', '1975-07-05', 581], ['1975-07-06', '2019-12-31', 'MYT']] },
  { name: 'Pemba', bbox: [39.5, -5.6, 40.0, -4.8], periods: [['1886-01-01', '1964-04-25', 511], ['1964-04-26', '2019-12-31', 510]] },
  { name: 'Andamanen und Nikobaren', bbox: [92.0, 6.5, 94.5, 14.0], periods: always(750) },
  { name: 'Kerguelen', bbox: [68.5, -50, 70.6, -48.4], periods: always('ATF') },
  { name: 'Crozetinseln', bbox: [50.0, -46.6, 52.5, -45.9], periods: always('ATF') },
  { name: 'Prinz-Edward-Inseln', bbox: [37.5, -47.1, 38.1, -46.6], periods: always(560) },
  { name: 'Heard und Macquarie', bbox: [73, -55, 160, -52.5], periods: always(900) },
  { name: 'Weihnachtsinsel', bbox: [105.5, -10.65, 105.8, -10.35], periods: [['1886-01-01', '1946-03-31', 827], ['1946-04-01', '1958-09-30', 830], ['1958-10-01', '2019-12-31', 900]] },
  { name: 'Bubiyan', bbox: [47.9, 29.55, 48.45, 30.1], periods: always(690) },
  // Ost- und Südostasien
  { name: 'Kurilen', bbox: [145.4, 43.3, 156.8, 51.0], periods: [['1886-01-01', '1945-08-14', 740], ['1945-08-15', '2019-12-31', 365]] },
  { name: 'Kinmen', bbox: [118.2, 24.35, 118.55, 24.56], periods: [['1886-01-01', '1949-12-07', 710], ['1949-12-08', '2019-12-31', 713]] },
  { name: 'Hongkong', bbox: [113.8, 22.15, 114.45, 22.57], periods: always('HKG') },
  { name: 'Riau-Inseln', bbox: [103.2, -0.6, 105.0, 1.22], periods: always(850) },
  { name: 'Natuna und Anambas', bbox: [105.5, 2.0, 109.5, 5.0], periods: always(850) },
  { name: 'Talaud und Sangihe', bbox: [125.0, 2.5, 127.5, 4.8], periods: always(850) },
  { name: 'Langkawi', bbox: [99.6, 6.1, 99.95, 6.5], periods: [['1886-01-01', '1946-03-31', 822], ['1946-04-01', '2019-12-31', 820]] },
  // Pazifik
  { name: 'Guam', bbox: [144.55, 13.2, 145.0, 13.7], periods: always('GUM') },
  { name: 'Nördliche Marianen', bbox: [145.0, 14.0, 146.2, 20.6], periods: always('MNP') },
  { name: 'Palau', bbox: [134.0, 6.8, 134.8, 8.2], periods: always('PLW') },
  { name: 'Karolinen', bbox: [137.5, 4.5, 163.5, 10.5], periods: always('FSM') },
  { name: 'Marshallinseln', bbox: [165.0, 4.5, 172.5, 14.7], periods: always('MHL') },
  { name: 'Gilbert- und Line-Inseln', bbox: [-161, -5, -150, 6.5], periods: always('KIR') },
  { name: 'Westsamoa', bbox: [-172.9, -14.1, -171.3, -13.4], periods: always('WSM') },
  { name: 'Amerikanisch-Samoa', bbox: [-170.95, -14.45, -169.4, -14.1], periods: always('ASM') },
  { name: 'Tonga', bbox: [-176.3, -22.5, -173.5, -15.5], periods: always('TON') },
  { name: 'Niue', bbox: [-170.1, -19.3, -169.6, -18.8], periods: always(920) },
  { name: 'Neue Hebriden', bbox: [166.4, -20.4, 170.3, -13.0], periods: always('VUT') },
  { name: 'Santa-Cruz-Inseln', bbox: [165.5, -12.0, 167.5, -10.0], periods: always(940) },
  { name: 'Marquesas', bbox: [-141, -11, -138.3, -7.5], periods: always(960) },
  // Nordamerika
  { name: 'San-Juan-Inseln', bbox: [-123.25, 48.4, -122.75, 48.8], periods: always(2) },
  { name: 'Grand Manan', bbox: [-66.95, 44.55, -66.7, 44.8], periods: always(20) },
  { name: 'Haida Gwaii', bbox: [-133.2, 51.9, -131.0, 54.3], periods: always(20) },
  { name: 'St.-Lorenz-Insel', bbox: [-172.0, 62.8, -168.6, 63.9], periods: [['1886-01-01', '1959-01-02', 3], ['1959-01-03', '2019-12-31', 2]] },
  { name: 'Aleuten (West)', bbox: [172, 51, 180, 53.6], periods: [['1886-01-01', '1959-01-02', 3], ['1959-01-03', '2019-12-31', 2]] },
  { name: 'Aleuten (Ost)', bbox: [-180, 51, -164.5, 54.5], periods: [['1886-01-01', '1959-01-02', 3], ['1959-01-03', '2019-12-31', 2]] },
];
