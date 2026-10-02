// Redaktionelle Titel und Texte für wichtige Gebietsänderungen.
// Schlüssel: 'JJJJ-MM-TT|von|nach' (Gebietsschlüssel wie in build/changes-report.txt).
// Änderungen mit Eintrag erscheinen auch dann in der Liste, wenn sie kleiner als 250 km² sind.
export const CHANGE_NOTES = {
  // Nahostkonflikt
  '1948-05-14|665|666': {
    title: 'Gründung Israels',
    text: 'Israel entsteht auf rund 78 Prozent des früheren Mandatsgebiets. Die Karte zeigt schon ab der Staatsgründung die Waffenstillstandslinien von 1949 („Grüne Linie“); während des Krieges 1948/49 verschoben sich die Fronten mehrfach.',
  },
  '1948-05-14|665|6511': {
    title: 'Gazastreifen unter ägyptischer Verwaltung',
    text: 'Ägyptische Truppen halten nach dem Krieg einen schmalen Küstenstreifen um Gaza, in den Zehntausende Flüchtlinge geflohen sind. Ägypten annektiert das Gebiet nicht.',
  },
  '1948-05-14|665|6631': {
    title: 'Westjordanland unter jordanischer Kontrolle',
    text: 'Die Arabische Legion Transjordaniens hält nach dem Krieg das Bergland westlich des Jordans einschließlich der Altstadt von Jerusalem.',
  },
  '1950-04-24|6631|6631': {
    title: 'Jordanien annektiert das Westjordanland',
    text: 'Jordanien gliedert das Westjordanland mit Ost-Jerusalem ein; die Bewohner erhalten die jordanische Staatsbürgerschaft. Kaum ein Staat erkennt die Annexion an, Großbritannien nur ohne Ost-Jerusalem.',
  },
  '1956-11-03|6511|GAZA-ISR': { title: 'Suezkrise: Israel besetzt den Gazastreifen' },
  '1956-11-05|651|SINAI-ISR': {
    title: 'Suezkrise: Israel besetzt den Sinai',
    text: 'Im Sinaifeldzug stößt Israel bis kurz vor den Suezkanal vor, Großbritannien und Frankreich landen in Port Said. Auf Druck der USA und der Sowjetunion ziehen sich alle drei bis März 1957 zurück.',
  },
  '1956-11-06|651|SUEZ-UKFR': { title: 'Suezkrise: Britisch-französische Landung in Port Said' },
  '1956-12-23|SUEZ-UKFR|651': { title: 'Abzug der britischen und französischen Truppen aus Port Said' },
  '1957-01-22|SINAI-ISR|651': { title: 'Israel räumt den Sinai bis auf die Küste am Golf von Akaba' },
  '1957-03-08|SINAI-ISR|651': {
    title: 'Israel räumt Scharm el-Scheich',
    text: 'Eine UN-Friedenstruppe (UNEF) übernimmt die Kontrolle; die Straße von Tiran bleibt für israelische Schiffe offen.',
  },
  '1957-03-08|GAZA-ISR|6511': { title: 'Gazastreifen wieder unter ägyptischer Verwaltung' },
  '1967-06-10|651|SINAI-ISR': { title: 'Sechstagekrieg: Israel besetzt den Sinai' },
  '1967-06-10|6511|GAZA-ISR': { title: 'Sechstagekrieg: Israel besetzt den Gazastreifen' },
  '1967-06-10|6631|WB-ISR': {
    title: 'Sechstagekrieg: Israel besetzt das Westjordanland',
    text: 'Mit dem Westjordanland fällt auch Ost-Jerusalem an Israel. Nach dem Völkerrecht gilt das Gebiet als besetzt; Israel beginnt bald mit dem Bau von Siedlungen.',
  },
  '1967-06-10|652|GOLAN-ISR': {
    title: 'Sechstagekrieg: Israel besetzt die Golanhöhen',
    text: 'Über 100 000 Bewohnerinnen und Bewohner fliehen oder werden vertrieben; in einigen drusischen Dörfern bleiben rund 6 000 Menschen.',
  },
  '1967-06-28|WB-ISR|EJER-ISR': {
    title: 'Israel annektiert Ost-Jerusalem',
    text: 'Israel dehnt die Stadtgrenze Jerusalems auf den Ostteil und umliegende Dörfer des Westjordanlands aus. Die UNO erklärt die Annexion für ungültig. Dargestellt ist die heutige israelische Stadtgrenze (nach Natural Earth).',
  },
  '1973-10-14|652|GOLAN-ISR': {
    title: 'Jom-Kippur-Krieg: Israel stößt Richtung Damaskus vor',
    text: 'Nach der Abwehr des syrischen Angriffs erobern israelische Truppen eine Enklave jenseits der Waffenstillstandslinie von 1967, etwa 40 Kilometer vor Damaskus (Linie vereinfacht).',
  },
  '1973-10-24|651|SUEZW-ISR': {
    title: 'Jom-Kippur-Krieg: Israel am Westufer des Suezkanals',
    text: 'Beim Waffenstillstand hält Israel einen Brückenkopf westlich des Kanals und hat die ägyptische 3. Armee eingeschlossen (Linie vereinfacht).',
  },
  '1973-10-24|SINAI-ISR|651': {
    title: 'Jom-Kippur-Krieg: Ägyptische Brückenköpfe am Ostufer',
    text: 'Ägyptische Truppen haben am 6. Oktober den Kanal überschritten und die israelische Bar-Lew-Linie überrannt. Sie halten zwei Streifen am Ostufer (vereinfacht).',
  },
  '1974-03-05|SINAI-ISR|651': {
    title: 'Sinai I: Truppenentflechtung am Suezkanal',
    text: 'Nach dem Abkommen vom 18. Januar 1974 zieht sich Israel auf eine Linie rund 20 bis 30 Kilometer östlich des Kanals zurück; dazwischen überwacht eine UN-Truppe eine Pufferzone (Linie vereinfacht).',
  },
  '1974-03-05|SUEZW-ISR|651': { title: 'Israel räumt das Westufer des Suezkanals' },
  '1974-06-26|GOLAN-ISR|652': {
    title: 'Golan: Truppenentflechtung',
    text: 'Israel räumt die 1973 eroberte Enklave und die zerstörte Stadt Quneitra. Dazwischen überwacht die UN-Truppe UNDOF eine Pufferzone.',
  },
  '1976-02-22|SINAI-ISR|651': {
    title: 'Sinai II: Rückgabe der Pässe und Ölfelder',
    text: 'Nach dem Interimsabkommen vom 4. September 1975 räumt Israel die Mitla- und Gidi-Pässe und die Ölfelder von Abu Rudeis am Golf von Suez (Linie vereinfacht).',
  },
  '1978-03-15|660|LBN-ISR': {
    title: 'Litani-Operation: Israel besetzt den Südlibanon',
    text: 'Nach einem Anschlag der Fatah besetzt Israel den Süden des Libanon bis zum Litani, ohne die Stadt Tyros (Linie vereinfacht).',
  },
  '1978-06-14|LBN-ISR|660': {
    title: 'Israel zieht aus dem Südlibanon ab',
    text: 'UN-Truppen (UNIFIL) rücken ein; einen Grenzstreifen übergibt Israel an die verbündete christliche Miliz von Saad Haddad.',
  },
  '1980-01-26|SINAI-ISR|651': {
    title: 'Sinai: Rückzug hinter die Linie El Arisch–Ras Muhammad',
    text: 'Gemäß dem Friedensvertrag gibt Israel bis Januar 1980 zwei Drittel des Sinai zurück, darunter El Arisch (schon im Mai 1979) und das Katharinenkloster.',
  },
  '1981-12-14|GOLAN-ISR|GOLAN-ISR': {
    title: 'Israel annektiert die Golanhöhen',
    text: 'Das Golanhöhen-Gesetz unterstellt das Gebiet israelischem Recht. Der UN-Sicherheitsrat erklärt die Annexion in Resolution 497 für nichtig.',
  },
  '1982-04-25|SINAI-ISR|651': {
    title: 'Abschluss des israelischen Rückzugs aus dem Sinai',
    text: 'Israel räumt das letzte Drittel mit Scharm el-Scheich und der Siedlung Jamit. Über das Grenzstück Taba wird bis 1989 gestritten.',
  },
  '1982-06-10|660|LBN-ISR': {
    title: 'Libanonkrieg: Israel besetzt den Süden bis vor Beirut',
    text: 'Die israelische Armee rückt bis an den Stadtrand von Beirut, ins Schuf-Gebirge und in die südliche Bekaa-Ebene vor (Linie vereinfacht).',
  },
  '1983-09-04|LBN-ISR|660': { title: 'Israel zieht sich an den Awali zurück' },
  '1985-06-10|LBN-ISR|660': {
    title: 'Israel zieht sich in die „Sicherheitszone“ zurück',
    text: 'Ein 10 bis 20 Kilometer breiter Grenzstreifen bleibt bis Mai 2000 besetzt und wird gemeinsam mit der Südlibanesischen Armee kontrolliert; die Hisbollah bekämpft die Besatzung (Linie vereinfacht).',
  },
};

// Automatisch erkannte Übergänge, die keine eigenständige Gebietsänderung sind
export const HIDDEN_CHANGES = new Set([
  '1940-08-03|366|365', // estnische Grenzgebiete (Narva, Petseri) – Teil der Annexion Estlands
  '1940-08-03|367|365', // lettisches Grenzgebiet (Abrene) – Teil der Annexion Lettlands
  '1947-08-15|750|710', // Abweichende Grenzdefinition Indien/China in CShapes, keine Gebietsabtretung
  '1985-06-10|LBN-ISR|LBN-ISR', // nur Namenswechsel zur „Sicherheitszone“, siehe Rückzug am selben Tag
]);
