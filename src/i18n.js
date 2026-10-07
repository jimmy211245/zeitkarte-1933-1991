// Sprachumschaltung Deutsch/Englisch. Die deutschen Texte im Code sind zugleich der Schlüssel:
// t('Liste') liefert auf Deutsch den Text selbst, auf Englisch den Eintrag aus EN (fehlt er, bleibt
// es deutsch). Die Sprache gilt für die ganze Sitzung; der Umschalter lädt die Seite neu, damit
// alle Ansichten, Karte und Zeitband in einem Zug in der neuen Sprache entstehen.
// Ereignis- und Gebietstexte sowie Kartenbeschriftungen liegen nur auf Deutsch vor.

const SUPPORTED = ['de', 'en'];

function detect() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(q)) return q;
    const saved = localStorage.getItem('lang');
    if (SUPPORTED.includes(saved)) return saved;
  } catch { /* privat */ }
  return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
}

export const LANG = detect();
export const LOCALE = LANG === 'en' ? 'en-GB' : 'de-DE';

const EN = {
  // Kopfzeile
  'Historische Karte': 'Historical map',
  'Liste einblenden': 'Show list',
  'Liste': 'List',
  'Kartenansicht': 'Map view',
  'Staaten': 'States',
  'Bündnisse': 'Alliances',
  'Schwerpunkt wählen: Liste, Karte und Zeitband auf ein Thema beschränken': 'Choose a focus: limit list, map and timeline to one topic',
  'Schwerpunkt': 'Focus',
  'Ebenen': 'Layers',
  'Ereignisse': 'Events',
  'Gebietsänderungen hervorheben': 'Highlight territorial changes',
  'Fronten und Besatzung (ungefähr)': 'Fronts and occupation (approximate)',
  'Binnengrenzen (Bundesländer, Teilrepubliken …)': 'Internal borders (states, republics …)',
  'Städte (Nahost, Deutschland)': 'Cities (Middle East, Germany)',
  'Flüsse und Seen': 'Rivers and lakes',
  'Über diese Karte': 'About this map',
  'Über': 'About',
  'Sprache': 'Language',
  'Zeitkarte': 'Timeline Map',
  'Von der Machtübernahme Hitlers bis zum Ende des Kalten Krieges': 'From Hitler’s rise to power to the end of the Cold War',
  // Seitenleiste
  'Ereignisse und Gebietsänderungen': 'Events and territorial changes',
  'Gebietsänderungen': 'Territorial changes',
  'Liste ausblenden, um die ganze Karte zu sehen': 'Hide the list to see the whole map',
  'Liste ausblenden': 'Hide list',
  'Suchen, z. B. Stalingrad': 'Search, e.g. Stalingrad',
  'Suchen, z. B. Sudetenland': 'Search, e.g. Sudetenland',
  'Keine Treffer': 'No results',
  'Keine Treffer. Suchbegriff ändern oder Filter zurücksetzen.': 'No results. Change the search term or reset the filter.',
  'Legende': 'Legend',
  'Karte wird geladen …': 'Loading map …',
  'Schwerpunkt aufheben': 'Clear focus',
  'Kein Schwerpunkt': 'No focus',
  'Alle Ereignisse und Gebietsänderungen': 'All events and territorial changes',
  'von': 'of',
  'Schließen': 'Close',
  'ca.': 'approx.',
  // Detailansicht
  'Die Karte zeigt den Plan schematisch, nachgezeichnet nach einer zeitgenössischen Karte; Linien können um einige Kilometer abweichen.': 'The map shows the plan schematically, redrawn from a contemporary map; lines may deviate by a few kilometres.',
  'Plan auf der Karte zeigen': 'Show plan on map',
  'Auf der Karte zeigen': 'Show on map',
  'Gebiet zeigen': 'Show area',
  'bisher': 'before',
  'danach': 'after',
  'Fläche': 'Area',
  'Hauptstadt': 'Capital',
  'Grenzen': 'Borders',
  'vor 1933': 'before 1933',
  'nach 1991': 'after 1991',
  'bis': 'to',
  'durch': 'by',
  // Zeitleiste und Steuerung
  'Vorheriges Ereignis (Bild↑)': 'Previous event (Page Up)',
  'Nächstes Ereignis (Bild↓)': 'Next event (Page Down)',
  'Abspielen (Leertaste)': 'Play (Space)',
  'Anhalten (Leertaste)': 'Pause (Space)',
  'Geschwindigkeit': 'Speed',
  '1 Woche/s': '1 week/s',
  '1 Monat/s': '1 month/s',
  '3 Monate/s': '3 months/s',
  '1 Jahr/s': '1 year/s',
  'Zeitband: ziehen, um die Zeit zu verschieben; Mausrad zum Zoomen': 'Timeline: drag to move through time; mouse wheel to zoom',
  // Legende
  'UN-Teilungsplan 1947 (schematisch)': 'UN Partition Plan 1947 (schematic)',
  'Peel-Plan 1937 (schematisch)': 'Peel Plan 1937 (schematic)',
  'Jüdischer Staat': 'Jewish state',
  'Arabischer Staat': 'Arab state',
  'Arabischer Staat (mit Transjordanien)': 'Arab state (with Transjordan)',
  'Jerusalem unter UN-Verwaltung': 'Jerusalem under UN administration',
  'Britisches Mandat': 'British mandate',
  'Unabhängiger Staat': 'Independent state',
  'Kolonie, Protektorat, Mandat (Farbe der Kolonialmacht)': 'Colony, protectorate, mandate (colour of the colonial power)',
  'Annektiert oder unter Besatzungsverwaltung': 'Annexed or under occupation administration',
  'Satellitenstaat': 'Satellite state',
  'Abhängiges Gebiet (Farbe der Kolonialmacht)': 'Dependent territory (colour of the colonial power)',
  'Ausgewählte Gebietsänderung': 'Selected territorial change',
  'Von den Achsenmächten besetzt (ungefähr)': 'Occupied by the Axis powers (approximate)',
  'Von den Alliierten erobertes Achsengebiet': 'Axis territory conquered by the Allies',
  'Frontlinie (ungefähr)': 'Front line (approximate)',
  'Binnengrenze (Bundesland, Teilrepublik …)': 'Internal border (state, republic …)',
  'Ereignis (verblasst mit der Zeit)': 'Event (fades over time)',
  'Stadt (ab mittlerer Zoomstufe)': 'City (from medium zoom)',
  // Kategorien
  'Politik': 'Politics',
  'Krieg und Militär': 'War and military',
  'Verträge und Konferenzen': 'Treaties and conferences',
  'Verfolgung und Völkermord': 'Persecution and genocide',
  'Krisen des Kalten Krieges': 'Cold War crises',
  'Aufstände und Revolutionen': 'Uprisings and revolutions',
  'Dekolonisierung': 'Decolonisation',
  'Wissenschaft und Technik': 'Science and technology',
  'Annexion': 'Annexation',
  'Besetzung oder Verwaltung': 'Occupation or administration',
  'Gebietswechsel': 'Change of territory',
  'Unabhängigkeit': 'Independence',
  'Wiederherstellung': 'Restoration',
  'Umbenennung': 'Renaming',
  'Statusänderung': 'Change of status',
  // Epochen
  'NS-Diktatur und Vorkriegszeit': 'Nazi dictatorship and pre-war period',
  'Vorkriegszeit': 'Pre-war',
  'Zweiter Weltkrieg': 'Second World War',
  'Nachkriegszeit und Blockbildung': 'Post-war period and formation of blocs',
  'Nachkriegszeit': 'Post-war',
  'Konfrontation im Kalten Krieg': 'Cold War confrontation',
  'Konfrontation': 'Confrontation',
  'Entspannungspolitik': 'Détente',
  'Entspannung': 'Détente',
  'Neue Konfrontation': 'New confrontation',
  'Ende des Kalten Krieges': 'End of the Cold War',
  // Status
  'unabhängiger Staat': 'independent state',
  'Kolonie': 'colony',
  'Protektorat': 'protectorate',
  'Mandatsgebiet des Völkerbunds': 'League of Nations mandate',
  'UN-Treuhandgebiet': 'UN trust territory',
  'abhängiges Gebiet': 'dependent territory',
  'Kondominium': 'condominium',
  'Teil des Mutterlandes': 'part of the mother country',
  'annektiert': 'annexed',
  'unter fremder Verwaltung': 'under foreign administration',
  'besetzt': 'occupied',
  'international nicht anerkannt': 'not internationally recognised',
  // Bündnisse
  'Achsenmächte und Verbündete': 'Axis powers and allies',
  'Alliierte': 'Allies',
  'Neutral': 'Neutral',
  'Mit dem Westen verbündet': 'Allied with the West',
  'Warschauer Pakt / Ostblock': 'Warsaw Pact / Eastern Bloc',
  'Andere kommunistische Staaten': 'Other communist states',
  'Blockfreie Staaten (Näherung)': 'Non-aligned states (approximation)',
  'Sonstige': 'Other',
  // Schwerpunkte
  'Nahostkonflikt': 'Middle East conflict',
  'Nahost': 'Middle East',
  'Mandat Palästina, Israel und seine Nachbarn, Kriege und Friedensschlüsse': 'Mandate Palestine, Israel and its neighbours, wars and peace treaties',
  'Deutsche Teilung': 'Division of Germany',
  'Deutschland': 'Germany',
  'Besatzungszonen, zwei deutsche Staaten, Mauer und Wiedervereinigung 1945–1990': 'Occupation zones, two German states, the Wall and reunification 1945–1990',
};

