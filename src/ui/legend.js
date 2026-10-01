// Legende der Kartensignaturen (einklappbar, Zustand wird im Browser gemerkt).
import { subscribe, state } from '../state.js';
import { BLOCS } from '../data/blocs.js';

const hatch = (base, line, dir = 45) =>
  `background: repeating-linear-gradient(${dir}deg, ${line} 0 1.5px, transparent 1.5px 5px), ${base}`;

const STATES = [
  ['Unabhängiger Staat', 'background:#e2c29d'],
  ['Kolonie, Protektorat, Mandat (Farbe der Kolonialmacht)', hatch('#e7b3bb', 'rgba(255,255,255,.85)')],
  ['Annektiert oder unter Besatzungsverwaltung', hatch('#c9bca2', 'rgba(37,42,49,.5)', -45)],
  ['Satellitenstaat', 'background: radial-gradient(rgba(37,42,49,.45) 1px, transparent 1.3px) 0 0/5px 5px, #c4bfdf'],
];

let blocsInUse = new Set();
let redraw = () => {};

/** Von der Karte aufgerufen, sobald sich die sichtbaren Bündniskategorien ändern */
export function setBlocLegend(used) {
  blocsInUse = used;
  redraw();
}

export function renderLegend(el) {
  // auf Handy, Tablet und niedrigen Bildschirmen anfangs eingeklappt, danach gilt die gemerkte Wahl
  let collapsed = window.matchMedia('(max-width: 860px), (max-height: 820px), (pointer: coarse)').matches;
  try {
    const saved = localStorage.getItem('legend-collapsed');
    if (saved !== null) collapsed = saved === '1';
  } catch { /* privat */ }
  const draw = () => {
    const fronts = state.layers.fronts;
    const first = state.mode === 'blocs'
      ? Object.entries(BLOCS).filter(([k]) => blocsInUse.has(k)).map(([, b]) => [b.name, `background:${b.color}`])
      : STATES;
    el.innerHTML = `
      <h2 tabindex="0" role="button" aria-expanded="${!collapsed}">${state.mode === 'blocs' ? 'Bündnisse' : 'Legende'} <span aria-hidden="true">${collapsed ? '+' : '–'}</span></h2>
      <ul>
        ${first.map(([label, css]) => `<li><span class="sw" style="${css}"></span>${label}</li>`).join('')}
        ${state.mode === 'blocs' ? `<li><span class="sw" style="${hatch('#e4e1da', 'rgba(255,255,255,.9)')}"></span>Abhängiges Gebiet (Farbe der Kolonialmacht)</li>` : ''}
        <li><span class="sw" style="background:rgba(163,38,42,.15);border:1.5px dashed #a3262a"></span>Ausgewählte Gebietsänderung</li>
        ${fronts ? `<li><span class="sw" style="${hatch('transparent', 'rgba(163,38,42,.6)')}"></span>Von den Achsenmächten besetzt (ungefähr)</li><li><span class="sw" style="${hatch('transparent', 'rgba(40,78,140,.6)', -45)}"></span>Von den Alliierten erobertes Achsengebiet</li><li><span class="ln"></span>Frontlinie (ungefähr)</li>` : ''}
        <li><span class="sw" style="background:#3d5a80;border-radius:50%;width:11px;height:11px;margin:0 5.5px"></span>Ereignis (verblasst mit der Zeit)</li>
      </ul>`;
    el.classList.toggle('collapsed', collapsed);
  };
  redraw = draw;
  el.addEventListener('click', (e) => {
    if (!e.target.closest('h2')) return;
    collapsed = !collapsed;
    try { localStorage.setItem('legend-collapsed', collapsed ? '1' : '0'); } catch { /* privat */ }
    draw();
  });
  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('h2')) { e.preventDefault(); e.target.click(); }
  });
  subscribe((s, changed) => (changed.includes('layers') || changed.includes('mode')) && draw());
  draw();
}
