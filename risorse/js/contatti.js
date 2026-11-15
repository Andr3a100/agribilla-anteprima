/* Il modulo dei contatti non manda niente da solo: compone il messaggio e lo apre in WhatsApp o nel programma di posta. */
(function () {
  "use strict";
  var modulo = document.querySelector("[data-componi]");
  if (!modulo) { return; }
  var whatsapp = modulo.querySelector("[data-componi-whatsapp]"), posta = modulo.querySelector("[data-componi-posta]"), anteprima = modulo.querySelector("[data-componi-anteprima]");
  var numero = whatsapp.getAttribute("data-numero"), casella = posta.getAttribute("data-casella");
  function valore(nome) { return modulo.elements[nome].value.trim(); }
  function aggiorna() {
    var linee = ["Buongiorno,", valore("messaggio") || "(scrivi qui il tuo messaggio)"];
    if (valore("argomento")) { linee.splice(1, 0, "Scrivo per: " + valore("argomento") + "."); }
    if (valore("nome")) { linee.push(valore("nome")); }
    var testo = linee.join("\n");
    anteprima.textContent = testo;
    whatsapp.href = numero + "?text=" + encodeURIComponent(testo);
    posta.href = "mailto:" + casella + "?subject=" + encodeURIComponent(valore("argomento") || "Richiesta dal sito") + "&body=" + encodeURIComponent(testo);
  }
  modulo.addEventListener("input", aggiorna);
  modulo.addEventListener("submit", function (evento) { evento.preventDefault(); });
  aggiorna();
})();
