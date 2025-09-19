async function barra_portafoglio(){
    const limite_attuale = document.getElementById("limite-attuale");
    const limite_barra = document.getElementById("limite-barra");
    const disponibile_barra = document.getElementById("disponibile-barra");
    const percentuale_barra = document.getElementById("percentuale-barra");
    const percentuale_barra_txt = document.getElementById("percentuale-barra-txt");

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        const response = await fetch(`/dati-transazioni-api/${id}`);
        if(!response.ok) {
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }

        data = await response.json();
        
        if(data.transazioni && Array.isArray(data.transazioni)) {
            if(data.transazioni.length === 0) {
                disponibile_barra.innerText = limite_attuale.innerText;
                limite_barra.innerText = limite_attuale.innerText;
                percentuale_barra.style.width = "0%";
                percentuale_barra_txt.innerText = "0%";
                return;
            }

            const meseCorrente = new Date().getMonth() + 1;
            const annoCorrente = new Date().getFullYear();
            let speseMensili = 0;

            data.transazioni.forEach(t => {
                const dataTransazione = new Date(t.data);
                const anno = dataTransazione.getFullYear(); 
                const mese = dataTransazione.getMonth() + 1;  

                if(anno === annoCorrente && mese === meseCorrente && t.carta_flag) {
                    if(t.importo < 0) {
                        speseMensili += Math.abs(t.importo);
                    }
                }
            });

            const limiteCarta = parseFloat(limite_attuale.innerText);
            let disponibile = limiteCarta - speseMensili;
            if (disponibile < 0) disponibile = 0;

            let percentualeUtilizzata = (speseMensili / limiteCarta) * 100;
            if (percentualeUtilizzata > 100) percentualeUtilizzata = 100;

            percentuale_barra.classList.remove("verde", "arancione", "rosso");

            if (percentualeUtilizzata < 50) {
                percentuale_barra.classList.add("verde");
            } else if (percentualeUtilizzata < 90) {
                percentuale_barra.classList.add("arancione");
            } else {
                percentuale_barra.classList.add("rosso");
            }

            limite_barra.innerText = limite_attuale.innerText;
            disponibile_barra.innerText = disponibile.toFixed(2);
            percentuale_barra.style.width = `${percentualeUtilizzata.toFixed(0)}%`;
            percentuale_barra_txt.innerText = `${percentualeUtilizzata.toFixed(0)}%`;
        }
    }
    else
        window.location.href = "/login";
}