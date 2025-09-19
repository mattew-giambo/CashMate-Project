const continua_btn = document.getElementById("continua-btn")
const close_popup = document.getElementById("close-popup-btn")
const conf_popup = document.getElementById("conf-popup-btn")

const messaggio_errore = document.getElementById("msg-invia")
const messaggio = document.getElementById("messaggio");
const popup_container = document.getElementById("popup")

const nome_popup = document.getElementById("nome-popup")
const iban_popup = document.getElementById("iban-popup")
const importo_popup = document.getElementById("importo-popup")
const data_popup = document.getElementById("data-popup")
const causale_popup = document.getElementById("causale-popup")

function resetFormCampi() {
    const nome = document.getElementById("nome-input");
    const iban = document.getElementById("iban-input");
    const importo = document.getElementById("importo-input");
    const data = document.getElementById("data-input");
    const causale = document.getElementById("causale-input");
    
    nome.value = "";
    iban.value = "";
    importo.value = "";
    data.value = "";
    causale.value = "";
};

const form = document.getElementById("form-bonifico");
form.addEventListener("submit", (event)=>{
    event.preventDefault(); // Previeni l'invio del form

    const nome = document.getElementById("nome-input");
    const iban = document.getElementById("iban-input");
    const importo = document.getElementById("importo-input");
    const data = document.getElementById("data-input");
    const causale = document.getElementById("causale-input");
    
    // Ottenere la data selezionata (come stringa YYYY-MM-DD)
    const selectedDate = data.value;

    // Ottenere la data di oggi come stringa YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];  // Ottieni la data di oggi nel formato YYYY-MM-DD

    // Confrontare solo le date come stringhe
    if (selectedDate < today) {
        messaggio_errore.textContent = "Errore, inserisci una data valida!";
        messaggio_errore.classList.add("active")
        setTimeout(()=>{
            messaggio_errore.classList.remove("active")
            messaggio_errore.textContent = "";
        }, 5000);
        return;
    } 
    if (nome.value === "") {
        messaggio_errore.textContent = "Errore, inserisci il nome e cognome del destinatario!";
        messaggio_errore.classList.add("active")
        setTimeout(()=>{
            messaggio_errore.classList.remove("active")
            messaggio_errore.textContent = "";
        }, 5000);
        return;
    } 
    if(iban.value === ""){
        messaggio_errore.textContent = "Errore, inserisci il nome e cognome del destinatario!";
        messaggio_errore.classList.add("active")
        setTimeout(()=>{
            messaggio_errore.classList.remove("active")
            messaggio_errore.textContent = "";
        }, 5000);
        return;
    }
    if(Number(importo.value) < 0 ){
        messaggio_errore.textContent = "Errore, inserisci un importo valido!";
        messaggio_errore.classList.add("active")
        setTimeout(()=>{
            messaggio_errore.classList.remove("active")
            messaggio_errore.textContent = "";
        }, 5000);
        return;
    }
    if(causale.value === ""){
        messaggio_errore.textContent = "Errore, inserisci una causale!";
        messaggio_errore.classList.add("active")
        setTimeout(()=>{
            messaggio_errore.classList.remove("active")
            messaggio_errore.textContent = "";
        }, 5000);
        return;
    }

    nome_popup.textContent = nome.value;
    iban_popup.textContent = iban.value;
    importo_popup.textContent = importo.value + " €";
    causale_popup.textContent = causale.value;
    data_popup.textContent = new Date(selectedDate).toLocaleDateString("it-IT");
    // Mostra il popup
    popup_container.style.display = "flex";
});

close_popup.addEventListener("click", function(){
    popup_container.style.display = "none";
    resetFormCampi();
});

conf_popup.addEventListener("click", async function() {
    const nome = document.getElementById("nome-input");
    const iban = document.getElementById("iban-input");
    const importo = document.getElementById("importo-input");
    const data = document.getElementById("data-input");
    const causale = document.getElementById("causale-input");

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if (!authData || !authData.id) {
        window.location.href = "/login";
        return;
    }

    const id = authData.id;
    const bonifico = {
        nomeDestinatario: nome.value,
        ibanDestinatario: iban.value,
        importo: parseFloat(importo.value),
        data: data.value, // formato YYYY-MM-DD
        descrizione: causale.value
    };

    try {
        const response = await fetch(`/bonifico/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bonifico)
        });

        const result = await response.json();
        
        if (result.status === "ok") {
            messaggio.textContent = "Operazione effettuata con successo!";
            messaggio.style.color = "#138808";
            messaggio.classList.add("active");
            setTimeout(() => {
                popup_container.style.display = "none";
                messaggio.textContent = "";
                messaggio.classList.remove("active");
                messaggio.style.color = "#ce3818";
            }, 3000);
            resetFormCampi();
        } else {
            messaggio.textContent = result.message;
            messaggio.classList.add("active");
            setTimeout(() => {
                popup_container.style.display = "none";
                messaggio.textContent = "";
                messaggio.classList.remove("active");
            }, 3000);
            resetFormCampi();
        }

    } catch (error) {
        console.log(error)
        messaggio.textContent = "Si è verificato un errore. Riprova più tardi.";
        messaggio.classList.add("active");
        setTimeout(() => {
            popup_container.style.display = "none";
            messaggio.textContent = "";
            messaggio.classList.remove("active");
        }, 3000);
        resetFormCampi();
    }
});
