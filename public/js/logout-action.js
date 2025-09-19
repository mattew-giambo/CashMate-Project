const esci_link = document.getElementById("esci-link");

esci_link.addEventListener("click", async () => {
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if(authData && authData.id){

        const id = authData.id;
        await fetch(`/logout-api/${id}`, {method: "POST"})
    }
    sessionStorage.removeItem("authData");
    localStorage.removeItem("authData");
})