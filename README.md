# Zeitkarte 1933–1991

Interaktive Karte der Staatsgrenzen, Gebietsänderungen und Ereignisse vom 30. Januar 1933, dem Tag von Hitlers Ernennung zum Reichskanzler, bis zur Auflösung der Sowjetunion Ende 1991.

**Zur Karte:** https://jimmy211245.github.io/zeitkarte-1933-1991/

## Funktionen

- Tagesgenaue Staatsgrenzen weltweit, einschließlich Kolonien, Protektoraten, Mandaten und Besatzungsverwaltungen
- Zeitband zum Ziehen und Abspielen
- 304 Ereignisse und 361 automatisch erkannte Gebietsänderungen mit Suche und Filter
- Ansicht nach Staaten oder nach Bündnissen (Achsenmächte und Alliierte, NATO, Warschauer Pakt, Blockfreie)
- Ebene mit ungefähren Fronten und Besatzungsgebieten im Zweiten Weltkrieg
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
   - `ne_50m_land.geojson`, `ne_50m_lakes.geojson` und `ne_50m_rivers_lake_centerlines.geojson` von https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
2. `npm run build:data` ausführen.

Ergänzungen zu CShapes (Annexionen, Besatzungsverwaltungen, Inseln), Ereignisse und Frontlinien stehen in `scripts/data`.

## Veröffentlichung

Jeder Push auf `main` baut die Seite mit GitHub Actions und veröffentlicht sie auf GitHub Pages (`.github/workflows/deploy.yml`).

## Quellen und Lizenzen

- **Grenzen:** CShapes 2.0 (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch; ETH Zürich), Lizenz [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de). Die daraus abgeleiteten Dateien in `public/data` (Grenzen, Gebietsänderungen, Beschriftungen, Fronten) stehen ebenfalls unter CC BY-NC-SA 4.0 und dürfen nur nicht-kommerziell verwendet werden.
- **Küsten, Seen, Flüsse:** Natural Earth (gemeinfrei).
- **Ereignisse:** für dieses Projekt zusammengestellt; Links führen zur deutschsprachigen Wikipedia.

CShapes bildet völkerrechtlich anerkannte Grenzen ab. Fronten und Besatzungsgebiete im Zweiten Weltkrieg sind Annäherungen zu ausgewählten Stichtagen, nachgezeichnete Trennlinien können um einige Kilometer abweichen.

Für den Programmcode ist noch keine Lizenz festgelegt.
