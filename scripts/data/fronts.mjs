// Machtbereich der Achsenmächte zu Stichtagen (gilt jeweils bis zum nächsten Stichtag).
// Pro Stichtag: besetzte Gebiete (zusätzlich zu den Staatsgebieten der Achsenmächte und
// ihren Annexionen) sowie die Fronten, deren alliierte Seite abgezogen wird.
//
// Bereichsangabe: { keys: [Gebietsschlüssel], clip?: Form }  – Form siehe 05-overlays.mjs:
//   ['west', Linie] | ['east', Linie] | ['box', [W, S, O, N]] | ['poly', [[lat, lon], …]]
import * as L from './fronts-lines.mjs';
import { GERMAN_SOVIET_LINE_1939 } from './patches/ww2.mjs';

const USSR = ['365', 'PL-SU', 'EST-SU', 'LAT-SU', 'LIT-SU'];
const box = (b) => ['box', b];
const CHANNEL_ISLANDS = { keys: ['200'], clip: box([-2.8, 49.1, -2.0, 49.75]) };
const SARDINIA_CORSICA = ['box', [7.8, 38.8, 10.0, 43.1]];

// Hybride Ostfront Ende Juli 1944: Norden wie im September, Süden (Rumänien) wie im Juni
const EAST_1944_08_01 = [
  ...L.EAST['1944-09-15'].slice(0, L.EAST['1944-09-15'].findIndex(([la, lo]) => la === 50.0 && lo === 21.6) + 1),
  [49.6, 22.4], [49.2, 23.4], [48.9, 24.2], [48.6, 24.7],
  ...L.EAST['1944-06-22'].slice(L.EAST['1944-06-22'].findIndex(([la, lo]) => la === 48.3 && lo === 25.1)),
];

const EAST_1945_02_15 = [
  [59.5, 21.0], [58.6, 21.6], [57.95, 22.0], [57.75, 22.9], [57.3, 23.4], [56.97, 23.15], [56.75, 22.75],
  [56.55, 22.35], [56.4, 21.85], [56.25, 21.2], [56.1, 21.0], [55.9, 20.6], [55.1, 20.6], [54.95, 21.0],
  [54.7, 20.9], [54.5, 20.6], [54.4, 20.2], [54.4, 19.9], [54.3, 19.7], [54.25, 19.5], [54.0, 19.0],
  [53.5, 18.6], [53.3, 17.5], [53.27, 16.5], [53.0, 15.6], [52.6, 14.6], [52.35, 14.55], [51.66, 15.6],
  [51.3, 15.3], [51.0, 15.5], [50.7, 16.6], [50.67, 17.9], [50.3, 18.2], [50.09, 18.22], [49.9, 18.6],
  [49.4, 19.0], [49.1, 20.0], [48.7, 19.4], [48.3, 19.0], [47.9, 18.7], [47.6, 18.6], [47.2, 18.3],
  [46.95, 18.0], [46.8, 17.6], [46.5, 17.4], [46.0, 17.5], [45.6, 18.6], [45.1, 19.3], [44.8, 19.0],
  [44.4, 18.5], [43.9, 18.0], [43.4, 17.8], [43.0, 17.5], [42.9, 17.5], [42.7, 17.3],
];

// Kurländischer Kessel: in den Linien bis Kriegsende enthalten
const COURLAND = ['poly', [[57.9, 21.0], [57.75, 22.8], [57.0, 23.3], [56.75, 22.75], [56.4, 21.85], [56.1, 20.9]]];

