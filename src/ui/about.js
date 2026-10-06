// Dialog "Über diese Karte": Quellen, Methode, Grenzen der Darstellung, Bedienung.
import { themeList } from '../data/themes.js';
import { LANG, t } from '../i18n.js';

const DE = ({ events, changes }) => `
    <div class="about-inner">
      <button type="button" class="close" aria-label="${t('Schließen')}"><svg><use href="#i-close"/></svg></button>
      <h2>Über diese Karte</h2>
      <p>Die Zeitkarte zeigt Staatsgrenzen, Kolonialreiche und ${events} Ereignisse vom 30. Januar 1933, dem Tag von Hitlers Ernennung zum Reichskanzler, bis zur Auflösung der Sowjetunion Ende 1991. Jede Grenze ist tagesgenau hinterlegt; ${changes} Gebietsänderungen werden automatisch erkannt und lassen sich einzeln aufrufen.</p>

      <h3>Bedienung</h3>
      <ul>
        <li>Zeitband ziehen oder anklicken, Mausrad zoomt die Zeitachse. Die Übersichtsleiste darüber springt direkt in ein Jahr.</li>
        <li>Pfeiltasten: einen Monat vor oder zurück (mit Umschalt ein Jahr, mit Alt einen Tag). Leertaste: abspielen. Bild↑/Bild↓: vorheriges oder nächstes Ereignis.</li>
        <li>Klick auf ein Land zeigt Name, Status und Gültigkeit der Grenzen; Klick auf einen Punkt öffnet das Ereignis.</li>
        <li>Die Adresszeile merkt sich Datum und Ausschnitt – so lassen sich Ansichten als Link teilen.</li>
        <li>Die Auswahl „Schwerpunkt“ beschränkt Liste, Karte und Zeitband auf ein Thema und zeigt die Region: ${themeList().map((th) => `${th.name} (Link: <code>?thema=${th.id}</code>)`).join(', ')}. Ein Ereignis kann zu mehreren Schwerpunkten gehören. Beim Peel-Plan und beim UN-Teilungsplan erscheint der jeweilige Plan auf der Karte.</li>
      </ul>

      <h3>Quellen und Methode</h3>
      <ul>
        <li><b>Grenzen:</b> CShapes 2.0 (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch; ETH Zürich), Lizenz CC BY-NC-SA 4.0. CShapes bildet völkerrechtliche Grenzen ab und lässt Änderungen unter 10 000 km² sowie im Krieg erzwungene und danach rückgängig gemachte Änderungen weg.</li>
        <li><b>Ergänzungen:</b> Annexionen und Besatzungsverwaltungen 1938–1945 (z. B. Anschluss Österreichs, Teilung Polens, Zerschlagung Jugoslawiens), Mandschukuo, Istrien, Saargebiet, Hatay, Berlin, Triest, Okinawa und fehlende Inseln wurden für diese Karte nachgezeichnet. Die Trennlinien sind vereinfacht und können um einige Kilometer abweichen.</li>
        <li><b>Nahostkonflikt:</b> Die besetzten Gebiete sind einzeln und mit ihren Veränderungen erfasst (Suezkrise 1956/57, Sechstagekrieg, Jom-Kippur-Krieg, schrittweise Rückgabe des Sinai 1974–1982, Annexionen von Ost-Jerusalem und Golan, Südlibanon 1978–1985). Ost-Jerusalem und die UN-Pufferzone auf dem Golan folgen Natural Earth, die übrigen Linien sind vereinfacht nachgezeichnet. Die Teilungspläne von 1937 und 1947 sind schematisch nach Karten der britischen Regierung (1938) und der CIA (1973) gezeichnet, beide gemeinfrei.</li>
        <li><b>Deutsche Teilung:</b> Westzonen und Sowjetische Besatzungszone sind als zwei Gebiete erfasst, Berlin als Gebiet unter Viermächteverwaltung, ab Dezember 1948 mit Ost- und West-Berlin; das Saarland erscheint 1947–1956 mit dem Status „Protektorat“ (offiziell teilautonom unter französischer Aufsicht). Die Grenze der Westzonen untereinander (amerikanische, britische, französische Zone), die Berliner Sektoren und die Bezirke der DDR (ab 1952) sind nicht eingezeichnet. Länder erscheinen ab 1949 im heutigen Zuschnitt.</li>
        <li><b>Binnengrenzen:</b> Nur für Länder, deren Gliederung sich für die jeweilige Zeit belegen lässt: Bundesstaaten der USA, Provinzen Kanadas, Bundesstaaten Mexikos, Brasiliens und Australiens, Länder der Bundesrepublik, der DDR (bis 1952), Österreichs und Kantone der Schweiz nach Natural Earth (heutiger Zuschnitt, für frühere Zeiträume zusammengelegt) sowie die Teilrepubliken der Sowjetunion, Jugoslawiens und der Tschechoslowakei nach den Grenzen ihrer Nachfolgestaaten (CShapes).</li>
        <li><b>Basiskarte:</b> Natural Earth (gemeinfrei). Moderne Stauseen erscheinen erst ab ihrer Entstehung, der Aralsee in seiner damaligen Größe.</li>
        <li><b>Ereignisse:</b> redaktionell zusammengestellt; Links führen je nach Sprache zur deutschen oder englischen Wikipedia.</li>
      </ul>

      <h3>Hinweis</h3>
      <p>Daten auf Grundlage von CShapes dürfen nur nicht-kommerziell verwendet werden. Fronten und Besatzungsgebiete im Zweiten Weltkrieg sind Annäherungen zu ausgewählten Stichtagen.</p>
    </div>`;

