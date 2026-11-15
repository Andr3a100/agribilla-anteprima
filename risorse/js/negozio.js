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

  /* «Metti nel carrello» nelle schede dei prodotti */
  var esito = document.querySelector("[data-esito-carrello]");
  Array.prototype.forEach.call(document.querySelectorAll("[data-aggiungi]"), function (tasto) {
    tasto.addEventListener("click", function () {
      var codice = tasto.getAttribute("data-aggiungi"), voce = dati.righe[codice];
      if (!voce) { return; }
      scrivi(L.aggiungi(leggi(), codice, 1, dati.righe));
      if (esito) {
        esito.textContent = "";
        var testo = document.createElement("span");
        testo.textContent = "Aggiunto: " + voce.prodotto + ", " + voce.formato.toLowerCase() + ". ";
        var vai = document.createElement("a");
        vai.href = dati.base + "negozio/carrello/";
        vai.textContent = "Vai al carrello";
        esito.appendChild(testo);
        esito.appendChild(vai);
      }
    });
  });

  /* Filtri della pagina del negozio */
  var filtri = document.querySelectorAll("[data-filtro]"), carte = document.querySelectorAll("[data-prodotti] [data-famiglia]");
  function filtra(famiglia) {
    Array.prototype.forEach.call(filtri, function (f) { f.setAttribute("aria-pressed", f.getAttribute("data-filtro") === famiglia ? "true" : "false"); });
    Array.prototype.forEach.call(carte, function (c) { c.hidden = famiglia !== "" && c.getAttribute("data-famiglia") !== famiglia; if (!c.hidden) { c.classList.add("visto"); } });
  }
  Array.prototype.forEach.call(filtri, function (f) { f.addEventListener("click", function () { filtra(f.getAttribute("data-filtro")); }); });
  /* un collegamento come «negozio/#miele» apre già la famiglia giusta, anche se la pagina è già aperta */
  function daIndirizzo() {
    var chiesta = window.location.hash.slice(1);
    if (chiesta && Array.prototype.some.call(filtri, function (f) { return f.getAttribute("data-filtro") === chiesta; })) { filtra(chiesta); }
  }
  if (filtri.length) { daIndirizzo(); window.addEventListener("hashchange", daIndirizzo); }
})();
