// Schwerpunktthemen: einzige Stelle, die Themen definiert. Die App (src) und die Datenaufbereitung
// (scripts) importieren diese Datei; sie darf deshalb keine Browser- oder Vite-Abhängigkeiten haben.
//
// Neues Thema: hier eintragen, dann Ereignisse mit `themes: ['id']` und Gebietsänderungen in
// scripts/data/change-themes.mjs zuordnen und `npm run build:data` ausführen.
//   id           Schlüssel im Zustand (state.theme) und in der Adresse (?thema=id)
//   name         Anzeigename (Auswahl, Banner, Detailansicht)
//   shortName    kurzer Name für schmale Bildschirme
//   description  ein Satz zum Inhalt (Auswahlmenü)
//   viewBounds   Kartenausschnitt [[West, Süd], [Ost, Nord]] beim Einschalten; nur für die
//                Ansicht, die Zugehörigkeit von Ereignissen und Änderungen steht in deren `themes`
export const THEMES = {
  nahost: {
    id: 'nahost',
    name: 'Nahostkonflikt',
    shortName: 'Nahost',
    description: 'Mandat Palästina, Israel und seine Nachbarn, Kriege und Friedensschlüsse',
    viewBounds: [[31.6, 29.4], [37.2, 34.0]],
  },
  'deutsche-teilung': {
    id: 'deutsche-teilung',
    name: 'Deutsche Teilung',
    shortName: 'Deutschland',
    description: 'Besatzungszonen, zwei deutsche Staaten, Mauer und Wiedervereinigung 1945–1990',
    viewBounds: [[5.8, 47.2], [15.4, 55.1]],
  },
};

/** Thema zur ID oder null; nur eigene Schlüssel, nicht z. B. „toString“ */
export function getTheme(id) {
  return typeof id === 'string' && Object.hasOwn(THEMES, id) ? THEMES[id] : null;
}

/** Alle Themen in der Reihenfolge ihrer Definition */
export const themeList = () => Object.values(THEMES);

/** Gehört das Ereignis bzw. die Gebietsänderung zum Thema? */
export const itemHasTheme = (item, themeId) => !!item.themes?.includes(themeId);

/** Filterregel der App: ohne aktives Thema passt alles, sonst nur dessen Einträge */
export const matchesTheme = (item, themeId) => !themeId || itemHasTheme(item, themeId);

/** Themen eines Eintrags als Konfigurationen (unbekannte IDs werden übergangen) */
export const themesOf = (item) => (item.themes ?? []).map(getTheme).filter(Boolean);

/**
 * Prüft das Feld `themes` eines Eintrags (Datenaufbereitung): Liste bekannter, nicht doppelter IDs.
 * Fehlt das Feld, ist das in Ordnung. Gibt die Probleme als Texte zurück.
 */
export function themeProblems(themes) {
  if (themes === undefined) return [];
  if (!Array.isArray(themes)) return ['themes muss eine Liste sein'];
  const problems = [];
  const seen = new Set();
  for (const id of themes) {
    if (!getTheme(id)) problems.push(`unbekanntes Thema ${JSON.stringify(id)}`);
    else if (seen.has(id)) problems.push(`Thema ${id} doppelt`);
    seen.add(id);
  }
  return problems;
}
