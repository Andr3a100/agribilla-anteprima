/* Le regole del carrello, senza pagina intorno: si provano da sole con  node --test prove/
   Una riga del carrello è { codice, quantita }. Il catalogo dice, per ogni codice, prodotto, formato e prezzo in
   centesimi (o niente, se il prezzo non è ancora confermato). */
(function (radice, fabbrica) {
  if (typeof module === "object" && module.exports) { module.exports = fabbrica(); } else { radice.CarrelloLogica = fabbrica(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var MASSIMO = 99;

  function intero(n) { n = Math.floor(Number(n)); return isFinite(n) ? n : 0; }

  /* Tiene solo le righe di prodotti che esistono, con quantità da 1 a 99, una riga per codice. */
  function pulisci(righe, catalogo) {
    var visti = {}, esito = [];
    (Array.isArray(righe) ? righe : []).forEach(function (r) {
      if (!r || typeof r.codice !== "string" || !Object.prototype.hasOwnProperty.call(catalogo, r.codice)) { return; }
      var q = Math.min(MASSIMO, intero(r.quantita));
      if (q < 1) { return; }
      if (Object.prototype.hasOwnProperty.call(visti, r.codice)) { esito[visti[r.codice]].quantita = Math.min(MASSIMO, esito[visti[r.codice]].quantita + q); return; }
      visti[r.codice] = esito.length;
      esito.push({ codice: r.codice, quantita: q });
    });
    return esito;
  }

  function aggiungi(righe, codice, quanti, catalogo) {
    return pulisci(righe.concat([{ codice: codice, quantita: quanti === undefined ? 1 : quanti }]), catalogo);
  }

  function imposta(righe, codice, quanti, catalogo) {
    var trovata = false;
    var nuove = righe.map(function (r) { if (r.codice !== codice) { return r; } trovata = true; return { codice: codice, quantita: quanti }; });
    if (!trovata) { nuove.push({ codice: codice, quantita: quanti }); }
    return pulisci(nuove, catalogo);
  }

  function togli(righe, codice) { return righe.filter(function (r) { return r.codice !== codice; }); }

  function conta(righe) { return righe.reduce(function (somma, r) { return somma + r.quantita; }, 0); }

  function euro(cent) {
    var c = Math.round(cent);
    return Math.floor(c / 100) + "," + ("0" + (c % 100)).slice(-2) + " €";
  }

  /* Il conto: le righe con il loro importo e il totale. Se anche una sola riga non ha prezzo, il totale non si dice. */
  function conti(righe, catalogo) {
    var completo = righe.length > 0, totale = 0;
    var voci = pulisci(righe, catalogo).map(function (r) {
      var v = catalogo[r.codice], haPrezzo = typeof v.prezzo === "number" && v.prezzo > 0;
      if (!haPrezzo) { completo = false; } else { totale += v.prezzo * r.quantita; }
      return { codice: r.codice, prodotto: v.prodotto, formato: v.formato, quantita: r.quantita, prezzo: haPrezzo ? v.prezzo : null,
               importo: haPrezzo ? v.prezzo * r.quantita : null };
    });
    return { righe: voci, pezzi: conta(voci), completo: completo, totale: completo ? totale : null };
  }

  /* Il messaggio per WhatsApp: l'elenco, il totale (o «da confermare») e ciò che la persona ha scritto. */
  function messaggio(righe, catalogo, chi) {
    var c = conti(righe, catalogo), linee = ["Buongiorno, vorrei ordinare:"];
    c.righe.forEach(function (v) {
      linee.push("• " + v.quantita + " × " + v.prodotto + " (" + v.formato + ")" + (v.importo === null ? "" : " = " + euro(v.importo)));
    });
    linee.push(c.completo ? "Totale dei prodotti: " + euro(c.totale) : "Prezzi e disponibilità: da confermare");
    chi = chi || {};
    if (chi.confezione) { linee.push("Confezione regalo: " + chi.confezione); }
    if (chi.nome) { linee.push("Nome: " + chi.nome); }
    if (chi.dove) { linee.push("Da spedire a: " + chi.dove); }
    if (chi.note) { linee.push("Note: " + chi.note); }
    return linee.join("\n");
  }

  return { MASSIMO: MASSIMO, pulisci: pulisci, aggiungi: aggiungi, imposta: imposta, togli: togli, conta: conta, euro: euro, conti: conti, messaggio: messaggio };
});
