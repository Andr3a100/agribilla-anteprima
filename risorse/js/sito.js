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

  /* La testata parte alta e si stringe appena si scorre: lo dice una «vedetta» in cima alla pagina, senza ascoltare
     ogni movimento dello scorrimento */
  var testata = document.querySelector("[data-testata]"), vedetta = document.querySelector("[data-vedetta]");
  if (testata && vedetta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (voci) { testata.classList.toggle("stretta", !voci[0].isIntersecting); }).observe(vedetta);
  }

  /* Il menu sul telefono: un pannello che si apre dal pulsante, si chiude con Esc, con un tocco su una voce o tornando
     a uno schermo largo; mentre è aperto la pagina sotto non scorre */
  var apri = document.querySelector("[data-menu-apri]"), parolaMenu = document.querySelector("[data-menu-parola]");
  function menu(aperto) {
    radice.classList.toggle("menu-aperto", aperto);
    apri.setAttribute("aria-expanded", aperto ? "true" : "false");
    if (parolaMenu) { parolaMenu.textContent = aperto ? "Chiudi il menu" : "Apri il menu"; }
  }
  if (apri) {
    apri.addEventListener("click", function () { menu(!radice.classList.contains("menu-aperto")); });
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && radice.classList.contains("menu-aperto")) { menu(false); apri.focus(); }
    });
    var pannello = document.getElementById("menu");
    if (pannello) { pannello.addEventListener("click", function (evento) { if (evento.target.closest && evento.target.closest("a")) { menu(false); } }); }
    if (window.matchMedia) {
      var largo = window.matchMedia("(min-width: 901px)");
      var seLargo = function () { if (largo.matches) { menu(false); } };
      if (largo.addEventListener) { largo.addEventListener("change", seLargo); } else if (largo.addListener) { largo.addListener(seLargo); }
    }
  }

  /* Le famiglie del negozio sotto la voce «Negozio»: si aprono anche dal pulsante con la freccia (tastiera e tocco) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-sotto-apri]"), function (tasto) {
    var voce = tasto.closest(".con-sotto");
    function sotto(aperta) { voce.classList.toggle("aperta", aperta); tasto.setAttribute("aria-expanded", aperta ? "true" : "false"); }
    tasto.addEventListener("click", function () { sotto(!voce.classList.contains("aperta")); });
    voce.addEventListener("keydown", function (evento) { if (evento.key === "Escape" && voce.classList.contains("aperta")) { sotto(false); tasto.focus(); } });
    document.addEventListener("click", function (evento) { if (!voce.contains(evento.target)) { sotto(false); } });
  });

  /* Le fotografie dell'apertura si possono fermare */
  var scena = document.querySelector("[data-scena]"), ferma = document.querySelector("[data-scena-ferma]");
  if (scena && ferma) {
    ferma.addEventListener("click", function () {
      var fermata = !scena.classList.contains("ferma");
      scena.classList.toggle("ferma", fermata);
      ferma.setAttribute("aria-pressed", fermata ? "true" : "false");
      ferma.setAttribute("aria-label", fermata ? "Fai ripartire le fotografie" : "Ferma le fotografie che scorrono");
    });
  }
})();
