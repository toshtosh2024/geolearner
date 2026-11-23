/* ============================================================
   サイドバー
   ============================================================ */
const side = document.getElementById("side");
function gramsOf(name) {
  return (CGRAM[name] || []).map((c) => GRAM_TEXT[lang][c]).filter(Boolean);
}
function gramText(name) {
  // 検索用の平文
  return gramsOf(name)
    .map((g) => [g.n, g.the, g.a, g.of, g.and, g.or, g.tip].filter(Boolean).join(" "))
    .join(" ");
}
function gramHTML(name) {
  const gs = gramsOf(name);
  if (!gs.length) return "";
  const row = (l, v) => (v ? '<div class="grow"><i>' + l + "</i><span>" + v + "</span></div>" : "");
  return (
    '<div class="sec"><h4>' +
    t("side.grammar") +
    "</h4>" +
    gs
      .map(
        (g) =>
          '<div class="gblk"><div class="gname">' +
          g.n +
          "</div>" +
          row(t("gram.the"), g.the) +
          row(t("gram.a"), g.a) +
          row(t("gram.of"), g.of) +
          row(t("gram.and"), g.and) +
          row(t("gram.or"), g.or) +
          (g.tip ? '<div class="gtip">' + g.tip + "</div>" : "") +
          "</div>",
      )
      .join("") +
    "</div>"
  );
}
function placeholder() {
  side.innerHTML = t("side.placeholder");
}
function selectCountry(name, noFly) {
  const f = BY_NAME[name];
  if (!f) return;
  selected = f;
  draw();
  if (!noFly) flyTo(f);
  const d = f.data;
  if (!d) {
    side.innerHTML =
      '<h2 class="c-name">' + f.name + '</h2><p class="c-en">' + t("side.noData") + "</p>";
    return;
  }
  const cat = catOf(f),
    def = cat ? MODES[mode].cats.find((x) => x[0] === cat) : null;
  const rel = relOf(f.name);
  side.innerHTML =
    '<h2 class="c-name">' +
    d.name +
    '</h2><p class="c-en">' +
    d.altName +
    "</p>" +
    '<div class="badges">' +
    '<span class="badge"><span class="sw" style="background:' +
    colorOf(f) +
    '"></span>' +
    (def ? loc(def[1]) : "—") +
    "</span>" +
    '<span class="badge">' +
    d.scrLabel +
    "</span>" +
    (rel ? '<span class="badge">' + rel.label + "</span>" : "") +
    '<span class="badge">' +
    t("side.sv") +
    loc(SV_LABEL[d.sv]) +
    "</span>" +
    "</div>" +
    '<div class="sec"><h4>' +
    t("side.langs") +
    "</h4><p>" +
    d.langs +
    "</p>" +
    '<p style="color:var(--ink-3);font-size:12px;margin-top:2px">' +
    d.famLabel +
    "</p></div>" +
    (d.keys && d.keys.length
      ? '<div class="sec"><h4>' +
        t("side.keys") +
        '</h4><div class="keys">' +
        d.keys.map((k) => '<span class="key">' + k + "</span>").join("") +
        "</div></div>"
      : "") +
    gramHTML(f.name) +
    (rel
      ? '<div class="sec"><h4>' +
        t("side.religion") +
        '</h4><div class="gblk">' +
        '<div class="gname">' +
        rel.detail +
        "</div>" +
        '<div class="gtip">' +
        rel.cue +
        "</div></div></div>"
      : "") +
    (d.signs && d.signs.length
      ? '<div class="sec"><h4>' +
        t("side.signs") +
        '</h4><div class="words">' +
        d.signs.map((k) => '<span class="word">' + k + "</span>").join("") +
        "</div></div>"
      : "") +
    (d.stop
      ? '<div class="sec"><h4>' +
        t("side.stop") +
        '</h4><span class="stopsign">' +
        d.stop +
        "</span></div>"
      : "") +
    '<div class="sec"><h4>' +
    t("side.tips") +
    "</h4><p>" +
    d.tips +
    "</p></div>" +
    (d.vs && d.vs.length
      ? '<div class="sec"><h4>' +
        t("side.vs") +
        '</h4><div class="vs">' +
        d.vs.map((v) => '<button data-name="' + v + '">' + v + "</button>").join("") +
        "</div></div>"
      : "");
  side.querySelectorAll(".vs button").forEach(
    (b) =>
      (b.onclick = () => {
        const n = NAME_TO_KEY[lang][b.dataset.name];
        if (n) selectCountry(n);
      }),
  );
}
