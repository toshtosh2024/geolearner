// 画面の固定文言（日本語 / 英語）。t("キー") で取り出す
// 値が関数のものは、t("キー", 引数...) で文言を組み立てる
const UI_TEXT = {
  ja: {
    "app.docTitle": "GeoGuessr 言語マップ｜世界の文字と言語で国を当てる",
    "app.title": "言語マップ",
    "app.subtitle": "GeoGuessr 用・世界の文字と言語",
    "app.description":
      "GeoGuessr で国を当てるための学習マップ。看板の文字・言語・冠詞・宗教・ストリートビューのカバレッジを国ごとに地図と一覧で確認でき、手がかりから国を当てるクイズもあります。",

    "view.map": "地図",
    "view.table": "一覧",
    "view.quiz": "クイズ",

    "mode.scr": "文字",
    "mode.fam": "語族",
    "mode.lingua": "通用語",
    "mode.rel": "宗教",
    "mode.sv": "SV",

    "search.placeholder": "国名・言語で検索",
    "search.noHits": "該当なし",
    "btn.labels": "🏷 ラベル",
    "btn.labelsTitle": "国名ラベルの表示切替",
    "btn.themeTitle": "ライト / ダーク",
    "btn.langTitle": "表示言語",
    "zoom.resetTitle": "全体表示",

    "map.noData": "データ未収録",
    "legend.noData": "データなし",

    "side.placeholder":
      '<div class="ph"><p style="font-size:15px;color:var(--ink);font-weight:600;margin:0 0 8px">' +
      "国をクリックすると詳細が出ます</p>" +
      "・上部タブで <b>文字 / 語族 / 通用語 / SV</b> の塗り分けを切替<br>" +
      "・<kbd>ホイール</kbd> でズーム、<kbd>ドラッグ</kbd> で移動<br>" +
      "・検索は <b>ő / och / és / dhe</b> のような看板の断片でも引けます<br>" +
      "・凡例をクリックするとそのカテゴリだけ強調<br>" +
      "・<b>一覧</b>タブで全データを検索、<b>クイズ</b>タブで手がかりから国当て<br><br>" +
      '<span style="color:var(--ink-3);font-size:12px">※ ストリートビューのカバレッジは目安です（撮影状況により変動します）。</span></div>',
    "side.noData": "データ未収録の国・地域です",
    "side.sv": "SV: ",
    "side.langs": "言語",
    "side.keys": "決め手になる文字・綴り",
    "side.grammar": "冠詞・つなぎ言葉",
    "side.religion": "多数派の宗教",
    "side.signs": "街でよく見る語",
    "side.stop": "一時停止標識",
    "side.tips": "見分けかた",
    "side.vs": "まぎらわしい国",
    "side.resizeTitle": "ドラッグでサイズ調整（ダブルクリックで元に戻す）",

    "gram.the": "定冠詞",
    "gram.a": "不定冠詞",
    "gram.of": "〜の",
    "gram.and": "と(and)",
    "gram.or": "または",

    "table.name": "国",
    "table.langs": "言語",
    "table.scr": "文字",
    "table.rel": "宗教",
    "table.stop": "STOP標識",
    "table.sv": "SV",
    "table.grammar": "冠詞 / と(and)",
    "table.keys": "決め手",
    "table.and": "と: ",

    "quiz.intro":
      '<div class="ph"><p style="font-size:15px;color:var(--ink);font-weight:600;margin:0 0 8px">' +
      "クイズモード</p>手がかりを読んで、その国を<b>地図上でクリック</b>してください。<br>" +
      "ヒントを増やすほど得点は下がります（4点→1点）。<br><br>" +
      '<span style="color:var(--ink-3);font-size:12px">「地図」タブに戻ると通常モードに戻ります。</span></div>',
    "quiz.prompt": "この手がかりの国を地図でクリック",
    "quiz.score": (score, asked, streak, best) =>
      score + " / " + asked + "　連続 " + streak + "（最高 " + best + "）",
    "quiz.next": "次の問題 →",
    "quiz.moreHint": (cost) => "ヒントを追加（−" + cost + "）",
    "quiz.giveUp": "答えを見る",
    "quiz.correct": (answer) => "正解！ " + answer,
    "quiz.wrong": (answer) => "正解は " + answer,
    "quiz.picked": (picked) => "（選択：" + picked + "）",
    "quiz.sep": "　",
    "quiz.keys": "決め手：",
    "quiz.articles": "冠詞：",
    "quiz.and": "と(and)：",
    "quiz.of": "〜の：",
    "quiz.script": "文字：",
    "quiz.signs": "街の語：",
    "quiz.stop": "STOP標識：",
    "quiz.religion": "宗教：",
    "quiz.family": "系統：",
    "quiz.langs": "言語：",
  },

  en: {
    "app.docTitle": "GeoGuessr Language Map | Tell countries apart by script and language",
    "app.title": "Language Map",
    "app.subtitle": "Scripts & languages for GeoGuessr",
    "app.description":
      "A study map for GeoGuessr: check each country's script, language, articles, religion and Street View coverage on a map or in a table, and practice with a clue-based quiz.",

    "view.map": "Map",
    "view.table": "Table",
    "view.quiz": "Quiz",

    "mode.scr": "Script",
    "mode.fam": "Family",
    "mode.lingua": "Lingua",
    "mode.rel": "Religion",
    "mode.sv": "SV",

    "search.placeholder": "Search country or language",
    "search.noHits": "No matches",
    "btn.labels": "🏷 Labels",
    "btn.labelsTitle": "Show / hide country labels",
    "btn.themeTitle": "Light / Dark",
    "btn.langTitle": "Language",
    "zoom.resetTitle": "Fit world",

    "map.noData": "No data yet",
    "legend.noData": "No data",

    "side.placeholder":
      '<div class="ph"><p style="font-size:15px;color:var(--ink);font-weight:600;margin:0 0 8px">' +
      "Click a country to see its details</p>" +
      "• Use the top tabs to color the map by <b>Script / Family / Lingua / SV</b><br>" +
      "• <kbd>Scroll</kbd> to zoom, <kbd>drag</kbd> to pan<br>" +
      "• Search also works with sign fragments like <b>ő / och / és / dhe</b><br>" +
      "• Click a legend item to highlight only that category<br>" +
      "• The <b>Table</b> tab lets you search all data; the <b>Quiz</b> tab has you guess countries from clues<br><br>" +
      '<span style="color:var(--ink-3);font-size:12px">* Street View coverage is approximate (it changes as imagery is updated).</span></div>',
    "side.noData": "No data for this country / region yet",
    "side.sv": "SV: ",
    "side.langs": "LANGUAGES",
    "side.keys": "GIVEAWAY LETTERS & SPELLINGS",
    "side.grammar": "ARTICLES & CONNECTORS",
    "side.religion": "MAJORITY RELIGION",
    "side.signs": "COMMON WORDS ON SIGNS",
    "side.stop": "STOP SIGN",
    "side.tips": "HOW TO TELL IT APART",
    "side.vs": "EASILY CONFUSED WITH",
    "side.resizeTitle": "Drag to resize (double-click to reset)",

    "gram.the": "the",
    "gram.a": "a / an",
    "gram.of": "of",
    "gram.and": "and",
    "gram.or": "or",

    "table.name": "COUNTRY",
    "table.langs": "LANGUAGES",
    "table.scr": "SCRIPT",
    "table.rel": "RELIGION",
    "table.stop": "STOP SIGN",
    "table.sv": "SV",
    "table.grammar": "ARTICLE / AND",
    "table.keys": "GIVEAWAYS",
    "table.and": "and: ",

    "quiz.intro":
      '<div class="ph"><p style="font-size:15px;color:var(--ink);font-weight:600;margin:0 0 8px">' +
      "Quiz mode</p>Read the clues and <b>click that country on the map</b>.<br>" +
      "Each extra hint lowers the score (4 pts → 1 pt).<br><br>" +
      '<span style="color:var(--ink-3);font-size:12px">Go back to the "Map" tab to leave quiz mode.</span></div>',
    "quiz.prompt": "CLICK THE COUNTRY THAT MATCHES THESE CLUES",
    "quiz.score": (score, asked, streak, best) =>
      score + " / " + asked + " · Streak " + streak + " (best " + best + ")",
    "quiz.next": "Next question →",
    "quiz.moreHint": (cost) => "Add a hint (−" + cost + ")",
    "quiz.giveUp": "Show answer",
    "quiz.correct": (answer) => "Correct! " + answer,
    "quiz.wrong": (answer) => "The answer was " + answer,
    "quiz.picked": (picked) => " (you picked " + picked + ")",
    "quiz.sep": " · ",
    "quiz.keys": "Giveaways: ",
    "quiz.articles": "Articles: ",
    "quiz.and": "and: ",
    "quiz.of": "of: ",
    "quiz.script": "Script: ",
    "quiz.signs": "Words on signs: ",
    "quiz.stop": "STOP sign: ",
    "quiz.religion": "Religion: ",
    "quiz.family": "Family: ",
    "quiz.langs": "Languages: ",
  },
};
