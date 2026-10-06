import { t } from '../i18n.js';

// Ereigniskategorien mit Farben für Karte, Zeitband und Liste.
export const CATEGORIES = {
  politik: { name: t('Politik'), color: '#3d5a80' },
  krieg: { name: t('Krieg und Militär'), color: '#a3262a' },
  vertrag: { name: t('Verträge und Konferenzen'), color: '#2f7d6d' },
  verfolgung: { name: t('Verfolgung und Völkermord'), color: '#3a3a3a' },
  krise: { name: t('Krisen des Kalten Krieges'), color: '#b8641e' },
  aufstand: { name: t('Aufstände und Revolutionen'), color: '#8a3f8c' },
  dekolonisation: { name: t('Dekolonisierung'), color: '#6b8e23' },
  technik: { name: t('Wissenschaft und Technik'), color: '#4b7fa8' },
};

export const CHANGE_TYPES = {
  annexion: t('Annexion'),
  besetzung: t('Besetzung oder Verwaltung'),
  gebiet: t('Gebietswechsel'),
  unabhaengigkeit: t('Unabhängigkeit'),
  wiederherstellung: t('Wiederherstellung'),
  umbenennung: t('Umbenennung'),
  status: t('Statusänderung'),
};
