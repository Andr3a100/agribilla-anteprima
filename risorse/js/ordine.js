/* La pagina del carrello: le righe, il conto, la richiesta su WhatsApp e, quando la gestione del negozio è accesa,
   il pagamento online. Il pagamento avviene sulle pagine del servizio di pagamento: qui non passa nessun dato di carta. */
(function () {
  "use strict";
  var N = window.Negozio, L = window.CarrelloLogica, zona = document.querySelector("[data-carrello]");
  if (!N || !L || !zona) { return; }
  var dati = N.dati;
  var vuoto = zona.querySelector("[data-vuoto]"), pieno = zona.querySelector("[data-pieno]"), elenco = zona.querySelector("[data-righe]");
  var modello = zona.querySelector("[data-modello-riga]"), conti = zona.querySelector("[data-conti]");
  var richiesta = zona.querySelector("[data-richiesta]"), whatsapp = zona.querySelector("[data-whatsapp]");
  var pagamento = zona.querySelector("[data-pagamento]"), inPreparazione = zona.querySelector("[data-in-preparazione]");
  var esito = document.querySelector("[data-esito-ordine]");

  function riga(nome, valore, classe) {
    var d = document.createElement("div"), a = document.createElement("dt"), b = document.createElement("dd");
    if (classe) { d.className = classe; }
    a.textContent = nome; b.textContent = valore;
    d.appendChild(a); d.appendChild(b);
    return d;
  }

  function disegna() {
    var c = L.conti(N.leggi(), dati.righe);
    vuoto.hidden = c.righe.length > 0;
    pieno.hidden = c.righe.length === 0;
    elenco.textContent = "";
    c.righe.forEach(function (v) {
      var voce = dati.righe[v.codice], li = modello.content.firstElementChild.cloneNode(true);
      var img = li.querySelector("img");
      if (voce.foto) { img.src = dati.base + voce.foto; } else { img.remove(); }
      var nome = li.querySelector("[data-nome]");
      nome.textContent = v.prodotto; nome.href = dati.base + voce.pagina;
      li.querySelector("[data-formato]").textContent = v.formato;
      li.querySelector("[data-prezzo]").textContent = v.prezzo === null ? "Prezzo da confermare" : L.euro(v.prezzo) + " l'uno · " + L.euro(v.importo);
      li.querySelector("output").textContent = String(v.quantita);
      var meno = li.querySelector("[data-meno]"), piu = li.querySelector("[data-piu]"), togli = li.querySelector("[data-togli]");
      meno.setAttribute("aria-label", "Uno in meno: " + v.prodotto + ", " + v.formato);
      piu.setAttribute("aria-label", "Uno in più: " + v.prodotto + ", " + v.formato);
      togli.setAttribute("aria-label", "Togli dal carrello: " + v.prodotto + ", " + v.formato);
      meno.addEventListener("click", function () { N.scrivi(L.imposta(N.leggi(), v.codice, v.quantita - 1, dati.righe)); });
      piu.addEventListener("click", function () { N.scrivi(L.imposta(N.leggi(), v.codice, v.quantita + 1, dati.righe)); });
      togli.addEventListener("click", function () { N.scrivi(L.togli(N.leggi(), v.codice)); });
      elenco.appendChild(li);
    });
    conti.textContent = "";
    conti.appendChild(riga("Prodotti", c.pezzi === 1 ? "1 pezzo" : c.pezzi + " pezzi"));
    conti.appendChild(riga("Spedizione", "da confermare"));
    conti.appendChild(riga("Totale dei prodotti", c.completo ? L.euro(c.totale) : "da confermare", "totale"));
    aggiornaRichiesta();
    var online = Boolean(dati.api) && c.completo;
    if (pagamento) { pagamento.hidden = !online; }
    if (inPreparazione) { inPreparazione.hidden = online; }
  }

  function campo(nome) { var el = richiesta && richiesta.elements[nome]; return el ? el.value.trim() : ""; }

  function aggiornaRichiesta() {
    if (!whatsapp) { return; }
    var testo = L.messaggio(N.leggi(), dati.righe, { nome: campo("nome"), dove: campo("dove"), note: campo("note") });
    whatsapp.href = dati.whatsapp + "?text=" + encodeURIComponent(testo);
  }
  if (richiesta) {
    richiesta.addEventListener("input", aggiornaRichiesta);
    richiesta.addEventListener("submit", function (evento) { evento.preventDefault(); });
  }

  function avvisa(tipo, testo) {
    if (!esito) { return; }
    esito.className = "avviso avviso-" + tipo;
    esito.textContent = testo;
    esito.hidden = false;
    esito.focus();
  }

  /* Pagamento online: i dati vanno alla gestione del negozio, che ricalcola il conto con i suoi prezzi e apre la pagina
     di pagamento. Dal browser non si decide nessun prezzo. */
  var modulo = zona.querySelector("[data-modulo-pagamento]");
  if (modulo && dati.api) {
    modulo.addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (!modulo.reportValidity()) { return; }
      var tasto = modulo.querySelector("button[type=submit]"), f = modulo.elements;
      tasto.disabled = true;
      var corpo = { righe: N.leggi(), cliente: { nome: f.nome.value.trim(), email: f.email.value.trim(), telefono: f.telefono.value.trim() },
                    consegna: { via: f.via.value.trim(), cap: f.cap.value.trim(), citta: f.citta.value.trim(), provincia: f.provincia.value.trim().toUpperCase() },
                    note: f.note.value.trim(), condizioni: f.condizioni.checked, privacy: f.privacy.checked };
      window.fetch(dati.base + dati.api + "/ordini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo), credentials: "omit" })
        .then(function (risposta) { return risposta.json().then(function (j) { return { ok: risposta.ok, j: j }; }); })
        .then(function (r) {
          if (r.ok && r.j && typeof r.j.url === "string" && /^https:\/\//.test(r.j.url)) { window.location.assign(r.j.url); return; }
          tasto.disabled = false;
          avvisa("errore", (r.j && (r.j.detail || r.j.messaggio)) || "Il pagamento non è partito. Riprova tra poco oppure manda la richiesta su WhatsApp.");
        })
        .catch(function () { tasto.disabled = false; avvisa("errore", "Il negozio non risponde in questo momento. Riprova tra poco oppure manda la richiesta su WhatsApp."); });
    });
  }

  /* Ritorno dalla pagina di pagamento: ?esito=pagato&ordine=…&chiave=…  oppure  ?esito=annullato */
  var parametri = new URLSearchParams(window.location.search), comeAndata = parametri.get("esito");
  if (comeAndata === "annullato") {
    avvisa("bozza", "Pagamento annullato: non è stato addebitato niente e il carrello è ancora qui.");
  } else if (comeAndata === "pagato" && dati.api && parametri.get("ordine") && parametri.get("chiave")) {
    window.fetch(dati.base + dati.api + "/ordini/" + encodeURIComponent(parametri.get("ordine")) + "?chiave=" + encodeURIComponent(parametri.get("chiave")), { credentials: "omit" })
      .then(function (risposta) { return risposta.ok ? risposta.json() : null; })
      .then(function (ordine) {
        if (ordine && ordine.stato === "pagato") {
          N.scrivi([]);
          avvisa("fatto", "Pagamento ricevuto: ordine " + ordine.numero + ". Ti abbiamo scritto una email con il riepilogo.");
        } else if (ordine) {
          avvisa("bozza", "Ordine " + ordine.numero + ": stiamo aspettando la conferma del pagamento. Ti scriviamo appena arriva.");
        } else {
          avvisa("errore", "Non troviamo questo ordine. Se hai pagato, scrivici: lo controlliamo subito.");
        }
      })
      .catch(function () { avvisa("errore", "Non riusciamo a leggere lo stato dell'ordine. Se hai pagato, scrivici: lo controlliamo subito."); });
  }

  document.addEventListener("agb:carrello", disegna);
  disegna();
})();
