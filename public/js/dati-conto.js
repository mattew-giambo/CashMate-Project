/* ## FETCH DEI DATI UTENTE */
document.addEventListener("DOMContentLoaded", async () => {
	const numero_conto = document.getElementsByName("numero-conto");
	const nome_utente = document.getElementById("nome-utente");
	const intestatario_value = document.getElementById("intestatario-value");
	const iban_value = document.getElementById("iban-value");

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
		
		if(numero_conto)
			// Popola dati utente
			for(let elem of numero_conto){
				elem.innerText = data.conto_id;
			}
		
		if(nome_utente)
			nome_utente.innerText = data.nome;

		if(intestatario_value)
			intestatario_value.innerText = data.nome + ` ${data.cognome}`;

		if(iban_value)
			iban_value.innerText = data.iban;
		return;
	}
	else {
		window.location.href = "/login";
	}
});
