/* ============================================================
   ドロワー（サイドバー）のサイズ調整
   PC は左端のドロワーの幅、スマホ幅は下から出るシートの高さを変える
   縁のつまみをドラッグ / 矢印キーで変更、ダブルクリックで既定に戻す
   地図の描き直しは main.js の ResizeObserver が自動で行う
   ============================================================ */
const resizer = document.getElementById("sideResizer");
const mainEl = document.querySelector("main");

const SIDE_SIZE_KEY = { w: "geolearner.sideWidth", h: "geolearner.sideHeight" };
const SIDE_MIN = { w: 240, h: 120 }; // ドロワーの最小サイズ
const MAP_MIN = { w: 280, h: 140 }; // 地図側に最低限残すサイズ（CSS の --drawer-w / --drawer-h と同じ値）

// PC は幅（w）、スマホ幅は高さ（h）を調整する
function sideAxis() {
  return NARROW_LAYOUT.matches ? "h" : "w";
}

function setSideSize(axis, px) {
  const r = mainEl.getBoundingClientRect();
  const max = (axis === "w" ? r.width : r.height) - MAP_MIN[axis];
  const size = Math.round(Math.max(SIDE_MIN[axis], Math.min(max, px)));
  mainEl.style.setProperty("--side-" + axis, size + "px");
}

function saveSideSize(axis) {
  try {
    localStorage.setItem(
      SIDE_SIZE_KEY[axis],
      parseInt(mainEl.style.getPropertyValue("--side-" + axis), 10),
    );
  } catch (e) {
    // 保存できなくても調整はできるので無視する
  }
}

function resetSideSize(axis) {
  mainEl.style.removeProperty("--side-" + axis);
  try {
    localStorage.removeItem(SIDE_SIZE_KEY[axis]);
  } catch (e) {
    // 同上
  }
}

function updateResizerOrientation() {
  // つまみの線の向き（横並びなら縦線）
  resizer.setAttribute("aria-orientation", sideAxis() === "w" ? "vertical" : "horizontal");
}

/* ---- ドラッグ ---- */
// 掴んだ時点のサイズとポインタ位置を覚えておき、そこからの移動量だけ変える
// （つまみのどこを掴んでも、掴んだ瞬間にサイズが跳ねないように）
let resizeStart = null;
function sideSizeOf(axis) {
  const side = document.getElementById("side").getBoundingClientRect();
  return axis === "w" ? side.width : side.height;
}
resizer.addEventListener("pointerdown", (e) => {
  const axis = sideAxis();
  resizeStart = { axis, size: sideSizeOf(axis), x: e.clientX, y: e.clientY };
  resizer.setPointerCapture(e.pointerId);
  resizer.classList.add("dragging");
  document.body.classList.add("resizing");
});
resizer.addEventListener("pointermove", (e) => {
  if (!resizeStart) return;
  const { axis, size, x, y } = resizeStart;
  // 横並びは右へ、縦並び（サイドバーが下）は上へ動かすと大きくなる
  setSideSize(axis, axis === "w" ? size + (e.clientX - x) : size + (y - e.clientY));
});
function endResize() {
  if (!resizeStart) return;
  saveSideSize(resizeStart.axis);
  resizeStart = null;
  resizer.classList.remove("dragging");
  document.body.classList.remove("resizing");
}
resizer.addEventListener("pointerup", endResize);
resizer.addEventListener("pointercancel", endResize);
resizer.addEventListener("dblclick", () => resetSideSize(sideAxis()));

/* ---- キーボード（Shift で大きく動かす） ---- */
resizer.addEventListener("keydown", (e) => {
  const axis = sideAxis();
  const step = e.shiftKey ? 64 : 16;
  const keys =
    axis === "w" ? { ArrowLeft: -step, ArrowRight: step } : { ArrowUp: step, ArrowDown: -step };
  if (!(e.key in keys)) return;
  e.preventDefault();
  setSideSize(axis, sideSizeOf(axis) + keys[e.key]);
  saveSideSize(axis);
});

/* ---- 起動時: 保存したサイズを復元（はみ出す分は CSS の max-width / max-height で抑える） ---- */
for (const axis of ["w", "h"]) {
  try {
    const px = parseInt(localStorage.getItem(SIDE_SIZE_KEY[axis]), 10);
    if (px > 0) mainEl.style.setProperty("--side-" + axis, px + "px");
  } catch (e) {
    // 同上
  }
}
updateResizerOrientation();
NARROW_LAYOUT.addEventListener("change", updateResizerOrientation);
