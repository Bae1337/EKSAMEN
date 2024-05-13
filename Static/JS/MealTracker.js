addEventListener("DOMContentLoaded", () => {
    // kører funktionerne IndsætMåltidIMealTracker() og IndsætMåltidISelector() når siden er loaded
    IndsætMåltidIMealTracker();
    IndsætMåltidISelector();
    // Sætter en eventlistener på input feltet med id "søg" som kører funktionen DropDown() når der skrives i feltet
    document.getElementById('søg').addEventListener('input', function() {
        DropDown(this.value);
    });
});

// Funktion til at konvertere dato til string
function dato(datoString) {
    // Laver en ny dato ud fra datoString
    let dato = new Date(datoString);
    // Henter dag, måned og år fra datoen
    let år = dato.getFullYear();
    let måned = dato.getMonth() + 1
    let dag = dato.getDate()
    // Henter timer og minutter fra datoen
    let timer = dato.getHours();
    let minutter = dato.getMinutes();
    // Hvis minutter er mindre end 10 tilføjes et 0 foran
    if (minutter < 10) {
        minutter = "0" + minutter;
    }
    
    // Returnerer datoen som en string i formatet "dag-måned-år timer:minutter"
    return dag + "-" + måned + "-" + år + " " + timer + ":" + minutter;
}

// Variabel til at holde styr på hvilket måltid der skal redigeres
let RegistreretID = 0;

// Funktion til at udregne næringsindhold for et måltid
function NæringsIndholdUdregning(ingredienser) {
    // Variabler til at holde styr på energi, protein, fedt, kostfibre og totalvægt
    let Energi = 0;
    let Protein = 0;
    let Fedt = 0;
    let Kostfibre = 0;
    let TotalVægt = 0;

    // Looper igennem alle ingredienser i måltidet og udregner næringsindholdet
    ingredienser.forEach(ingrediens => {
        Energi += ingrediens.Energi_kcal / 100 * ingrediens.IngrediensVægt;
        Protein += ingrediens.Protein / 100 * ingrediens.IngrediensVægt;
        Fedt += ingrediens.Fedt / 100 * ingrediens.IngrediensVægt;
        Kostfibre += ingrediens.Kostfibre / 100 * ingrediens.IngrediensVægt;
        TotalVægt += ingrediens.IngrediensVægt;
    });
    
    // Udregner næringsindholdet for hele måltidet
    let totalEnergi = Energi / TotalVægt * ingredienser[0].RegistreretVægt;
    let totalProtein = Protein / TotalVægt * ingredienser[0].RegistreretVægt;
    let totalFedt = Fedt / TotalVægt * ingredienser[0].RegistreretVægt;
    let totalKostfibre = Kostfibre / TotalVægt * ingredienser[0].RegistreretVægt;

    // Returnerer næringsindholdet for hele måltidet
    return {totalEnergi, totalProtein, totalFedt, totalKostfibre};
}

