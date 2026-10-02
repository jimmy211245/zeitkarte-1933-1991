// Zeitband: feste rote Nadel in der Mitte, das Band läuft darunter durch.
// Ziehen = Zeit verschieben, Mausrad = Maßstab ändern, Klick auf eine Marke = Ereignis öffnen.
import { state, set, subscribe } from '../state.js';
import { START, END, fromIso, parts, yearStart, formatShort, toDay } from '../lib/dates.js';
import { ERAS } from '../data/eras.js';
import { CATEGORIES } from '../data/categories.js';

const MONTH_ABBR = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const ERAS_D = ERAS.map((e) => ({ ...e, a: fromIso(e.from), b: fromIso(e.to) }));

export function createTimeline({ tape, overview, tooltip, onPick }) {
  const ctx = tape.getContext('2d');
  const octx = overview.getContext('2d');
  let W = 0, H = 0, OW = 0, OH = 0, dpr = 1;
  let scale = 4; // Tage pro Pixel
  let markers = { events: [], changes: [] };
  let hover = null;
  let frame = 0;

  const css = getComputedStyle(document.documentElement);
  const INK = css.getPropertyValue('--ink').trim() || '#22272e';
  const INK2 = css.getPropertyValue('--ink-2').trim() || '#5a636d';
  const SIGNAL = css.getPropertyValue('--signal').trim() || '#a3262a';
  const SANS = '"Noto Sans", system-ui, sans-serif';

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = tape.clientWidth; H = tape.clientHeight;
    tape.width = Math.round(W * dpr); tape.height = Math.round(H * dpr);
    OW = overview.clientWidth; OH = overview.clientHeight;
    overview.width = Math.round(OW * dpr); overview.height = Math.round(OH * dpr);
    setScale(scale);
  }

  const xOf = (day) => W / 2 + (day - state.day) / scale;
  const dayOf = (x) => state.day + (x - W / 2) * scale;

  function request() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function draw() {
    frame = 0;
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const d0 = dayOf(0), d1 = dayOf(W);

    // Bereich außerhalb 1933–1991
    ctx.fillStyle = 'rgba(37,42,49,0.06)';
    if (d0 < START) ctx.fillRect(0, 0, xOf(START), H);
    if (d1 > END) ctx.fillRect(xOf(END), 0, W - xOf(END), H);

    // Epochenband
    const bandH = 15;
    for (const era of ERAS_D) {
      const x0 = Math.max(0, xOf(era.a)), x1 = Math.min(W, xOf(era.b + 1));
      if (x1 <= 0 || x0 >= W) continue;
      ctx.fillStyle = era.color;
      ctx.fillRect(x0, 0, x1 - x0, bandH);
      ctx.font = `500 10.5px ${SANS}`;
      const label = x1 - x0 > ctx.measureText(era.name).width + 16 ? era.name : era.short;
      const tw = ctx.measureText(label).width;
      if (x1 - x0 > tw + 12) {
        ctx.fillStyle = INK;
        // Beschriftung bleibt im sichtbaren Teil der Epoche
        const tx = Math.min(Math.max(x0 + 6, 6), x1 - tw - 6);
        ctx.fillText(label, tx, 11);
      }
    }

    // Jahres-, Monats- und Tagesstriche
    const top = bandH + 2;
    const y0 = parts(Math.max(START, Math.floor(d0))).y - 1;
    const y1 = parts(Math.min(END, Math.ceil(d1))).y + 1;
    const pxPerYear = 365.25 / scale;
    const yearStep = pxPerYear > 46 ? 1 : pxPerYear > 22 ? 2 : pxPerYear > 9 ? 5 : 10;
    ctx.font = `500 11px ${SANS}`;
    for (let y = y0; y <= y1; y++) {
      const x = xOf(yearStart(y));
      if (x < -60 || x > W + 60) continue;
      const major = y % yearStep === 0;
      ctx.fillStyle = major ? 'rgba(37,42,49,0.32)' : 'rgba(37,42,49,0.12)';
      ctx.fillRect(Math.round(x), top, 1, major ? H - top : 8);
      if (major) {
        ctx.fillStyle = INK2;
        ctx.fillText(String(y), Math.round(x) + 4, top + 11);
      }
      if (pxPerYear > 160) {
        for (let m = 2; m <= 12; m++) {
          const mx = xOf(toDay(y * 10000 + m * 100 + 1));
          if (mx < -30 || mx > W + 30) continue;
          ctx.fillStyle = 'rgba(37,42,49,0.14)';
          ctx.fillRect(Math.round(mx), top, 1, 7);
          if (pxPerYear > 520) {
            ctx.fillStyle = INK2;
            ctx.font = `400 10px ${SANS}`;
            ctx.fillText(MONTH_ABBR[m - 1], Math.round(mx) + 3, top + 11);
            ctx.font = `500 11px ${SANS}`;
          }
        }
        if (pxPerYear > 520) {
          ctx.fillStyle = INK2;
          ctx.font = `400 10px ${SANS}`;
          ctx.fillText(MONTH_ABBR[0], Math.round(x) + 34, top + 11);
          ctx.font = `500 11px ${SANS}`;
        }
      }
    }
    if (scale < 0.25) {
      for (let d = Math.ceil(d0); d <= d1; d++) {
        ctx.fillStyle = 'rgba(37,42,49,0.1)';
        ctx.fillRect(Math.round(xOf(d)), H - 6, 1, 6);
      }
    }

    // Gebietsänderungen als kleine Rauten am unteren Rand
    const cy = H - 9;
    for (const c of markers.changes) {
      const x = xOf(c.t);
      if (x < -5 || x > W + 5) continue;
      const r = c.imp === 1 ? 3.6 : c.imp === 2 ? 2.8 : 2.1;
      ctx.fillStyle = hover && hover.kind === 'change' && hover.id === c.id ? SIGNAL : 'rgba(37,42,49,0.55)';
      ctx.globalAlpha = c.dim ? 0.25 : 1;
      ctx.beginPath();
      ctx.moveTo(x, cy - r); ctx.lineTo(x + r, cy); ctx.lineTo(x, cy + r); ctx.lineTo(x - r, cy);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Ereignisse als farbige Striche
    const base = H - 18;
    for (const ev of markers.events) {
      const x = xOf(ev.t);
      if (x < -3 || x > W + 3) continue;
      const h = ev.imp === 1 ? 22 : ev.imp === 2 ? 15 : 9;
      const isHover = hover && hover.kind === 'event' && hover.id === ev.id;
      const isSel = state.selection && state.selection.kind === 'event' && state.selection.id === ev.id;
      ctx.fillStyle = CATEGORIES[ev.cat]?.color ?? INK2;
      ctx.globalAlpha = ev.dim ? 0.25 : 1;
      ctx.fillRect(Math.round(x) - (isHover || isSel ? 1.5 : 1), base - h, isHover || isSel ? 3 : 2, h);
      ctx.globalAlpha = 1;
    }

    // Nadel
    const nx = Math.round(W / 2) + 0.5;
    ctx.strokeStyle = SIGNAL;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(nx, 0); ctx.lineTo(nx, H); ctx.stroke();
    ctx.fillStyle = SIGNAL;
    ctx.beginPath(); ctx.moveTo(nx - 6, 0); ctx.lineTo(nx + 6, 0); ctx.lineTo(nx, 7); ctx.fill();

    drawOverview();
  }

  function drawOverview() {
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.clearRect(0, 0, OW, OH);
    const ox = (d) => ((d - START) / (END - START)) * OW;
    for (const era of ERAS_D) {
      octx.fillStyle = era.color;
      octx.fillRect(ox(era.a), 0, ox(era.b + 1) - ox(era.a), OH);
    }
    // Ereignisdichte
    octx.fillStyle = 'rgba(37,42,49,0.35)';
    for (const ev of markers.events) {
      if (ev.imp !== 1) continue;
      octx.fillRect(Math.round(ox(ev.t)), OH - 4, 1, 4);
    }
    // sichtbarer Ausschnitt
    const a = Math.max(0, ox(dayOf(0))), b = Math.min(OW, ox(dayOf(W)));
    octx.strokeStyle = 'rgba(37,42,49,0.65)';
    octx.lineWidth = 1;
    octx.strokeRect(a + 0.5, 0.5, Math.max(2, b - a - 1), OH - 1);
    octx.fillStyle = SIGNAL;
    octx.fillRect(Math.round(ox(state.day)) - 1, 0, 2, OH);
  }

  // --- Interaktion -------------------------------------------------------------------------
  const maxScale = () => (END - START) / Math.max(200, W * 0.92);
  function setScale(s) {
    scale = Math.min(maxScale(), Math.max(0.02, s));
    request();
  }

  // radius: Fangbereich in Pixeln (für Finger größer als für die Maus)
  function pick(x, y, radius = 6) {
    let best = null, bestD = radius;
    for (const ev of markers.events) {
      const d = Math.abs(xOf(ev.t) - x);
      if (d < bestD && y > H - 44) { best = { kind: 'event', id: ev.id, t: ev.t }; bestD = d; }
    }
    if (y > H - 16) {
      for (const c of markers.changes) {
        const d = Math.abs(xOf(c.t) - x);
        if (d < bestD) { best = { kind: 'change', id: c.id, t: c.t }; bestD = d; }
      }
    }
    return best;
  }

  let drag = null;
  // Zwei Finger auf dem Band ändern den Maßstab (Ersatz für das Mausrad)
  const fingers = new Map();
  let pinch = null;
  const spread = () => {
    const [a, b] = [...fingers.values()];
    return Math.max(20, Math.abs(a - b));
  };
  tape.addEventListener('pointerdown', (e) => {
    tape.setPointerCapture(e.pointerId);
    fingers.set(e.pointerId, e.clientX);
    if (fingers.size === 2) {
      pinch = { spread: spread(), scale };
      drag = null;
      return;
    }
    drag = { x: e.clientX, day: state.day, moved: false, wasPlaying: state.playing };
    if (state.playing) set({ playing: false });
  });
  tape.addEventListener('pointermove', (e) => {
    const r = tape.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (pinch && fingers.has(e.pointerId)) {
      fingers.set(e.pointerId, e.clientX);
      setScale((pinch.scale * pinch.spread) / spread());
      return;
    }
    if (drag) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) drag.moved = true;
      if (drag.moved) set({ day: drag.day - dx * scale });
      return;
    }
    if (e.pointerType === 'touch') return;
    const h = pick(x, y);
    if ((h && (!hover || h.id !== hover.id || h.kind !== hover.kind)) || (!h && hover)) {
      hover = h;
      request();
      showTooltip(h, x);
    }
  });
  const release = (e) => {
    fingers.delete(e.pointerId);
    if (fingers.size < 2) pinch = null;
  };
  const end = (e) => {
    release(e);
    if (!drag) return;
    const r = tape.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (!drag.moved) {
      const h = pick(x, y, e.pointerType === 'touch' ? 14 : 6);
      if (h) onPick(h);
      else set({ day: dayOf(x) });
    }
    drag = null;
  };
  tape.addEventListener('pointerup', end);
  tape.addEventListener('pointercancel', (e) => {
    release(e);
    drag = null;
  });
  tape.addEventListener('pointerleave', () => {
    if (hover) { hover = null; request(); showTooltip(null); }
  });
  tape.addEventListener('wheel', (e) => {
    e.preventDefault();
    setScale(scale * Math.exp(e.deltaY * 0.0016));
  }, { passive: false });

  // Übersicht: klicken oder ziehen springt direkt
  let odrag = false;
  const jumpOverview = (e) => {
    const r = overview.getBoundingClientRect();
    set({ day: START + ((e.clientX - r.left) / r.width) * (END - START) });
  };
  overview.addEventListener('pointerdown', (e) => { odrag = true; overview.setPointerCapture(e.pointerId); jumpOverview(e); });
  overview.addEventListener('pointermove', (e) => odrag && jumpOverview(e));
  overview.addEventListener('pointerup', () => (odrag = false));

  function showTooltip(h, x) {
    if (!h) { tooltip.hidden = true; return; }
    const item = h.kind === 'event' ? markers.byEvent.get(h.id) : markers.byChange.get(h.id);
    if (!item) { tooltip.hidden = true; return; }
    tooltip.hidden = false;
    tooltip.querySelector('.tt-date').textContent = formatShort(h.t);
    tooltip.querySelector('.tt-title').textContent = item.title;
    const r = tape.getBoundingClientRect();
    const tw = tooltip.offsetWidth;
    tooltip.style.left = `${Math.min(window.innerWidth - tw - 8, Math.max(8, r.left + x - tw / 2))}px`;
    tooltip.style.top = `${r.top - tooltip.offsetHeight - 8}px`;
  }

  new ResizeObserver(resize).observe(tape);
  subscribe(() => request());
  resize();

  return {
    setMarkers(events, changes) {
      markers = {
        events, changes,
        byEvent: new Map(events.map((e) => [e.id, e])),
        byChange: new Map(changes.map((c) => [c.id, c])),
      };
      request();
    },
    redraw: request,
    zoomTo(daysVisible) {
      scale = Math.max(0.02, daysVisible / Math.max(200, W));
      request();
    },
  };
}
