/* ============================================================
   一覧タブ
   ============================================================ */
let sortKey = "name",
  sortAsc = true,
  tableFilter = "";
function renderTable() {
  const rows = FEATURES.filter((f) => f.data).map((f) => f.data && { f, d: f.data });
  const ff = tableFilter.trim().toLowerCase();
  const relTxt = (n) => {
    const r = relOf(n);
    return r ? r.label + " " + r.detail + " " + r.cue : "";
  };
  let list = rows.filter(
    (r) =>
      !ff ||
      [
        r.d.name,
        r.f.name,
        r.d.langs,
        r.d.scrLabel,
        r.d.famLabel,
        (r.d.keys || []).join(" "),
        (r.d.signs || []).join(" "),
        r.d.stop || "",
        gramText(r.f.name),
        relTxt(r.f.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(ff),
  );
  const get = (r) =>
    ({
      name: r.d.name,
      langs: r.d.langs,
      scr: r.d.scrLabel,
      stop: r.d.stop || "",
      sv: r.d.sv,
      rel: (relOf(r.f.name) || {}).label || "",
    })[sortKey] || "";
  list.sort((a, b) => get(a).localeCompare(get(b), lang) * (sortAsc ? 1 : -1));
  document.getElementById("tablewrap").innerHTML =
    "<table><thead><tr>" +
    ["name", "langs", "scr", "rel", "stop", "sv"]
      .map((k) => {
        const l = t("table." + k);
        return (
          '<th data-k="' + k + '">' + l + (sortKey === k ? (sortAsc ? " ▲" : " ▼") : "") + "</th>"
        );
      })
      .join("") +
    "<th>" +
    t("table.grammar") +
    "</th><th>" +
    t("table.keys") +
    "</th></tr></thead><tbody>" +
    list
      .map((r) => {
        const g = gramsOf(r.f.name)[0],
          rl = relOf(r.f.name);
        return (
          '<tr data-n="' +
          r.f.name +
          '"><td><span class="dot" style="background:' +
          colorOf(r.f) +
          '"></span><b>' +
          r.d.name +
          "</b>" +
          (r.d.altName
            ? '<div style="color:var(--ink-3);font-size:11px">' + r.d.altName + "</div>"
            : "") +
          "</td>" +
          '<td class="k">' +
          r.d.langs +
          '</td><td class="k">' +
          r.d.scrLabel +
          "</td>" +
          '<td class="k">' +
          (rl ? rl.label : "—") +
          "</td>" +
          "<td>" +
          (r.d.stop || "—") +
          '</td><td class="k">' +
          loc(SV_LABEL[r.d.sv]) +
          "</td>" +
          '<td class="k">' +
          (g
            ? (g.the || "—") +
              '<div style="color:var(--ink-3)">' +
              t("table.and") +
              (g.and || "—") +
              "</div>"
            : "—") +
          "</td>" +
          '<td class="k">' +
          (r.d.keys || []).join(" / ") +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table>";
  document
    .getElementById("tablewrap")
    .querySelectorAll("th[data-k]")
    .forEach((th) => {
      th.onclick = () => {
        const k = th.dataset.k;
        if (k === sortKey) sortAsc = !sortAsc;
        else {
          sortKey = k;
          sortAsc = true;
        }
        renderTable();
      };
    });
  document
    .getElementById("tablewrap")
    .querySelectorAll("tbody tr")
    .forEach((tr) => {
      tr.onclick = () => {
        setView("map");
        selectCountry(tr.dataset.n);
      };
    });
}
