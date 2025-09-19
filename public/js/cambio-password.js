async function sendPasswordForm() {
    const vecchia_password = document.getElementById("password").value;
    const nuova_password = document.getElementById("conferma_password").value;
    const messaggio = document.getElementById("messaggio");

    // Reset classi precedenti
    messaggio.classList.remove("successo", "errore");

    const dati = {
        vecchia_password: vecchia_password,
        nuova_password: nuova_password
    }
    console.log(dati);
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if (authData && authData.id) {
        const id = authData.id;
        try {
            const response = await fetch(`/nuova-password-api/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dati)
            });

            const data = await response.json();

            if (!response.ok && response.status === 422) {
                messaggio.textContent = data.message;
                messaggio.classList.add("errore");
                setTimeout(() => {
                    messaggio.textContent = "";
                    messaggio.classList.remove("errore");
                }, 3000);

                // Pulisco i campi del form
                document.getElementById("password").value = "";
                document.getElementById("conferma_password").value = "";
                return;
            }

            if (!response.ok) {
                messaggio.textContent = "Sessione scaduta. Effettua di nuovo il login.";
                messaggio.classList.add("errore");
                localStorage.removeItem("authData");
                sessionStorage.removeItem("authData");
                setTimeout(() => window.location.href = "/login", 3000);
                return;
            }

            messaggio.textContent = data.message;
            messaggio.classList.add("successo");
            setTimeout(() => {
                messaggio.textContent = "";
                messaggio.classList.remove("successo");
            }, 3000);
            
            document.getElementById("password").value = "";
            document.getElementById("conferma_password").value = "";

        } catch (error) {
            messaggio.textContent = "Errore di rete o del server. Riprova.";
            messaggio.classList.add("errore");
            setTimeout(() => {
                messaggio.textContent = "";
                messaggio.classList.remove("errore");
            }, 3000);
            document.getElementById("password").value = "";
            document.getElementById("conferma_password").value = "";
            console.error(error);
        }
    }
}
;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("password-form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        sendPasswordForm();
    });
});