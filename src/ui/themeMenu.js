// Schwerpunkt-Auswahl in der Kopfzeile: Knopf mit Auswahlmenü („Kein Schwerpunkt“ und alle Themen
// aus data/themes.js). Das Menü kennt keine einzelnen Themen, es liest nur die Konfiguration.
import { state, set, subscribe } from '../state.js';
import { getTheme, themeList, itemHasTheme } from '../data/themes.js';
import { setupMenu } from './menu.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** onSelect(theme | null) wird nach dem Umschalten aufgerufen (z. B. um die Karte auszurichten) */
export function createThemeMenu({ button, menu, events, changes, onSelect }) {
  const menuApi = setupMenu(button, menu);
  const label = button.querySelector('.long');
  const labelShort = button.querySelector('.short');

  const counts = (t) => `${events.filter((e) => itemHasTheme(e, t.id)).length} Ereignisse · ${changes.filter((c) => itemHasTheme(c, t.id)).length} Gebietsänderungen`;
  const options = [
    '<label><input type="radio" name="theme" value="" /><span><b>Kein Schwerpunkt</b><small>Alle Ereignisse und Gebietsänderungen</small></span></label>',
    ...themeList().map((t) => `<label><input type="radio" name="theme" value="${esc(t.id)}" /><span><b>${esc(t.name)}</b><small>${esc(t.description)}</small><small>${counts(t)}</small></span></label>`),
  ];
  menu.innerHTML = options.join('');

  function render() {
    const theme = getTheme(state.theme);
    button.classList.toggle('active', !!theme);
    label.textContent = theme ? theme.name : 'Schwerpunkt';
    labelShort.textContent = theme ? theme.shortName : 'Schwerpunkt';
    for (const input of menu.querySelectorAll('input')) input.checked = input.value === (theme?.id ?? '');
  }

  // Menü schließen und den Fokus auf den Knopf zurückgeben, falls er im Menü lag
  function done() {
    const hadFocus = menu.contains(document.activeElement);
    menuApi.close();
    if (hadFocus) button.focus();
  }
  menu.addEventListener('change', (e) => {
    const theme = getTheme(e.target.value);
    set({ theme: theme?.id ?? null, selection: null });
    done();
    onSelect(theme);
  });
  // ein erneuter Klick auf den schon gewählten Eintrag löst kein change aus, soll das Menü aber schließen
  menu.addEventListener('click', (e) => {
    if (e.target.closest('label')) done();
  });
  subscribe((s, changed) => {
    if (changed.includes('theme')) render();
  });
  render();
}
