/* ============================================================
   詳細地図（MapLibre GL JS ＋ OpenFreeMap の背景地図）
   - 地図右下のトグルで「シンプル（canvas の地図）」と切り替える
   - MapLibre は「詳細」を選んだときに初めて CDN から読み込む
   - 国の塗り分け・選択・ホバー・クイズは、シンプルな地図と同じ状態（mode / selected / hovered …）を使う
     map.js の draw / fitWorld / resize、interaction.js の flyTo / zoomBy が、
     詳細表示中はここの関数（syncDetailMap / detailFitWorld …）を呼ぶ
   ============================================================ */
const MAPLIBRE_URL = "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl";
const BASEMAP_STYLE = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};
const BASEMAP_STORAGE_KEY = "geolearner.baseMap";
const WORLD_BOUNDS = [
  [-180, -58],
  [180, 83],
]; // 世界全体表示の範囲（シンプルな地図の fitWorld と同じ）
const NO_COUNTRY = ["==", ["get", "name"], ""]; // どの国にも当たらないフィルター
const countryIs = (name) => ["==", ["get", "name"], name];

const detailEl = document.getElementById("detailMap");
const baseSeg = document.getElementById("baseSeg");
const detail = {
  map: null, // maplibregl.Map
  loading: null, // MapLibre 本体を読み込み中の Promise
  creating: null, // 地図を作成中の Promise
  wanted: "simple", // 最後に選ばれた地図の種類（読み込み中に切り替えられた場合の判定用）
  styleKey: null, // 今の背景スタイル（light / dark）
  colorKey: null, // 塗り色を最後に反映したときの状態
  labelsShown: null, // 地名ラベルを最後に反映したときの状態
};

/* ---------- 国のポリゴン（TopoJSON → 経度・緯度の GeoJSON） ---------- */
let countryGeoJSON = null;
// 環の途中で経度が ±180° をまたいで飛ぶ場合は連続にしておく（MapLibre は 180° を超える経度も描ける）
function unwrapRing(pts) {
  let off = 0,
    prev = pts[0][0];
  return pts.map((p, i) => {
    if (i) {
      const d = p[0] + off - prev;
      if (d > 180) off -= 360;
      else if (d < -180) off += 360;
    }
    prev = p[0] + off;
    return [prev, p[1]];
  });
}
function buildCountryGeoJSON() {
  const features = [];
  for (const g of topo.objects.countries.geometries) {
    const name = g.properties.name;
    if (SKIP.has(name) || !BY_NAME[name]) continue;
    const polys = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : null;
    if (!polys) continue;
    features.push({
      type: "Feature",
      properties: { name },
      geometry: {
        type: "MultiPolygon",
        coordinates: polys.map((poly) => poly.map((ring) => unwrapRing(ringPts(ring)))),
      },
    });
  }
  return { type: "FeatureCollection", features };
}

/* ---------- MapLibre の読み込みと地図の作成 ---------- */
function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve();
  if (!detail.loading) {
    detail.loading = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MAPLIBRE_URL + ".css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = MAPLIBRE_URL + ".js";
      script.onload = resolve;
      script.onerror = () => {
        detail.loading = null; // 次に押されたときに再挑戦できるように
        reject(new Error("MapLibre を読み込めませんでした"));
      };
      document.head.appendChild(script);
    });
  }
  return detail.loading;
}

function themeKey() {
  return getComputedStyle(document.documentElement).colorScheme.includes("dark") ? "dark" : "light";
}

function createDetailMap() {
  return new Promise((resolve, reject) => {
    detail.styleKey = themeKey();
    const map = new maplibregl.Map({
      container: detailEl,
      style: BASEMAP_STYLE[detail.styleKey],
      bounds: WORLD_BOUNDS,
      attributionControl: {
        compact: true,
        customAttribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a>',
      },
      dragRotate: false, // 回転・傾きはなし（シンプルな地図と同じ北が上の表示）
      pitchWithRotate: false,
      touchPitch: false,
    });
    map.touchZoomRotate.disableRotation();

    // 背景スタイルを読み込むたびに（テーマ切替を含む）国のレイヤーを足し直す
    map.on("style.load", () => {
      addCountryLayers(map);
      detail.colorKey = null;
      detail.labelsShown = null;
      syncDetailMap();
    });

    const timer = setTimeout(
      () => reject(new Error("詳細地図の読み込みがタイムアウトしました")),
      20000,
    );
    map.once("load", () => {
      clearTimeout(timer);
      // スマホ幅では出典表記を最初から「ⓘ」に畳む（広げたままだと凡例と重なる。タップで開く）
      const attrib = detailEl.querySelector(".maplibregl-ctrl-attrib");
      if (attrib && NARROW_LAYOUT.matches) {
        attrib.classList.remove("maplibregl-compact-show");
        attrib.removeAttribute("open");
      }
      resolve(map);
    });

    /* マウス・タッチ操作（シンプルな地図の pointer イベントと同じ動き） */
    map.on("mousemove", (e) => {
      if (map.isMoving()) return hideTip();
      const f = countryAt(map, e.point);
      if (f !== hovered) {
        hovered = f;
        syncDetailMap();
      }
      if (f) showTip(f, e.point.x, e.point.y);
      else hideTip();
    });
    map.on("mouseout", () => {
      hovered = null;
      hideTip();
      syncDetailMap();
    });
    map.on("click", (e) => onCountryClick(countryAt(map, e.point)));
    map.on("movestart", (e) => {
      if (e.originalEvent) userMoved = true; // ユーザーがドラッグ・ズームした
      hideTip();
    });
  });
}

