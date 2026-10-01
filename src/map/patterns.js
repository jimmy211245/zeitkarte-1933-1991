// Schraffuren als Bildmuster für MapLibre (fill-pattern).
// hatch-dep:  Kolonien, Protektorate, Mandate (feine helle Diagonalen)
// hatch-war:  Annexionen und Besatzungsverwaltungen (dunkle Gegendiagonalen)
// dots-pup:   Satellitenstaaten (Punktraster)
// hatch-occ:  Kriegsbesetzung im Militärlayer (rote Schraffur)

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

function diagonal(size, color, width, reverse = false) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'square';
  g.beginPath();
  // drei Linien, damit das Muster nahtlos kachelt
  for (const o of [-size, 0, size]) {
    if (reverse) {
      g.moveTo(o, 0);
      g.lineTo(o + size, size);
    } else {
      g.moveTo(o, size);
      g.lineTo(o + size, 0);
    }
  }
  g.stroke();
  return g.getImageData(0, 0, size, size);
}

function dots(size, color, r) {
  const c = makeCanvas(size);
  const g = c.getContext('2d');
  g.fillStyle = color;
  for (const [x, y] of [[size / 4, size / 4], [(3 * size) / 4, (3 * size) / 4]]) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  return g.getImageData(0, 0, size, size);
}

export function addPatterns(map) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const s = Math.round(8 * ratio);
  const add = (id, data) => {
    if (!map.hasImage(id)) map.addImage(id, data, { pixelRatio: ratio });
  };
  add('hatch-dep', diagonal(s, 'rgba(255,255,255,0.75)', 1.4 * ratio));
  add('hatch-war', diagonal(s, 'rgba(37,42,49,0.42)', 1.1 * ratio, true));
  add('dots-pup', dots(s, 'rgba(37,42,49,0.38)', 0.9 * ratio));
  add('hatch-occ', diagonal(Math.round(7 * ratio), 'rgba(163,38,42,0.55)', 1.3 * ratio));
  add('hatch-occ-su', diagonal(Math.round(7 * ratio), 'rgba(176,32,32,0.5)', 1.3 * ratio, true));
  add('hatch-occ-west', diagonal(Math.round(7 * ratio), 'rgba(40,78,140,0.5)', 1.3 * ratio, true));
}
