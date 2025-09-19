const p_message = document.getElementById("msg-error");
const accedi_btn = document.getElementById("accedi-btn");
const check_ricorda = document.getElementById("check-ricordami");
const form = document.getElementById("login-form");

/* INVIO DEL FORM */
form.addEventListener("submit", async (event)=>{
    event.preventDefault();  // Previene l'invio del form
    const email = document.getElementById("email").value;
    const password= document.getElementById("password").value;
    const dati = {
        email: email,
        password: password
    }
    const response = await fetch("/login-api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(dati)
    });
    if (response.ok){
        const data = await response.json();
        if (check_ricorda.checked)
            localStorage.setItem("authData", JSON.stringify(data.message));
        else
            sessionStorage.setItem("authData", JSON.stringify(data.message));
        
        window.location.href = "/dashboard/conto";
    }
    else{
        const errorData = await response.json();
        p_message.textContent = errorData.message;
        p_message.classList.add("active");
        setTimeout(()=>{
            p_message.classList.remove("active");
            p_message.textContent = "";
        }, 8000)
    }
})