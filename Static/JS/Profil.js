addEventListener("DOMContentLoaded", (event) => {
    // Kører funktionen hentBruger når siden er loadet
    hentBruger();
});

// Funktion til at hente brugerens data
function hentBruger() {
  // henter brugerens data fra serveren og sætter det ind i de forskellige input felter
  fetch('/profilApi/hentBruger', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('profilBrugernavn').value = data.Brugernavn;
      document.getElementById('profilKøn').selected = data.Køn;
      document.getElementById('profilAlder').value = data.Alder;
      document.getElementById('profilVægt').value = data.Vægt;
      document.getElementById('profilHøjde').value = data.Højde;
    })
}

// Funktion til at opdatere brugerens data
function opdaterBruger() {
  // Henter brugerens data fra input felterne fra HTML
  let Brugernavn = document.getElementById('profilBrugernavn').value;
  let Køn = document.getElementById('profilKøn').value;
  let Alder = document.getElementById('profilAlder').value;
  let Vægt = document.getElementById('profilVægt').value;
  let Højde = document.getElementById('profilHøjde').value;

  // Tjekker om alle felter er udfyldt og returnere en alert hvis de ikke er
  if (Brugernavn == "" || Køn == "" || Alder == 0 || Vægt == 0 || Højde == 0) {
    alert("Udfyld venligst alle felter");
    return;
  }


  // Sender brugerens data til serveren og opdaterer brugeren i databasen
  fetch('/profilApi/opdaterBruger', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Sender brugerens data til serveren
        Brugernavn: Brugernavn,
        Alder: Alder,
        Køn: Køn,
        Vægt: Vægt,
        Højde: Højde
      })
    })
    .then(response => response.json())
    .then(data => {
      // Hvis brugeren er opdateret vises en besked i profilTextBox
      if (data.message === "Bruger Opdateret") {
        document.getElementById('profilTextBox').innerHTML = "Bruger er opdateret";
    } else {
      // Hvis brugeren ikke er opdateret vises en fejl besked i profilTextBox
        document.getElementById('profilTextBox').innerHTML = "Der skete en fejl";
    }
})}

// Funktion til at slette brugerens data ved at bruge api'en sletBruger
function sletBruger() {
  fetch('/profilApi/sletBruger', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      window.location.href = '/logind';
})}

// Funktion til at logge brugeren ud ved at bruge api'en logud
function logud() {
  fetch('/profilApi/logud', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      // omdirigerer brugeren til logind siden
      window.location.href = '/logind';
})}
