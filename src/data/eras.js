import { t } from '../i18n.js';

// Epochen für das Zeitband. Die Einteilung des Ost-West-Konflikts folgt der in deutschen
// Schulbüchern üblichen Phasengliederung.
export const ERAS = [
  { from: '1933-01-30', to: '1939-08-31', name: t('NS-Diktatur und Vorkriegszeit'), short: t('Vorkriegszeit'), color: '#d8cdb9' },
  { from: '1939-09-01', to: '1945-09-02', name: t('Zweiter Weltkrieg'), short: t('Zweiter Weltkrieg'), color: '#c9a3a0' },
  { from: '1945-09-03', to: '1949-12-31', name: t('Nachkriegszeit und Blockbildung'), short: t('Nachkriegszeit'), color: '#cfd4c4' },
  { from: '1950-01-01', to: '1962-10-28', name: t('Konfrontation im Kalten Krieg'), short: t('Konfrontation'), color: '#b7c4d3' },
  { from: '1962-10-29', to: '1979-12-24', name: t('Entspannungspolitik'), short: t('Entspannung'), color: '#c8d6cb' },
  { from: '1979-12-25', to: '1985-03-10', name: t('Neue Konfrontation'), short: t('Neue Konfrontation'), color: '#b9bfd6' },
  { from: '1985-03-11', to: '1991-12-31', name: t('Ende des Kalten Krieges'), short: t('Ende des Kalten Krieges'), color: '#d7d1bf' },
];
