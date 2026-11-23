/* ============================================================
   凡例
   ============================================================ */
function renderLegend() {
  const m = MODES[mode];
  const counts = {};
  FEATURES.forEach((f) => {
    const c = catOf(f);
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  document.getElementById("legend").innerHTML =
    "<h4>" +
    loc(m.label).toUpperCase() +
    "</h4>" +
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
          '<span style="margin-left:auto;color:var(--ink-3);font-size:11px">' +
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
  document
    .getElementById("legend")
    .querySelectorAll(".row")
    .forEach((r) => {
      r.onclick = () => {
        dimCat = dimCat === r.dataset.cat || !r.dataset.cat ? null : r.dataset.cat;
        renderLegend();
        draw();
      };
    });
}