/** Übersetzt einen deutschen Text; ohne Eintrag bleibt er unverändert */
export const t = (de) => (LANG === 'en' ? EN[de] ?? de : de);

/** Ersetzt in einem deutschen Satz mit Platzhaltern {n} die Werte; Englisch über Vorlage `en` */
export const tf = (de, en, vars = {}) =>
  (LANG === 'en' ? en : de).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

// Zahlen im Format der Sprache
export const fmtNumber = (n) => Number(n).toLocaleString(LOCALE);

// Statischen Text in index.html übersetzen: Textknoten und Attribute title, aria-label, placeholder
export function translateDocument(root = document.body) {
  document.documentElement.lang = LANG;
  if (LANG !== 'en') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const s = n.nodeValue.trim();
    if (s && EN[s]) n.nodeValue = n.nodeValue.replace(s, EN[s]);
  }
  for (const el of root.querySelectorAll('[title],[aria-label],[placeholder]')) {
    for (const a of ['title', 'aria-label', 'placeholder']) {
      const v = el.getAttribute(a);
      if (v && EN[v]) el.setAttribute(a, EN[v]);
    }
  }
  document.title = 'Timeline Map 1933–1991';
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Interactive map of territorial changes and events from Hitler’s rise to power to the end of the Cold War.',
  );
}

/** Sprachumschalter (DE | EN): merkt die Wahl, setzt ?lang= und lädt die Seite neu (Hash bleibt) */
export function setupLangSwitch(container) {
  for (const btn of container.querySelectorAll('[data-lang]')) {
    btn.setAttribute('aria-checked', String(btn.dataset.lang === LANG));
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === LANG) return;
      try { localStorage.setItem('lang', lang); } catch { /* privat */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      location.replace(url);
    });
  }
}
