addEventListener("DOMContentLoaded", (event) => {});

// function til at logge ind
function logind() {
  // henter brugernavn og kodeord fra input felterne
  let Brugernavn = document.getElementById('logIndBrugernavn').value;
  let Kodeord = document.getElementById('logIndKodeord').value;

  // sender brugernavn og kodeord til serveren via api
  fetch('/logindApi/logind', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          Brugernavn: Brugernavn,
          Kodeord: Kodeord,
      })
    })
    .then(response => response.json())
    .then(data => {
      // hvis brugeren findes, sendes brugeren til forsiden
      if (data.message === "Bruger fundet") {
          window.location.href = '/';
      } else {
        // hvis brugeren ikke findes, vises en fejlbesked
          document.getElementById('logindFejl').innerHTML = "Brugernavn eller kodeord er forkert";
      }
    })
}

// function til at tilføje en bruger
function tilføjBruger() {
    // henter brugernavn, kodeord, alder, køn, vægt og højde fra input felterne
    let Brugernavn = document.getElementById('tilføjBrugernavn').value;
    let Kodeord = document.getElementById('tilføjKodeord').value;
    let Køn = document.getElementById('tilføjKøn').value;
    let Alder = document.getElementById('tilføjAlder').value;
    let Vægt = document.getElementById('tilføjVægt').value;
    let Højde = document.getElementById('tilføjHøjde').value;

    // hvis alder, vægt eller højde er 0, sættes de til null
    if (Brugernavn == "" || Kodeord == "" || Alder == 0 || Vægt == 0 || Højde == 0) {
      alert("Udfyld venligst alle felter");
      return;
    }
    
    // sender brugernavn, kodeord, alder, køn, vægt og højde til serveren via api
    fetch('/logindApi/tilfojBruger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Brugernavn: Brugernavn,
            Kodeord: Kodeord,
            Alder: Alder,
            Køn: Køn,
            Vægt: Vægt,
            Højde: Højde
        })
      })
      .then(response => response.json())
      .then(data => {
        // hvis brugeren er oprettet, vises besked
        if (data.message === "Bruger tilføjet") {
            document.getElementById('tilføjTextBox').innerHTML = "Bruger er oprettet";
        } else {
            // hvis brugeren ikke er oprettet, vises fejlbesked
            document.getElementById('tilføjTextBox').innerHTML = "Der skete en fejl";
        }
      })
}