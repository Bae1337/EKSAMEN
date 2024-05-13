addEventListener("DOMContentLoaded", () => {
    // kald funktionen når siden er loadet
    beregnBasalstofskifte();
});

// funktion til at registrere aktivitet
function registrerAktivitet() {
    // henter værdierne fra input felterne fra HTML og gemmer dem i variabler
    let aktivitet = document.getElementById("aktivitetsSelector").value;
    let tid = document.getElementById("tid").value;
    let resultat = document.getElementById("resultat");

    // beregner forbrændte kalorier
    let Forbrændt = aktivitet / 60 * tid;
    // sætter resultatet ind i resultat feltet
    resultat.value = Forbrændt.toFixed();

    // sender dataen til serveren via en POST request og får en respons tilbage som bliver vist i resultatTekst feltet
    fetch('/AktivitetsTrackerApi/registrerAktivitet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Forbrændt: Forbrændt,
        })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("resultatTekst").innerText = data.message;
        })
}

// funktion til at beregne basalstofskifte
function beregnBasalstofskifte() {
    // henter brugerens BMR som bliver gemt i session og sætter det ind i input feltet
    fetch('/AktivitetsTrackerApi/BrugerOplysninger', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        let BMR = data.BMR;
        document.getElementById("basalstofskifteIndput").value = BMR;
    })
}