function countryAt(map, point) {
  const hit = map.queryRenderedFeatures(point, { layers: ["country-fill"] })[0];
  return hit ? BY_NAME[hit.properties.name] || null : null;
}

// ズームに応じた濃さ。国の形は 1:50m の粗いデータなので、街の規模まで寄ると実際の海岸線や国境と
// ずれる。拡大するほど薄くして、街の規模（ズーム 10〜11）では背景地図だけが見えるようにする
const byZoom = (...stops) => ["interpolate", ["linear"], ["zoom"], ...stops];
const FILL_OPACITY = byZoom(1, 0.8, 4, 0.55, 7, 0.3, 9, 0.12, 11, 0);
const OUTLINE_OPACITY = byZoom(7, 1, 10, 0); // 選択中の国の縁取り

function addCountryLayers(map) {
  if (!countryGeoJSON) countryGeoJSON = buildCountryGeoJSON();
  map.addSource("countries", { type: "geojson", data: countryGeoJSON });
  // 塗りと国境線は背景の地名ラベルより下に入れる（拡大したとき地名が読めるように）
  const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
  map.addLayer(
    {
      id: "country-fill",
      type: "fill",
      source: "countries",
      paint: { "fill-color": "#ccc", "fill-opacity": FILL_OPACITY },
    },
    firstLabel,
  );
  map.addLayer(
    {
      id: "country-border",
      type: "line",
      source: "countries",
      paint: {
        "line-width": 0.6,
        // 拡大すると背景地図の細かい国境線があるので、こちらの粗い線は消していく
        "line-opacity": byZoom(2, 0.9, 6, 0.4, 8, 0),
      },
    },
    firstLabel,
  );
  // ホバー・選択の縁取りはいちばん上に描く（シンプルな地図と同じ太さ）
  const round = { "line-join": "round", "line-cap": "round" };
  map.addLayer({
    id: "country-hover",
    type: "line",
    source: "countries",
    filter: NO_COUNTRY,
    layout: round,
    paint: { "line-width": 1.6, "line-opacity": byZoom(7, 0.6, 10, 0) },
  });
  map.addLayer({
    id: "country-selected-halo",
    type: "line",
    source: "countries",
    filter: NO_COUNTRY,
    layout: round,
    paint: { "line-width": 6, "line-opacity": OUTLINE_OPACITY },
  });
  map.addLayer({
    id: "country-selected",
    type: "line",
    source: "countries",
    filter: NO_COUNTRY,
    layout: round,
    paint: { "line-width": 3, "line-opacity": OUTLINE_OPACITY },
  });
}

/* ---------- 状態を詳細地図に反映（map.js の draw() から呼ばれる） ---------- */
function syncDetailMap() {
  const map = detail.map;
  if (!map || !map.getLayer("country-fill")) return; // 読み込み中・スタイル切替中

  // テーマが変わったら背景スタイルを切り替える（style.load で国のレイヤーを足し直し、またここに来る）
  const theme = themeKey();
  if (theme !== detail.styleKey) {
    detail.styleKey = theme;
    map.setStyle(BASEMAP_STYLE[theme], { diff: false });
    return;
  }

  // 塗り色（塗り分けの種類・凡例の強調・テーマが変わったときだけ作り直す）
  const colorKey = [mode, dimCat, theme].join("|");
  if (colorKey !== detail.colorKey) {
    detail.colorKey = colorKey;
    const fillColor = ["match", ["get", "name"]];
    for (const f of FEATURES) fillColor.push(f.name, fillColorOf(f));
    fillColor.push(css("--nodata"));
    map.setPaintProperty("country-fill", "fill-color", fillColor);
    map.setPaintProperty("country-border", "line-color", css("--stroke"));
    map.setPaintProperty("country-hover", "line-color", css("--ink"));
    map.setPaintProperty("country-selected-halo", "line-color", css("--surface"));
    map.setPaintProperty("country-selected", "line-color", css("--ink"));
  }

  // ホバー・選択中の国の縁取り
  map.setFilter(
    "country-hover",
    hovered && hovered !== selected ? countryIs(hovered.name) : NO_COUNTRY,
  );
  const sel = selected ? countryIs(selected.name) : NO_COUNTRY;
  map.setFilter("country-selected-halo", sel);
  map.setFilter("country-selected", sel);

  // 地名ラベル（「ラベル」ボタンと連動。クイズ中は答えが分かってしまうので隠れる）
  if (showLabels !== detail.labelsShown) {
    detail.labelsShown = showLabels;
    for (const l of map.getStyle().layers) {
      if (l.type === "symbol")
        map.setLayoutProperty(l.id, "visibility", showLabels ? "visible" : "none");
    }
  }
}

