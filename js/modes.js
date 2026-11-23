/* ============================================================
   カテゴリ定義
   ラベルは { ja, en } で持ち、loc() で表示言語のものを取り出す
   ============================================================ */
const MODES = {
  scr: {
    label: { ja: "街中の文字", en: "Script on signs" },
    cats: [
      ["latin", { ja: "ラテン文字", en: "Latin" }, "--s1"],
      ["cyrillic", { ja: "キリル文字", en: "Cyrillic" }, "--s2"],
      ["arabic", { ja: "アラビア文字", en: "Arabic" }, "--s3"],
      ["cjk", { ja: "漢字・かな・ハングル", en: "Chinese, Japanese & Korean" }, "--s4"],
      ["indic", { ja: "インド系文字", en: "Indic scripts" }, "--s5"],
      ["sea", { ja: "東南アジア系文字", en: "Southeast Asian scripts" }, "--s6"],
      ["other", { ja: "その他の固有文字", en: "Other native scripts" }, "--s7"],
    ],
  },
  fam: {
    label: { ja: "言語の系統", en: "Language family" },
    cats: [
      ["romance", { ja: "ロマンス語派", en: "Romance" }, "--s1"],
      ["germanic", { ja: "ゲルマン語派", en: "Germanic" }, "--s2"],
      ["slavic", { ja: "スラヴ語派", en: "Slavic" }, "--s3"],
      ["turkic", { ja: "テュルク諸語", en: "Turkic" }, "--s4"],
      ["semitic", { ja: "セム語派", en: "Semitic" }, "--s5"],
      ["indoiranian", { ja: "インド・イラン語派", en: "Indo-Iranian" }, "--s6"],
      ["easia", { ja: "東・東南アジア諸語", en: "East & Southeast Asian" }, "--s7"],
      ["other", { ja: "その他", en: "Other" }, "--s8"],
    ],
  },
  lingua: {
    label: { ja: "併記・通用する言語", en: "Second / common language" },
    cats: [
      ["en", { ja: "英語", en: "English" }, "--s1"],
      ["es", { ja: "スペイン語", en: "Spanish" }, "--s2"],
      ["fr", { ja: "フランス語", en: "French" }, "--s3"],
      ["pt", { ja: "ポルトガル語", en: "Portuguese" }, "--s4"],
      ["ru", { ja: "ロシア語", en: "Russian" }, "--s5"],
      ["ar", { ja: "アラビア語", en: "Arabic" }, "--s6"],
      ["other", { ja: "現地語のみが基本", en: "Mostly local language only" }, "--s7"],
    ],
  },
  rel: {
    label: { ja: "多数派の宗教", en: "Majority religion" },
    cats: [
      ["catholic", { ja: "カトリック", en: "Catholic" }, "--s1"],
      ["protestant", { ja: "プロテスタント系", en: "Protestant" }, "--s2"],
      ["orthodox", { ja: "正教会", en: "Orthodox" }, "--s3"],
      ["islam", { ja: "イスラム教", en: "Islam" }, "--s4"],
      ["buddhist", { ja: "仏教", en: "Buddhism" }, "--s5"],
      ["hindu", { ja: "ヒンドゥー教", en: "Hinduism" }, "--s6"],
      [
        "mixed",
        { ja: "その他・混在（無宗教が多数）", en: "Other / mixed (largely non-religious)" },
        "--s7",
      ],
    ],
  },
  sv: {
    label: { ja: "ストリートビュー", en: "Street View" },
    cats: [
      ["car", { ja: "公式カーあり", en: "Official coverage" }, "--o1"],
      ["partial", { ja: "一部・限定的", en: "Partial / limited" }, "--o2"],
      ["photo", { ja: "フォトのみ", en: "Photospheres only" }, "--o3"],
      ["none", { ja: "カバレッジなし", en: "No coverage" }, "--o4"],
    ],
  },
};
const SV_LABEL = {
  car: { ja: "公式カーあり", en: "Official coverage" },
  partial: { ja: "一部・限定的", en: "Partial / limited" },
  photo: { ja: "フォトスフィアのみ", en: "Photospheres only" },
  none: { ja: "カバレッジなし", en: "No coverage" },
};
