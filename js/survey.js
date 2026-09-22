/* ---------------------------------------------------------------
   Builds the survey form from QUESTIONS and sends the answers to
   the Store. One section per question, so the explanatory text on
   the left lines up with the question on the right.
   --------------------------------------------------------------- */

const Survey = (() => {
  const root = document.getElementById("survey-questions");

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- one radio row: label on the left, N choices on the right ---- */
  function radioRow(name, label, scale, hint) {
    const opts = scale.map((s, i) =>
      `<label class="opt" title="${esc(s)}"><input type="radio" name="${name}" value="${i}"><span class="dot"></span><span class="opt-txt">${esc(s)}</span></label>`
    ).join("");
    return `<div class="row"><div class="row-label">${esc(label)}${hint ? `<span class="row-hint">${esc(hint)}</span>` : ""}</div><div class="opts n${scale.length}">${opts}</div></div>`;
  }

  function scaleHeader(scale) {
    return `<div class="row head"><div class="row-label"></div><div class="opts n${scale.length}">${scale.map(s => `<span class="opt-head">${esc(s)}</span>`).join("")}</div></div>`;
  }

  function build(q) {
    const scale = SCALES[q.scale];
    let body = "";
    if (q.type === "grid") {
      body = `<div class="grid">${scaleHeader(scale)}${q.rows.map(r => radioRow(`${q.id}.${r.id}`, r.label, scale, r.hint)).join("")}</div>`;
    } else if (q.type === "single") {
      body = `<div class="grid single">${scaleHeader(scale)}${radioRow(q.id, "", scale)}</div>`;
    } else if (q.type === "multi") {
      body = `<div class="checks">${q.rows.map(r =>
        `<label class="check"><input type="checkbox" name="${q.id}" value="${r.id}"><span class="box"></span>${esc(r.label)}</label>`).join("")}</div>`;
    } else if (q.type === "poles") {
      body = `<div class="poles">${q.rows.map(r => `
        <div class="pole-row">
          <div class="pole left">${esc(r.left)}</div>
          <div class="pole-opts">${scale.map((s, i) => `<label class="opt" title="${i + 1}"><input type="radio" name="${q.id}.${r.id}" value="${i}"><span class="dot"></span><span class="num">${i + 1}</span></label>`).join("")}</div>
          <div class="pole right">${esc(r.right)}</div>
        </div>`).join("")}</div>`;
    } else if (q.type === "text") {
      body = `<textarea name="${q.id}" rows="3" maxlength="300" placeholder="Optional"></textarea>`;
    }
    return `<fieldset class="q" data-q="${q.id}">
      <legend>${esc(q.title)}</legend>
      ${q.hint ? `<p class="q-hint">${esc(q.hint)}</p>` : ""}
      ${body}
    </fieldset>`;
  }

  /* Each question gets its own slot in the page (see index.html) */
  function render() {
    QUESTIONS.forEach(q => {
      const slot = document.querySelector(`[data-slot="${q.id}"]`);
      if (slot) slot.innerHTML = build(q);
    });
  }

  /* ---- read the form into one plain object ---- */
  function collect() {
    const form = document.getElementById("survey-form");
    const fd = new FormData(form);
    const out = { ts: new Date().toISOString() };
    QUESTIONS.forEach(q => {
      if (q.type === "grid" || q.type === "poles") {
        out[q.id] = {};
        q.rows.forEach(r => {
          const v = fd.get(`${q.id}.${r.id}`);
          if (v !== null) out[q.id][r.id] = Number(v);
        });
      } else if (q.type === "single") {
        const v = fd.get(q.id);
        if (v !== null) out[q.id] = Number(v);
      } else if (q.type === "multi") {
        out[q.id] = fd.getAll(q.id);
      } else if (q.type === "text") {
        out[q.id] = (fd.get(q.id) || "").trim();
      }
    });
    return out;
  }

  function answeredCount(row) {
    let n = 0;
    QUESTIONS.forEach(q => {
      if (q.type === "grid" || q.type === "poles") n += Object.keys(row[q.id]).length;
      else if (q.type === "single" && row[q.id] !== undefined) n++;
    });
    return n;
  }

  async function submit(e) {
    e.preventDefault();
    const status = document.getElementById("submit-status");
    const row = collect();
    if (answeredCount(row) === 0) {
      status.textContent = "Answer at least one question first.";
      status.className = "status warn";
      return;
    }
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    status.textContent = "Saving…";
    status.className = "status";
    try {
      await Store.add(row);
      status.innerHTML = "Saved. Thanks! <button type=\"button\" class=\"link\" id=\"go-results\">See the class results &rarr;</button>";
      status.className = "status ok";
      document.getElementById("go-results").addEventListener("click", () => App.show("results"));
      document.getElementById("survey-form").reset();
    } catch (err) {
      status.textContent = "Could not save: " + err.message;
      status.className = "status warn";
    } finally {
      btn.disabled = false;
    }
  }

  function init() {
    render();
    document.getElementById("survey-form").addEventListener("submit", submit);
  }

  return { init };
})();
