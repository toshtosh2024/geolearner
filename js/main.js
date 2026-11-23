/* ============================================================
   ビュー切替・検索・テーマ・表示言語
   ============================================================ */
function setView(v) {
  view = v;
  document
    .querySelectorAll("#viewSeg button")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === v));
  document.getElementById("stage").classList.toggle("hidden", v === "table");
  document.getElementById("tablewrap").classList.toggle("hidden", v !== "table");
  document.getElementById("quizbar").classList.toggle("hidden", v !== "quiz");
  side.parentElement.style.display = "flex";
  if (v === "table") {
    tableFilter = qEl.value;
    renderTable();
  }
  if (v === "quiz") {
    if (!quiz) newQuiz();
    else renderQuiz();
    showLabels = false;
    draw();
  }
  if (v === "map") {
    quiz = null;
    showLabels = true;
  }
  if (v !== "table") {
    requestAnimationFrame(() => {
      resize();
      if (!userMoved) fitWorld();
      draw();
    });
  }
}
document
  .querySelectorAll("#viewSeg button")
  .forEach((b) => (b.onclick = () => setView(b.dataset.view)));
document.querySelectorAll("#modeSeg button").forEach(
  (b) =>
    (b.onclick = () => {
      mode = b.dataset.mode;
      dimCat = null;
      document
        .querySelectorAll("#modeSeg button")
        .forEach((x) => x.setAttribute("aria-pressed", x.dataset.mode === mode));
      renderLegend();
      draw();
      if (view === "table") renderTable();
      if (selected) selectCountry(selected.name, true);
    }),
);
document.getElementById("labelBtn").onclick = () => {
  showLabels = !showLabels;
  draw();
};
document.getElementById("themeBtn").onclick = () => {
  const cur =
    document.documentElement.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  renderLegend();
  draw();
  if (view === "table") renderTable();
};

// 表示言語の切替: 国データを差し替えて、表示中のものをすべて描き直す
function setLang(next) {
  if (next === lang || !LANGS.includes(next)) return;
  lang = next;
  saveLang();
  for (const f of FEATURES) f.data = countryText(f.name);
  applyStaticText();
  suggEl.style.display = "none";
  renderLegend();
  draw();
  if (view === "table") renderTable();
  if (view === "quiz") renderQuiz();
  if (selected) selectCountry(selected.name, true);
  else if (view === "quiz") renderQuizIntro();
  else placeholder();
}
document
  .querySelectorAll("#langSeg button")
  .forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));

const qEl = document.getElementById("q"),
  suggEl = document.getElementById("sugg");
qEl.addEventListener("input", () => {
  const v = qEl.value.trim().toLowerCase();
  if (view === "table") {
    tableFilter = qEl.value;
    renderTable();
    suggEl.style.display = "none";
    return;
  }
  if (!v) {
    suggEl.style.display = "none";
    return;
  }
  const hits = FEATURES.filter(
    (f) =>
      f.data &&
      [
        f.data.name,
        f.name,
        f.data.langs,
        f.data.scrLabel,
        (f.data.keys || []).join(" "),
        (f.data.signs || []).join(" "),
        f.data.stop || "",
        gramText(f.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(v),
  ).slice(0, 10);
  suggEl.innerHTML =
    hits
      .map(
        (f) =>
          '<div data-n="' +
          f.name +
          '"><b>' +
          f.data.name +
          '</b> <span style="color:var(--ink-3)">' +
          f.data.langs +
          "</span></div>",
      )
      .join("") || '<div style="color:var(--ink-3)">' + t("search.noHits") + "</div>";
  suggEl.style.display = "block";
  suggEl.querySelectorAll("div[data-n]").forEach(
    (el) =>
      (el.onclick = () => {
        selectCountry(el.dataset.n);
        suggEl.style.display = "none";
        qEl.value = "";
      }),
  );
});
qEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const first = suggEl.querySelector("div[data-n]");
    if (first) {
      first.click();
    }
  }
  if (e.key === "Escape") {
    suggEl.style.display = "none";
    qEl.blur();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) suggEl.style.display = "none";
});

function relayout() {
  const k0 = T.k,
    x0 = T.x,
    y0 = T.y;
  resize();
  if (userMoved) {
    T.k = k0;
    T.x = x0;
    T.y = y0;
    clampT();
  } else fitWorld();
  draw();
}
window.addEventListener("resize", relayout);
new ResizeObserver(relayout).observe(document.getElementById("stage"));
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  renderLegend();
  draw();
});

applyStaticText();
resize();
fitWorld();
renderLegend();
placeholder();
draw();
