// Ereignisse aus scripts/data/events/*.mjs zu public/data/events.json zusammenfassen.
// Felder je Ereignis:
//   d: 'JJJJ-MM-TT' | 'JJJJ-MM' | 'JJJJ'   Datum (Genauigkeit wird erkannt)
//   end: optionales Enddatum (gleiches Format)
//   title, text, cat, imp (1 = sehr wichtig … 3), place, at: [Länge, Breite], zoom, wiki
//   theme: Schwerpunktthema (z. B. 'nahost'), plan: schematische Kartenebene (siehe 07-nahost.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { dayIndex } from './lib/dates.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'scripts', 'data', 'events');
const CATS = new Set(['politik', 'krieg', 'vertrag', 'verfolgung', 'krise', 'aufstand', 'dekolonisation', 'technik']);
const THEMES = new Set(['nahost']);
const PLANS = new Set(['peel1937', 'un1947']);

function parseDate(s) {
  const [y, m, d] = String(s).split('-').map(Number);
  const prec = d ? 'd' : m ? 'm' : 'y';
  return { ymd: y * 10000 + (m || 1) * 100 + (d || 1), prec };
}

const all = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(path.join(DIR, file)).href);
  for (const ev of mod.default) all.push({ ...ev, _file: file });
}

const problems = [];
const out = all
  .map((ev) => {
    const a = parseDate(ev.d);
    const b = ev.end ? parseDate(ev.end) : null;
    if (!CATS.has(ev.cat)) problems.push(`${ev.d} ${ev.title}: unbekannte Kategorie ${ev.cat}`);
    if (!ev.title || !ev.text) problems.push(`${ev.d}: Titel oder Text fehlt`);
    if (ev.at && (Math.abs(ev.at[0]) > 180 || Math.abs(ev.at[1]) > 90)) problems.push(`${ev.d} ${ev.title}: Koordinaten vertauscht?`);
    if (ev.theme && !THEMES.has(ev.theme)) problems.push(`${ev.d} ${ev.title}: unbekanntes Thema ${ev.theme}`);
    if (ev.plan && !PLANS.has(ev.plan)) problems.push(`${ev.d} ${ev.title}: unbekannter Plan ${ev.plan}`);
    return {
      t: dayIndex(a.ymd),
      te: b ? dayIndex(b.ymd) : dayIndex(a.ymd),
      ymd: a.ymd,
      prec: a.prec,
      ...(b ? { end: b.ymd, tEnd: dayIndex(b.ymd), precEnd: b.prec } : {}),
      title: ev.title,
      text: ev.text.trim().replace(/\s+\n/g, '\n'),
      cat: ev.cat,
      imp: ev.imp ?? 2,
      place: ev.place ?? null,
      lon: ev.at ? ev.at[0] : null,
      lat: ev.at ? ev.at[1] : null,
      zoom: ev.zoom ?? null,
      wiki: ev.wiki ?? null,
      ...(ev.theme ? { theme: ev.theme } : {}),
      ...(ev.plan ? { plan: ev.plan } : {}),
    };
  })
  .sort((x, y) => x.t - y.t || x.imp - y.imp);
out.forEach((ev, i) => (ev.id = i + 1));

if (problems.length) console.warn(problems.map((p) => '  ! ' + p).join('\n'));
fs.writeFileSync(path.join(ROOT, 'public', 'data', 'events.json'), JSON.stringify(out));
console.log(`events.json: ${out.length} Ereignisse`);
