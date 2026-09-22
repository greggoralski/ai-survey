/* Switches between the two views: the survey and the class results. */
const App = (() => {
  function show(view) {
    document.querySelectorAll(".view").forEach(v => v.hidden = v.id !== "view-" + view);
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", t.dataset.view === view));
    location.hash = view === "results" ? "results" : "";
    window.scrollTo({ top: 0 });
    if (view === "results") Results.refresh();
  }

  function init() {
    Survey.init();
    Results.init();
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => show(t.dataset.view)));
    show(location.hash === "#results" ? "results" : "survey");
  }

  document.addEventListener("DOMContentLoaded", init);
  return { show };
})();
