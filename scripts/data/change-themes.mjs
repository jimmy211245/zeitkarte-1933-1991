// Zuordnung von Gebietsänderungen zu Schwerpunktthemen (Themen: src/data/themes.js).
// Schlüssel: 'JJJJ-MM-TT|von|nach' (wie in build/changes-report.txt und change-notes.mjs).
// Die Zuordnung ist redaktionell und nicht geografisch: Eine Änderung in der Nähe eines
// Themengebiets gehört nur dazu, wenn sie hier steht.
export const CHANGE_THEMES = {
  nahost: [
    // Entstehung der Staaten der Region
    '1944-11-22|660|660', // Unabhängigkeit: Libanon
    '1946-01-01|652|652', // Unabhängigkeit: Syrien
    '1946-05-25|663|663', // Unabhängigkeit: Transjordanien
    '1949-04-26|663|663', // Umbenennung: Transjordanien → Jordanien
    '1958-02-22|651|651', // Umbenennung: Ägypten → Vereinigte Arabische Republik
    '1958-02-22|652|652', // VAR (Syrien): unabhängiger Staat → Teil des Mutterlandes
    '1961-09-28|652|652', // Syrien: wieder unabhängiger Staat
    '1971-09-02|651|651', // Umbenennung: Vereinigte Arabische Republik → Ägypten
    // Palästinakrieg 1948/49 und Annexion des Westjordanlandes
    '1948-05-14|665|666', // Gründung Israels
    '1948-05-14|665|6511', // Gazastreifen unter ägyptischer Verwaltung
    '1948-05-14|665|6631', // Westjordanland unter jordanischer Kontrolle
    '1950-04-24|6631|6631', // Jordanien annektiert das Westjordanland
    // Suezkrise 1956/57
    '1956-11-03|6511|GAZA-ISR',
    '1956-11-05|651|SINAI-ISR',
    '1956-11-06|651|SUEZ-UKFR',
    '1956-12-23|SUEZ-UKFR|651',
    '1957-01-22|SINAI-ISR|651',
    '1957-03-08|SINAI-ISR|651',
    '1957-03-08|GAZA-ISR|6511',
    // Sechstagekrieg 1967
    '1967-06-10|651|SINAI-ISR',
    '1967-06-10|6511|GAZA-ISR',
    '1967-06-10|6631|WB-ISR',
    '1967-06-10|652|GOLAN-ISR',
    '1967-06-28|WB-ISR|EJER-ISR',
    // Jom-Kippur-Krieg 1973 und Entflechtungsabkommen
    '1973-10-14|652|GOLAN-ISR',
    '1973-10-24|SINAI-ISR|651',
    '1973-10-24|651|SUEZW-ISR',
    '1974-03-05|SINAI-ISR|651',
    '1974-03-05|SUEZW-ISR|651',
    '1974-06-26|GOLAN-ISR|652',
    '1976-02-22|SINAI-ISR|651',
    // Rückgabe des Sinai, Annexion des Golan
    '1980-01-26|SINAI-ISR|651',
    '1981-12-14|GOLAN-ISR|GOLAN-ISR',
    '1982-04-25|SINAI-ISR|651',
    // Südlibanon 1978–1985
    '1978-03-15|660|LBN-ISR',
    '1978-06-14|LBN-ISR|660',
    '1982-06-10|660|LBN-ISR',
    '1983-09-04|LBN-ISR|660',
    '1985-06-10|LBN-ISR|660',
  ],
  'deutsche-teilung': [
    // Besatzungszeit 1945: Westzonen und SBZ, Berlin, Verluste östlich von Oder und Neiße
    '1945-05-08|255|260', // Deutsches Reich → Westzonen
    '1945-05-08|255|265', // Deutsches Reich → Sowjetische Besatzungszone
    '1945-05-08|255|BERLIN', // Deutsches Reich → Berlin (Viermächteverwaltung)
    '1945-05-08|255|290', // Deutsches Reich → Polen (Gebiete östlich von Oder und Neiße)
    '1945-05-08|255|365', // Deutsches Reich → UdSSR (nördliches Ostpreußen)
    // Saarland als französisches Protektorat und Rückkehr zur Bundesrepublik
    '1947-12-17|260|SAAR',
    '1957-01-01|SAAR|260',
    // Spaltung Berlins, zwei deutsche Staaten
    '1948-12-01|BERLIN|265', // Berlin → Ost-Berlin (SBZ)
    '1948-12-01|BERLIN|WBERLIN',
    '1949-05-23|260|260', // BRD: wieder unabhängiger Staat
    '1949-10-07|265|265', // DDR: wieder unabhängiger Staat
    // Wiedervereinigung 1990
    '1990-10-03|WBERLIN|260',
    '1990-10-03|265|260',
    '1990-10-03|260|260', // Umbenennung: Bundesrepublik Deutschland → Deutschland
  ],
};
