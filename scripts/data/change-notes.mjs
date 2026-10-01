// Redaktionelle Titel und Texte für wichtige Gebietsänderungen.
// Schlüssel: 'JJJJ-MM-TT|von|nach' (Gebietsschlüssel wie in build/changes-report.txt).
export const CHANGE_NOTES = {};

// Automatisch erkannte Übergänge, die keine eigenständige Gebietsänderung sind
export const HIDDEN_CHANGES = new Set([
  '1940-08-03|366|365', // estnische Grenzgebiete (Narva, Petseri) – Teil der Annexion Estlands
  '1940-08-03|367|365', // lettisches Grenzgebiet (Abrene) – Teil der Annexion Lettlands
  '1947-08-15|750|710', // Abweichende Grenzdefinition Indien/China in CShapes, keine Gebietsabtretung
]);
