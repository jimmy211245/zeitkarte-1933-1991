import { t } from '../i18n.js';

// Statusbezeichnungen (wie im Build-Skript scripts/data/polities.mjs)
export const STATUS_LABELS = {
  ind: t('unabhängiger Staat'),
  col: t('Kolonie'),
  prot: t('Protektorat'),
  mand: t('Mandatsgebiet des Völkerbunds'),
  trust: t('UN-Treuhandgebiet'),
  terr: t('abhängiges Gebiet'),
  cond: t('Kondominium'),
  part: t('Teil des Mutterlandes'),
  ann: t('annektiert'),
  adm: t('unter fremder Verwaltung'),
  occ: t('besetzt'),
  pup: t('Satellitenstaat'),
  unrec: t('international nicht anerkannt'),
};