/* ---------- 視点の操作（map.js / interaction.js から呼ばれる） ---------- */
// ドロワーに隠れている分の余白
function detailPadding(px = 0, py = 0) {
  const { left, bottom } = mapInset();
  return { top: py, right: px, bottom: bottom + py, left: left + px };
}
function detailFitWorld() {
  if (!detail.map) return;
  detail.map.fitBounds(WORLD_BOUNDS, { padding: detailPadding(), animate: false });
}
function detailFlyTo(f) {
  const { left, bottom } = mapInset();
  // f.bbox はメルカトルの単位座標（0..1）。国が見える範囲の真ん中 4 割ほどに収まるようにする
  const [x0, y0, x1, y1] = f.bbox;
  const bounds = [
    [x0 * 360 - 180, unitToLat(y1)],
    [x1 * 360 - 180, unitToLat(y0)],
  ];
  const padding = detailPadding((W - left) * 0.3, (H - bottom) * 0.3);
  detail.map.fitBounds(bounds, { padding, maxZoom: 11, duration: 600 });
}
function detailZoomBy(s) {
  const { left, bottom } = mapInset();
  // ドロワーに隠れていない範囲の中央を軸にズーム
  const around = detail.map.unproject([left + (W - left) / 2, (H - bottom) / 2]);
  detail.map.easeTo({ zoom: detail.map.getZoom() + Math.log2(s), around, duration: 250 });
}
function detailResize() {
  if (detail.map) detail.map.resize();
}
// メルカトルの単位座標 y（0..1）→ 緯度
function unitToLat(y) {
  return (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
}

/* ---------- 切り替え（同じ場所・同じ縮尺を引き継ぐ） ---------- */
// MapLibre のズーム z では世界の幅が 512 * 2^z px、シンプルな地図では T.k px
function viewToDetail() {
  const u = (W / 2 - T.x) / T.k,
    v = (H / 2 - T.y) / T.k;
  detail.map.jumpTo({ center: [u * 360 - 180, unitToLat(v)], zoom: Math.log2(T.k / 512) });
}
function viewFromDetail() {
  const c = detail.map.getCenter().wrap();
  T.k = 512 * 2 ** detail.map.getZoom();
  const [u, v] = proj(c.lng, c.lat);
  T.x = W / 2 - u * T.k;
  T.y = H / 2 - v * T.k;
  clampT();
}

async function setBaseMap(next) {
  detail.wanted = next;
  if (next === baseMap) return updateBaseSeg();
  if (next === "detail") {
    baseSeg.classList.add("loading");
    try {
      await loadMapLibre();
      if (!detail.map) {
        detailEl.classList.add("preparing"); // 大きさは持たせたまま、準備ができるまで見せない
        detailEl.classList.remove("hidden");
        // 読み込み中にもう一度押されても、地図は 1 つだけ作る
        detail.creating = detail.creating || createDetailMap();
        detail.map = await detail.creating;
      }
    } catch (err) {
      console.error(err);
      detail.creating = null;
      detailEl.classList.add("hidden");
      detail.wanted = "simple";
      alert(t("base.loadError"));
      return updateBaseSeg();
    } finally {
      baseSeg.classList.remove("loading");
      detailEl.classList.remove("preparing");
    }
    if (baseMap === "detail") return updateBaseSeg(); // 同時に押された別の呼び出しで切り替え済み
    if (detail.wanted !== "detail") {
      // 読み込み中に「シンプル」へ戻された
      detailEl.classList.add("hidden");
      return updateBaseSeg();
    }
    detailEl.classList.remove("hidden");
    detail.map.resize();
    baseMap = "detail";
    if (userMoved) viewToDetail();
    else detailFitWorld();
  } else {
    if (detail.map && userMoved) viewFromDetail();
    baseMap = "simple";
    detailEl.classList.add("hidden");
    if (!userMoved) fitWorld();
  }
  document.getElementById("stage").classList.toggle("detail-on", baseMap === "detail");
  hovered = null;
  hideTip();
  try {
    localStorage.setItem(BASEMAP_STORAGE_KEY, baseMap);
  } catch (e) {
    // 保存できなくても切り替えはできるので無視する
  }
  updateBaseSeg();
  draw();
}

function updateBaseSeg() {
  baseSeg.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.base === detail.wanted);
  });
}
baseSeg.querySelectorAll("button").forEach((b) => (b.onclick = () => setBaseMap(b.dataset.base)));

// 前回「詳細」を選んでいたら、起動後に詳細地図へ切り替える（main.js の起動処理の最後で呼ぶ）
function restoreBaseMap() {
  try {
    if (localStorage.getItem(BASEMAP_STORAGE_KEY) === "detail") setBaseMap("detail");
  } catch (e) {
    // 同上
  }
}
