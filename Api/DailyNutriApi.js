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

// Endpoint til at hente alle aktiviteter, registreret måltider samt drukket vand for en bruger fra databasen
router.get('/hentDagligNutri', tjekAuth, async (req, res) => {
    // Henter BrugerID fra session
    let BrugerID = req.session.user.BrugerID;
    // Henter BMR fra session og omregner til kcal
    let BMRIKcal = req.session.user.BMR * 239.005736;

    try {
        // Kalder metoden i database objektet, som henter alle aktiviteter, registreret måltider samt drukket vand for en bruger
        let recordset = await database.hentDagligNutri(BrugerID);
        // Sender svar tilbage til klienten
        res.status(200).json( { recordset, BMRIKcal });
    } catch (err) {
        // Hvis der sker en fejl, sendes en fejlbesked til klienten
        res.status(500).json({ error: err?.message });
    }
});

// Ekspoterer router
export default router;