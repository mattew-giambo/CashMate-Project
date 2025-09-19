async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // data:application/pdf;base64, .....(dati effettivi base64)
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function sendRegisterForm() {
    const form = document.getElementById('registration-form');

    const nome = form.nome.value.trim();
    const cognome = form.cognome.value.trim();
    const data_nascita = form.data_nascita.value;
    const codice_fiscale = form.codice_fiscale.value.trim().toUpperCase();
    const citta = form.citta.value.trim();
    const cap = form.cap.value.trim();
    const indirizzo = form.indirizzo.value.trim();
    const numero_telefono = form.numero_telefono.value.trim();
    const email = form.email.value.trim();
    const numero_documento = form.numero_documento.value.trim().toUpperCase();
    const occupazione = form.occupazione.value.trim();
    const password = form.password.value;
    const conferma_password = form.conferma_password.value;
    const documento_input = form.documento;
    const oggi = new Date().toISOString().split("T")[0];
    const dataNascita = new Date(data_nascita); 
    const diffInMs = oggi - dataNascita; // Differenza in millisecondi
    const diffInYears = new Date(diffInMs).getUTCFullYear() - 1970; // Calcoliamo l'età in anni

    const popup = document.getElementById('popup');
    const hMessageElement = document.getElementById('hMessage');
    const pMessageElement = document.getElementById('pMessage');
    
    if (diffInYears < 18) {
        alert("Devi avere almeno 18 anni per registrarti.");
        return false; // Impedisce il submit
    }
    
    if (data_nascita >= oggi) {
        alert("La data di nascita deve essere precedente alla data odierna.");
        return false; // Impedisce la submit
    }

    if (password !== conferma_password) {
        alert("Le password non corrispondono.");
        return false;
    }
    /* INVIO DEL DOCUMENTO AL SERVER PDF */
    const file = documento_input.files[0];
    const file_base64 = await fileToBase64(file)
    
    const dati = {
        nome, cognome, data_nascita, codice_fiscale, citta, cap, indirizzo,
        numero_telefono, email, numero_documento, occupazione, password, 
        base64_documento: file_base64
    };

    try {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Impostiamo il tipo di contenuto come JSON
            body: JSON.stringify(dati) // Convertiamo l'oggetto `dati` in una stringa JSON
        }
        const response = await fetch('/register-api', options);
        const result = await response.json();

        if (response.ok) {
            // Mostra il popup di successo
            hMessageElement.innerText = "Registrazione riuscita"
            pMessageElement.innerText = "Registrazione effettuata con successo! Verrai reindirizzato alla pagina di login..."
            popup.style.display = 'flex';
            setTimeout(() => {
                window.location.href = '/login';
            }, 5000); // Attendi 5 secondi prima del redirect
        } else {
            // Mostra il popup di errore con il messaggio ricevuto dal server
            const message = result.message;
            hMessageElement.innerText = "Errore"
            pMessageElement.innerText = message;
            popup.style.display = 'flex';
        }
    } catch (err) {
        console.error('Errore durante l’invio del form:', err);
        hMessageElement.innerText = "Errore interno del server."
        pMessageElement.innerText = err.message;
        popup.style.display = 'flex';
    }

    return false; // impedisce il submit tradizionale
}

// Quando il DOM è pronto, aggiungi l'event listener
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registration-form");
    const close_popup = document.getElementById("close-popup-btn");
    const popup = document.getElementById('popup');

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Previeni l'invio del form
        sendRegisterForm();

        close_popup.addEventListener("click", function() {
            popup.style.display = "none";
        })
    });
});