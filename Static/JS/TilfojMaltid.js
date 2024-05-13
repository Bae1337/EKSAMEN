document.addEventListener("DOMContentLoaded", () => {
    // Funktion til at søge efter fødevare
    document.getElementById('søg').addEventListener('input', function() {
        DropDown(this.value);
    });
});

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

// opretter et tomt array til ingredienser
let ingredienser = [];

// Funktion til at slette en ingrediens fra både en HTML-tabel og arrayet
function SletIngrediens(ingrediens) {
    // Bruger closest() til at finde den nærmeste tabelrække (tr)
    let række = ingrediens.closest('tr');

    // Henter rækkeindekset for den pågældende række i tabellen
    let rækkeIndex = række.rowIndex;

    // Bruger rækkeindekset til at slette rækken fra HTML-tabellen med id 'ingTable'
    document.getElementById('ingTable').deleteRow(rækkeIndex);

    // Bruger rækkeindekset - 1 til at slette ingrediensen fra arrayet
    // Trækker 1 fra fordi arrayets index starter ved 0
    ingredienser.splice(rækkeIndex - 1, 1);
}

// Funktion til at tilføje ingredienser til array og HTML-tabel
function TilføjIngredienserTilArray() {
    // Henter værdierne fra inputfelterne samt tabellen
    let FødevareNavn = document.getElementById('søg').value;
    let Vægt = document.getElementById('vægt').value;
    let table = document.getElementById('ingTable');

    // Hvis et af inputfelterne er tomme, vises en alert
    if(FødevareNavn === "" || Vægt === "") {
        alert("Udfyld begge både FødevareNavn og Vægt");
        return;
    }

    // Bruger FoodInspectorApi til at hente ingrediens fra databasen
    fetch('/FoodInspectorApi/HentData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // Data der sendes til serveren
            FødevareNavn: FødevareNavn
        })
        })
        .then(response => response.json())
        .then(data => {
            // Hvis der er resultater i databasen, tilføjes ingrediensen til arrayet
            if(data.result.length > 0) {
                // Opretter et objekt med FoodID og Vægt
                let ingrediens = {
                    FoodID: data.result[0].FoodID,
                    Vægt: Vægt
                }
                // Tilføjer objektet til arrayet
                ingredienser.push(ingrediens);
                
                // Opretter en tabelrække og celler til tabellen
                let række = table.insertRow();
                let navnCelle = række.insertCell(0);
                let vægtCelle = række.insertCell(1);
                let sletCelle = række.insertCell(2);

                // Indsætter værdierne i cellerne
                navnCelle.innerHTML = data.result[0].FødevareNavn;
                vægtCelle.innerHTML = Vægt;

                // Opretter en sletknap og tilføjer en eventlistener til den som kalder SletIngrediens funktionen
                let sletKnap = document.createElement('button');
                sletKnap.textContent = 'Slet';

                sletKnap.addEventListener('click', function() {
                    SletIngrediens(this);
                });

                // Tilføjer sletknap til sletcellen
                sletCelle.appendChild(sletKnap);
            }
    });

    // Nulstiller inputfelterne
    document.getElementById('søg').value = "";
    document.getElementById('vægt').value = "";
}


// Funktion til at tilføje måltid til databasen
function TilføjMåltid() {
    // Henter navnet på måltidet
    let Navn = document.getElementById('navn').value;

    // Hvis navnet er tomt, vises en alert
    if(Navn === "") {
        alert("Udfyld navn");
        return;
    }

    // Sender Navn og ingredienser til serveren via api for at tilføje måltid til databasen
    fetch('/MealCreatorApi/tilfojMaltid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // Data der sendes til serveren (Navn og ingredienser arrayet)
            Navn: Navn,
            Ingredienser: ingredienser
        })
        })
        .then(response => response.json())
        .then(data => {
            // Hvis måltidet er tilføjet, sendes brugeren tilbage til MealCreator siden
            if(data.message === "Måltid tilføjet") {
                window.location.href = "/MealCreator";
            }
        })
}