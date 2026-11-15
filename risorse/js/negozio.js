/* Il carrello nel browser: resta in questo computer (niente account, niente cookie), si vede in testata, si riempie
   dalle schede dei prodotti e si legge nella pagina del carrello. Le regole stanno in carrello-logica.js. */
(function () {
  "use strict";
  var scatola = document.getElementById("dati-negozio");
  if (!scatola || !window.CarrelloLogica) { return; }
  var dati = JSON.parse(scatola.textContent), L = window.CarrelloLogica, CHIAVE = "agb-carrello";

  function leggi() {
    try { return L.pulisci(JSON.parse(window.localStorage.getItem(CHIAVE) || "[]"), dati.righe); } catch (errore) { return memoria; }
  }
  var memoria = [];   // se la memoria del browser non c'è, il carrello vive finché la pagina resta aperta
  function scrivi(righe) {
    memoria = righe;
    try { window.localStorage.setItem(CHIAVE, JSON.stringify(righe)); } catch (errore) { /* pazienza */ }
    numero();
    document.dispatchEvent(new CustomEvent("agb:carrello"));
  }
  function numero() {
    var n = L.conta(leggi());
    Array.prototype.forEach.call(document.querySelectorAll("[data-carrello-numero]"), function (el) {
      el.textContent = String(n);
      el.hidden = n === 0;
      el.setAttribute("aria-label", n === 1 ? "1 prodotto nel carrello" : n + " prodotti nel carrello");
    });
  }
  window.Negozio = { dati: dati, leggi: leggi, scrivi: scrivi };
  numero();
  window.addEventListener("storage", function (evento) { if (evento.key === CHIAVE) { numero(); document.dispatchEvent(new CustomEvent("agb:carrello")); } });

  /* «Metti nel carrello»: nelle schede, nelle carte dei prodotti e nel piccolo test. Il formato viene dal pulsante oppure
     dalla scelta accanto; l'esito si scrive nella stessa zona, così chi usa uno screen reader lo sente. */
  document.addEventListener("click", function (evento) {
    var tasto = evento.target.closest ? evento.target.closest("[data-aggiungi], [data-aggiungi-scelto]") : null;
    if (!tasto) { return; }
    var zona = tasto.closest("[data-zona-acquisto]") || document;
    var scelta = zona.querySelector("[data-formato]");
    var codice = tasto.hasAttribute("data-aggiungi") ? tasto.getAttribute("data-aggiungi") : (scelta ? scelta.value : "");
    var voce = dati.righe[codice];
    if (!voce) { return; }
    scrivi(L.aggiungi(leggi(), codice, 1, dati.righe));
    var esito = zona.querySelector("[data-esito]");
    if (!esito) { return; }
    esito.textContent = "";
    var testo = document.createElement("span");
    testo.textContent = "Aggiunto: " + voce.prodotto + ", " + voce.formato.toLowerCase() + ". ";
    var vai = document.createElement("a");
    vai.href = dati.base + "negozio/carrello/";
    vai.textContent = "Vai al carrello";
    esito.appendChild(testo);
    esito.appendChild(vai);
  });

  /* Galleria della scheda: le miniature scelgono la fotografia grande */
  Array.prototype.forEach.call(document.querySelectorAll("[data-galleria]"), function (galleria) {
    var miniature = galleria.querySelectorAll("[data-miniatura]"), viste = galleria.querySelectorAll("[data-vista]");
    Array.prototype.forEach.call(miniature, function (m) {
      m.addEventListener("click", function () {
        var quale = m.getAttribute("data-miniatura");
        Array.prototype.forEach.call(viste, function (v) { v.hidden = v.getAttribute("data-vista") !== quale; });
        Array.prototype.forEach.call(miniature, function (x) { x.setAttribute("aria-pressed", x === m ? "true" : "false"); });
      });
    });
  });
})();
