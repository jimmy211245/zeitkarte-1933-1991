// Farbwelt der Karte. Gedämpfte Flächenfarben im Stil klassischer Schulatlanten;
// benachbarte Staaten erhalten im Build-Schritt verschiedene Farbindizes.

export const SEA = '#b9cbd2';
export const SEA_DEEP = '#aabfc8';
export const LAND = '#e4e1da';
export const INK = '#252a31';
export const RIVER = '#8fb0be';

export const STATE_COLORS = [
  '#e2c29d', // Sand
  '#bcd2a3', // Salbei
  '#e5b1aa', // Altrosa
  '#c4bfdf', // Lavendel
  '#e8d48f', // Stroh
  '#a8ccbe', // Graugrün
  '#d8b2cf', // Malve
  '#efbd8a', // Aprikose
  '#b9c7de', // Taubenblau
  '#d3c8a2', // Khaki
];

/** MapLibre-Ausdruck: Farbindex (Property `c`) → Farbe */
export function colorExpression(prop = 'c') {
  const expr = ['match', ['get', prop]];
  STATE_COLORS.forEach((col, i) => expr.push(i, col));
  expr.push('#d9d6cf');
  return expr;
}
