# Zeitkarte 1933–1991

Interaktive Karte der Staatsgrenzen, Gebietsänderungen und Ereignisse vom 30. Januar 1933, dem Tag von Hitlers Ernennung zum Reichskanzler, bis zur Auflösung der Sowjetunion Ende 1991.

**Zur Karte:** https://jimmy211245.github.io/zeitkarte-1933-1991/

## Funktionen

- Tagesgenaue Staatsgrenzen weltweit, einschließlich Kolonien, Protektoraten, Mandaten und Besatzungsverwaltungen
- Zeitband zum Ziehen und Abspielen
- 403 Ereignisse und rund 380 automatisch erkannte Gebietsänderungen mit Suche und Filter
- Ansicht nach Staaten oder nach Bündnissen (Achsenmächte und Alliierte, NATO, Warschauer Pakt, Blockfreie)
- Ebene mit ungefähren Fronten und Besatzungsgebieten im Zweiten Weltkrieg
- Schwerpunkte (Auswahl „Schwerpunkt“ in der Kopfzeile oder Link mit `?thema=<id>`) beschränken Liste, Karte und Zeitband auf ein Thema:
  - **Nahostkonflikt** (`?thema=nahost`): 93 Ereignisse von 1933 bis 1991, 39 Gebietsänderungen (die besetzten Gebiete einzeln), Städte der Region und die Teilungspläne von 1937 und 1947 als schematische Karte
  - **Deutsche Teilung** (`?thema=deutsche-teilung`): 57 Ereignisse von 1945 bis 1990 (Besatzungszonen, Berlin-Blockade, zwei Staaten, Mauer, Ostpolitik, Wiedervereinigung) und 14 Gebietsänderungen
- Binnengrenzen, wo sie sich für die Zeit belegen lassen: Bundesstaaten und Provinzen der USA, Kanadas, Mexikos, Brasiliens und Australiens, Länder der Bundesrepublik, der DDR und Österreichs, Kantone der Schweiz, Teilrepubliken der Sowjetunion, Jugoslawiens und der Tschechoslowakei
- Sprachumschalter **DE | EN** in der Kopfzeile (oder `?lang=en`): Oberfläche, Legende, Datumsangaben und „Über“-Dialog gibt es deutsch und englisch; Ereignistexte (Titel, Ort, Beschreibung) auch englisch; Gebietsänderungen und Kartenbeschriftungen bisher nur deutsch
- Datum und Kartenausschnitt stehen in der Adresszeile, Ansichten lassen sich als Link teilen

## Lokal starten

Voraussetzung: Node.js 20.19 oder neuer.

```bash
npm install
npm run dev
```

Die Seite läuft dann unter http://localhost:5173. `npm run build` erzeugt die fertige Seite im Ordner `dist`.

## Daten neu erzeugen

Die aufbereiteten Kartendaten liegen in `public/data` und sind im Repository enthalten. Neu erzeugen muss man sie nur, wenn sich Grenzen, Ereignisse oder Fronten ändern sollen:

1. Rohdaten in den Ordner `data-raw` legen:
   - `CShapes-2.0.geojson` von https://icr.ethz.ch/data/cshapes/
   - `ne_50m_land.geojson`, `ne_50m_lakes.geojson`, `ne_50m_rivers_lake_centerlines.geojson` und `ne_10m_admin_1_states_provinces.geojson` von https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
2. `npm run build:data` ausführen (dauert einige Minuten).

Ergänzungen zu CShapes (Annexionen, Besatzungsverwaltungen, Inseln, Nahostkonflikt), Ereignisse, Frontlinien, Teilungspläne und Städte stehen in `scripts/data`, die Gliederung der Binnengrenzen in `scripts/08-admin.mjs`.

## Schwerpunkte (Themen)

Schwerpunkte sind in `src/data/themes.js` definiert (ID, Name, Kurzname, Beschreibung für das Auswahlmenü, Kartenausschnitt `viewBounds`). Die App und die Skripte in `scripts` lesen dieselbe Datei; sonst kennt kein Programmteil die einzelnen Themen. `state.theme` ist `null` oder eine Theme-ID, ungültige IDs in `?thema=` werden ignoriert.

**Zuordnung.** Sie steht immer in den Daten, nie in einer geografischen Regel:

