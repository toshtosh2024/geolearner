/* ============================================================
   凡例
   見出しをクリックすると開閉できる。スマホ幅では地図が狭いので最初は閉じておく
   ============================================================ */
let legendOpen = !NARROW_LAYOUT.matches;
function renderLegend() {
  const m = MODES[mode];
  const counts = {};
  FEATURES.forEach((f) => {
    const c = catOf(f);
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  const legend = document.getElementById("legend");
  legend.classList.toggle("collapsed", !legendOpen);
  legend.innerHTML =
    "<h4>" +
    loc(m.label).toUpperCase() +
    '<span class="chev">' +
    (legendOpen ? "▾" : "▸") +
    "</span></h4>" +
    m.cats
      .map(
        (c) =>
          '<div class="row' +
          (dimCat && dimCat !== c[0] ? " dim" : "") +
          '" data-cat="' +
          c[0] +
          '">' +
          '<span class="sw" style="background:' +
          css(c[2]) +
          '"></span>' +
          loc(c[1]) +
          '<span class="count">' +
          (counts[c[0]] || 0) +
          "</span></div>",
      )
      .join("") +
    '<div class="row' +
    (dimCat ? " dim" : "") +
    '" data-cat=""><span class="sw" style="background:' +
    css("--nodata") +
    '"></span>' +
    t("legend.noData") +
    "</div>";
  legend.querySelector("h4").onclick = () => {
    legendOpen = !legendOpen;
    renderLegend();
  };
  legend.querySelectorAll(".row").forEach((r) => {
    r.onclick = () => {
      dimCat = dimCat === r.dataset.cat || !r.dataset.cat ? null : r.dataset.cat;
      renderLegend();
      draw();
    };
  });
}
