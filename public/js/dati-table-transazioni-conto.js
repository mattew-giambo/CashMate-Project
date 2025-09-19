/* FETCH DEI DATI TRANSAZIONI */
document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("tbody-transazioni");
  
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
  
      if (data.transazioni && Array.isArray(data.transazioni)) {
        // Ottieni mese e anno correnti
        const now = new Date();
        const meseCorrente = now.getMonth();
        const annoCorrente = now.getFullYear();
  
        // Filtra solo le transazioni del mese corrente
        const transazioniCorrenti = data.transazioni.filter(tx => {
          const dataTx = new Date(tx.data);
          return dataTx.getMonth() === meseCorrente && dataTx.getFullYear() === annoCorrente;
        });
  
        // Ordinamento dalla più recente alla più vecchia
        transazioniCorrenti.sort((a, b) => {
          const diffData = new Date(b.data) - new Date(a.data);
          if (diffData !== 0) {
              return diffData; // ordina per data (prima la più recente)
          }
          return b.id - a.id; // a parità di data, ordina per id decrescente
      });
  
        if (transazioniCorrenti.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td colspan="6" style="text-align: center; color: #999;">
              Nessuna transazione disponibile per il mese corrente
            </td>
          `;
          tbody.appendChild(tr);
        } else {
          transazioniCorrenti.forEach(tx => {
            const tr = document.createElement("tr");
  
            const tipo = tx.importo >= 0 ? "Entrata" : "Uscita";
            const dataLocale = new Date(tx.data).toLocaleDateString('it-IT');
  
            tr.innerHTML = `
              <td>${tx.id}</td>
              <td>${dataLocale}</td>
              <td>${tx.importo.toFixed(2)} €</td>
              <td>
                <div class="icona-td">
                  <span class="material-symbols-rounded ${tipo === 'Entrata' ? 'td-entrata' : 'td-uscita'}">
                    ${tipo === 'Entrata' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </div>
              </td>
              <td>${tx.destinatario ?? "-"}</td>
              <td>${tx.mittente ?? "-"}</td>
            `;
            tbody.appendChild(tr);
          });
        }
        return;
      } else {
        window.location.href = "/login";
      }
    }
  });
  