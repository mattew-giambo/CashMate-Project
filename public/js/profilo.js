const btn_download_carta = document.getElementById("download-carta-id");
const form_assistenza = document.getElementById("form-assistenza");

btn_download_carta.addEventListener("click", async()=>{
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const id = authData.id;
        const response = await fetch(`/cartaId-api/${id}`);

        if(!response.ok){
            window.location.href = "/login";
            localStorage.removeItem("authData");
            sessionStorage.removeItem("authData");
            return;
        }

        const data = await response.json();
        const base64String = data.document_file;
        const fileDataUrl = `data:application/pdf;base64,${base64String}`;
        
        const a = document.createElement("a");
        a.href = fileDataUrl;
        a.download = "cartaID.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    else
        window.location.href = "/login";
});

form_assistenza.addEventListener("submit", async(event)=>{
    event.preventDefault();
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){
        const oggetto_form = document.getElementById("oggetto-form");
        const corpo_form = document.getElementById("corpo-form");
        const email = document.getElementById("email-value");
        const msg_assist = document.getElementById("msg-assist");
        
        const response = await fetch("/assistenza-api", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                oggetto: oggetto_form.value,
                corpo: corpo_form.value,
                mittente: email.innerText
            })
        });

        if(response.ok){
            msg_assist.textContent = "Operazione effettuata con successo!";
            msg_assist.classList.add("active");
            msg_assist.style.color = "#138808";
            setTimeout(() => {
                msg_assist.textContent = "";
                msg_assist.classList.remove("active");
                msg_assist.style.color = "#ce3818";
            }, 3000);
            oggetto_form.value = "";
            corpo_form.value = "";
        } else {
            msg_assist.textContent = result.message;
            msg_assist.classList.add("active");
            setTimeout(() => {
                msg_assist.textContent = "";
                msg_assist.classList.remove("active");
            }, 3000);
            oggetto_form.value = "";
            corpo_form.value = "";
        }

        return;
    }
    else
        window.location.href = "/login";
});