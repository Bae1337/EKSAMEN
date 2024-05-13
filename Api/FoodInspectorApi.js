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

// Endpoint til at hente en enkelt fødevare fra databasen
router.post('/HentData', tjekAuth, async (req, res) => {
    try {
        // Henter data fra request body (indput fra hjemmesiden)
        let data = req.body;

        // Kalder metoden i database objektet, som henter en enkelt fødevare fra databasen
        let result = await database.hentMadData(data);

        // Sender svar tilbage til klienten
        res.status(200).json({result});
    } catch(err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Ekspoterer router
export default router;