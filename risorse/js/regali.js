/* «Componi la tua confezione»: si sceglie la scatola, si contano i prodotti, e il risultato va nel carrello o
   direttamente in un messaggio. Niente prezzi inventati: il conto lo fa il carrello con i prezzi confermati. */
(function () {
  "use strict";
  var N = window.Negozio, L = window.CarrelloLogica, zona = document.querySelector("[data-compositore]");
  if (!N || !L || !zona) { return; }
  var dati = N.dati, scelte = {};
  var elenco = zona.querySelector("[data-confezione-elenco]"), vuota = zona.querySelector("[data-confezione-vuota]");
  var metti = zona.querySelector("[data-confezione-carrello]"), whatsapp = zona.querySelector("[data-confezione-whatsapp]");
  var biglietto = zona.querySelector("[data-confezione-biglietto]"), esito = zona.querySelector("[data-confezione-esito]");

  function scatola() { var s = zona.querySelector("input[name=scatola]:checked"); return s ? s.value : ""; }
  function righe() {
    var r = Object.keys(scelte).filter(function (c) { return scelte[c] > 0; }).map(function (c) { return { codice: c, quantita: scelte[c] }; });
    if (scatola()) { r.push({ codice: scatola(), quantita: 1 }); }
    return L.pulisci(r, dati.righe);
  }
  function disegna() {
    var r = righe(), scelti = r.filter(function (x) { return x.codice !== scatola(); });
    elenco.textContent = "";
    r.forEach(function (x) {
      var v = dati.righe[x.codice], li = document.createElement("li"), n = document.createElement("strong"), t = document.createElement("span");
      n.textContent = x.quantita + " ×"; t.textContent = v.prodotto + ", " + v.formato.toLowerCase();
      li.appendChild(n); li.appendChild(t); elenco.appendChild(li);
    });
    vuota.hidden = scelti.length > 0;
    metti.disabled = scelti.length === 0;
    whatsapp.setAttribute("aria-disabled", scelti.length === 0 ? "true" : "false");
    whatsapp.href = scelti.length === 0 ? "#confezione" : dati.whatsapp + "?text=" + encodeURIComponent(L.messaggio(r, dati.righe, { confezione: "sì, da comporre insieme", note: biglietto.value.trim() }));
  }
  Array.prototype.forEach.call(zona.querySelectorAll("[data-contatore]"), function (c) {
    var codice = c.getAttribute("data-codice"), numero = c.querySelector("output");
    scelte[codice] = 0;
    function cambia(di) { scelte[codice] = Math.max(0, Math.min(12, scelte[codice] + di)); numero.textContent = String(scelte[codice]); disegna(); }
    c.querySelector("[data-meno]").addEventListener("click", function () { cambia(-1); });
    c.querySelector("[data-piu]").addEventListener("click", function () { cambia(1); });
  });
  Array.prototype.forEach.call(zona.querySelectorAll("input[name=scatola]"), function (s) { s.addEventListener("change", disegna); });
  biglietto.addEventListener("input", disegna);
  whatsapp.addEventListener("click", function (evento) { if (whatsapp.getAttribute("aria-disabled") === "true") { evento.preventDefault(); } });
  metti.addEventListener("click", function () {
    var carrello = N.leggi();
    righe().forEach(function (x) { carrello = L.aggiungi(carrello, x.codice, x.quantita, dati.righe); });
    N.scrivi(carrello);
    esito.textContent = "";
    var testo = document.createElement("span"), vai = document.createElement("a");
    testo.textContent = "La confezione è nel carrello. ";
    vai.href = dati.base + "negozio/carrello/"; vai.textContent = "Vai al carrello";
    esito.appendChild(testo); esito.appendChild(vai);
  });
  disegna();
})();
