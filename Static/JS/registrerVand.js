addEventListener("DOMContentLoaded", () => {});

// Funktion til at registrere drukket vand
function registrerDrukketVand() {
    // Henter mængde fra input felt
    let Mængde = document.getElementById("mængde").value;

    // Sender mængde af vand til serveren via api for at registrere vand i databasen
    fetch("/MealTrackerApi/registrerVand", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            // Data der sendes til serveren
            Mængde: Mængde
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Sender bruger tilbage til MealTracker siden
        window.location.href = "/MealTracker";
    })  
}