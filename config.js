import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.development`, debug: true });

// SQL Server config for Azure, hentet fra .env.development filen
let server = process.env.AZURE_SQL_SERVER;
let database = process.env.AZURE_SQL_DATABASE;
let port = parseInt(process.env.AZURE_SQL_PORT);
let user = process.env.AZURE_SQL_USER;
let password = process.env.AZURE_SQL_PASSWORD;

// Eksporterer konfigurationen objektet
export let config = {
    server,
    port,
    database,
    user,
    password,
    options: {
        encrypt: true
    }
};