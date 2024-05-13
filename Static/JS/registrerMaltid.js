addEventListener("DOMContentLoaded", function () {
    // indsætter måltider i selector når siden er loadet
    IndsætMåltidISelector();
});

function HentLokation() {
    // Laver et promise objekt til at hente brugerens lokation fra browseren og returnerer det
    let position = new Promise((resolve, reject) => {
        // Bruger funktionen getCurrentPosition fra geolocation til at hente brugerens lokation
        navigator.geolocation.getCurrentPosition(position => {
            // Lavet et objekt med brugerens koordinater
            let koordinater = {
                Breddegrad: position.coords.latitude,
                Længdegrad: position.coords.longitude
            };
            // Returnerer koordinaterne hvis det lykkedes at hente dem
            resolve(koordinater);
        }, error => {
            // Returnerer fejlbesked hvis det ikke lykkedes at hente koordinaterne
            reject(error);
        });
    });
    // Returnerer promise objektet med koordinaterne
    return position;
}

// Funktion til at indsætte måltider i selector
function IndsætMåltidISelector() {
    // Henter måltid selector fra html
    let måltidSelector = document.getElementById("måltidSelector");
    // bruger MealCreatorApi til at hente måltider der er lavet registrereret af brugeren
    fetch("/MealCreatorApi/hentMaltidTilMeaclCreator", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        })
        .then(response => response.json())
        .then(data => {
            // Opretter et set til at holde styr på antal måltider
            let antalMåltider = new Set();
            // Looper igennem data og indsætter måltider i selector
            data.forEach(måltid => {
                // Hvis måltidet ikke allerede er i selector, indsættes det
                if (!antalMåltider.has(måltid.MåltidId)) {
                    // Opretter et option element til hvert måltid
                    let option = document.createElement("option");
                    // Sætter værdi og tekst til option elementet
                    option.value = måltid.MåltidId;
                    option.text = måltid.Navn;

                    // Tilføjer option element til selector
                    måltidSelector.add(option);
                    antalMåltider.add(måltid.MåltidId);
                }
            });
        });
}

// Funktion til at registrere måltid
async function registrerMåltid() {
    try {
        // Henter brugerens lokation fra browseren samt værdier fra input felter
        let { Breddegrad, Længdegrad } = await HentLokation();
        let måltidSelector = document.getElementById("måltidSelector");
        let vægt = document.getElementById("vægt").value;
        
        // Hvis et af felterne er tomme, vises en alert
        if (måltidSelector.value === "" || vægt === "") {
            alert("Udfyld alle felter");
            return;
        }

        // sender MåltidId, vægt, længdegrad og breddegrad til serveren via api for at registrere måltid i databasen
        fetch("/MealTrackerApi/registrerMaltid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Data der sendes til serveren
                MåltidId: måltidSelector.value,
                Vægt: vægt,
                Længdegrad: Længdegrad,
                Breddegrad: Breddegrad
            })
            })
            .then(response => response.json())
            .then(data => {
                // Hvis måltidet blev registreret, sendes brugeren tilbage til MealTracker siden
                if (data.message === "Måltid registreret") {
                    window.location.href = "/MealTracker";
                }
                else {
                    // Hvis der skete en fejl, vises en alert
                    alert("Der skete en fejl");
                }
            });
    } catch (error) {
        return;
    }
}