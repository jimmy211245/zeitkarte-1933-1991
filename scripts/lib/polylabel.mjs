// "Pol der Unzugänglichkeit" eines Polygons: der Punkt im Inneren mit dem größten Abstand
// zum Rand – ideal für Beschriftungen. Nach dem Verfahren von Mapbox (polylabel, ISC-Lizenz).

function pointToSegmentDistSq(px, py, a, b) {
  let x = a[0], y = a[1];
  let dx = b[0] - x, dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = px - x; dy = py - y;
  return dx * dx + dy * dy;
}

function signedDist(x, y, rings) {
  let inside = false;
  let min = Infinity;
  for (const ring of rings) {
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
      min = Math.min(min, pointToSegmentDistSq(x, y, a, b));
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(min);
}

function cell(x, y, h, rings) {
  const d = signedDist(x, y, rings);
  return { x, y, h, d, max: d + h * Math.SQRT2 };
}

export function polylabel(rings, precision) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of rings[0]) {
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  const width = maxX - minX, height = maxY - minY;
  const size = Math.min(width, height);
  if (size === 0) return [minX, minY];
  precision = precision ?? Math.max(width, height) / 200;
  let h = size / 2;
  const queue = [];
  for (let x = minX; x < maxX; x += size) {
    for (let y = minY; y < maxY; y += size) queue.push(cell(x + h, y + h, h, rings));
  }
  // Startwert: Schwerpunkt der Bounding-Box
  let best = cell(minX + width / 2, minY + height / 2, 0, rings);
  for (const c of queue) if (c.d > best.d) best = c;
  let guard = 0;
  while (queue.length && guard++ < 20000) {
    // Zelle mit dem größten möglichen Abstand zuerst
    let bi = 0;
    for (let i = 1; i < queue.length; i++) if (queue[i].max > queue[bi].max) bi = i;
    const c = queue.splice(bi, 1)[0];
    if (c.d > best.d) best = c;
    if (c.max - best.d <= precision) continue;
    h = c.h / 2;
    queue.push(cell(c.x - h, c.y - h, h, rings), cell(c.x + h, c.y - h, h, rings), cell(c.x - h, c.y + h, h, rings), cell(c.x + h, c.y + h, h, rings));
  }
  return [best.x, best.y];
}
