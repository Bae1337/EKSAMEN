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

// Endpoint til at hente alle aktiviteter for en bruger fra databasen
router.post('/registrerAktivitet', tjekAuth, async (req, res) => {
    try {
        // Henter data fra request body (indput fra hjemmesiden) og brugerID fra session
        let data = req.body;
        let BrugerID = req.session.user.BrugerID;

        // Kalder metoden i database objektet, som registrerer en aktivitet
        let request = await database.registrerAktivitet(data, BrugerID);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Aktivitet registreret!" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at hente brugerens BMR fra session
router.get('/BrugerOplysninger', tjekAuth, async (req, res) => {
    try {
        // Henter BMR fra session
        let BMR = req.session.user.BMR;
    
        // Sender BMR til klienten
        res.status(200).json({ BMR });
    }
    catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Eksporterer router 
export default router;