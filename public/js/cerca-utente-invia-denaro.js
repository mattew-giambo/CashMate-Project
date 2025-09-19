const form_cerca_utente = document.getElementById("form-cerca-utente");
const messagio = document.getElementById("msg-invia");

form_cerca_utente.addEventListener("submit", async(event)=>{
    event.preventDefault();

    const email = document.getElementById("username").value;

    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;

        if(email.innerText === ""){
            messagio.innerText = "Errore, inserisci un'email valida";
            messagio.classList.add("active");
            setTimeout(()=>{
                messagio.classList.remove("active");
                messagio.innerText= "";
            }, 4000);
        }
        const response = await fetch(`/valid-utente-api/${id}`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email: email})
        });

        const data = await response.json();
        if(!response.ok){
            messagio.innerText = data.message;
            messagio.classList.add("active");
            setTimeout(()=>{
                messagio.classList.remove("active");
                messagio.innerText= "";
            }, 4000);
            return;
        }
        else
            form_cerca_utente.submit();
    }
    else
        window.location.href ="/login";
});