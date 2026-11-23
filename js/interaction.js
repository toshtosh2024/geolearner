/* ============================================================
   インタラクション
   ============================================================ */
let drag = null,
  moved = 0,
  userMoved = false;
cv.addEventListener("pointerdown", (e) => {
  drag = { x: e.clientX, y: e.clientY };
  moved = 0;
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener("pointermove", (e) => {
  const r = cv.getBoundingClientRect(),
    mx = e.clientX - r.left,
    my = e.clientY - r.top;
  if (drag) {
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    moved += Math.abs(dx) + Math.abs(dy);
    T.x += dx;
    T.y += dy;
    drag = { x: e.clientX, y: e.clientY };
    userMoved = true;
    clampT();
    draw();
    document.getElementById("tip").style.display = "none";
    return;
  }
  const f = hit(mx, my);
  const tip = document.getElementById("tip");
  if (f !== hovered) {
    hovered = f;
    draw();
  }
  if (f) {
    const cat = catOf(f),
      def = cat ? MODES[mode].cats.find((x) => x[0] === cat) : null;
    tip.innerHTML = f.data
      ? "<b>" +
        f.data.name +
        "</b><br><small>" +
        f.data.langs +
        '</small><br><small style="color:' +
        colorOf(f) +
        '">■</small> <small>' +
        (def ? loc(def[1]) : "") +
        "</small>"
      : "<b>" + f.name + "</b><br><small>" + t("map.noData") + "</small>";
    tip.style.display = "block";
    const w = tip.offsetWidth,
      h = tip.offsetHeight;
    tip.style.left = Math.min(W - w - 8, mx + 14) + "px";
    tip.style.top = Math.max(4, my - h - 12) + "px";
  } else tip.style.display = "none";
});
cv.addEventListener("pointerup", (e) => {
  const r = cv.getBoundingClientRect();
  if (drag && moved < 5) {
    const f = hit(e.clientX - r.left, e.clientY - r.top);
    if (view === "quiz" && quiz && !quiz.done) {
      if (f) finishQuiz(f);
    } else if (f) selectCountry(f.name, true); // 地図クリックでは視点を動かさない
  }
  drag = null;
});
cv.addEventListener("pointerleave", () => {
  hovered = null;
  document.getElementById("tip").style.display = "none";
  draw();
});
cv.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const r = cv.getBoundingClientRect(),
      mx = e.clientX - r.left,
      my = e.clientY - r.top;
    const s = Math.exp(-e.deltaY * 0.0022);
    const ux = (mx - T.x) / T.k,
      uy = (my - T.y) / T.k;
    userMoved = true;
    T.k *= s;
    clampT();
    T.x = mx - ux * T.k;
    T.y = my - uy * T.k;
    clampT();
    draw();
  },
  { passive: false },
);
function zoomBy(s) {
  userMoved = true;
  // ドロワーに隠れていない範囲の中央を軸にズームする
  const { left, bottom } = mapInset();
  const cx = left + (W - left) / 2,
    cy = (H - bottom) / 2;
  const ux = (cx - T.x) / T.k,
    uy = (cy - T.y) / T.k;
  T.k *= s;
  clampT();
  T.x = cx - ux * T.k;
  T.y = cy - uy * T.k;
  clampT();
  draw();
}
document.getElementById("zin").onclick = () => zoomBy(1.6);
document.getElementById("zout").onclick = () => zoomBy(1 / 1.6);
document.getElementById("zreset").onclick = () => {
  userMoved = false;
  fitWorld();
  draw();
};

function flyTo(f, pad) {
  userMoved = true;
  // ドロワーに隠れていない範囲の中央に寄せる
  const { left, bottom } = mapInset();
  const vw = W - left,
    vh = H - bottom;
  const [x0, y0, x1, y1] = f.bbox;
  const w = Math.max(x1 - x0, 0.004),
    h = Math.max(y1 - y0, 0.004);
  const k = Math.min(vw / (w * (pad || 2.6)), vh / (h * (pad || 2.6)));
  const k0 = T.k,
    x0s = T.x,
    y0s = T.y;
  const kt = Math.max(Math.min(vw, vh) * 0.35, k),
    xt = left + vw / 2 - ((x0 + x1) / 2) * kt,
    yt = vh / 2 - ((y0 + y1) / 2) * kt;
  const t0 = performance.now();
  (function step(t) {
    const p = Math.min(1, (t - t0) / 450),
      e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    T.k = k0 + (kt - k0) * e;
    T.x = x0s + (xt - x0s) * e;
    T.y = y0s + (yt - y0s) * e;
    clampT();
    draw();
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
