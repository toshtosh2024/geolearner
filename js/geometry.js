/* ============================================================
   TopoJSON → 単位座標(Web メルカトル 0..1)のパス
   ============================================================ */
const topo = WORLD_TOPO;
const SKIP = new Set([
  "Antarctica",
  "Fr. S. Antarctic Lands",
  "Heard I. and McDonald Is.",
  "S. Geo. and the Is.",
  "Ashmore and Cartier Is.",
  "Siachen Glacier",
  "Indian Ocean Ter.",
]);

function decodeArcs(t) {
  const [sx, sy] = t.transform.scale,
    [tx, ty] = t.transform.translate;
  return t.arcs.map((a) => {
    let x = 0,
      y = 0;
    return a.map((d) => {
      x += d[0];
      y += d[1];
      return [x * sx + tx, y * sy + ty];
    });
  });
}
const ARCS = decodeArcs(topo);
function arcOf(i) {
  return i < 0 ? ARCS[~i].slice().reverse() : ARCS[i];
}
function ringPts(ring) {
  let p = [];
  for (let k = 0; k < ring.length; k++) {
    const a = arcOf(ring[k]);
    p = p.concat(k ? a.slice(1) : a);
  }
  return p;
}
function proj(lon, lat) {
  const x = (lon + 180) / 360;
  const f = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  const y = (1 - Math.asinh(Math.tan(f)) / Math.PI) / 2;
  return [x, y];
}
const FEATURES = []; // {name, path, cx, cy, area, bbox}
for (const g of topo.objects.countries.geometries) {
  const name = g.properties.name;
  if (SKIP.has(name)) continue;
  const polys = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : null;
  if (!polys) continue;
  // 1) 環ごとに投影。環の内部で経度が飛ぶ場合は連続化しておく
  const shapes = polys.map((poly) =>
    poly.map((ring) => {
      const pts = ringPts(ring).map((p) => proj(p[0], p[1]));
      let off = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = pts[i][0] + off - pts[i - 1][0];
        if (d > 0.5) off -= 1;
        else if (d < -0.5) off += 1;
        pts[i][0] += off;
      }
      let sum = 0,
        a2 = 0;
      for (let i = 0, n = pts.length; i < n; i++) {
        sum += pts[i][0];
        const p = pts[i],
          q = pts[(i + 1) % n];
        a2 += p[0] * q[1] - q[0] * p[1];
      }
      return { pts, meanX: sum / pts.length, a2, area: Math.abs(a2 / 2) };
    }),
  );
  // 2) 最大の外環を基準に、日付変更線の反対側へ飛んだ環を本体側へ寄せる
  //    （ロシア東端やフィジーが地図の逆側に現れるのを防ぐ）
  let dom = 0,
    domA = -1;
  for (const rs of shapes) {
    const r = rs[0];
    if (r.area > domA) {
      domA = r.area;
      dom = r.meanX;
    }
  }
  for (const rs of shapes)
    for (const r of rs) {
      const s = Math.round(dom - r.meanX);
      if (s) {
        for (const p of r.pts) p[0] += s;
        r.meanX += s;
      }
    }
  // 3) パス・外接矩形・重心
  const path = new Path2D();
  let bestA = 0,
    cx = 0,
    cy = 0,
    x0 = 9,
    y0 = 9,
    x1 = -9,
    y1 = -9,
    totalA = 0;
  for (const rs of shapes) {
    for (const r of rs) {
      const pts = r.pts;
      path.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) path.lineTo(pts[i][0], pts[i][1]);
      path.closePath();
      for (const p of pts) {
        if (p[0] < x0) x0 = p[0];
        if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[1] > y1) y1 = p[1];
      }
    }
    const r0 = rs[0];
    totalA += r0.area;
    if (r0.area > bestA && r0.a2 !== 0) {
      bestA = r0.area;
      let px = 0,
        py = 0;
      const pts = r0.pts;
      for (let i = 0, n = pts.length; i < n; i++) {
        const p = pts[i],
          q = pts[(i + 1) % n],
          f = p[0] * q[1] - q[0] * p[1];
        px += (p[0] + q[0]) * f;
        py += (p[1] + q[1]) * f;
      }
      cx = px / (3 * r0.a2);
      cy = py / (3 * r0.a2);
    }
  }
  FEATURES.push({
    name,
    path,
    cx,
    cy,
    area: totalA,
    bbox: [x0, y0, x1, y1],
    data: countryText(name), // 表示言語を切り替えると main.js の setLang() で差し替わる
  });
}
const BY_NAME = {};
FEATURES.forEach((f, i) => {
  f.idx = i;
  BY_NAME[f.name] = f;
});
