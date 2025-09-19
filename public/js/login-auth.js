async function validateAuthCode() {
    const authDataRaw = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;

    if (authData && authData.authCode && authData.id) {
        const response = await fetch("/valida-authCode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(authData)
        });
        if(response.ok)
            window.location.href = "/dashboard/conto";
    }
}


