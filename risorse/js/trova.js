/* «Quale miele fa per te?»: due domande e una risposta. Le parole sono nel catalogo; qui si mostra solo il passo giusto. */
(function () {
  "use strict";
  var zona = document.querySelector("[data-trova]");
  if (!zona) { return; }
  var passi = zona.querySelectorAll("[data-passo]"), esiti = zona.querySelectorAll("[data-risultato]"), ancora = zona.querySelector("[data-ricomincia]");
  function mostra(passo, esito) {
    Array.prototype.forEach.call(passi, function (p) { p.hidden = esito !== null || p.getAttribute("data-passo") !== String(passo); });
    Array.prototype.forEach.call(esiti, function (r) { r.hidden = r.getAttribute("data-risultato") !== esito; });
    ancora.hidden = esito === null && passo === 0;
    var fuoco = esito !== null ? zona.querySelector('[data-risultato="' + esito + '"] h3') : zona.querySelector('[data-passo="' + passo + '"] .trova-domanda');
    if (fuoco) { fuoco.focus(); }
  }
  zona.addEventListener("click", function (evento) {
    var tasto = evento.target.closest ? evento.target.closest("[data-prossima], [data-miele], [data-ricomincia]") : null;
    if (!tasto) { return; }
    if (tasto.hasAttribute("data-miele")) { mostra(0, tasto.getAttribute("data-miele")); }
    else if (tasto.hasAttribute("data-prossima")) { mostra(Number(tasto.getAttribute("data-prossima")), null); }
    else { mostra(0, null); }
  });
})();
