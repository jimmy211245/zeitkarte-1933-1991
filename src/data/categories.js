import { t } from '../i18n.js';

// Ereigniskategorien mit Farben für Karte und Liste; `tape` ist die hellere Variante für das
// dunkle Zeitband.
export const CATEGORIES = {
  politik: { name: t('Politik'), color: '#3d5a80', tape: '#7c9cc6' },
  krieg: { name: t('Krieg und Militär'), color: '#a3262a', tape: '#d2554e' },
  vertrag: { name: t('Verträge und Konferenzen'), color: '#2f7d6d', tape: '#3fa48e' },
  verfolgung: { name: t('Verfolgung und Völkermord'), color: '#3a3a3a', tape: '#a7afb8' },
  krise: { name: t('Krisen des Kalten Krieges'), color: '#b8641e', tape: '#e08a33' },
  aufstand: { name: t('Aufstände und Revolutionen'), color: '#8a3f8c', tape: '#b771b9' },
  dekolonisation: { name: t('Dekolonisierung'), color: '#6b8e23', tape: '#94b947' },
  technik: { name: t('Wissenschaft und Technik'), color: '#4b7fa8', tape: '#6fa7d4' },
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