- Ereignisse tragen `themes: ['id']` (Liste, auch leer oder weggelassen). Ein Ereignis kann mehreren Themen angehören, etwa `themes: ['nahost', 'deutsche-teilung']`; die Detailansicht zeigt dann mehrere Schlagwörter.
- Gebietsänderungen werden in `scripts/data/change-themes.mjs` per Schlüssel (`JJJJ-MM-TT|von|nach`, nachzulesen in `build/changes-report.txt` nach einem Datenlauf) einem Thema zugeordnet und landen als `themes` in `changes-list.json`.
- Der Build prüft vor dem Schreiben der Dateien, dass `themes` eine Liste bekannter, nicht doppelter IDs ist und dass jeder Schlüssel in `change-themes.mjs` zu einer Gebietsänderung passt; sonst bricht er ab.

**Neues Thema hinzufügen:**

1. In `src/data/themes.js` unter `THEMES` eintragen (Name, Kurzname, Beschreibung, `viewBounds`).
2. Ereignisse in `scripts/data/events` mit `themes` versehen, neue Ereignisse am besten in einer eigenen Datei wie `deutsche-teilung.mjs`, und Gebietsänderungen in `change-themes.mjs` zuordnen.
3. `npm run build:data` ausführen. Auswahlmenü, Banner, Tab-Zähler, Zeitband-Abschwächung, Navigation und Kartenausschnitt folgen aus der Konfiguration.
4. Optional: Städte in `scripts/data/places.mjs` ergänzen (eine gemeinsame Ebene für alle Themen), schematische Pläne wie die Nahost-Teilungspläne sind eigener Code (`07-nahost.mjs`, `style.js`, `legend.js`).

**Navigation.** Vor/Zurück in der Detailansicht folgt dem aktiven Schwerpunkt und den Kategorie-Filtern der Liste, nicht der Suche. Die Transportknöpfe und Bild↑/Bild↓ richten sich nur nach dem Schwerpunkt.

**Bekannte Lücken beim Schwerpunkt „Deutsche Teilung“:**

- Die Westzonen sind ein Gebiet; die amerikanische, britische und französische Zone sind nicht einzeln eingezeichnet, ebenso nicht die Berliner Sektoren.
- Länder gibt es erst ab 1949, im heutigen Zuschnitt (Natural Earth); die Länder von 1945 bis 1949 fehlen, im Südwesten fehlen bis April 1952 die Grenzen der drei Länder vor Baden-Württemberg.
- Von der DDR gibt es nur die fünf Länder bis Juli 1952; die 14 Bezirke ab 1952 sind nicht eingezeichnet, weil keine belastbaren Grenzdaten vorliegen. Danach zeigt die Karte die DDR ohne Binnengrenzen, nur Ost-Berlin ist abgesetzt.
- Die Oder-Neiße-Gebiete erscheinen als Gebietsänderung 1945 (Polen, Sowjetunion), nicht als deutsche „Ostgebiete unter Verwaltung“ mit eigenem Status.
- Grenzen außerhalb der Nahost-Region sind für die Karte auf 35 % der Stützpunkte vereinfacht, die Umrisse Berlins sind grob.

## Veröffentlichung

Jeder Push auf `main` baut die Seite mit GitHub Actions und veröffentlicht sie auf GitHub Pages (`.github/workflows/deploy.yml`).

## Quellen und Lizenzen

- **Grenzen:** CShapes 2.0 (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch; ETH Zürich), Lizenz [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de). Die daraus abgeleiteten Dateien in `public/data` (Grenzen, Gebietsänderungen, Beschriftungen, Fronten, Binnengrenzen, Teilungspläne) stehen ebenfalls unter CC BY-NC-SA 4.0 und dürfen nur nicht-kommerziell verwendet werden.
- **Küsten, Seen, Flüsse, Binnengrenzen:** Natural Earth (gemeinfrei). Die Binnengrenzen geben den heutigen Zuschnitt wieder; für frühere Zeiträume sind Einheiten zusammengelegt, nicht belegbare Gliederungen fehlen.
- **Teilungspläne:** schematisch nachgezeichnet nach Map No. 3 des Palestine Partition Commission Report (britische Regierung, 1938) und der Karte „UN Partition Plan for Palestine 1947“ der CIA (1973), beide gemeinfrei.
- **Ereignisse:** für dieses Projekt zusammengestellt; Links führen zur deutschsprachigen Wikipedia.

CShapes bildet völkerrechtlich anerkannte Grenzen ab. Fronten und Besatzungsgebiete im Zweiten Weltkrieg sowie die Linien der Sinai-Abkommen, im Libanon und auf dem Golan 1973 sind Annäherungen; nachgezeichnete Trennlinien können um einige Kilometer abweichen.

Für den Programmcode ist noch keine Lizenz festgelegt.
