/* ---------------------------------------------------------------
   Class results: fetch every saved answer, count them up, and draw
   simple stacked bars next to MIT's numbers for the same question.
   No chart library, just divs with widths.
   --------------------------------------------------------------- */

const Results = (() => {
  let rows = [];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- counting ---- */
  function tally(values, k) {
    const counts = new Array(k).fill(0);
    values.forEach(v => { if (Number.isInteger(v) && v >= 0 && v < k) counts[v]++; });
    const n = counts.reduce((a, b) => a + b, 0);
    return { n, pct: counts.map(c => n ? Math.round(100 * c / n) : 0) };
  }

  function humberGrid(q, r) {
    return tally(rows.map(x => x[q.id] && x[q.id][r.id]), SCALES[q.scale].length);
  }
  function humberSingle(q) {
    return tally(rows.map(x => x[q.id]), SCALES[q.scale].length);
  }
  function humberMulti(q, r) {
    const answered = rows.filter(x => Array.isArray(x[q.id]));
    const n = answered.length;
    const c = answered.filter(x => x[q.id].includes(r.id)).length;
    return { n, pct: n ? Math.round(100 * c / n) : 0 };
  }

  /* ---- drawing ---- */
  function stacked(label, pct, n, style, cls) {
    if (n === 0) {
      return `<div class="bar-row ${cls}"><span class="bar-who">${esc(label)}</span><div class="bar empty"><span>no answers yet</span></div></div>`;
    }
    const segs = pct.map((p, i) => p > 0
      ? `<span class="seg ${style}-${i}" style="width:${p}%" title="${p}%">${p >= 7 ? p + "%" : ""}</span>`
      : "").join("");
    return `<div class="bar-row ${cls}"><span class="bar-who">${esc(label)}${cls === "humber" ? ` <em>n=${n}</em>` : ""}</span><div class="bar">${segs}</div></div>`;
  }

  function simpleBar(label, pct, n, cls) {
    if (n === 0) {
      return `<div class="bar-row ${cls}"><span class="bar-who">${esc(label)}</span><div class="bar empty"><span>no answers yet</span></div></div>`;
    }
    return `<div class="bar-row ${cls}"><span class="bar-who">${esc(label)}${cls === "humber" ? ` <em>n=${n}</em>` : ""}</span><div class="bar plain"><span class="seg ord4-2" style="width:${pct}%"></span><span class="val">${pct}%</span></div></div>`;
  }

  function legend(scale, style) {
    return `<div class="legend">${scale.map((s, i) => `<span><i class="sw ${style}-${i}"></i>${esc(s)}</span>`).join("")}</div>`;
  }
  function mitWho(q) {
    const extra = q.mitTotal ? ` &middot; MIT, everyone = ${esc(q.mitTotal.label)}` : "";
    return `<p class="chart-note mit">MIT = ${esc(q.mitLabel)}${extra}</p>`;
  }

  function chart(q) {
    const scale = SCALES[q.scale];
    const style = SCALE_STYLE[q.scale];
    let html = "";

    if (q.type === "grid" || q.type === "poles") {
      html += legend(scale, style) + mitWho(q);
      q.rows.forEach(r => {
        const h = humberGrid(q, r);
        const label = q.type === "poles"
          ? `<span class="pole-lbl"><b>1</b> ${esc(r.left)}<br><b>5</b> ${esc(r.right)}</span>`
          : esc(r.label);
        html += `<div class="item"><div class="item-label">${label}</div>
          ${stacked("Humber class", h.pct, h.n, style, "humber")}
          ${stacked("MIT", r.mit, 1, style, "mit")}
        </div>`;
      });
    } else if (q.type === "single") {
      const h = humberSingle(q);
      html += legend(scale, style) + mitWho(q);
      html += `<div class="item">
        ${stacked("Humber class", h.pct, h.n, style, "humber")}
        ${stacked("MIT", q.mit, 1, style, "mit")}
        ${q.mitTotal ? stacked("MIT, everyone", q.mitTotal.values, 1, style, "mit") : ""}
      </div>`;
    } else if (q.type === "multi") {
      html += `<p class="chart-note">Percent of respondents who ticked each task.</p>` + mitWho(q);
      q.rows.forEach(r => {
        const h = humberMulti(q, r);
        html += `<div class="item"><div class="item-label">${esc(r.label)}</div>
          ${simpleBar("Humber class", h.pct, h.n, "humber")}
          ${simpleBar("MIT", r.mit, 1, "mit")}
        </div>`;
      });
    } else if (q.type === "text") {
      const answers = rows.map(x => x[q.id]).filter(t => t && t.trim());
      html += answers.length
        ? `<ul class="answers">${answers.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
        : `<p class="chart-note">No written answers yet.</p>`;
      html += `<div class="mit mit-note"><b>MIT:</b> ${esc(q.mitNote)}</div>`;
    }
    return html;
  }

  function render() {
    document.getElementById("resp-count").textContent = rows.length;
    QUESTIONS.forEach(q => {
      const slot = document.querySelector(`[data-chart="${q.id}"]`);
      if (slot) slot.innerHTML = chart(q);
    });
  }

  async function refresh() {
    const note = document.getElementById("store-note");
    try {
      rows = await Store.all();
      note.textContent = await Store.describe();
    } catch (e) {
      note.textContent = "Could not load answers: " + e.message;
    }
    render();
  }

  /* With Firestore the bars grow by themselves as the room submits,
     so the Refresh button becomes a spare. */
  let live = null;
  async function goLive() {
    if (live) return;
    live = await Store.subscribe(async next => {
      rows = next;
      document.getElementById("store-note").textContent = await Store.describe();
      render();
    });
    if (live) document.getElementById("refresh-btn").hidden = true;
  }

  function download() {
    const blob = new Blob([JSON.stringify(rows, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-survey-responses.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function clearAll() {
    if (!confirm(`Delete all ${rows.length} saved responses? This cannot be undone.`)) return;
    await Store.clear();
    await refresh();
  }

  function init() {
    goLive();
    document.getElementById("refresh-btn").addEventListener("click", refresh);
    document.getElementById("download-btn").addEventListener("click", download);
    document.getElementById("clear-btn").addEventListener("click", clearAll);
    document.getElementById("show-mit").addEventListener("change", e => {
      document.getElementById("view-results").classList.toggle("hide-mit", !e.target.checked);
    });
  }

  return { init, refresh };
})();
