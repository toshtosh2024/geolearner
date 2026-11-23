/* ============================================================
   クイズ
   ============================================================ */
const QPOOL = FEATURES.filter((f) => f.data && (f.data.keys || []).length && f.data.sv !== "none");
let quiz = null;
function newQuiz() {
  let f;
  do {
    f = QPOOL[Math.floor(Math.random() * QPOOL.length)];
  } while (QPOOL.length > 1 && quiz && f === quiz.f);
  quiz = { f, hints: 1, done: false, result: null };
  selected = null;
  hovered = null;
  userMoved = false;
  fitWorld();
  draw();
  renderQuizIntro();
  renderQuiz();
}
function renderQuizIntro() {
  side.innerHTML = t("quiz.intro");
}
function renderQuiz() {
  const bar = document.getElementById("quizbar");
  if (!quiz) {
    bar.innerHTML = "";
    return;
  }
  const d = quiz.f.data;
  const g0 = gramsOf(quiz.f.name)[0];
  const rel = relOf(quiz.f.name);
  const lbl = (key) => "<b>" + t(key) + "</b>";
  const sep = t("quiz.sep");
  const hintList = [
    lbl("quiz.keys") + (d.keys || []).slice(0, 3).join(" / "),
    g0
      ? lbl("quiz.articles") +
        (g0.the || "—") +
        sep +
        lbl("quiz.and") +
        (g0.and || "—") +
        sep +
        lbl("quiz.of") +
        (g0.of || "—")
      : lbl("quiz.script") + d.scrLabel,
    lbl("quiz.signs") +
      (d.signs || []).join(" / ") +
      (d.stop ? sep + lbl("quiz.stop") + d.stop : ""),
    rel ? lbl("quiz.religion") + rel.detail : lbl("quiz.family") + d.famLabel,
    lbl("quiz.script") + d.scrLabel + sep + lbl("quiz.family") + d.famLabel,
    lbl("quiz.langs") + d.langs,
  ];
  bar.innerHTML =
    '<div class="qhead"><span>' +
    t("quiz.prompt") +
    "</span></div>" +
    '<div class="qbody">' +
    hintList
      .slice(0, quiz.hints)
      .map((h) => "<div>" + h + "</div>")
      .join("") +
    "</div>" +
    '<div class="qact">' +
    (quiz.done
      ? '<button class="btn primary" id="qnext">' + t("quiz.next") + "</button>"
      : '<button class="btn" id="qhint">' +
        t("quiz.moreHint") +
        "</button>" +
        '<button class="btn" id="qgive">' +
        t("quiz.giveUp") +
        "</button>") +
    '<span id="qres">' +
    (quiz.result ? quizResultHTML() : "") +
    "</span></div>" +
    (quiz.done ? '<div class="qnote">' + d.tips + "</div>" : "");
  const hb = document.getElementById("qhint");
  if (hb)
    hb.onclick = () => {
      if (quiz.hints < hintList.length) {
        quiz.hints++;
        renderQuiz();
      }
    };
  const gb = document.getElementById("qgive");
  if (gb) gb.onclick = () => finishQuiz(null);
  const nb = document.getElementById("qnext");
  if (nb) nb.onclick = newQuiz;
}
function quizResultHTML() {
  const { correct, picked } = quiz.result;
  const answer = quiz.f.data.name;
  if (correct) return '<span class="result ok">' + t("quiz.correct", answer) + "</span>";
  return (
    '<span class="result ng">' +
    t("quiz.wrong", answer) +
    "</span>" +
    (picked ? t("quiz.picked", picked.data ? picked.data.name : picked.name) : "")
  );
}
function finishQuiz(f) {
  if (!quiz || quiz.done) return;
  const correct = f && f.name === quiz.f.name;
  quiz.done = true;
  quiz.hints = 4;
  // 言語を切り替えて描き直しても結果が消えないよう、状態として持っておく
  quiz.result = { correct, picked: f };
  selectCountry(quiz.f.name, false);
  setTimeout(renderQuiz, 20);
}
