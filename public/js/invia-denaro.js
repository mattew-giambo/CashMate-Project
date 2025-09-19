const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('username');
const destinatario = document.getElementById("destinatario-value");
const email_destinatario = document.getElementById("email-destinatario");
const form_invia_denaro = document.getElementById("form-invia-denaro");
const messaggio = document.getElementById("messaggio");
const descrizione_input = document.getElementById("descrizione-value");
const annulla_btn = document.getElementById("annulla-btn");

document.addEventListener("DOMContentLoaded", async ()=>{
    email_destinatario.innerText = email;

    const response = await fetch("/nome-utente-api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email: email})
    });

    if(!response.ok){
        window.location.href = "/login";
        localStorage.removeItem("authData");
        sessionStorage.removeItem("authData");
        return;
    }
    const data = await response.json();
    destinatario.innerText = data.message.nome + " " + data.message.cognome;
});

form_invia_denaro.addEventListener("submit", async(event)=>{
    event.preventDefault();

    const importo = parseFloat(document.getElementById("importo").value);
    const saldo_disponibile = parseFloat(document.getElementById("saldo-disponibile-value").innerText);
    const descrizione_value = descrizione_input.value;
    
    if(importo < 0){
        messaggio.innerText = "Errore, inserisci un importo valido!";
        messaggio.classList.add("active");
        setTimeout(()=>{
            messaggio.classList.remove("active");
            messaggio.innerText = "";
        }, 4000);
        return;
    }
    
    if(importo > saldo_disponibile){
        messaggio.innerText = "Errore, saldo insufficiente!";
        messaggio.classList.add("active");
        setTimeout(()=>{
            messaggio.classList.remove("active");
            messaggio.innerText = "";
        }, 4000);
        return;
    }

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        const response = await fetch(`/invia-denaro-api/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email_dest: email,
                importo: importo,
                descrizione: descrizione_value
            })
        });

        const data = await response.json();
        if(!response.ok){
            messaggio.innerText = data.message;
            messaggio.classList.add("active");
            setTimeout(()=>{
                messaggio.classList.remove("active");
                messaggio.innerText = "";
            }, 4000);
            return;
        }

        messaggio.innerText = data.message;
        messaggio.style.color = "#138808";
        messaggio.classList.add("active");
        setTimeout(()=>{
            messaggio.textContent = "";
            messaggio.classList.remove("active");
            messaggio.style.color = "#ce3818";

            window.location.href= "/dashboard/operazioni";
        }, 2500);


    }
    else
        window.location.href ="/login";
});

annulla_btn.addEventListener("click", ()=>{
    window.location.href="/dashboard/operazioni";
});
