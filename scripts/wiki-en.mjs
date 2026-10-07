// Englische Wikipedia-Titel nachtragen: für jedes Ereignis mit `wiki` (deutscher Artikel) den
// Sprachlink zur englischen Wikipedia holen und als `wiki` in public/data/events.en.json schreiben.
// Aufruf nach dem Bauen der Ereignisse: node scripts/wiki-en.mjs (braucht Netz)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', f), 'utf8'));
const events = read('events.json');
const en = read('events.en.json');

// Von Hand geprüft: deutsche Begriffe ohne Sprachlink (kein exakter Artikel oder keiner mit
// englischem Gegenstück). Schlüssel 'Begriff@JJJJMMTT' gilt nur für das Ereignis an dem Tag.
const MANUAL = {
  'Volksabstimmung über den Status des Saargebietes': '1935 Saar status referendum',
  'Rheinlandbesetzung': 'Remilitarisation of the Rhineland',
  'Italienische Invasion Albaniens': 'Italian invasion of Albania',
  'Deutsch-sowjetischer Grenz- und Freundschaftsvertrag': 'German–Soviet Boundary and Friendship Treaty',
  'Seegefecht am Río de la Plata': 'Battle of the River Plate',
  'Bombardierung Rotterdams': 'German bombing of Rotterdam',
  'Italien im Zweiten Weltkrieg': 'Military history of Italy during World War II',
  'Sowjetische Besetzung der baltischen Staaten': 'Occupation of the Baltic states',
  'Luftangriff auf Coventry': 'Coventry Blitz',
  'Deutsche Kriegserklärung an die Vereinigten Staaten': 'German declaration of war on the United States',
  'Porajmos': 'Romani Holocaust',
  'Holocaust in Ungarn': 'The Holocaust in Hungary',
  'Flucht und Vertreibung der Deutschen 1945–1950': 'Flight and expulsion of Germans (1944–1950)',
  'Luftangriff auf Tokio am 10. März 1945': 'Bombing of Tokyo',
  'Tod Adolf Hitlers': 'Death of Adolf Hitler',
  'Berliner Erklärung (1945)': 'Berlin Declaration (1945)',
  'Kontrollratsgesetz Nr. 46': 'Abolition of Prussia',
  'Februarumsturz 1948': "1948 Czechoslovak coup d'état",
  'Hadassah-Konvoi': 'Hadassah medical convoy massacre',
  'Tito-Stalin-Bruch': 'Tito–Stalin split',
  'Vertreibung aus Lydda und Ramla': 'Palestinian expulsion from Lydda and Ramle',
  'Status Jerusalems': 'Status of Jerusalem',
  'Schlacht von Chamdo': 'Battle of Chamdo',
  'Bezirke der DDR': 'Administrative divisions of East Germany',
  'Volksaufstand vom 17. Juni 1953': 'East German uprising of 1953',
  'Putsch in Guatemala 1954': "1954 Guatemalan coup d'état",
  'Operation Schwarzer Pfeil': 'Operation Black Arrow',
  'Römische Verträge': 'Treaty of Rome',
  'U-2-Zwischenfall': '1960 U-2 incident',
  'Annexion Goas': 'Indian annexation of Goa',
  'Chinesisch-sowjetischer Grenzkonflikt': 'Sino-Soviet border conflict',
  'Schwarzer September (Jordanien)': 'Black September',
  'Dezemberaufstand 1970': 'December 1970 protests in Poland',
  'Besuch Richard Nixons in China': '1972 visit by Richard Nixon to China',
  'Olympia-Attentat München': 'Munich massacre',
  'Deutschland und die Vereinten Nationen': 'Germany and the United Nations',
  'Sinai-Abkommen@19740118': 'Yom Kippur War', // Sinai I hat keinen eigenen Artikel, dort im Abschnitt zu den Folgen
  'Sinai-Abkommen@19750904': 'Sinai Interim Agreement',
  'Massaker von Ma’alot': "Ma'alot massacre",
  'Indonesische Besetzung Osttimors': 'Indonesian invasion of East Timor',
  'Massaker von Tel al-Zaatar': 'Tel al-Zaatar massacre',
  'Anschlag auf der Küstenstraße': 'Coastal road massacre',
  'Sandinistische Revolution': 'Nicaraguan Revolution',
  'Golanhöhen-Gesetz': 'Golan Heights Law',
  'Anschläge auf die Kasernen der Multinationalen Friedenstruppe in Beirut': '1983 Beirut barracks bombings',
  'Nachrüstung': 'NATO Double-Track Decision',
  'Israelische Sicherheitszone im Südlibanon': 'Israeli occupation of Southern Lebanon (1982–2000)',
  'Operation Holzbein': 'Operation Wooden Leg',
  'Gipfeltreffen in Genf 1985': 'Geneva Summit (1985)',
  'Ungarische Grenzöffnung 1989': 'Pan-European Picnic',
  'Prager Botschaftsflüchtlinge': 'Embassy of Germany, Prague',
  'Montagsdemonstrationen in der DDR': 'Monday demonstrations in East Germany',
  'Zehn-Punkte-Programm': 'German reunification', // Kohls Plan hat keinen eigenen Artikel
  'Gipfeltreffen von Malta': 'Malta Summit',
  'Akt über die Wiederherstellung des unabhängigen Staates Litauen': 'Act of the Re-Establishment of the State of Lithuania',
  'Charta von Paris für ein neues Europa': 'Paris Charter',
  'Januarereignisse in Litauen': 'January Events',
  'Belowescher Vereinbarung': 'Belovezha Accords',
};

