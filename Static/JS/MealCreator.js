addEventListener("DOMContentLoaded", () => {
    // kører funktionen opdaterTabel() når siden er loaded
    opdaterTabel();
});

// Funktion til at udregne total kalorier pr. 100g for et måltid
function totalKalorierPrMåltidPr100g(ingredienser) {
    let Vægt = 0;
    let Kalorier = 0;
    let totalKalorier = 0;
    let totalVægt = 0;

    // Går igennem alle ingredienserne i et måltid og udregner total kalorier pr. 100g
    ingredienser.forEach(ingrediens => {
        Vægt = ingrediens.Vægt;
        Kalorier = ingrediens.Energi_kcal;
        totalKalorier += Kalorier / 100 * Vægt;
        totalVægt += Vægt;
    });

    return totalKalorier / totalVægt * 100;
}

// Funktion til at opdatere tabellen med måltider
function opdaterTabel() {
    // Henter tabellen fra HTML
    let table = document.getElementById('mealTable');
    // Sletter alle rækker i tabellen undtagen den første
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // henter alle måltider for en bruger fra databasen
    fetch('/MealCreatorApi/hentMaltidTilMeaclCreator', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        })
    .then(response => response.json())
    .then(data => {
        // Laver et nyt set til at holde styr på hvilke måltider der allerede er blevet tilføjet til tabellen
        let antalMåltider = new Set();

        // Går igennem alle rækker i data
        data.forEach(row => {
            // Hvis måltidet ikke allerede er blevet tilføjet til tabellen tilføjes det
            if(!antalMåltider.has(row.MåltidId)) {
                // Laver et nyt array med de ingredienser der har samme MåltidId som det aktuelle måltid(row.MåltidId)
                let måltidIngredienser = data.filter(item => item.MåltidId === row.MåltidId);
                // Laver en ny række og celler i tabellen
                let nyRække = table.insertRow();
                let IDcelle = nyRække.insertCell();
                let NavnCelle = nyRække.insertCell();
                let TotalKalorierCelle = nyRække.insertCell();
                let AntalIngredienserCelle = nyRække.insertCell();
                let RedigerCelle = nyRække.insertCell();

                // Sætter indholdet i cellerne
                IDcelle.innerHTML = row.MåltidId;
                NavnCelle.innerHTML = row.Navn;
                // Udregner total kalorier pr. 100g for måltidet og sætter det i cellen
                TotalKalorierCelle.innerHTML = totalKalorierPrMåltidPr100g(måltidIngredienser).toFixed(2);
                AntalIngredienserCelle.innerHTML = måltidIngredienser.length;

                // Laver to knapper i RedigerCelle, en til at slette måltidet og en til at vise ingredienserne
                let SletButton = document.createElement("button");
                let visIngredienserButton = document.createElement("button");
                SletButton.textContent = "Slet";
                visIngredienserButton.textContent = "Vis ingredienser";
                
                // Tilføjer klassen button til knapperne og tilføjer eventlisteners til knapperne
                SletButton.classList.add("button");
                visIngredienserButton.classList.add("button");
                SletButton.addEventListener("click", function() {
                    // Sletter måltidet fra databasen funktion
                    sletMåltid(row.MåltidId);
                });
                visIngredienserButton.addEventListener("click", function() {
                    // Viser ingredienserne for måltidet funktion
                    visIngredienser(måltidIngredienser);
                });
                // Tilføjer knapperne til cellen
                RedigerCelle.appendChild(visIngredienserButton);
                RedigerCelle.appendChild(SletButton);

                // Tilføjer MåltidId til set'et så det ikke bliver tilføjet igen
                antalMåltider.add(row.MåltidId);
            }
        });
    });
}

// Funktion til at vise ingredienserne for et måltid
function visIngredienser(måltid) {
    // Viser popup vinduet
    let pop = document.getElementById("popup");
    pop.style.display = "block";

    // Henter tabellen fra HTML
    let table = document.getElementById("infTable");
    // Sletter alle rækker i tabellen undtagen den første
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // laver variabler til at holde styr på de samlede værdier
    let samletVægt = 0;
    let samletEnergi = 0;
    let samletProtein = 0;
    let samletFedt = 0;
    let samletKostFibre = 0;

    // Går igennem alle ingredienserne og tilføjer dem til tabellen
    måltid.forEach(ingrediens => {
        // Laver en ny række og celler i tabellen
        let newRow = table.insertRow();
        let navnCelle = newRow.insertCell();
        let vægtCelle = newRow.insertCell();
        let energiCelle = newRow.insertCell();
        let proteinCelle = newRow.insertCell();
        let fedtCelle = newRow.insertCell();
        let fibreCelle = newRow.insertCell();

        // Udregner næringsindholdet for ingredienserne
        let energiCellVærdi = ingrediens.Energi_kcal / 100 * ingrediens.Vægt;
        let proteinCellVærdi = ingrediens.Protein / 100 * ingrediens.Vægt;
        let fedtCellVærdi = ingrediens.Fedt / 100 * ingrediens.Vægt;
        let fibreCellVærdi = ingrediens.Kostfibre / 100 * ingrediens.Vægt;

        // Tilføjer værdierne til de samlede værdier
        samletVægt += parseFloat(ingrediens.Vægt);
        samletEnergi += energiCellVærdi;
        samletProtein += proteinCellVærdi;
        samletFedt += fedtCellVærdi;
        samletKostFibre += fibreCellVærdi;

        // Sætter indholdet i cellerne
        navnCelle.innerHTML = ingrediens.FødevareNavn;
        vægtCelle.innerHTML = ingrediens.Vægt;
        energiCelle.innerHTML = energiCellVærdi.toFixed(2);
        proteinCelle.innerHTML = proteinCellVærdi.toFixed(2);
        fedtCelle.innerHTML = fedtCellVærdi.toFixed(2);
        fibreCelle.innerHTML = fibreCellVærdi.toFixed(2);
    });

    // Laver en ny række i tabellen med de samlede værdier
    let newRow = table.insertRow();
    let navnCelle = newRow.insertCell();
    let vægtCelle = newRow.insertCell();
    let energiCelle = newRow.insertCell();
    let proteinCelle = newRow.insertCell();
    let fedtCelle = newRow.insertCell();
    let fibreCelle = newRow.insertCell();

    navnCelle.innerHTML = "Samlet";
    vægtCelle.innerHTML = samletVægt;
    energiCelle.innerHTML = samletEnergi.toFixed(2);
    proteinCelle.innerHTML = samletProtein.toFixed(2);
    fedtCelle.innerHTML = samletFedt.toFixed(2);
    fibreCelle.innerHTML = samletKostFibre.toFixed(2);
}

// Funktion til at slette et måltid
function sletMåltid(MåltidId) {
    // Sletter måltidet fra databasen
    fetch('/MealCreatorApi/sletMaltid', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            MåltidId: MåltidId 
        })
        })
    .then(response => response.json())
    .then(data => {
        // Opdaterer tabellen efter måltidet er blevet slettet
        opdaterTabel();
    });
}

// Funktion til at lukke popup vinduet med ingredienserne
function lukPopup() {
    let pop = document.getElementById("popup");
    pop.style.display = "none";
}

// Funktion til at skifte side til TilføjMåltid
function skiftSideTilTilføjMåltid() {
    window.location.href = "/TilfojMaltid";
}

// Funktion til at skifte side til FoodInspector
function skiftSideTilFoodInspector() {
    window.location.href = "/FoodInspector";
}