// Funktion til at indsætte måltider i mealtracker tabellen
function IndsætMåltidIMealTracker() {
    // Henter tabellen med id "MealTrackerTable"
    let table = document.getElementById("MealTrackerTable");
    // Sletter alle rækker i tabellen undtagen den første
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Henter alle registrerede måltider for en bruger fra databasen
    fetch("/MealTrackerApi/hentRegistreredeMaltiderTilMealTracker", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then(response => response.json())
    .then(data => {
        // Laver et nyt set til at holde styr på hvilke registreringer der allerede er blevet tilføjet til tabellen
        let antalRegistreret = new Set();
        // Går igennem alle rækker i data
        data.forEach(row => {
            // Hvis registreringen ikke allerede er blevet tilføjet til tabellen tilføjes den
            if(!antalRegistreret.has(row.RegistreretID)) {
                // Hvis MåltidNavn er null, betyder det at det er en registrering af en enkelt ingrediens og ikke et måltid
                if (row.MåltidNavn === null) {
                    // Sætter MåltidNavn til IngrediensNavn og de andre værdier til Ingrediensens værdier
                    row.MåltidNavn = row.IngrediensNavn;
                    row.IngrediensVægt = row.RegistreretVægt;
                    row.Energi_kcal = row.IngrediensEnergi_kcal;
                    row.Protein = row.IngrediensProtein;
                    row.Fedt = row.IngrediensFedt;
                    row.Kostfibre = row.IngrediensKostfibre;
                }

                // Laver et nyt array med de registrerede måltider der har samme RegistreretID som det aktuelle måltid(row.RegistreretID)
                let registreretMåltider = data.filter(item => item.RegistreretID === row.RegistreretID);

                // Laver en ny række og celler i tabellen
                let nyRække = table.insertRow();
                let måltidNavnCelle = nyRække.insertCell();
                let datoCelle = nyRække.insertCell();
                let vægtCelle = nyRække.insertCell();
                let næringsindholdCelle = nyRække.insertCell();
                let lokationCelle = nyRække.insertCell();
                let knapperCelle = nyRække.insertCell();

                // Laver en variabel til at holde næringsindholdet for måltidet
                let NæringsIndhold = NæringsIndholdUdregning(registreretMåltider);

                // Laver 4 divs til at holde næringsindholdet for måltidet
                let energi = document.createElement("div");
                let protein = document.createElement("div");
                let fedt = document.createElement("div");
                let kostfibre = document.createElement("div");

                // Sætter indholdet i divs til næringsindholdet for måltidet
                energi.textContent = "Kcal: " + NæringsIndhold.totalEnergi.toFixed() + " g";
                protein.textContent = "Protein: " + NæringsIndhold.totalProtein.toFixed() + " g";
                fedt.textContent = "Fedt: " + NæringsIndhold.totalFedt.toFixed() + " g";
                kostfibre.textContent = "Kostfibre: " + NæringsIndhold.totalKostfibre.toFixed() + " g";

                // Sætter farver på divs
                energi.id = "blue";
                protein.id = "orange";
                fedt.id = "lys";
                kostfibre.id = "rød";

                // Laver to knapper til at redigere og slette registreringen
                let SletButton = document.createElement("button");
                let RedigerButton = document.createElement("button");
                SletButton.textContent = "Slet";
                RedigerButton.textContent = "Rediger";
                
                // Sætter klasser på knapperne og tilføjer eventlisteners til dem
                SletButton.classList.add("button");
                RedigerButton.classList.add("button");
                SletButton.addEventListener("click", function() {
                    // Sletter registreringen fra databasen funktion
                    sletRegistrering(row.RegistreretID);
                });
                RedigerButton.addEventListener("click", function() {
                    // Hvis IngrediensNavn er null, betyder det at det er en registrering af et måltid og ikke en enkelt ingrediens
                    if (row.IngrediensNavn === null) {
                        // Sætter RegistreretID variablen til RegistreretID for det aktuelle måltid
                        RegistreretID = row.RegistreretID;
                        // Viser popup vinduet
                        let popup = document.getElementById("popup");
                        popup.style.display = "block";
                    } else {
                        // Sætter RegistreretID variablen til RegistreretID for det aktuelle måltid
                        RegistreretID = row.RegistreretID;
                        // Viser popup vinduet for redigering af et enkelt ingrediens
                        let popup = document.getElementById("popupIngrediens");
                        popup.style.display = "block";
                    }
                });
                
                // Sætter indholdet i cellerne
                måltidNavnCelle.innerHTML = row.MåltidNavn;
                datoCelle.innerHTML = dato(row.Dato);
                vægtCelle.innerHTML = row.RegistreretVægt + " g";

                // Tilføjer næringsindhold divs til næringsindhold cellen
                næringsindholdCelle.appendChild(energi);
                næringsindholdCelle.appendChild(protein);
                næringsindholdCelle.appendChild(fedt);
                næringsindholdCelle.appendChild(kostfibre);

                // Sætter lokationen i lokation cellen
                lokationCelle.innerHTML = "Længdegrad: " + row.Længdegrad + "<br> Breddegrad: " + row.Breddegrad;

                // Tilføjer knapperne til knapper cellen
                knapperCelle.appendChild(RedigerButton);
                knapperCelle.appendChild(SletButton);

                // Tilføjer RegistreretID til set'et så det ikke bliver tilføjet igen
                antalRegistreret.add(row.RegistreretID);
            }
        });
    });
}

// Funktion til at slette registreringen af et måltid
function sletRegistrering(RegistreretID) {
    // Sletter registreringen fra databasen
    fetch("/MealTrackerApi/sletRegistrering", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Sender RegistreretID til serveren
            RegistreretID: RegistreretID
         })
    })
    .then(response => response.json())
    .then(data => {
        // Opdaterer tabellen med registreringer
        IndsætMåltidIMealTracker()
    });
}

