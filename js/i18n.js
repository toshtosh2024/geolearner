/* ============================================================
   表示言語（日本語 / 英語）
   ============================================================ */
const LANGS = ["ja", "en"];
const LANG_STORAGE_KEY = "geolearner.lang";

// URL の ?lang= → 保存済みの選択 → ブラウザの言語 の順で決める
// （?lang= は検索エンジンや共有リンク向けに、言語ごとの URL を持たせるため）
function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch (e) {
    // プライベートブラウズなどで localStorage が使えないときは無視する
  }
  return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
}
let lang = initialLang();

function saveLang() {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // 保存できなくても表示の切替はできるので無視する
  }
  // アドレスバーの URL も ?lang= に合わせる（そのまま共有できるように）
  try {
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(history.state, "", url);
  } catch (e) {
    // file:// で開いているときなど、URL を書き換えられない環境では何もしない
  }
}

// UI 文言（js/data/ui-text.js）を取り出す。値が関数なら引数を渡して組み立てる
function t(key, ...args) {
  const text = UI_TEXT[lang][key] ?? UI_TEXT.ja[key];
  return typeof text === "function" ? text(...args) : text;
}

// { ja: "…", en: "…" } 形式のラベルから現在の言語のものを取り出す
function loc(labels) {
  return labels[lang];
}

// HTML に直接書いてある文言を、data-i18n* 属性のキーで差し替える
function applyStaticText() {
  document.documentElement.lang = lang;
  document.title = t("app.docTitle");
  document.querySelector('meta[name="description"]').content = t("app.description");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("#langSeg button").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.lang === lang);
  });
}

/* ------------------------------------------------------------
   データの言語別ビュー
   ------------------------------------------------------------ */

// 国データ: 表示名は name、副題（日本語版で添える英語名）は altName にそろえる
const JA_NAME_TO_KEY = {};
for (const key in COUNTRIES) JA_NAME_TO_KEY[COUNTRIES[key].ja] = key;

const COUNTRY_TEXT = { ja: {}, en: {} };
for (const key in COUNTRIES) {
  const d = COUNTRIES[key];
  COUNTRY_TEXT.ja[key] = { ...d, name: d.ja, altName: key };
  COUNTRY_TEXT.en[key] = {
    ...d,
    name: key,
    ...COUNTRIES_EN[key],
    altName: "",
    // まぎらわしい国（vs）は日本語名で書かれているので、英語名に引き直す
    vs: (d.vs || []).map((v) => COUNTRIES_EN[JA_NAME_TO_KEY[v]]?.name ?? v),
  };
}

// 表示名 → 国キー（「まぎらわしい国」ボタンから国を引く用）
const NAME_TO_KEY = { ja: {}, en: {} };
for (const l of LANGS)
  for (const key in COUNTRY_TEXT[l]) NAME_TO_KEY[l][COUNTRY_TEXT[l][key].name] = key;

function countryText(key) {
  return COUNTRY_TEXT[lang][key] || null;
}

// 冠詞・つなぎ言葉
const GRAM_TEXT = { ja: GRAM, en: GRAM_EN };

// 宗教: 国ごとに { label: 分類名, detail: 内訳, cue: 景観の手がかり } をまとめておく
const RELIGION_TEXT = { ja: {}, en: {} };
for (const name in RELIG) {
  const [cat, detail, cue] = RELIG[name];
  if (!RELCAT[cat]) continue;
  const ja = RELCAT[cat];
  const en = RELCAT_EN[cat];
  const enCountry = RELIG_EN[name] || {};
  RELIGION_TEXT.ja[name] = { label: ja.label, detail: detail || ja.label, cue: cue || ja.cue };
  RELIGION_TEXT.en[name] = {
    label: en.label,
    detail: enCountry.detail || en.label,
    cue: enCountry.cue || en.cue,
  };
}
