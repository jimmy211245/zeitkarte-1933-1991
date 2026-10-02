// Seitenleiste: Listen für Ereignisse und Gebietsänderungen, Suche, Filter und Detailansicht.
import { state, set, subscribe } from '../state.js';
import { CATEGORIES, CHANGE_TYPES } from '../data/categories.js';
import { formatShort, formatPrecision, parts } from '../lib/dates.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const THEME_NAMES = { nahost: 'Nahostkonflikt' };
// Ausschnitt [West, Süd, Ost, Nord] für Gebietsänderungen und die Kartenansicht eines Themas
export const THEME_REGIONS = { nahost: [29, 27, 37, 34.8] };

export function createPanel({ events, changes, onFocus }) {
  const listEl = document.getElementById('items');
  const listWrap = document.getElementById('panel-list');
  const detailEl = document.getElementById('panel-detail');
  const searchEl = document.getElementById('search');
  const chipsEl = document.getElementById('chips');
  const panel = document.getElementById('panel');
  const head = document.getElementById('sheet-head');
  const peekEl = document.getElementById('peek');
  document.getElementById('count-events').textContent = events.length;
  document.getElementById('count-changes').textContent = changes.length;

  const byId = { event: new Map(events.map((e) => [e.id, e])), change: new Map(changes.map((c) => [c.id, c])) };
  let visible = [];
  let rows = [];
  let lastCurrent = null;
  let currentIdx = -1;
  let userScrolled = 0;

  // Auf schmalen Bildschirmen ist die Seitenleiste ein Blatt am unteren Rand. Eingeklappt zeigt
  // es nur das ausgewählte oder zuletzt eingetretene Ereignis.
  const sheetMq = window.matchMedia('(max-width: 860px)');
  let sheetOpen = false;

  function setSheet(open) {
    sheetOpen = open;
    panel.classList.toggle('open', open);
    head.setAttribute('aria-expanded', String(open));
    // eingeklappte Inhalte sind unsichtbar und sollen auch per Tastatur nicht erreichbar sein
    listWrap.inert = detailEl.inert = sheetMq.matches && !open;
  }
  sheetMq.addEventListener('change', () => setSheet(sheetOpen));

  // Tippen klappt um; Wischen nach oben öffnet, nach unten schließt (der Klick danach zählt nicht)
  let swipeY = null;
  let swipedAt = 0;
  head.addEventListener('pointerdown', (e) => {
    swipeY = e.clientY;
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointerup', (e) => {
    if (swipeY == null) return;
    const dy = e.clientY - swipeY;
    swipeY = null;
    if (Math.abs(dy) > 24) {
      swipedAt = performance.now();
      setSheet(dy < 0);
    }
  });
  head.addEventListener('pointercancel', () => (swipeY = null));
  head.addEventListener('click', () => {
    if (performance.now() - swipedAt > 400) setSheet(!sheetOpen);
  });

  function updatePeek() {
    const sel = state.selection;
    const kind = sel ? sel.kind : state.tab === 'events' ? 'event' : 'change';
    const it = sel ? byId[sel.kind].get(sel.id) : visible[currentIdx] ?? visible[0];
    if (!it) {
      peekEl.innerHTML = '<span class="peek-what">Keine Treffer</span>';
      return;
    }
    const dot = kind === 'event' ? `<span class="dot" style="background:${CATEGORIES[it.cat]?.color}"></span>` : '';
    peekEl.innerHTML = `<span class="peek-when">${esc(formatShort(it.t))}</span><span class="peek-what">${dot}${esc(it.title)}</span>`;
  }

  // Kategorie-Chips
  function renderChips() {
    if (state.tab === 'events') {
      chipsEl.innerHTML = Object.entries(CATEGORIES)
        .map(([k, c]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${!state.categories || state.categories.has(k)}"><i style="background:${c.color}"></i>${esc(c.name)}</button>`)
        .join('');
    } else {
      chipsEl.innerHTML = Object.entries(CHANGE_TYPES)
        .map(([k, name]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${!state.categories || state.categories.has(k)}">${esc(name)}</button>`)
        .join('');
    }
    updateChipEdges();
  }
  // Die Kategorien stehen in einer Zeile: weiche Ränder zeigen, auf welcher Seite es weitergeht,
  // und das Mausrad schiebt die Zeile seitwärts
  function updateChipEdges() {
    const max = chipsEl.scrollWidth - chipsEl.clientWidth;
    chipsEl.classList.toggle('more-left', chipsEl.scrollLeft > 2);
    chipsEl.classList.toggle('more-right', chipsEl.scrollLeft < max - 2);
  }
  chipsEl.addEventListener('scroll', updateChipEdges, { passive: true });
  new ResizeObserver(updateChipEdges).observe(chipsEl);
  chipsEl.addEventListener('wheel', (e) => {
    if (chipsEl.scrollWidth <= chipsEl.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    chipsEl.scrollLeft += e.deltaY;
  }, { passive: false });

  chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const all = [...chipsEl.querySelectorAll('.chip')].map((c) => c.dataset.cat);
    let cur = state.categories ? new Set(state.categories) : new Set(all);
    // Klick auf einen Chip, während alle aktiv sind: nur diesen zeigen
    if (cur.size === all.length) cur = new Set([b.dataset.cat]);
    else if (cur.has(b.dataset.cat)) cur.delete(b.dataset.cat);
    else cur.add(b.dataset.cat);
    set({ categories: cur.size === 0 || cur.size === all.length ? null : cur });
  });

  // Tabs
  document.querySelectorAll('.tabs [role=tab]').forEach((b) =>
    b.addEventListener('click', () => set({ tab: b.dataset.tab, categories: null, selection: null })),
  );

  let searchTimer = 0;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => set({ query: searchEl.value.trim() }), 120);
  });

  const norm = (s) => s.toLocaleLowerCase('de').normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Schwerpunktthema: Ereignisse mit passendem Thema, Gebietsänderungen in der Region
  const inTheme = (it, kind) => {
    if (!state.theme) return true;
    if (kind === 'event') return it.theme === state.theme;
    const [w, s, e, n] = it.bbox, [rw, rs, re, rn] = THEME_REGIONS[state.theme];
    return !(e < rw || w > re || n < rs || s > rn);
  };
  const themeBanner = document.getElementById('theme-banner');
  function renderThemeBanner() {
    themeBanner.hidden = !state.theme;
    if (!state.theme) return;
    const nEvents = events.filter((e) => inTheme(e, 'event')).length;
    const nChanges = changes.filter((c) => inTheme(c, 'change')).length;
    themeBanner.innerHTML = `<span><b>Schwerpunkt ${esc(THEME_NAMES[state.theme])}</b> · ${nEvents} Ereignisse · ${nChanges} Gebietsänderungen</span><button type="button" data-act="theme-off" title="Schwerpunkt aufheben"><svg><use href="#i-close"/></svg></button>`;
  }
  themeBanner.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="theme-off"]')) set({ theme: null });
  });

  function filterItems() {
    const q = norm(state.query);
    const source = state.tab === 'events' ? events : changes;
    const kind = state.tab === 'events' ? 'event' : 'change';
    return source.filter((it) => {
      const cat = state.tab === 'events' ? it.cat : it.type;
      if (!inTheme(it, kind)) return false;
      if (state.categories && !state.categories.has(cat)) return false;
      if (!q) return true;
      return norm(`${it.title} ${it.place ?? ''} ${it.text ?? ''} ${it.to ?? ''} ${it.from ?? ''}`).includes(q);
    });
  }

  function renderList() {
    visible = filterItems();
    if (visible.length === 0) {
      listEl.innerHTML = `<li class="empty">Keine Treffer. Suchbegriff ändern oder Filter zurücksetzen.</li>`;
      rows = [];
      currentIdx = -1;
      updatePeek();
      return;
    }
    let html = '';
    let lastYear = null;
    for (const it of visible) {
      const y = parts(it.t).y;
      if (y !== lastYear) { html += `<li class="year-sep">${y}</li>`; lastYear = y; }
      if (state.tab === 'events') {
        const c = CATEGORIES[it.cat];
        html += `<li class="item" data-id="${it.id}"><span class="when">${esc(formatShort(it.t).replace(/ \d{4}$/, ''))}</span><span class="what"><span class="dot" style="background:${c?.color}"></span>${esc(it.title)}</span>${it.place ? `<span class="sub">${esc(it.place)}</span>` : ''}</li>`;
      } else {
        html += `<li class="item" data-id="${it.id}"><span class="when">${esc(formatShort(it.t).replace(/ \d{4}$/, ''))}</span><span class="what">${esc(it.title)}</span><span class="sub">${esc(CHANGE_TYPES[it.type] ?? '')}${it.area ? ` · ca. ${it.area.toLocaleString('de-DE')} km²` : ''}</span></li>`;
      }
    }
    listEl.innerHTML = html;
    rows = [...listEl.querySelectorAll('.item')];
    lastCurrent = null;
    markCurrent(true);
  }

  // Markiert den Eintrag, der dem aktuellen Datum am nächsten liegt, und hält ihn im Blick
  function markCurrent(force = false) {
    if (!rows.length) return;
    let idx = -1;
    for (let i = 0; i < visible.length; i++) {
      if (visible[i].t <= state.day) idx = i; else break;
    }
    rows.forEach((r, i) => {
      r.classList.toggle('past', i <= idx);
      r.classList.toggle('future', i > idx);
    });
    const cur = idx >= 0 ? rows[idx] : null;
    if (cur !== lastCurrent || force) {
      lastCurrent?.classList.remove('current');
      cur?.classList.add('current');
      lastCurrent = cur;
      currentIdx = idx;
      updatePeek();
      if (cur && Date.now() - userScrolled > 2500) {
        // offsetTop zählt ab der Seitenleiste, nicht ab dem Listenanfang
        const top = cur.offsetTop - listEl.offsetTop - listEl.clientHeight / 3;
        listEl.scrollTop = Math.max(0, top);
      }
    }
  }
  listEl.addEventListener('wheel', () => (userScrolled = Date.now()), { passive: true });
  listEl.addEventListener('touchmove', () => (userScrolled = Date.now()), { passive: true });

  listEl.addEventListener('click', (e) => {
    const row = e.target.closest('.item');
    if (!row) return;
    const kind = state.tab === 'events' ? 'event' : 'change';
    open(kind, Number(row.dataset.id) || row.dataset.id);
  });

  // reveal: auf schmalen Bildschirmen das Blatt mit der Detailansicht aufklappen
  function open(kind, id, { jump = true, reveal = true } = {}) {
    const it = byId[kind].get(id);
    if (!it) return;
    set({ selection: { kind, id }, ...(jump ? { day: it.t, playing: false } : {}) });
    if (reveal && sheetMq.matches) setSheet(true);
    onFocus(kind, it);
  }

  function renderDetail() {
    const sel = state.selection;
    if (!sel) {
      detailEl.hidden = true;
      listWrap.hidden = false;
      return;
    }
    const it = byId[sel.kind].get(sel.id);
    if (!it) return;
    const list = sel.kind === 'event' ? events : changes;
    const i = list.indexOf(it);
    const prev = list[i - 1], next = list[i + 1];
    let body = '';
    if (sel.kind === 'event') {
      const c = CATEGORIES[it.cat];
      const date = it.end ? `${formatPrecision(it.t, it.prec)} – ${formatPrecision(it.tEnd, it.precEnd ?? it.prec)}` : formatPrecision(it.t, it.prec);
      const paragraphs = (it.text || '').split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join('');
      const wiki = it.wiki
        ? `https://de.wikipedia.org/w/index.php?search=${encodeURIComponent(it.wiki)}&title=Spezial%3ASuche&go=Artikel`
        : null;
      body = `
        <div class="detail-kicker"><span class="cat"><i style="background:${c?.color}"></i>${esc(c?.name)}</span>${it.theme ? `<span class="theme-tag">${esc(THEME_NAMES[it.theme])}</span>` : ''}</div>
        <div class="detail-date">${esc(date)}</div>
        <h2 class="detail-title">${esc(it.title)}</h2>
        ${it.place ? `<div class="detail-place"><svg><use href="#i-pin"/></svg>${esc(it.place)}</div>` : ''}
        <div class="detail-text">${paragraphs}</div>
        ${it.plan ? `<p class="detail-note">Die Karte zeigt den Plan schematisch, nachgezeichnet nach einer zeitgenössischen Karte; Linien können um einige Kilometer abweichen.</p>` : ''}
        <div class="detail-links">
          ${it.lon != null || it.plan ? `<button type="button" class="link-btn" data-act="fly"><svg><use href="#i-pin"/></svg>${it.plan ? 'Plan auf der Karte zeigen' : 'Auf der Karte zeigen'}</button>` : ''}
          ${wiki ? `<a class="link-btn" href="${wiki}" target="_blank" rel="noopener"><svg><use href="#i-ext"/></svg>Wikipedia</a>` : ''}
        </div>`;
    } else {
      body = `
        <div class="detail-kicker">${esc(CHANGE_TYPES[it.type] ?? 'Gebietsänderung')}</div>
        <div class="detail-date">${esc(formatPrecision(it.t))}</div>
        <h2 class="detail-title">${esc(it.title)}</h2>
        ${it.text ? `<div class="detail-text"><p>${esc(it.text)}</p></div>` : ''}
        <dl class="detail-facts">
          ${it.from && it.from !== it.to ? `<dt>bisher</dt><dd>${esc(it.from)}</dd>` : ''}
          <dt>danach</dt><dd>${esc(it.toFull ?? it.to)}${it.sov ? ` (${esc(it.sov)})` : ''}</dd>
          <dt>Fläche</dt><dd>ca. ${it.area.toLocaleString('de-DE')} km²</dd>
        </dl>
        <div class="detail-links"><button type="button" class="link-btn" data-act="fly"><svg><use href="#i-pin"/></svg>Gebiet zeigen</button></div>`;
    }
    detailEl.innerHTML = `
      <div class="detail-bar">
        <button type="button" data-act="back"><svg><use href="#i-back"/></svg>Liste</button>
        <button type="button" data-act="close" title="Schließen"><svg><use href="#i-close"/></svg></button>
      </div>
      <div class="detail-body">${body}</div>
      <div class="detail-nav">
        ${prev ? `<button type="button" data-nav="${prev.id}"><small>${esc(formatShort(prev.t))}</small>${esc(prev.title)}</button>` : '<span></span>'}
        ${next ? `<button type="button" data-nav="${next.id}"><small>${esc(formatShort(next.t))}</small>${esc(next.title)}</button>` : '<span></span>'}
      </div>`;
    listWrap.hidden = true;
    detailEl.hidden = false;
    detailEl.scrollTop = 0;
  }

  detailEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const sel = state.selection;
    // Auf schmalen Bildschirmen geben Schließen und „Auf der Karte zeigen“ die Karte wieder frei
    if (b.dataset.act === 'back') set({ selection: null });
    else if (b.dataset.act === 'close') {
      set({ selection: null });
      setSheet(false);
    } else if (b.dataset.act === 'fly' && sel) {
      setSheet(false);
      onFocus(sel.kind, byId[sel.kind].get(sel.id), { forceFly: true });
    } else if (b.dataset.nav && sel) open(sel.kind, Number(b.dataset.nav) || b.dataset.nav);
  });

  subscribe((s, changed) => {
    if (changed.includes('tab')) {
      document.querySelectorAll('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === s.tab)));
      searchEl.placeholder = s.tab === 'events' ? 'Suchen, z. B. Stalingrad' : 'Suchen, z. B. Sudetenland';
    }
    if (changed.includes('tab') || changed.includes('categories')) renderChips();
    if (changed.includes('theme')) renderThemeBanner();
    if (changed.some((k) => ['tab', 'query', 'categories', 'theme'].includes(k))) renderList();
    if (changed.includes('selection')) {
      renderDetail();
      rows.forEach((r) => r.classList.toggle('selected', !!s.selection && String(s.selection.id) === r.dataset.id));
      updatePeek();
    }
    if (changed.includes('day')) markCurrent();
    // beim Abspielen soll die Karte frei sein
    if (changed.includes('playing') && s.playing && sheetMq.matches) setSheet(false);
  });

  renderChips();
  renderThemeBanner();
  renderList();
  setSheet(false);
  return {
    open,
    /** Höhe des Bereichs, den das Blatt unten von der Karte verdeckt (0 bei Seitenleiste) */
    coveredHeight: () => (sheetMq.matches ? (sheetOpen ? panel.offsetHeight : head.offsetHeight) : 0),
  };
}
