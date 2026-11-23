/* ============================================================
   状態
   ============================================================ */
let mode = "scr",
  selected = null,
  hovered = null,
  dimCat = null,
  showLabels = true,
  view = "map";
const cv = document.getElementById("map"),
  ctx = cv.getContext("2d");
const pick = document.createElement("canvas"),
  pctx = pick.getContext("2d", { willReadFrequently: true });
let W = 0,
  H = 0,
  DPR = 1,
  pickDirty = true;
const T = { k: 1, x: 0, y: 0 }; // 単位座標 → 画面: px = u*k + x
const NARROW_LAYOUT = matchMedia("(max-width: 860px)"); // スマホ幅（CSS のブレークポイントと同じ）

// ドロワーが地図に重なっている分（PC は左、スマホ幅は下）。中心合わせやパンの範囲はこれを除いて考える
function mapInset() {
  const s = document.getElementById("side").getBoundingClientRect();
  const m = cv.getBoundingClientRect();
  return NARROW_LAYOUT.matches
    ? { left: 0, bottom: Math.max(0, m.bottom - s.top) }
    : { left: Math.max(0, s.right - m.left), bottom: 0 };
}

function css(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}
function catOf(f) {
  if (mode === "rel") {
    const k = (RELIG[f.name] || [])[0];
    return k ? (k === "other" ? "mixed" : k) : null;
  }
  if (!f.data) return null;
  return mode === "scr"
    ? f.data.scr
    : mode === "fam"
      ? f.data.fam
      : mode === "lingua"
        ? f.data.lingua
        : f.data.sv;
}
function relOf(name) {
  const r = RELIG[name];
  const text = RELIGION_TEXT[lang][name];
  return r && text ? { key: r[0], ...text } : null;
}
function colorOf(f) {
  const c = catOf(f);
  if (c == null) return css("--nodata");
  const def = MODES[mode].cats.find((x) => x[0] === c);
  return def ? css(def[2]) : css("--nodata");
}

function resize() {
  const r = cv.getBoundingClientRect();
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = r.width;
  H = r.height;
  cv.width = W * DPR;
  cv.height = H * DPR;
  pick.width = Math.max(1, Math.round(W / 2));
  pick.height = Math.max(1, Math.round(H / 2));
  pickDirty = true;
  draw();
}
function fitWorld() {
  const { left, bottom } = mapInset();
  const vw = W - left,
    vh = H - bottom; // ドロワーに隠れていない範囲
  const yTop = proj(0, 83)[1],
    yBot = proj(0, -58)[1];
  const k = Math.min(vw / 1.0, vh / (yBot - yTop));
  T.k = k;
  T.x = left + vw / 2 - 0.5 * k;
  T.y = vh / 2 - ((yTop + yBot) / 2) * k;
  clampT();
}
function clampT() {
  const { left, bottom } = mapInset();
  const vw = W - left,
    vh = H - bottom;
  T.k = Math.max(1, Math.min(60000, T.k));
  const minK = Math.min(vw, vh) * 0.35;
  if (T.k < minK) T.k = minK;
  T.x = Math.min(left + vw * 0.4, Math.max(left + vw * 0.6 - T.k, T.x));
  const h = T.k;
  T.y = Math.min(vh * 0.4, Math.max(vh * 0.6 - h, T.y));
}

function paint(c, scale, withStroke) {
  c.save();
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.clearRect(0, 0, W, H);
  if (withStroke) {
    c.fillStyle = css("--ocean");
    c.fillRect(0, 0, W, H);
  }
  c.setTransform(T.k * scale, 0, 0, T.k * scale, T.x * scale, T.y * scale);
  const lw = 0.6 / T.k;
  for (const f of FEATURES) {
    if (withStroke) {
      const c0 = catOf(f);
      let col = colorOf(f);
      if (dimCat && c0 !== dimCat) col = css("--nodata");
      c.fillStyle = col;
    } else {
      c.fillStyle =
        "rgb(" + ((f.idx >> 16) & 255) + "," + ((f.idx >> 8) & 255) + "," + (f.idx & 255) + ")";
    }
    c.fill(f.path, "evenodd");
    if (withStroke) {
      c.strokeStyle = css("--stroke");
      c.lineWidth = lw;
      c.stroke(f.path);
    }
  }
  if (withStroke) {
    c.lineJoin = "round";
    // ホバー中の国: 塗り色（アクセントの青と同じ色の国もある）に埋もれないよう、文字色で縁取る
    if (hovered && hovered !== selected) {
      c.globalAlpha = 0.6;
      c.strokeStyle = css("--ink");
      c.lineWidth = 1.6 / T.k;
      c.stroke(hovered.path);
      c.globalAlpha = 1;
    }
    // 選択中の国: 背景色の縁取り＋文字色の太線。どの塗り色・隣国の上でも境目が見えるように
    if (selected) {
      c.strokeStyle = css("--surface");
      c.lineWidth = 6 / T.k;
      c.stroke(selected.path);
      c.strokeStyle = css("--ink");
      c.lineWidth = 3 / T.k;
      c.stroke(selected.path);
    }
  }
  c.restore();
}
function drawLabels() {
  if (!showLabels) return;
  ctx.save();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '600 11px "Hiragino Sans","Noto Sans JP",sans-serif';
  const drawn = [];
  const list = FEATURES.filter((f) => f.data).sort((a, b) => b.area - a.area);
  for (const f of list) {
    const w = (f.bbox[2] - f.bbox[0]) * T.k;
    if (w < 44) continue;
    const x = f.cx * T.k + T.x,
      y = f.cy * T.k + T.y;
    if (x < -40 || x > W + 40 || y < 0 || y > H) continue;
    const label = f.data.name;
    const tw = ctx.measureText(label).width;
    if (drawn.some((d) => Math.abs(d.x - x) < (d.w + tw) / 2 + 6 && Math.abs(d.y - y) < 14))
      continue;
    drawn.push({ x, y, w: tw });
    ctx.lineWidth = 3.2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.strokeText(label, x, y);
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y);
  }
  ctx.restore();
}
function draw() {
  paint(ctx, DPR, true);
  drawLabels();
  pickDirty = true;
}
function inFeature(f, px, py) {
  ctx.save();
  ctx.setTransform(T.k * DPR, 0, 0, T.k * DPR, T.x * DPR, T.y * DPR);
  const r = ctx.isPointInPath(f.path, px * DPR, py * DPR, "evenodd");
  ctx.restore();
  return r;
}
function hit(px, py) {
  if (pickDirty) {
    paint(pctx, 0.5, false);
    pickDirty = false;
  }
  const d = pctx.getImageData(Math.round(px / 2), Math.round(py / 2), 1, 1).data;
  let cand = null;
  if (d[3] !== 0) {
    const i = (d[0] << 16) | (d[1] << 8) | d[2];
    if (i < FEATURES.length) cand = FEATURES[i];
  }
  // 判定用キャンバスは縮小＋アンチエイリアスのため境界で誤検出する。実際の形で検証する
  if (cand && inFeature(cand, px, py)) return cand;
  for (const f of FEATURES) {
    if (inFeature(f, px, py)) return f;
  }
  return null;
}
