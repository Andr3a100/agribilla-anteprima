/* Comportamenti comuni a tutte le pagine. Tutto è un miglioramento: senza JavaScript il sito si legge lo stesso. */
(function () {
  "use strict";
  var radice = document.documentElement;
  var pocoMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Aperto con un doppio clic (file://) il browser non sa che «negozio/» vuol dire «negozio/index.html». */
  if (window.location.protocol === "file:") {
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (a) {
      var h = a.getAttribute("href");
      if (/^(https?:|mailto:|tel:|#)/.test(h)) { return; }
      var pezzi = h.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
      if (pezzi && (pezzi[1] === "" || /\/$/.test(pezzi[1]) || pezzi[1] === "." || pezzi[1] === "..")) {
        a.setAttribute("href", pezzi[1].replace(/\/?$/, "/") + "index.html" + (pezzi[2] || "") + (pezzi[3] || ""));
      }
    });
  }

  /* Tema chiaro e scuro */
  var tasto = document.querySelector("[data-tema]");
  var parola = document.querySelector("[data-tema-testo]");
  function aggiornaTasto() {
    var scuro = radice.getAttribute("data-theme") === "dark";
    if (tasto) { tasto.setAttribute("aria-pressed", scuro ? "true" : "false"); }
    if (parola) { parola.textContent = scuro ? "Tema chiaro" : "Tema scuro"; }
  }
  if (tasto) {
    aggiornaTasto();
    tasto.addEventListener("click", function () {
      var scuro = radice.getAttribute("data-theme") !== "dark";
      radice.setAttribute("data-theme", scuro ? "dark" : "light");
      try { window.localStorage.setItem("agb-tema", scuro ? "scuro" : "chiaro"); } catch (errore) { /* pazienza */ }
      aggiornaTasto();
    });
  }

  /* Comparse allo scorrimento: solo opacità e spostamento, e solo se il movimento è gradito */
  var daMostrare = document.querySelectorAll(".entra");
  if (pocoMovimento || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(daMostrare, function (el) { el.classList.add("visto"); });
  } else {
    var osservatore = new IntersectionObserver(function (voci) {
      voci.forEach(function (voce) {
        if (!voce.isIntersecting) { return; }
        voce.target.classList.add("visto");
        osservatore.unobserve(voce.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(daMostrare, function (el) { osservatore.observe(el); });
  }
})();
