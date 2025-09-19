/* FETCH DEI DATI TRANSAZIONI */
document.addEventListener("DOMContentLoaded", async () => {
	const tbody = document.getElementById("tbody-transazioni");
	const popup_container = document.getElementById("popup");

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
		// Ordinamento delle transazioni dalla più recente alla più vecchia
		data.transazioni.sort((a, b) => {
			const diffData = new Date(b.data) - new Date(a.data);
			if (diffData !== 0) {
				return diffData; // ordina per data (prima la più recente)
			}
			return b.id - a.id; // a parità di data, ordina per id decrescente
		});

		if (data.transazioni.length === 0) {
		// Se non ci sono transazioni, mostra una riga vuota o un messaggio
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td colspan="6" style="text-align: center; color: #999;">
			Nessuna transazione disponibile
			</td>
		`;
		tbody.appendChild(tr);
		} else {
		data.transazioni.forEach(tx => {
			// genero una riga per ogni transazione
			const tr = document.createElement("tr");
	
			// Determina tipo di transazione
			const tipo = tx.importo >= 0 ? "Entrata" : "Uscita";

			// Converte la data da formato UTC a locale
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
			
			tbody.appendChild(tr); // serve per inserire dinamicamente un elemento nel DOM

			if(popup_container){
			tr.addEventListener("click", ()=>{
				const transazione_id_popup = document.getElementById("transazione-id-popup");
				const importo_popup = document.getElementById("importo-popup");
				const data_popup = document.getElementById("data-popup");
				const tipo_popup = document.getElementById("tipo-popup");
				const mittente_popup = document.getElementById("mittente-popup");
				const destinatario_popup = document.getElementById("destinatario-popup");
				const descrizione_popup = document.getElementById("descrizione-popup");
				
				transazione_id_popup.innerText = tx.id;
				importo_popup.innerText = tx.importo.toFixed(2) + " €";
				data_popup.innerText = dataLocale;
				tipo_popup.innerText = tipo;
				mittente_popup.innerHTML = `${tx.mittente ?? "-"}`;
				destinatario_popup.innerHTML = `${tx.destinatario ?? "-"}`;
				descrizione_popup.innerText = tx.descrizione;

				popup_container.style.display = "flex";
			});
			}
		});
		}
		return;
	}
	else {
		window.location.href = "/login";
	}
	}
});
