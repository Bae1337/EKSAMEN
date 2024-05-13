import express from 'express';
import { config } from '../config.js';
import Database from '../database.js';
import { tjekAuth, sessionOpret } from '../auth.js';
import { beregningAfBMR } from '../Helper.js';

// Opretter et router objekt fra express pakken
let router = express.Router();
router.use(express.json());

// Opretter forbindelse til databasen via database objektet
let database = new Database(config);

// Middleware til at tjekke om brugeren er logget ind
router.use(sessionOpret);

// Endpoint til at hente en enkelt fødevare fra databasen
router.post('/logind', async (req, res) => {
    try {
        // Henter data fra request body (indput fra hjemmesiden)
        let bruger = req.body;

        // Kalder metoden i database objektet, som henter Bruger fra databasen
        let result = await database.logind(bruger);

        // Hvis der er en bruger med det brugernavn og kode, gemmes nedenstående i session
        if (result.length > 0) {
            req.session.user = {
                BrugerID: result[0].BrugerID,
                Brugernavn: result[0].Brugernavn,
                Køn: result[0].Køn,
                Alder: result[0].Alder,
                Vægt: result[0].Vægt,
                Højde: result[0].Højde,
                BMR: beregningAfBMR(result[0].Alder, result[0].Vægt, result[0].Køn)
            }
            // Sender svar tilbage til klienten
            res.status(200).json({ message: "Bruger fundet", user: result });
        } 
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: "Forkert brugernavn eller kode" });
    }
});

// Endpoint til at tilføje en bruger til databasen
router.post('/tilfojBruger', async (req, res) => {
    try {
        // Henter data fra request body (indput fra hjemmesiden)
        let bruger = req.body;

        // Kalder metoden i database objektet, som tilføjer en bruger til databasen
        let rowsAffected = await database.tilføjBrugere(bruger);

        // Sender svar tilbage til klienten
        res.status(201).json({ message: "Bruger tilføjet", rowsAffected });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }

});

// eksporter router
export default router;