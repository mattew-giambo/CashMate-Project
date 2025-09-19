/*  ## SALDO-CONTAINER ##

    Prendo dal DOM gli elementi HTML usando il loro ID: il testo del saldo, l'icona del bottone
    visibilità, il testo sotto l'icona e il messaggio con l'ultima data di aggiornamento.
    
    La variabile saldoReale conserva il valore reale del saldo. 

    Aggiungo un ascoltatore di eventi all'elemento con id 'toggle-saldo', ossia il bottone, quindi 
    quando il bottone viene cliccato, viene eseguita la funzione. 
    Ricorda che la proprietà .textContent di un elemento HTML restituisce il testo contenuto nel nodo e 
    nei suoi discendenti, senza HTML, solo il testo. Ad esempio, se c'è <strong> in mezzo al testo
    non viene preso.

    Nella variabile 'oggi' creo un nuovo oggetto Date, questo rappresenta la data e l'ora attuali.
    Mentre opzioniData è un oggetto che specifica il formato desiderato con il metodo toLocaleDateString()
    che formatta la data in base alla localizzazione. (2-digit -> 2 cifre, numeric mostra l'anno completo)
    Il metodo formatta l'oggetto nel formato di data italiano.
*/

const saldoValore = document.getElementById("saldo-valore");
const toggleIcon = document.getElementById("toggle-icon");
const toggleText = document.getElementById("toggle-text-saldo");
const toggleButton = document.getElementById("toggle-saldo");
const saldoData = document.getElementById("saldo-data");


toggleButton.addEventListener("click", () => {
    const testoAttuale = saldoValore.textContent;

    // Se il saldo è nascosto, al click lo mostro
    if(testoAttuale === "Saldo nascosto") {
        saldoValore.textContent = `${saldoReale.toFixed(2)} €`;
        toggleIcon.textContent = "visibility_off";
        toggleText.textContent = "Nascondi";
    }

    // Se il saldo è visibile, al click lo nascondo
    else {
        saldoValore.textContent = "Saldo nascosto";
        toggleIcon.textContent = "visibility";
        toggleText.textContent = "Mostra";
    }
    
});

// Imposta la data odierna nel formato italiano
const oggi = new Date();
const opzioniData = { day: "2-digit", month: "2-digit", year: "numeric" };
const data = oggi.toLocaleDateString("it-IT", opzioniData);
saldoData.textContent = `Saldo aggiornato al ${data}`;

/*  ## COPY-TOAST ##

    Con DOMContentLoaded ci si assicura che il codice venga eseguito solo dopo che 
    l’intero HTML è stato caricato. Così siamo sicuri che gli elementi .copy-iban 
    e #iban-value esistano nel DOM.
*/

document.addEventListener("DOMContentLoaded", () => {
    // 1. Trova gli elementi importanti nella pagina web
    const iconaCopia = document.querySelector(".copy-iban"); // L'icona che l'utente clicca per copiare
    const valoreIban = document.getElementById("iban-value"); // Il testo dell'IBAN da copiare
    const messaggioCopiato = document.getElementById("copy-toast"); // Il messaggio di conferma "Copiato!"

    // 2. Verifica se tutti gli elementi sono stati trovati correttamente
    if (iconaCopia && valoreIban && messaggioCopiato) {
        // 3. Se l'icona di copia esiste, ascolta il click dell'utente
        iconaCopia.addEventListener("click", () => {
            // 4. Quando l'utente clicca, prendi il testo dell'IBAN
            const testoDaCopiare = valoreIban.textContent;

            // 5. Tenta di copiare il testo negli appunti del computer/telefono
            navigator.clipboard.writeText(testoDaCopiare)
                .then(() => {
                    // 6. Se la copia ha successo:
                    //    a. Rendi visibile il messaggio "Copiato!"
                    messaggioCopiato.classList.remove("hidden"); // Togli la classe che lo nasconde
                    messaggioCopiato.classList.add("show");    // Aggiungi la classe che lo mostra

                    //    b. Dopo un breve periodo (2 secondi), nascondi nuovamente il messaggio
                    setTimeout(() => {
                        messaggioCopiato.classList.remove("show"); // Togli la classe che lo mostra
                        messaggioCopiato.classList.add("hidden");  // Aggiungi la classe che lo nasconde
                    }, 2000); // 2000 millisecondi = 2 secondi
                })
                .catch(errore => {
                    // 7. Se c'è stato un errore durante la copia:
                    console.error("Errore durante la copia:", errore);
                });
        });
    }
    // 8. Se uno degli elementi importanti non è stato trovato, non fare nulla 
});