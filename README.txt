VIGTIGT:

Hvis ikke applikationen kan starte på localhost,
kan det være nødvendigt at geninstallere bcrypt.

Skriv derfor følgende i konsollen:
1. npm uninstall bcrypt
2. npm install bcrypt

Derefter kan index.js startes ved 'node index.js'
Vi håber ikke dette forårsager yderligere problematikker



// mindre vigtigt: //

Hvis npm test ikke virker,
kan det være nødvendigt at geninstallere mocha.

Skriv derfor følgende i konsollen:
1. npm uninstall --save-dev mocha
2. npm install --save-dev mocha

Derefter kan man teste ved 'npm test'
Dette er udelukkende i tilfælde af, at eksaminator vil foretage testing
