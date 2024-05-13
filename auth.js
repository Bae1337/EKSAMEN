import session from 'express-session';

// Middleware til at oprette en session
let sessionOpret = session({
    // Her sættes en hemmelig nøgle til at signere session ID cookie'en
    secret: 'verysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  });
  

  // funktion til at tjekke om brugeren er logget ind
  function tjekAuth(req, res, next) {
    // Hvis brugeren har en session, fortsættes serverkaldet
    if (req.session && req.session.user) {
        return next();
    } else {
        // Hvis brugeren ikke har en session, sendes brugeren til login-siden
        return res.redirect('/logind');
    }
}

// Eksporterer funktionerne
export { sessionOpret, tjekAuth };