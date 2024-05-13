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

// Endpoint til at hente tilføje et måltid til databasen
router.post('/tilfojMaltid', tjekAuth, async (req, res) => {
    // Henter data fra request body (indput fra hjemmesiden)
    let måltid = req.body;

    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;
    try {
        // Kalder metoden i database objektet, som tilføjer et måltid til databasen
        let rowsAffected = await database.tilføjMåltid(måltid, BrugerID);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Måltid tilføjet" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at hente alle måltider fra databasen til MealCreator for en bruger
router.get('/hentMaltidTilMeaclCreator', tjekAuth, async (req, res) => {
    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;

    try {
        // Kalder metoden i database objektet, som henter alle måltider fra databasen
        let recordset = await database.hentMåltiderTilMealCreator(BrugerID);

        // Sender svar tilbage til klienten
        res.status(200).json(recordset);
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }

});

// Endpoint til at slette et måltid fra databasen
router.delete('/sletMaltid', tjekAuth, async (req, res) => {
    // Henter måltidId fra request body (indput fra hjemmesiden)
    let MåltidId = req.body.MåltidId;
    try {
        // Kalder metoden i database objektet, som sletter et måltid fra databasen
        let rowsAffected = await database.sletMåltid(MåltidId);

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Måltid slettet" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Eksporterer router objektet
export default router;