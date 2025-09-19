const btn_stato_carta = document.getElementById("stato-carta-btn");
const messaggio = document.getElementById("messaggio");
const btn_aggiorna_carta = document.getElementById("aggiorna-carta-btn");
const limite_carta = document.getElementById("limite-carta");
const limite_attuale = document.getElementById("limite-attuale");

btn_stato_carta.addEventListener("click", async()=>{
    if (btn_stato_carta.classList.contains("blocca-carta-btn")) {
        btn_stato_carta.classList.remove("blocca-carta-btn");
        btn_stato_carta.classList.add("attiva-carta-btn");
        btn_stato_carta.innerText = "Attiva Carta";
        messaggio.innerText = "Carta bloccata con successo!"
        setTimeout(()=>{
            messaggio.innerText ="";
        }, 5000);
    }
    else if (btn_stato_carta.classList.contains("attiva-carta-btn")) {
        btn_stato_carta.classList.remove("attiva-carta-btn");
        btn_stato_carta.classList.add("blocca-carta-btn");
        btn_stato_carta.innerText = "Blocca Carta";
        messaggio.innerText = "Carta attivata con successo!"
        setTimeout(()=>{
            messaggio.innerText ="";
        }, 5000);
    }
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        const response = await fetch(`/stato-carta-api/${id}`, {method: "POST"});

        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }
    }
    else
        window.location.href = "/login";
});

btn_aggiorna_carta.addEventListener("click", async()=>{
    const limite_valore = Number(limite_carta.value);
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(!authData || !authData.id)
        window.location.href = "/login";

    if(limite_valore >= 0 && limite_valore <= 5000){
        const id = authData.id;
        let response = await fetch(`/limite-carta-api/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({limite_valore: limite_valore})
        });
        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }
        limite_attuale.innerText = limite_valore;
        messaggio.innerText = "Limite attuale impostato!"
        setTimeout(()=>{
            messaggio.innerText ="";
        }, 5000);

        await barra_portafoglio();
    } else{
        messaggio.innerText = "Inserisci un limite valido!"
        setTimeout(()=>{
            messaggio.innerText ="";
        }, 5000);
    }
});

/* POPUP */
const close_popup = document.getElementById("close-popup-btn");
const popup_container = document.getElementById("popup");

close_popup.addEventListener("click", function(){
    popup_container.style.display = "none";
});
