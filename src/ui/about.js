// Dialog "Über diese Karte": Quellen, Methode, Grenzen der Darstellung, Bedienung.
export function setupAbout(dialog, button, { events, changes }) {
  dialog.innerHTML = `
    <div class="about-inner">
      <button type="button" class="close" aria-label="Schließen"><svg><use href="#i-close"/></svg></button>
      <h2>Über diese Karte</h2>
      <p>Die Zeitkarte zeigt Staatsgrenzen, Kolonialreiche und ${events} Ereignisse vom 30. Januar 1933, dem Tag von Hitlers Ernennung zum Reichskanzler, bis zur Auflösung der Sowjetunion Ende 1991. Jede Grenze ist tagesgenau hinterlegt; ${changes} Gebietsänderungen werden automatisch erkannt und lassen sich einzeln aufrufen.</p>

      <h3>Bedienung</h3>
      <ul>
        <li>Zeitband ziehen oder anklicken, Mausrad zoomt die Zeitachse. Die Übersichtsleiste darüber springt direkt in ein Jahr.</li>
        <li>Pfeiltasten: einen Monat vor oder zurück (mit Umschalt ein Jahr, mit Alt einen Tag). Leertaste: abspielen. Bild↑/Bild↓: vorheriges oder nächstes Ereignis.</li>
        <li>Klick auf ein Land zeigt Name, Status und Gültigkeit der Grenzen; Klick auf einen Punkt öffnet das Ereignis.</li>
        <li>Die Adresszeile merkt sich Datum und Ausschnitt – so lassen sich Ansichten als Link teilen.</li>
      </ul>

      <h3>Quellen und Methode</h3>
      <ul>
        <li><b>Grenzen:</b> CShapes 2.0 (Schvitz, Girardin, Rüegger, Weidmann, Cederman, Gleditsch; ETH Zürich), Lizenz CC BY-NC-SA 4.0. CShapes bildet völkerrechtliche Grenzen ab und lässt Änderungen unter 10 000 km² sowie im Krieg erzwungene und danach rückgängig gemachte Änderungen weg.</li>
        <li><b>Ergänzungen:</b> Annexionen und Besatzungsverwaltungen 1938–1945 (z. B. Anschluss Österreichs, Teilung Polens, Zerschlagung Jugoslawiens), Mandschukuo, Istrien, Saargebiet, Hatay, Berlin, Triest, Okinawa und fehlende Inseln wurden für diese Karte nachgezeichnet. Die Trennlinien sind vereinfacht und können um einige Kilometer abweichen.</li>
        <li><b>Basiskarte:</b> Natural Earth (gemeinfrei). Moderne Stauseen erscheinen erst ab ihrer Entstehung, der Aralsee in seiner damaligen Größe.</li>
        <li><b>Ereignisse:</b> redaktionell zusammengestellt; Links führen zur deutschsprachigen Wikipedia.</li>
      </ul>

      <h3>Hinweis</h3>
      <p>Daten auf Grundlage von CShapes dürfen nur nicht-kommerziell verwendet werden. Fronten und Besatzungsgebiete im Zweiten Weltkrieg sind Annäherungen zu ausgewählten Stichtagen.</p>
    </div>`;
  button.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
