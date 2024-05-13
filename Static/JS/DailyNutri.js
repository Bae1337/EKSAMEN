addEventListener("DOMContentLoaded", () => {
    // Hent data fra de sidste 24 timer og viser dem i tabellen
    hentDagligNutri24Timer();

    // Eventlistener til at skifte mellem visning af data fra de sidste 24 timer og den sidste måned
    document.getElementById("visningSelector").addEventListener("change", () => {
        let visning = document.getElementById("visningSelector").value;
        if (visning == 1) {
            hentDagligNutri24Timer();
        } else if (visning == 2) {
            hentDagligNutri1Måned();
        }
    });
});

// Funktion til at hente data fra de sidste 24 timer og vise dem i tabellen
function hentDagligNutri24Timer() {
    // Henter tabellen fra HTML
    let table = document.getElementById("DailyNutriTable");

    // Fetch data fra databasen via API'en og viser dem i tabellen
    fetch("/DailyNutriApi/hentDagligNutri", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then(response => response.json())
    .then(data => {
        // Sletter alle rækker i tabellen undtagen overskriften
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
    
        // Opretter variable som indeholder dato for nu og for 24 timer siden
        let nu = new Date();
        let sidste24Timer = new Date(nu.getTime() - 24 * 60 * 60 * 1000);
        // opretter tomt array til data for hver time
        let dataPrTime = [];

        // Opretter et objekt for hver time i de sidste 24 timer
        for (let time = 0; time < 24; time++) {  
            // Opretter et nyt tidspunkt for hver time i de sidste 24 timer
            let startTime = new Date(nu.getTime() - time * 60 * 60 * 1000);
            // Tilføjer objektet til arrayet som indeholder timen, kalorier indtaget, vand drukket og kalorier forbrændt for den time startene på 0
            dataPrTime.push({
                time: startTime,
                KcalIndtaget: 0,
                DrukketVand: 0,
                Forbrændt: 0
            });
        }

        // Looper igennem alle aktiviteterne og tilføjer kalorier forbrændt til arrayet for den time aktiviteten er foretaget
        data.recordset.resultAktivitet.forEach(aktivitet => {
            // Opretter en variabel med tidspunktet for aktiviteten
            let tidspunkt = new Date(aktivitet.AktivitetDato);
            // Hvis aktiviteten er foretaget inden for de sidste 24 timer tilføjes kalorierne forbrændt til arrayet for den time aktiviteten er foretaget
            if (tidspunkt >= sidste24Timer && tidspunkt <= nu) {
                // Finder indexet for den time aktiviteten er foretaget i arrayet ved at sammenligne tidspunktet for aktiviteten med tidspunktet for hver time i arrayet
                let IndexPåArray = dataPrTime.findIndex(array => 
                    // sammenligner timer, dato, måned og år for aktiviteten og tiden i arrayet
                    array.time.getHours() === tidspunkt.getHours() &&
                    array.time.getDate() === tidspunkt.getDate() &&
                    array.time.getMonth() === tidspunkt.getMonth() &&
                    array.time.getFullYear() === tidspunkt.getFullYear());
                // Hvis aktiviteten tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes kalorierne forbrændt til arrayet for den time aktiviteten er foretaget
                if (IndexPåArray !== -1) {
                    dataPrTime[IndexPåArray].Forbrændt += aktivitet.Forbrændt;
                }
            }
        });

        // Looper igennem alle registreret måltider og tilføjer kalorier indtaget til arrayet for den time måltidet er foretaget
        data.recordset.resultRegistreretMåltider.forEach(måltid => {
            // Opretter en variabel med tidspunktet for hvornår måltidet er indtaget
            let tidspunkt = new Date(måltid.MåltidDato);
            // Hvis måltidet er indtaget inden for de sidste 24 timer tilføjes kalorierne indtaget til arrayet for den time måltidet er indtaget
            if (tidspunkt >= sidste24Timer) {
                // Finder indexet for den time måltidet er indtaget i arrayet ved at sammenligne tidspunktet for registreret måltid med tidspunktet for hver time i arrayet
                let IndexPåArray = dataPrTime.findIndex(array => 
                    // sammenligner timer, dato, måned og år for registreret måltid og tiden i arrayet
                    array.time.getHours() === tidspunkt.getHours() &&
                    array.time.getDate() === tidspunkt.getDate() &&
                    array.time.getMonth() === tidspunkt.getMonth() &&
                    array.time.getFullYear() === tidspunkt.getFullYear());
                // Hvis måltidets tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes kalorierne indtaget til arrayet for den time måltidet er indtaget
                if (IndexPåArray !== -1) {
                    dataPrTime[IndexPåArray].KcalIndtaget += måltid.Energi_kcal;
                }
            }
        });

        // Looper igennem alle registreret vand og tilføjer mængden af vand drukket til arrayet for den time vandet er drukket
        data.recordset.resultVand.forEach(vand => {
            // Opretter en variabel med tidspunktet for hvornår vandet er drukket
            let tidspunkt = new Date(vand.VandDato);
            // Hvis vandet er drukket inden for de sidste 24 timer tilføjes mængden af vand drukket til arrayet for den time vandet er drukket
            if (tidspunkt >= sidste24Timer && tidspunkt <= nu) {
                // Finder indexet for den time vandet er drukket i arrayet ved at sammenligne tidspunktet for drukket vand med tidspunktet for hver time i arrayet
                let IndexPåArray = dataPrTime.findIndex(array => 
                    // sammenligner timer, dato, måned og år for drukket vand og tiden i arrayet
                    array.time.getHours() === tidspunkt.getHours() &&
                    array.time.getDate() === tidspunkt.getDate() &&
                    array.time.getMonth() === tidspunkt.getMonth() &&
                    array.time.getFullYear() === tidspunkt.getFullYear());
                // Hvis vandets tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes mængden af vand drukket til arrayet for den time vandet er drukket
                if (IndexPåArray !== -1) {
                    dataPrTime[IndexPåArray].DrukketVand += vand.Mængde;
                }
            }
        });

        // Opretter en række i tabellen for hver time i arrayet og indsætter dataen i cellerne
        dataPrTime.forEach(dataTilRække => {
            // Opretter en række i tabellen
            let række = table.insertRow();
            // Tilføjer BMR for hver time til forbrændte kalorier
            dataTilRække.Forbrændt += data.BMRIKcal / 24;
            // indsætter dataen for hver time i cellerne i rækken
            række.insertCell().textContent = dataTilRække.time.getHours() + ":00";
            række.insertCell().textContent = dataTilRække.KcalIndtaget.toFixed();
            række.insertCell().textContent = dataTilRække.DrukketVand.toFixed();
            række.insertCell().textContent = dataTilRække.Forbrændt.toFixed();
            række.insertCell().textContent = (dataTilRække.KcalIndtaget - dataTilRække.Forbrændt).toFixed();
        });
    })
}


// Funktion til at hente data fra den sidste måned og vise dem i tabellen
function hentDagligNutri1Måned() {
    // Henter tabellen fra HTML
    let table = document.getElementById("DailyNutriTable");

    // Fetch data fra databasen via API'en og viser dem i tabellen
    fetch("/DailyNutriApi/hentDagligNutri", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then(response => response.json())
    .then(data => {
        // Sletter alle rækker i tabellen undtagen overskriften
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        // Opretter variable som indeholder dato for nu og for en måned siden
        let nu = new Date();
        let sidsteMåned = new Date(nu.getFullYear(), nu.getMonth() - 1, nu.getDate());

        // opretter tomt array til data for hver dag
        let dataPrDag = [];
    
        // Opretter et objekt for hver dag i den sidste måned
        for (let dag = 0; dag < 31; dag++) {  
            // Opretter en variabel med dato for i dag
            let startDag = new Date(nu);
            // Trækker antal dage fra i dag for at finde dato for en dag i den sidste måned
            startDag.setDate(startDag.getDate() - dag);

            // Tilføjer objektet til arrayet som indeholder datoen, kalorier indtaget, vand drukket og kalorier forbrændt for den dag startene på 0
            dataPrDag.push({
                dag: startDag,
                KcalIndtaget: 0,
                DrukketVand: 0,
                Forbrændt: 0
            });
        }

        // Looper igennem alle aktiviteterne og tilføjer kalorier forbrændt til arrayet for den dag aktiviteten er foretaget
        data.recordset.resultAktivitet.forEach(aktivitet => {
            // Opretter en variabel med tidspunktet for aktiviteten
            let tidspunkt = new Date(aktivitet.AktivitetDato);
            // Hvis aktiviteten er foretaget inden for den sidste måned tilføjes kalorierne forbrændt til arrayet for den dag aktiviteten er foretaget
            if (tidspunkt >= sidsteMåned) {
                // Finder indexet for den dag aktiviteten er foretaget i arrayet ved at sammenligne tidspunktet for aktiviteten med tidspunktet for hver dag i arrayet
                let IndexPåArray = dataPrDag.findIndex(array => 
                    // sammenligner dato, måned og år for aktiviteten og dagen i arrayet
                    array.dag.getDate() === tidspunkt.getDate() &&
                    array.dag.getMonth() === tidspunkt.getMonth() &&
                    array.dag.getFullYear() === tidspunkt.getFullYear());
                // Hvis aktivitetens tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes kalorierne forbrændt til arrayet for den dag aktiviteten er foretaget
                if (IndexPåArray !== -1) {
                    dataPrDag[IndexPåArray].Forbrændt += aktivitet.Forbrændt;
                }
            }
        });
    
        // Looper igennem alle registreret måltider og tilføjer kalorier indtaget til arrayet for den dag måltidet er foretaget
        data.recordset.resultRegistreretMåltider.forEach(måltid => {
            // Opretter en variabel med tidspunktet for hvornår måltidet er indtaget
            let tidspunkt = new Date(måltid.MåltidDato);
            // Hvis måltidet er indtaget inden for den sidste måned tilføjes kalorierne indtaget til arrayet for den dag måltidet er indtaget
            if (tidspunkt >= sidsteMåned) {
                // Finder indexet for den dag måltidet er indtaget i arrayet ved at sammenligne tidspunktet for registreret måltid med tidspunktet for hver dag i arrayet
                let IndexPåArray = dataPrDag.findIndex(array => 
                    // sammenligner dato, måned og år for registreret måltid og dagen i arrayet
                    array.dag.getDate() === tidspunkt.getDate() &&
                    array.dag.getMonth() === tidspunkt.getMonth() &&
                    array.dag.getFullYear() === tidspunkt.getFullYear());
                // Hvis måltidets tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes kalorierne indtaget til arrayet for den dag måltidet er indtaget
                if (IndexPåArray !== -1) {
                    dataPrDag[IndexPåArray].KcalIndtaget += måltid.Energi_kcal;
                }
            }
        });
    
        // Looper igennem alle registreret vand og tilføjer mængden af vand drukket til arrayet for den dag vandet er drukket
        data.recordset.resultVand.forEach(vand => {
            // Opretter en variabel med tidspunktet for hvornår vandet er drukket
            let tidspunkt = new Date(vand.VandDato);
            // Hvis vandet er drukket inden for den sidste måned tilføjes mængden af vand drukket til arrayet for den dag vandet er drukket
            if (tidspunkt >= sidsteMåned) {
                // Finder indexet for den dag vandet er drukket i arrayet ved at sammenligne tidspunktet for drukket vand med tidspunktet for hver dag i arrayet
                let IndexPåArray = dataPrDag.findIndex(array => 
                    // sammenligner dato, måned og år for drukket vand og dagen i arrayet
                    array.dag.getDate() === tidspunkt.getDate() &&
                    array.dag.getMonth() === tidspunkt.getMonth() &&
                    array.dag.getFullYear() === tidspunkt.getFullYear());
                // Hvis vandets tidspunkt ikke findes i arrayet, vil IndexPåArray være -1

                // Hvis indexet ikke er -1 tilføjes mængden af vand drukket til arrayet for den dag vandet er drukket
                if (IndexPåArray !== -1) {
                    dataPrDag[IndexPåArray].DrukketVand += vand.Mængde;
                }
            }
        });
    
        // Opretter en række i tabellen for hver dag i arrayet og indsætter dataen i cellerne
        dataPrDag.forEach(dataTilRække => {
            // Opretter en række i tabellen
            let række = table.insertRow();
            // Tilføjer BMR for hver dag til forbrændte kalorier
            dataTilRække.Forbrændt += data.BMRIKcal;
            // indsætter dataen for hver dag i cellerne i rækken
            række.insertCell().textContent = dataTilRække.dag.getDate() + "-" +  (dataTilRække.dag.getMonth()+1) + "-" + dataTilRække.dag.getFullYear();
            række.insertCell().textContent = dataTilRække.KcalIndtaget.toFixed();
            række.insertCell().textContent = dataTilRække.DrukketVand.toFixed();
            række.insertCell().textContent = dataTilRække.Forbrændt.toFixed();
            række.insertCell().textContent = (dataTilRække.KcalIndtaget - dataTilRække.Forbrændt).toFixed();
        });
    })
}