const EN = ({ events, changes }) => `
    <div class="about-inner">
      <button type="button" class="close" aria-label="Close"><svg><use href="#i-close"/></svg></button>
      <h2>About this map</h2>
      <p>The timeline map shows state borders, colonial empires and ${events} events from 30 January 1933, the day Hitler was appointed Chancellor, to the dissolution of the Soviet Union at the end of 1991. Every border is stored to the day; ${changes} territorial changes are detected automatically and can be opened one by one.</p>
      <p class="about-note"><i>Note:</i> The interface and the events (titles, places, descriptions) are available in English; territorial changes and map labels are currently available in German only.</p>

      <h3>Controls</h3>
      <ul>
        <li>Drag or click the timeline; the mouse wheel zooms the time axis. The overview bar above jumps straight to a year.</li>
        <li>Arrow keys: one month forward or back (with Shift one year, with Alt one day). Space: play. Page Up/Page Down: previous or next event.</li>
        <li>Clicking a country shows its name, status and the validity of its borders; clicking a dot opens the event.</li>
        <li>The address bar remembers date and map section, so views can be shared as a link.</li>
        <li>The “Focus” menu limits list, map and timeline to one topic and shows the region: ${themeList().map((th) => `${t(th.name)} (link: <code>?thema=${th.id}</code>)`).join(', ')}. An event can belong to several topics. For the Peel Plan and the UN Partition Plan, the respective plan appears on the map. The language can be set with <code>?lang=en</code> or <code>?lang=de</code>.</li>
      </ul>

      <h3>Sources and method</h3>
      <ul>
        <li><b>Borders:</b> CShapes 2.0 (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch; ETH Zurich), licence CC BY-NC-SA 4.0. CShapes depicts borders under international law and omits changes under 10,000 km² as well as changes forced during war and later reversed.</li>
        <li><b>Additions:</b> Annexations and occupation administrations 1938–1945 (e.g. the Anschluss of Austria, partition of Poland, dismemberment of Yugoslavia), Manchukuo, Istria, the Saar territory, Hatay, Berlin, Trieste, Okinawa and missing islands were redrawn for this map. The dividing lines are simplified and may deviate by a few kilometres.</li>
        <li><b>Middle East conflict:</b> The occupied territories are recorded individually with their changes (Suez Crisis 1956/57, Six-Day War, Yom Kippur War, gradual return of Sinai 1974–1982, annexations of East Jerusalem and the Golan, southern Lebanon 1978–1985). East Jerusalem and the UN buffer zone on the Golan follow Natural Earth; the other lines are redrawn in simplified form. The partition plans of 1937 and 1947 are drawn schematically after maps of the British government (1938) and the CIA (1973), both in the public domain.</li>
        <li><b>Division of Germany:</b> The western zones and the Soviet occupation zone are recorded as two areas, Berlin as an area under four-power administration, from December 1948 with East and West Berlin; the Saarland appears 1947–1956 with the status “protectorate” (officially semi-autonomous under French supervision). The boundaries between the western zones (American, British, French), the Berlin sectors and the districts of the GDR (from 1952) are not shown. States appear in their present form from 1949.</li>
        <li><b>Internal borders:</b> Only for countries whose subdivision can be documented for the period: US states, Canadian provinces, Mexican, Brazilian and Australian states, states of the Federal Republic, the GDR (until 1952), Austria and Swiss cantons after Natural Earth (present-day form, merged for earlier periods) as well as the republics of the Soviet Union, Yugoslavia and Czechoslovakia following the borders of their successor states (CShapes).</li>
        <li><b>Base map:</b> Natural Earth (public domain). Modern reservoirs appear only from their creation; the Aral Sea at its then size.</li>
        <li><b>Events:</b> editorially compiled; links lead to the English-language Wikipedia.</li>
      </ul>

      <h3>Notice</h3>
      <p>Data based on CShapes may only be used non-commercially. Fronts and occupied areas in the Second World War are approximations for selected dates.</p>
    </div>`;

export function setupAbout(dialog, button, counts) {
  dialog.innerHTML = (LANG === 'en' ? EN : DE)(counts);
  button.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
