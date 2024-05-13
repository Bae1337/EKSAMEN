addEventListener("DOMContentLoaded", () => {
    // Kører dropDown funktionen hver gang der skrives i søgefeltet
    document.getElementById('søg').addEventListener('input', function() {
        DropDown(this.value);
    });
});

// Funktion til at hente brugers lokation fra browseren
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

// Funktion til at vise dropdown med forslag til fødevarenavne
function DropDown(indput) {
    // Hvis søgefeltet er tomt, skjules dropdown
    if (indput.length < 1) {
        document.getElementById('Dropdown').style.display = 'none';
        return;
    }
    // Sender en POST request til serveren med søgeværdien
    fetch('/FoodInspectorApi/HentData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ FødevareNavn: indput })
    })
    .then(response => response.json())
    .then(data => {
        // Henter div med id dropdown fra html
        let dropdown = document.getElementById('dropdown');
        dropdown.innerHTML = ""; 
        // Hvis der er data i databasen, vises det i dropdown
        if (data && data.result.length) {
            // lopper igennem arrayet af resultater
            data.result.forEach(item => {
                // Opretter div elementer til dropdown for hvert resultat
                let foreslag = document.createElement('div');
                // Indsætter navn for fødevaren i div'et
                foreslag.textContent = item.FødevareNavn;
                // Tilføjer en eventlistener til hvert forslag
                foreslag.addEventListener('click', function() {
                    // Når der klikkes på et forslag, indsættes værdien i søgefeltet og dropdown skjules
                    document.getElementById('søg').value = this.textContent;
                    dropdown.style.display = 'none';
                });
                // Tilføjer div'et til dropdown
                dropdown.appendChild(foreslag);
            });
            // Viser dropdown
            dropdown.style.display = 'block';
        } else {
            // Hvis der ikke er nogen resultater, skjules dropdown
            dropdown.style.display = 'none';
        }
    })
}

// Funktion til at hente FoodID fra databasen
async function HentIngrediensID(FødevareNavn) {
    try {
        // bruger FoodInspectorApi til at hente FoodID fra databasen
        let response = await fetch('/FoodInspectorApi/HentData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                // Sender FødevareNavn til serveren
                FødevareNavn 
            })
        });
        // 
        let data = await response.json();
        // Hvis FødevareNavn blev fundet i databasen returneres FoodID
        if (data && data.result.length > 0) {
            return data.result[0].FoodID;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Funktion til at registrere en enkelt ingrediens
async function registrerEnkeltIngrediens() {
    try {
        // Henter brugerens lokation fra browseren samt værdierne fra søgefeltet og vægtfeltet
        let { Breddegrad, Længdegrad } = await HentLokation();
        let FødevareNavn = document.getElementById('søg').value;
        let Vægt = document.getElementById('vægt').value;

        // Hvis et af felterne er tomme, vises en alert
        if (FødevareNavn === "" || Vægt === "") {
            alert("Udfyld alle felter");
            return;
        }

        // Henter FoodID fra databasen ved hjælp af FødevareNavn og gemmer det i variablen IngrediensID
        let IngrediensID = await HentIngrediensID(FødevareNavn);
        // Hvis IngrediensID er null, vises en alert
        if (IngrediensID === null) {
            alert("Fødevare ikke fundet");
            return;
        }

        // Sender IngrediensID, Vægt, Breddegrad og Længdegrad til serveren via api
        fetch("/MealTrackerApi/registrerEnkeltIngrediens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Data der sendes til serveren
                IngrediensID: IngrediensID,
                Vægt: Vægt,
                Breddegrad: Breddegrad,
                Længdegrad: Længdegrad
            })
            })
            .then(response => response.json())
            .then(data => {
                // Hvis der lykkes at registrere ingrediensen, sendes brugeren til MealTracker siden
                if (data.message === "Ingrediens registreret") {
                    window.location.href = "/MealTracker";
                }
                else {
                    // Hvis der sker en fejl, vises en alert
                    alert("Der skete en fejl");
                }
            });

    } catch (err) {
        // Hvis der sker en fejl, vises fejlen i konsollen
        console.error(err);
    }
}