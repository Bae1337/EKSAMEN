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

// Endpoint til at hente en bruger fra session
router.get('/hentBruger', tjekAuth, async (req, res) => {
    try {
        // Henter bruger fra session
        let bruger = req.session.user;

        // Sender svar tilbage til klienten
        res.status(200).json(bruger);
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }

});

// Endpoint til at opdatere en bruger i databasen
router.put('/opdaterBruger', tjekAuth, async (req, res) => {
    try {
        // Henter nye oplysninger om bruger fra request body (indput fra hjemmesiden)
        let bruger = req.body;

        // Henter BrugerID fra session
        let BrugerID = req.session.user.BrugerID

        // Kalder metoden i database objektet, som opdaterer en bruger i databasen
        let result = await database.opdaterBruger(bruger, BrugerID);

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Bruger Opdateret", user: result });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Endpoint til at slette en bruger fra databasen
router.delete('/sletBruger', tjekAuth, async (req, res) => {
    try {
        // Henter BrugerID fra session
        let BrugerID = req.session.user.BrugerID

        // Kalder metoden i database objektet, som sletter en bruger fra databasen
        let result = await database.sletBruger(BrugerID);
        
        // Hvis brugeren blev slettet, afsluttes sessionen
        if (result.rowsAffected === 0) {
            // Sender svar tilbage til klienten
            res.status(404).json({ message: "Bruger blev ikke fundet" });
        } else {
            // Afslutter sessionen
            req.session.destroy();
            // Hvis brugeren ikke blev slettet, sendes en fejlbesked til klienten
            res.status(200).json({ message: "Bruger slettet and session afsluttet" });
        }
        
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: "Bruger blev ikke fundet" });
    }
});

// Endpoint til at logge en bruger ud
router.post('/logud', async (req, res) => {
    try {
        // Afslutter sessionen
        req.session.destroy()

        // Sender svar tilbage til klienten
        res.status(200).json({ message: "Bruger logget ud" });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Eksporterer router objektet
export default router;