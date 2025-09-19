/* ## FETCH DEI DATI UTENTE */
document.addEventListener("DOMContentLoaded", async () => {
    const intestatario_value = document.getElementById("intestatario-value");
    const num_carta_value = document.getElementById("num_carta-value");
    const scad_carta = document.getElementById("scad_carta");
    const limite_attuale = document.getElementById("limite-attuale");
    const limite_barra = document.getElementById("limite-barra");
    const btn_stato_carta = document.getElementById("stato-carta-btn");

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        let response = await fetch(`/dati-conto-api/${id}`);

        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }
        let data = await response.json();
        
        intestatario_value.innerText = data.nome + " " + data.cognome;

        let formatted = '';
        for (let i = 0; i < data.carta_num.length; i += 4) {
            formatted += data.carta_num.slice(i, i + 4) + ' ';
        }
        num_carta_value.innerText = formatted.trim();

        data.scad_carta = new Date(data.scad_carta);
        scad_carta.innerText = (data.scad_carta.getMonth() + 1).toString().padStart(2, '0') + "/" + data.scad_carta.getFullYear().toString().slice(-2);
        limite_attuale.innerText = data.limite_spesa;
        limite_barra.innerText = data.limite_spesa;

        if(data.stato_carta){
            btn_stato_carta.innerText = "Blocca Carta";
            btn_stato_carta.classList.add("blocca-carta-btn");
        }
        else{
            btn_stato_carta.innerText = "Attiva Carta";
            btn_stato_carta.classList.add("attiva-carta-btn");
        }
        
        await barra_portafoglio();
    }
    else
        window.location.href = "/login";
});