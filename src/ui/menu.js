// Aufklappmenüs der Kopfzeile (Ebenen, Schwerpunkt): immer nur eines offen, Schließen per
// Klick daneben oder Escape. Das Menü liegt zusammen mit seinem Knopf in einem .menu-wrap.
const menus = [];

export function setupMenu(button, menu) {
  const wrap = button.closest('.menu-wrap');
  const api = {
    close() {
      if (menu.hidden) return false;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      return true;
    },
    open() {
      menus.forEach((m) => m.close());
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    },
  };
  menus.push(api);
  button.addEventListener('click', () => (menu.hidden ? api.open() : api.close()));
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) api.close();
  });
  // Escape schließt das offene Menü (auch mit Fokus auf dem Knopf) und nicht zusätzlich die Detailansicht
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && api.close()) {
      e.stopPropagation();
      button.focus();
    }
  });
  return api;
}
