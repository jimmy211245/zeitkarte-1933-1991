// Minimaler TopoJSON-Decoder (Polygone und Punkte), damit gemeinsame Grenzlinien nur einmal
// übertragen werden müssen. Entspricht in der Logik topojson-client/feature.

function decodeArcs(topology) {
  const t = topology.transform;
  return topology.arcs.map((arc) => {
    if (!t) return arc;
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]];
    });
  });
}

export function topoToGeoJSON(topology, objectName) {
  const arcs = decodeArcs(topology);
  const t = topology.transform;
  const point = (p) => (t ? [p[0] * t.scale[0] + t.translate[0], p[1] * t.scale[1] + t.translate[1]] : p);

  const ring = (indexes) => {
    const out = [];
    indexes.forEach((i, k) => {
      const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      for (let j = k === 0 ? 0 : 1; j < a.length; j++) out.push(a[j]);
    });
    if (out.length < 4) while (out.length < 4) out.push(out[0]);
    return out;
  };

  const geometry = (g) => {
    switch (g.type) {
      case 'Polygon': return { type: 'Polygon', coordinates: g.arcs.map(ring) };
      case 'MultiPolygon': return { type: 'MultiPolygon', coordinates: g.arcs.map((p) => p.map(ring)) };
      case 'LineString': return { type: 'LineString', coordinates: ring(g.arcs) };
      case 'MultiLineString': return { type: 'MultiLineString', coordinates: g.arcs.map(ring) };
      case 'Point': return { type: 'Point', coordinates: point(g.coordinates) };
      default: return null;
    }
  };

  // ohne Objektnamen werden alle Objekte zusammengeführt (mapshaper trennt Flächen und Linien)
  const objs = objectName ? [topology.objects[objectName]] : Object.values(topology.objects);
  const geoms = objs.flatMap((obj) => (obj.type === 'GeometryCollection' ? obj.geometries : [obj]));
  return {
    type: 'FeatureCollection',
    features: geoms
      .filter((g) => g.type)
      .map((g) => ({ type: 'Feature', ...(g.id != null ? { id: g.id } : {}), properties: g.properties ?? {}, geometry: geometry(g) })),
  };
}