// Funktion til at skifte side til registrering af måltid
function skiftSideTilRegistrerMåltid() {
    window.location.href = "/registrerMaltid";
}

// Funktion til at skifte side til registrering af enkelt ingrediens
function skiftSideTilRegistrerEnkeltIngrediens() {
    window.location.href = "/registrerEnkeltIngrediens";
}

// Funktion til at skifte side til registrering af vand
function skiftSideTilRegistrerVand() {
    window.location.href = "/registrerVand";
}

// Funktion til at insætte måltider i selector
function IndsætMåltidISelector() {
    // Henter selector med id "måltidSelector"
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
            // Laver et nyt set til at holde styr på hvilke måltider der allerede er blevet tilføjet til selector
            let antalMåltider = new Set();
            // Går igennem alle rækker i data
            data.forEach(måltid => {
                // Hvis måltidet ikke allerede er blevet tilføjet til selector tilføjes det
                if (!antalMåltider.has(måltid.MåltidId)) {
                    // Laver en ny option til selector
                    let option = document.createElement("option");
                    // Sætter værdien og teksten på option
                    option.value = måltid.MåltidId;
                    option.text = måltid.Navn;

                    // Tilføjer option til selector og MåltidId til set'et så det ikke bliver tilføjet igen
                    måltidSelector.add(option);
                    antalMåltider.add(måltid.MåltidId);
                }
            });
        });
}

// Funktion til at redigere registrering af måltid
function RedigerRegistreringAfMåltid() {
    // Henter værdier fra input felterne
    let måltidSelector = document.getElementById("måltidSelector");
    let vægt = document.getElementById("vægt").value;

    // Hvis et af felterne er tomme vises en alert
    if (måltidSelector.value === "" || vægt === "") {
        alert("Udfyld alle felter");
        return;
    }

    // Redigerer registreringen af måltidet i databasen
    fetch("/MealTrackerApi/redigerRegistering", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Sender RegistreretID, MåltidId og Vægt til serveren
            RegistreretID: RegistreretID,
            MåltidId: måltidSelector.value,
            Vægt: vægt
        })
    })
        .then(response => response.json())
        .then(data => {
            // Opdaterer tabellen med registreringer og lukker popup vinduet
            IndsætMåltidIMealTracker();
            lukPopup();
        });
}

// Funktion til at vise dropdown med forslag til søgefeltet
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

// Funktion til at redigere registrering af enkelt ingrediens
// Funktionen bliver nødt til at være async fordi den kalder HentIngrediensID som også fetcher data fra serveren.
async function RedigerRegisteringAfInkeltIngrediens() {
    try {
        // Henter værdier fra input felterne
        let Vægt = document.getElementById("vægtIngrediens").value;
        let IngrediensNavn = document.getElementById("søg").value;
    
        // Hvis et af felterne er tomme vises en alert
        if (IngrediensNavn === "" || Vægt === "") {
            alert("Udfyld alle felter");
            return;
        }
        // Henter IngrediensID fra databasen ved at kalde HentIngrediensID funktionen
        let IngrediensID = await HentIngrediensID(IngrediensNavn);
        // Hvis IngrediensID er null, betyder det at fødevaren ikke blev fundet i databasen
        if (IngrediensID === null) {
            alert("Fødevare ikke fundet");
            return;
        }
        
        // Redigerer registreringen af enkelt ingrediens i databasen ved at bruge MealTrackerApi
        fetch("/MealTrackerApi/redigerEnkeltIngrediens", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Sender RegistreretID, IngrediensID og Vægt til serveren
                RegistreretID: RegistreretID,
                IngrediensID: IngrediensID,
                Vægt: Vægt
            })
        })
            .then(response => response.json())
            .then(data => {
                // Opdaterer tabellen med registreringer og lukker popup vinduet
                IndsætMåltidIMealTracker();
                lukPopupIngrediens();
            });
    } catch (err) {
        console.error(err);
    }
}

// Funktion til at lukke popup vinduet
function lukPopup() {
    let pop = document.getElementById("popup");
    pop.style.display = "none";
}

// Funktion til at lukke popup vinduet
function lukPopupIngrediens() {
    let pop = document.getElementById("popupIngrediens");
    pop.style.display = "none";
}