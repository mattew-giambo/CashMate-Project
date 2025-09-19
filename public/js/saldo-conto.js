/* CALCOLO DEL SALDO, utilizzare la variabile saldoReale */

let saldoReale = 0;
document.addEventListener("DOMContentLoaded", async () => {
    const saldo_disponibile_value = document.getElementById("saldo-disponibile-value");

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id) {
        const id = authData.id;
        const response = await fetch(`/dati-transazioni-api/${id}`);

        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }
        const data = await response.json();
        if (data.transazioni && Array.isArray(data.transazioni)){
            data.transazioni.forEach(t => {
                saldoReale += parseFloat(t.importo);
            });
        }
        if(saldo_disponibile_value)
            saldo_disponibile_value.innerText = saldoReale.toFixed(2) +" €";
    }
    else
        window.location.href = "/login";
}); 