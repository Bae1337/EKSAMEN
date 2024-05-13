addEventListener("DOMContentLoaded", () => {
    // Hver gang der skrives i søgefeltet, kaldes DropDown funktionen
    document.getElementById('søg').addEventListener('input', function() {
        DropDown(this.value);
    });
});

// Funktion til at hente ingrediens data fra databasen
function HentMadData() {
    // Henter værdien fra søgefeltet
    let FødevareNavn = document.getElementById('søg').value;

    // Sender en POST request til serveren med FødevareNavn
    fetch('/FoodInspectorApi/HentData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            FødevareNavn: FødevareNavn
        })
        })
        .then(response => response.json())
        .then(data => {
            // Hvis der er data i databasen, vises det i HTML
            if(data.result.length > 0) {
                // indsætter data i HTML
                document.getElementById('overskrift').innerHTML = data.result[0].FødevareNavn;
                document.getElementById('produktid').innerHTML = "Mad id: " + data.result[0].FoodID;
                document.getElementById('taxa').innerHTML = "Taxanomisk navn: " + data.result[0].TaxonomicName;
                document.getElementById('fødevaregruppe').innerHTML = "Fødevare Gruppe: " + data.result[0].FoodGroupID;

                document.getElementById('energiKj').innerHTML = "Energi(kJ): " + data.result[0].Energi_kJ.toFixed(2);
                document.getElementById('energiKcal').innerHTML = "Energi(kcal): " + data.result[0].Energi_kcal.toFixed(2);
                document.getElementById('protein').innerHTML = "Protein(g): " + data.result[0].Protein.toFixed(2);
                document.getElementById('kostfibre').innerHTML = "Kostfibre(g): " + data.result[0].Kostfibre.toFixed(2);
                document.getElementById('fedt').innerHTML = "Fedt(g): " + data.result[0].Fedt.toFixed(2);
                document.getElementById('kulhydrat').innerHTML = "Kulhydrat(g): " + data.result[0].Kulhydrat.toFixed(2);
                document.getElementById('vand').innerHTML = "Vand(g): " + data.result[0].Vand.toFixed(2);
                document.getElementById('tørstof').innerHTML = "Tørstof(g): " + data.result[0].Tørstof.toFixed(2);
            } else {
                document.getElementById('overskrift').innerHTML = "Fødevare ikke fundet";
            }
        })
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
                    // Kaldes HentMadData funktionen
                    HentMadData();
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