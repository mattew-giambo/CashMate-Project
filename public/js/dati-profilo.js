/* ## FETCH DEI DATI UTENTE */
document.addEventListener("DOMContentLoaded", async () => {
    const intestatario_value = document.getElementById("intestatario-value");
    const cod_fisc_value = document.getElementById("cod_fisc-value");
    const carta_id_value = document.getElementById("carta_id-value");
    const num_tel_value = document.getElementById("num_tel-value");
    const email_value = document.getElementById("email-value");
    const residenza_value = document.getElementById("residenza-value");
    const professione_value = document.getElementById("professione-value");
    const iban_value = document.getElementById("iban-value");
    const id_conto_value = document.getElementById("id_conto-value");

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        const response = await fetch(`/dati-conto-api/${id}`);

        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }
        const data = await response.json();
        
        intestatario_value.innerText = data.nome + " " + data.cognome;
        cod_fisc_value.innerText = data.cod_fisc;
        carta_id_value.innerText = data.carta_id;
        num_tel_value.innerText = data.numero_tel;
        email_value.innerText = data.email;
        residenza_value.innerText = data.citta_res + " - " + data.cap + " - " + data.indirizzo_res;
        professione_value.innerText = data.occupazione;
        iban_value.innerText = data.iban;
        id_conto_value.innerText = data.conto_id;

        return;
    }
    else
        window.location.href = "/login";
});