export const EUROPE = {
  bbox: [-32, 0, 72, 76],
  end: '1945-05-08',
  snapshots: [
    { d: '1939-09-01', occupied: [] },
    { d: '1939-09-08', occupied: [{ keys: ['290'], clip: ['west', L.POLAND_1939_09_08] }], lines: [L.POLAND_1939_09_08] },
    { d: '1939-09-17', occupied: [{ keys: ['290'], clip: ['west', GERMAN_SOVIET_LINE_1939] }] },
    { d: '1939-09-29', occupied: [] },
    { d: '1940-04-09', occupied: [{ keys: ['390'] }, { keys: ['385'], clip: box([0, 57, 35, 64]) }] },
    {
      d: '1940-05-15', lines: [L.WEST_1940_05_15],
      occupied: [{ keys: ['390'] }, { keys: ['385'], clip: box([0, 57, 35, 66.5]) }, { keys: ['210', '212'] }, { keys: ['211', '220'], clip: ['east', L.WEST_1940_05_15] }],
    },
    {
      d: '1940-05-21', lines: [L.WEST_1940_05_21],
      occupied: [{ keys: ['390'] }, { keys: ['385'], clip: box([0, 57, 35, 66.5]) }, { keys: ['210', '212'] }, { keys: ['211', '220'], clip: ['east', L.WEST_1940_05_21] }],
    },
    {
      d: '1940-06-04', lines: [L.WEST_1940_06_04],
      occupied: [{ keys: ['390'] }, { keys: ['385'], clip: box([0, 57, 35, 66.5]) }, { keys: ['210', '212', '211'] }, { keys: ['220'], clip: ['east', L.WEST_1940_06_04] }],
    },
    {
      d: '1940-06-10', lines: [L.WEST_1940_06_04],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['east', L.WEST_1940_06_04] }],
    },
    {
      d: '1940-06-14', lines: [L.WEST_1940_06_14],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['east', L.WEST_1940_06_14] }],
    },
    {
      d: '1940-06-22', lines: [L.DEMARCATION_FRANCE],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS],
    },
    {
      d: '1940-08-19', lines: [L.DEMARCATION_FRANCE],
      occupied: [{ keys: ['390', '385', '210', '212', '211', '521'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS],
    },
    {
      d: '1941-02-07', lines: [L.DEMARCATION_FRANCE], africa: L.AFRICA_EAST_OF['1941-02-07'],
      occupied: [{ keys: ['390', '385', '210', '212', '211', '521'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS],
    },
    {
      d: '1941-03-16', lines: [L.DEMARCATION_FRANCE], africa: L.AFRICA_EAST_OF['1941-02-07'],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS],
    },
    {
      d: '1941-04-11', lines: [L.DEMARCATION_FRANCE], africa: L.AFRICA_EAST_OF['1941-04-11'],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS],
    },
    {
      d: '1941-04-18', lines: [L.DEMARCATION_FRANCE], africa: L.AFRICA_EAST_OF['1941-04-11'],
      occupied: [{ keys: ['390', '385', '210', '212', '211'] }, { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] }, CHANNEL_ISLANDS, { keys: ['350'], clip: box([19, 39.4, 27, 42]) }],
    },
    ...[
      // Ab Mai 1941: Westeuropa, Griechenland besetzt; Ostfront je nach Stichtag
      ['1941-04-30', null, '1941-04-11'],
      ['1941-06-22', null, '1941-04-11'],
      ['1941-07-10', '1941-07-10', '1941-04-11'],
      ['1941-09-30', '1941-09-30', '1941-04-11'],
      ['1941-12-05', '1941-12-05', '1941-04-11'],
      ['1941-12-24', '1941-12-05', '1941-12-24'],
      ['1942-02-06', '1941-12-05', '1942-02-06'],
      ['1942-06-30', '1942-06-30', '1942-06-30'],
    ].map(([d, east, africa]) => ({
      d,
      east: east && L.EAST[east],
      africa: L.AFRICA_EAST_OF[africa],
      lines: [L.DEMARCATION_FRANCE, ...(east ? [L.EAST[east]] : [])],
      occupied: [
        { keys: ['390', '385', '210', '212', '211', '350'] },
        { keys: ['220'], clip: ['demarcation', L.DEMARCATION_FRANCE] },
        CHANNEL_ISLANDS,
        ...(east ? [{ keys: USSR }] : []),
        ...(africa === '1942-06-30' ? [{ keys: ['651'], clip: box([24.0, 26.0, 28.9, 32.0]) }] : []),
      ],
    })),
    ...[
      // Ab November 1942: ganz Frankreich besetzt, Brückenkopf Tunesien
      ['1942-11-11', '1942-06-30', '1942-11-15', true],
      ['1942-11-18', '1942-11-18', '1942-11-15', true],
      ['1942-12-15', '1942-11-18', '1942-12-15', true],
      ['1943-01-23', '1942-11-18', '1943-01-23', true],
      ['1943-02-15', '1942-11-18', null, true],
      ['1943-03-31', '1943-03-31', null, true],
      ['1943-05-13', '1943-03-31', null, false],
    ].map(([d, east, africa, tunisia]) => ({
      d,
      east: L.EAST[east],
      africa: africa ? L.AFRICA_EAST_OF[africa] : 9.3,
      lines: [L.EAST[east], ...(tunisia ? [L.TUNISIA_LINE] : [])],
      occupied: [
        { keys: ['390', '385', '210', '212', '211', '350', '220'] },
        CHANNEL_ISLANDS,
        { keys: USSR },
        ...(tunisia ? [{ keys: ['616'], clip: ['tunisia', L.TUNISIA_LINE] }] : []),
      ],
    })),
    ...[
      // Ab Juli 1943: Sizilien, Kapitulation Italiens, Front in Italien
      ['1943-07-31', '1943-03-31', '1943-07-31', false],
      ['1943-08-17', '1943-03-31', '1943-08-17', false],
      ['1943-09-10', '1943-03-31', '1943-09-30', true],
      ['1943-12-31', '1943-12-31', '1943-12-31', true],
    ].map(([d, east, italy, italyOccupied]) => ({
      d,
      east: L.EAST[east],
      italy: L.ITALY[italy],
      africa: 9.3,
      allied: italyOccupied ? [SARDINIA_CORSICA] : [],
      lines: [L.EAST[east], L.ITALY[italy]],
      occupied: [
        { keys: ['390', '385', '210', '212', '211', '350', '220'] },
        CHANNEL_ISLANDS,
        { keys: USSR },
        ...(italyOccupied ? [{ keys: ['325', 'SLO-IT', 'MONTENEGRO'] }] : []),
      ],
    })),
    ...[
      // 1944/45: Westfront, Zusammenbruch im Osten
      ['1944-06-06', '1943-12-31', '1943-12-31', { normandy: '1944-06-06' }, true],
      ['1944-06-22', '1944-06-22', '1944-06-30', { normandy: '1944-06-30' }, true],
      ['1944-08-01', EAST_1944_08_01, '1944-06-30', { normandy: '1944-07-31' }, true],
      ['1944-08-25', EAST_1944_08_01, '1944-06-30', { normandy: '1944-08-25', provence: '1944-08-25' }, true],
      ['1944-09-15', '1944-09-15', '1944-09-30', { west: '1944-09-15' }, true],
      ['1944-11-01', '1944-09-15', '1944-09-30', { west: '1944-09-15' }, false],
      ['1944-12-15', '1944-12-31', '1944-12-31', { west: '1944-12-15' }, false],
      ['1945-02-15', EAST_1945_02_15, '1944-12-31', { west: '1944-12-15' }, false],
      ['1945-03-31', EAST_1945_02_15, '1944-12-31', { west: '1945-03-31' }, false],
      ['1945-04-15', '1945-04-15', '1945-04-21', { west: '1945-04-15' }, false],
    ].map(([d, east, italy, westSpec, greece]) => {
      const eastLine = Array.isArray(east) ? east : L.EAST[east];
      const westLine = westSpec.west ? L.WEST[westSpec.west] : null;
      const allied = [SARDINIA_CORSICA];
      if (westSpec.normandy) allied.push(['poly', L.NORMANDY[westSpec.normandy]]);
      if (westSpec.provence) allied.push(['poly', L.PROVENCE[westSpec.provence]]);
      return {
        d,
        east: eastLine,
        west: westLine,
        italy: L.ITALY[italy],
        africa: 9.3,
        allied,
        lines: [eastLine, L.ITALY[italy], ...(westLine ? [westLine] : [])],
        occupied: [
          { keys: ['390', '385', '210', '212', '211', '220', '325', 'SLO-IT', 'MONTENEGRO', ...(greece ? ['350'] : [])] },
          CHANNEL_ISLANDS,
          { keys: USSR },
          { keys: ['LAT-SU'], clip: COURLAND },
        ],
      };
    }),
  ],
};

