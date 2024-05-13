import express from 'express';
import { config } from '../config.js';
import Database from '../database.js';
import { tjekAuth, sessionOpret } from '../auth.js';

// Opretter et router objekt fra express pakken
let router = express.Router();
router.use(express.json());

// Opretter forbindelse til databasen via database objektet
let database = new Database(config);

// Middleware til at tjekke om brugeren er logget ind
router.use(sessionOpret);

// Endpoint til at registrer et indtaget måltid i databasen
router.post('/registrerMaltid', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let registrering = req.body;

    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;

    try {
        // Kalder metoden i database objektet, som registrerer et indtaget måltid i databasen
        let rowsAffected = await database.registrerMåltid(registrering, BrugerID);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Måltid registreret" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at hente alle registrerede indtaget måltider for en bruger fra databasen til MealTracker
router.get('/hentRegistreredeMaltiderTilMealTracker', tjekAuth, async (req, res) => {
    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;

    try {
        // Kalder metoden i database objektet, som henter alle registrerede indtaget måltider for en bruger fra databasen
        let recordset = await database.hentRegistreredeMåltiderTilMealTracker(BrugerID);

        // Sender svar tilbage til klienten
        res.status(200).json(recordset);
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at slette et registreret måltid fra databasen
router.delete('/sletRegistrering', tjekAuth, async (req, res) => {
    // Henter RegistreretID fra request body (indput fra hjemmesiden)
    let RegistreretID = req.body.RegistreretID;

    try {
        // Kalder metoden i database objektet, som sletter et registreret måltid fra databasen
        let rowsAffected = await database.sletRegistreretMåltid(RegistreretID);

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Måltid slettet" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at redigere et registreret måltid i databasen
router.put('/redigerRegistering', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let opdatering = req.body;

    try {
        // Kalder metoden i database objektet, som redigerer et registreret måltid i databasen
        let rowsAffected = await database.RedigerRegistreretMåltid(opdatering);

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Måltid redigeret" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at registrere en enkelt ingrediens i databasen
router.post('/registrerEnkeltIngrediens', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let registrering = req.body;

    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;
    
    try {
        // Kalder metoden i database objektet, som registrerer en enkelt ingrediens i databasen
        let rowsAffected = await database.registrerEnkeltIngrediens(registrering, BrugerID);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Ingrediens registreret" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at redigere et registreret ingrediens i databasen
router.put('/redigerEnkeltIngrediens', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let opdatering = req.body;

    try {
        // Kalder metoden i database objektet, som redigerer et registreret ingrediens i databasen
        let rowsAffected = await database.redigerRegistreretIngrediens(opdatering);

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Ingrediens redigeret" });
    } catch (err) {

        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at registrere indtaget vand i databasen
router.post('/registrerVand', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let registrering = req.body;

    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;

    try {
        // Kalder metoden i database objektet, som registrerer indtaget vand i databasen
        let rowsAffected = await database.registrerVand(registrering, BrugerID);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Vand registreret" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// eksporter router
export default router;