// Wikipedia drosselt bei vielen Anfragen ("too many requests", kein JSON): kurz warten, erneut versuchen
async function getJson(url) {
  for (let i = 0; ; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'zeitkarte-build/1.0' } });
    if (res.ok) return res.json();
    if (i === 5) throw new Error(`Wikipedia-API: ${res.status}`);
    await new Promise((r) => setTimeout(r, 15000));
  }
}

const titles = [...new Set(events.map((e) => e.wiki).filter(Boolean))];
const enTitle = new Map(); // deutscher Begriff → englischer Titel
for (let i = 0; i < titles.length; i += 50) {
  const batch = titles.slice(i, i + 50);
  const url = 'https://de.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1&prop=langlinks&lllang=en&lllimit=max&titles=' +
    encodeURIComponent(batch.join('|'));
  const q = (await getJson(url)).query;
  // Eingabe → normalisiert → Weiterleitung → Seite
  const follow = (t) => {
    t = q.normalized?.find((n) => n.from === t)?.to ?? t;
    return q.redirects?.find((r) => r.from === t)?.to ?? t;
  };
  for (const t of batch) {
    const page = q.pages.find((p) => p.title === follow(t));
    const link = page?.langlinks?.[0]?.title;
    if (link) enTitle.set(t, link);
  }
}

const byId = new Map(events.map((e) => [e.id, e]));
const missing = [];
for (const tr of en) {
  const ev = byId.get(tr.id), w = ev?.wiki;
  if (!w) { delete tr.wiki; continue; }
  const manual = MANUAL[`${w}@${ev.ymd}`] ?? MANUAL[w];
  if (manual) tr.wiki = manual;
  else if (enTitle.has(w)) tr.wiki = enTitle.get(w);
  else { delete tr.wiki; missing.push(w); }
}
fs.writeFileSync(path.join(ROOT, 'public', 'data', 'events.en.json'), JSON.stringify(en));
console.log(`events.en.json: ${enTitle.size}/${titles.length} englische Artikel gefunden`);
if (missing.length) console.log('ohne englischen Artikel (Suche als Rückfall):\n  ' + [...new Set(missing)].join('\n  '));
