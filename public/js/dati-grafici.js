/* FETCH DEI DATI GRAFICI */

document.addEventListener("DOMContentLoaded", async () => {
    const contestoCanvas = document.getElementById("mioGrafico").getContext("2d");      // -> il canvas dove verrà disegnato il grafico
    const bottoneToggle = document.getElementById("toggle-graph");                      // -> bottone per cambiare tipo di grafico
    const testoToggle = document.getElementById("toggle-text-graph");                   // -> il testo dentro il bottone (Patrimonio / Spese)
    const iconaToggle = bottoneToggle.querySelector(".material-symbols-outlined");      // -> l’icona nel bottone (bar_chart / pie_chart)
    const titoloGrafico = document.querySelector(".graph-title .title");                // -> il titolo sopra al grafico

    // Etichette dei mesi
    const mesi = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];

    // Dati iniziali per il grafico
    let patrimonioMensile = Array(12).fill(0);
    let speseMensili = Array(12).fill(0);
    let istanzaGrafico = null; // conterrà l’oggetto Chart corrente, per poterlo distruggere e ricreare al cambio di tipo
    let visualizzazione = "patrimonio";

    const getConfigBar = (tipo) => {
        const isPatrimonio = tipo === "patrimonio";
        return {
            type: "bar",
            data: {
                labels: mesi,
                datasets: [{
                    label: isPatrimonio ? "Patrimonio (€)" : "Spese (€)",
                    data: isPatrimonio ? patrimonioMensile : speseMensili,
                    backgroundColor: isPatrimonio ? '#eb843b' : '#8958da',
                    borderColor: isPatrimonio ? '#d17131' : '#6c43c6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: isPatrimonio ? "Patrimonio (€)" : "Spese (€)"
                        },
                        ticks: { font: { size: window.innerWidth < 600 ? 10 : 14 } }
                    },
                    x: {
                        title: {
                          display: true,
                          text: "Mese"
                        },
                        ticks: { font: { size: window.innerWidth < 600 ? 10 : 14 } }
                    }
                },
                plugins: {
                    legend: {display: false}
                }
            }
        };
    };
    
    const aggiornaGrafico = (tipo) => {
        if(istanzaGrafico) istanzaGrafico.destroy();
        const configurazione = getConfigBar(tipo);
        istanzaGrafico = new Chart(contestoCanvas, configurazione);
    
        // Aggiorna testi e icona
        if (tipo === "patrimonio") {
            testoToggle.textContent = "Spese";
            iconaToggle.textContent = "bar_chart";
            titoloGrafico.textContent = `Andamento Patrimonio ${new Date().getFullYear()}`;
            bottoneToggle.classList.remove("evidenziato");
            testoToggle.classList.remove("evidenziato");
        } else {
            testoToggle.textContent = "Patrimonio";
            iconaToggle.textContent = "bar_chart";
            titoloGrafico.textContent = `Andamento Spese ${new Date().getFullYear()}`;
            bottoneToggle.classList.add("evidenziato");
            testoToggle.classList.add("evidenziato");
        }
    }
  
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;
  
    if(authData && authData.id) {
        const id = authData.id;
        const response = await fetch(`/dati-transazioni-api/${id}`);

        if(!response.ok) {
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
        }

        const data = await response.json();
        if(data.transazioni && Array.isArray(data.transazioni)) {
            if (data.transazioni.length === 0) {
                console.log("Nessuna transazione disponibile per l'utente.");
                aggiornaGrafico(visualizzazione); // Mostra grafico vuoto (tutti zeri)
                return;
            }

            const annoCorrente = new Date().getFullYear();
            // Ordina le transazioni per data
            data.transazioni.sort((a, b) => new Date(a.data) - new Date(b.data));

            let saldoCorrente = 0;
            data.transazioni.forEach(t => {
                const dataTransazione = new Date(t.data);
                const anno = dataTransazione.getFullYear(); 
                if(anno === annoCorrente - 1) {
                    saldoCorrente += t.importo;
                }
            });

            data.transazioni.forEach(t => {
                const dataTransazione = new Date(t.data);
                const anno = dataTransazione.getFullYear(); 
                const mese = dataTransazione.getMonth();  

                if(anno === annoCorrente) {
                    if(anno === annoCorrente) {
                        saldoCorrente += t.importo;
                        patrimonioMensile[mese] = saldoCorrente;
                    }
                }
            });

            data.transazioni.forEach(t => {
                const dataTransazione = new Date(t.data);
                const anno = dataTransazione.getFullYear();
                const mese = dataTransazione.getMonth();

                if(anno === annoCorrente && t.importo < 0) {
                    speseMensili[mese] += Math.abs(t.importo);
                }
            });

            aggiornaGrafico(visualizzazione);
        }

        // Gestisce il cambio di visualizzazione tra patrimonio e spese
        bottoneToggle.addEventListener("click", () => {
            visualizzazione = visualizzazione === "patrimonio" ? "spese" : "patrimonio";
            aggiornaGrafico(visualizzazione);
        });

        // Gestisce il ridimensionamento del grafico
        window.addEventListener("resize", () => {
            if (istanzaGrafico) istanzaGrafico.resize();
        });
        return;
    } else {
        window.location.href = "/login";
    }
});