// --- Asien und Pazifik ------------------------------------------------------------------------
const CHINA = ['710'];
const BURMA_SOUTH_OF = (lat) => ({ keys: ['775'], clip: box([90, 5, 102, lat]) });

export const ASIA = {
  bbox: [60, -15, 200, 62],
  end: '1945-09-02',
  snapshots: [
    { d: '1937-07-07', occupied: [] },
    { d: '1937-12-31', occupied: [{ keys: CHINA, clip: ['northeast', L.CHINA['1937-12-31']] }], lines: [L.CHINA['1937-12-31']] },
    { d: '1938-10-31', occupied: [{ keys: CHINA, clip: ['northeast', L.CHINA['1938-10-31']] }, { keys: CHINA, clip: ['poly', L.CANTON] }], lines: [L.CHINA['1938-10-31']] },
    ...[
      ['1939-02-10', []],
      ['1940-09-22', [{ keys: ['815'], clip: box([102, 20.3, 108, 23.5]) }]],
      ['1941-07-28', [{ keys: ['815', '811', '812'] }]],
      ['1941-12-25', [{ keys: ['815', '811', '812', 'HKG', 'GUM', 'KIR'] }, { keys: ['821', '822'], clip: box([99, 4.0, 105, 7.0]) }, { keys: ['840'], clip: box([119, 13.5, 123, 19]) }]],
      ['1942-03-08', [
        { keys: ['815', '811', '812', 'HKG', 'GUM', 'KIR', '821', '822', '827', '823', '824', '835', '850', '860', '840'] },
        BURMA_SOUTH_OF(18),
        { keys: ['912'], clip: box([148, -7, 153.5, -3.5]) },
        { keys: ['750'], clip: box([92, 6.5, 94.5, 14]) },
      ]],
      ['1942-06-30', [
        { keys: ['815', '811', '812', 'HKG', 'GUM', 'KIR', '821', '822', '827', '823', '824', '835', '850', '860', '840', '775', '940'] },
        { keys: ['912'], clip: box([142, -8, 153.5, -2]) },
        { keys: ['750'], clip: box([92, 6.5, 94.5, 14]) },
        { keys: ['3'], clip: box([172, 51, 178.5, 53.2]) },
      ]],
      ['1943-02-09', [
        { keys: ['815', '811', '812', 'HKG', 'GUM', 'KIR', '821', '822', '827', '823', '824', '835', '850', '860', '840', '775'] },
        { keys: ['940'], clip: box([154, -8.5, 159.5, -5]) },
        { keys: ['912'], clip: box([142, -8, 153.5, -2]) },
        { keys: ['750'], clip: box([92, 6.5, 94.5, 14]) },
        { keys: ['3'], clip: box([172, 51, 178.5, 53.2]) },
      ]],
      ['1943-11-30', [
        { keys: ['815', '811', '812', 'HKG', 'GUM', '821', '822', '827', '823', '824', '835', '850', '860', '840', '775'] },
        { keys: ['912'], clip: box([142, -6.5, 153.5, -2]) },
        { keys: ['750'], clip: box([92, 6.5, 94.5, 14]) },
      ]],
    ].map(([d, extra]) => ({
      d,
      lines: [L.CHINA['1938-10-31']],
      occupied: [
        { keys: CHINA, clip: ['northeast', L.CHINA['1938-10-31']] },
        { keys: CHINA, clip: ['poly', L.CANTON] },
        { keys: CHINA, clip: box([108.5, 18.0, 111.2, 20.2]) },
        ...extra,
      ],
    })),
    ...[
      ['1944-08-15', '1938-10-31', 26, [['box', [144.5, 13.0, 146.5, 15.5]], ['box', [161, 4, 173, 15]], ['box', [130.5, -9, 141.1, -0.5]]], []],
      ['1944-12-31', '1944-12-31', 24.5, [['box', [144.5, 13.0, 146.5, 15.5]], ['box', [161, 4, 173, 15]], ['box', [130.5, -9, 141.1, -0.5]], ['box', [134, 6.8, 134.8, 8.2]], ['box', [124.2, 9.9, 126.2, 12.6]]], []],
      ['1945-03-31', '1944-12-31', 21, [['box', [144.5, 13.0, 146.5, 15.5]], ['box', [161, 4, 173, 15]], ['box', [130.5, -9, 141.1, -0.5]], ['box', [134, 6.8, 134.8, 8.2]], ['box', [119, 9.9, 127, 19]], ['box', [141.2, 24.6, 141.45, 24.95]]], []],
      ['1945-06-30', '1944-12-31', 16, [['box', [144.5, 13.0, 146.5, 15.5]], ['box', [161, 4, 173, 15]], ['box', [130.5, -9, 141.1, -0.5]], ['box', [134, 6.8, 134.8, 8.2]], ['box', [116, 4, 127, 19]], ['box', [141.2, 24.6, 141.45, 24.95]], ['box', [126.5, 24.0, 131.5, 28.6]]], []],
      ['1945-08-15', '1944-12-31', 16, [['box', [144.5, 13.0, 146.5, 15.5]], ['box', [161, 4, 173, 15]], ['box', [130.5, -9, 141.1, -0.5]], ['box', [134, 6.8, 134.8, 8.2]], ['box', [116, 4, 127, 19]], ['box', [141.2, 24.6, 141.45, 24.95]], ['box', [126.5, 24.0, 131.5, 28.6]], ['box', [115, 38, 121, 54]], ['box', [115, 47, 136, 54]], ['box', [129, 41.5, 136, 47]]], []],
    ].map(([d, china, burma, allied]) => ({
      d,
      lines: [L.CHINA[china]],
      allied,
      occupied: [
        { keys: CHINA, clip: ['northeast', L.CHINA[china]] },
        { keys: CHINA, clip: ['poly', L.CANTON] },
        { keys: CHINA, clip: box([108.5, 18.0, 111.2, 20.2]) },
        { keys: ['815', '811', '812', 'HKG', '821', '822', '827', '823', '824', '835', '850', '860', '840'] },
        BURMA_SOUTH_OF(burma),
        { keys: ['912'], clip: box([142, -6.5, 153.5, -2]) },
        { keys: ['750'], clip: box([92, 6.5, 94.5, 14]) },
      ],
    })),
  ],
};

// Achsenmächte und Verbündete je Zeitraum (für das Staatsgebiet im Machtbereich)
export const AXIS_STATES = [
  ['255', '1933-01-30', '1945-05-08'],
  ['325', '1936-10-25', '1943-09-08'],
  ['740', '1937-07-07', '1945-09-02'],
  ['310', '1940-11-20', '1945-05-08'],
  ['360', '1940-11-23', '1944-08-23'],
  ['355', '1941-03-01', '1944-09-08'],
  ['SLOWAKEI', '1939-03-15', '1945-05-08'],
  ['NDH', '1941-04-10', '1945-05-08'],
  ['375', '1941-06-25', '1944-09-19'],
  ['800', '1942-01-25', '1945-08-15'],
  ['MANCHU', '1932-03-01', '1945-08-19'],
];
