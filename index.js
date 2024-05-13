import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { sessionOpret, tjekAuth } from './auth.js';

// Importere alle API'er kald fra de forskellige filer
import logindApi from './Api/logindApi.js';
import profilApi from './Api/ProfilApi.js';
import FoodinspectorApi from './Api/FoodInspectorApi.js';
import MealCreatorApi from './Api/MealCreatorApi.js';
import MealTrackerApi from './Api/MealTrackerApi.js';
import AktivitetsTrackerApi from './Api/AktivitetsTrackerApi.js';
import DailyNutriApi from './Api/DailyNutriApi.js';

// Disse to linjer er nødvendige for at kunne bruge __dirname og __filename i ES6 modules
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);


// Bruger port 3000
let port = 3000;

// Opretter en Express app
let app = express();

// Bruger session middleware så brugerens session kan gemmes
app.use(sessionOpret);

// Appen skal bruge json
app.use(express.json());

// Bruger statiske filer fra Static mappen
app.use(express.static(path.join(__dirname, 'Static')));

// Middleware til at tjekke om brugeren er logget ind og sende dem til logind siden hvis de ikke er
app.use((req, res, next) => {
  // Hvis brugeren ikke har en session og ikke er på logind siden eller et logind API kald, sendes brugeren til logind siden
  if (!req.session.user && req.path !== '/logind' && !req.path.startsWith('/logindApi')) {
    res.redirect('/logind');
  } else {
    next();
  }
});


// Sætter /logind til at sende logind.html
app.get('/logind', (req, res) => {
  // Hvis brugeren allerede er logget ind, sendes de til forsiden
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'Static', 'HTML/logind.html'));
  }
});

// Sætter forsiden til at sende dailyNutri.html
app.get('/', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/dailyNutri.html'));
});

// Sætter /profil til at sende profil.html
app.get('/profil', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/profil.html'));
});

// Sætter /foodinspector til at sende foodinspector.html
app.get('/foodinspector', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/foodinspector.html'));
});

// sætter /TilfojMaltid til at sende TilfojMaltid.html
app.get('/TilfojMaltid', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/TilfojMaltid.html'));
});

// Sætter /MealCreator til at sende MealCreator.html
app.get('/MealCreator', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/MealCreator.html'));
});

// Sætter /RegistrerMaltid til at sende RegistrerMåltid.html
app.get('/RegistrerMaltid', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/RegistrerMaltid.html'));
});

// Sætter /registrerEnkeltIngrediens til at sende registrerEnkeltIngrediens.html
app.get('/registrerEnkeltIngrediens', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/registrerEnkeltIngrediens.html'));
});

// Sætter /registrerAktivitet til at sende registrerAktivitet.html
app.get('/registrerVand', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/registrerVand.html'));
});

// Sætter /registrerAktivitet til at sende registrerAktivitet.html
app.get('/MealTracker', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/MealTracker.html'));
});

// Sætter /AktivitetsTracker til at sende aktivitetsTracker.html
app.get('/AktivitetsTracker', tjekAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'Static', 'HTML/aktivitetsTracker.html'));
})

// Sætter de forskellige API'er til at bruge de forskellige filer
app.use('/logindApi', logindApi);
app.use('/profilApi', profilApi);
app.use('/FoodinspectorApi', FoodinspectorApi);
app.use('/MealCreatorApi', MealCreatorApi);
app.use('/MealTrackerApi', MealTrackerApi);
app.use('/AktivitetsTrackerApi', AktivitetsTrackerApi);
app.use('/DailyNutriApi', DailyNutriApi);

// Starter serveren på porten
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Eksporterer appen
export default app;