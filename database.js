import sql from 'mssql';
import bcrypt from 'bcrypt';

// opretter en klasse som hedder Database og eksporterer den
export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  // konstruktør som tager imod en config
  constructor(config) {
    this.config = config;
  }

  // metode til at forbinde til databasen
  async connect() {
    try {
      // hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
      if (this.connected === false) {
        // opretter en ny forbindelse til databasen ud fra config
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
      } 
    } catch (error) {
      // hvis der er en fejl, udskrives fejlen
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
      console.log(error)
    }
  }

  // metode til at lukke forbindelsen til databasen
  async disconnect() {
    try {
      // hvis der er en forbindelse til databasen, lukkes forbindelsen
      this.poolconnection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
    }
  }

  // metode til at hente brugere fra databasen ud fra et BrugerID
  async logind(data) {
    try {
      // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
      if (this.connected === false){
        await this.connect();
      }

      // opretter en forespørgsel til databasen
      let request = this.poolconnection.request();

      // input til forespørgslen med data, som bliver sendt fra frontend
      request.input('Brugernavn', sql.VarChar(50), data.Brugernavn);

      // udfører forespørgslen og gemmer resultatet
      let result = await request.query(
        `SELECT * FROM dbo.Brugere WHERE Brugernavn = @Brugernavn`
      );

      // hvis der er en bruger med det indtastede brugernavn
      if (result.recordset.length > 0) {
        // gemmer brugeren i variablen Bruger
        let Bruger = result.recordset[0];

        // Hvis det indtastede kodeord matcher det krypterede kodeord i databasen returneres brugeren
        let dekrypter = await bcrypt.compare(data.Kodeord, Bruger.Kodeord);
        if (dekrypter) {
          return result.recordset;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      // hvis der er en fejl, udskrives fejlen
      console.error(error);
    }
  }


  // metode til at tilføje brugere til databasen
  async tilføjBrugere(data) {
    try {
      // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
      if (this.connected === false){
        await this.connect();
      }

      // opretter en forespørgsel til databasen
      let request = this.poolconnection.request();
      // krypterer kodeordet
      let krypteretKodeord = await bcrypt.hash(data.Kodeord, 10);

    // input til forespørgslen med data, som bliver sendt fra frontend
    request.input('Brugernavn', sql.VarChar(50), data.Brugernavn);
      request.input('Kodeord', sql.VarChar(60), krypteretKodeord);
      request.input('Køn', sql.VarChar(50), data.Køn);
      request.input('Alder', sql.Int, data.Alder);
      request.input('Vægt', sql.Int, data.Vægt);
      request.input('Højde', sql.Int, data.Højde);

      // udfører forespørgslen med sql query og gemmer resultatet
      let result = await request.query(
        `INSERT INTO dbo.Brugere (Brugernavn, Kodeord, Køn, Alder, Vægt, Højde) VALUES (@Brugernavn, @Kodeord, @Køn, @Alder, @Vægt, @Højde)`
      );

      // returnerer antal rækker der er blevet påvirket
      return result.rowsAffected[0];
    } catch (error) {
      // hvis der er en fejl, udskrives fejlen
      console.error(`Error adding user: ${error}`);
    }
  }


  // metode til at opdatere brugere i databasen
  async opdaterBruger(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
    request.input('BrugerID', sql.Int, BrugerID);
    request.input('Brugernavn', sql.VarChar(50), data.Brugernavn);
    request.input('Køn', sql.VarChar(50), data.Køn);
    request.input('Alder', sql.Int, data.Alder);
    request.input('Vægt', sql.Int, data.Vægt);
    request.input('Højde', sql.Int, data.Højde);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(
      `UPDATE dbo.Brugere SET Brugernavn = @Brugernavn, Køn = @Køn, Alder = @Alder, Vægt = @Vægt, Højde = @Højde WHERE BrugerID = @BrugerID`
    );

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }

  // metode til at slette brugere i databasen
  async sletBruger(BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med BrugerID, som bliver sendt fra apien
    request.input('BrugerID', sql.Int, BrugerID);

    // udfører forespørgslen med sql query og gemmer resultatet
    // sletter alle data fra brugeren først fra de forskellige tabeller og til sidst fra brugertabellen
    let result = await request.query(`
      BEGIN TRANSACTION;

      BEGIN TRY
          DELETE FROM dbo.Aktivitet WHERE BrugerID = @BrugerID;
          DELETE FROM dbo.Vand WHERE BrugerID = @BrugerID;
          DELETE FROM dbo.RegistreretMåltider WHERE BrugerID = @BrugerID;
          DELETE FROM dbo.MåltidIngredienser
          WHERE MåltidId IN (SELECT MåltidId FROM dbo.Måltider WHERE BrugerID = @BrugerID);
          DELETE FROM dbo.Måltider WHERE BrugerID = @BrugerID;
          DELETE FROM dbo.Brugere WHERE BrugerID = @BrugerID;
      
          COMMIT TRANSACTION;
      END TRY
      BEGIN CATCH
          ROLLBACK TRANSACTION;
          THROW;
      END CATCH;
    
    `);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }



  // metode til at ingrediens fra databasen ud fra FødevareNavn
  async hentMadData(data) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data, som bliver sendt fra frontend
    request.input('FødevareNavn', sql.VarChar(50), `%${data.FødevareNavn}%`);

    // udfører forespørgslen og gemmer resultatet
    let result = await request.query(
      `SELECT * FROM dbo.FoodDatabase WHERE FødevareNavn LIKE @FødevareNavn`
    );

    // returnerer resultatet
    return result.recordset;
  }

  // Meal Creator

  // metode til at tilføje måltider til databasen
  async tilføjMåltid(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // starter en transaktion til databasen for at sikre at alle forespørgsler bliver udført
    // Hvis en forespørgsel fejler, bliver transaktionen rullet tilbage
    let transaktion = new sql.Transaction(this.poolconnection);

    try {
      await transaktion.begin();

      // opretter en forespørgsel til databasen med transaktionen
      let request = new sql.Request(transaktion);

      // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
      request.input('BrugerID', sql.Int, BrugerID);
      request.input('Navn', sql.VarChar(50), data.Navn);

      // udfører forespørgslen med sql query og gemmer resultatet
      let MealResult = await request.query(`INSERT INTO [dbo].[Måltider] ([BrugerID], [Navn]) OUTPUT INSERTED.MåltidId VALUES (@BrugerID, @Navn)`);

      // Laver en variabel med MåltidId som er oprettet i ovenstående forespørgsel
      let MåltidId = MealResult.recordset[0].MåltidId;

      // Looper igennem hver ingrediens i arrayet og indsætter dem i databasen med samme MåltidId
      for (let ingredienser of data.Ingredienser) {
        // opretter en ny forespørgsel til databasen med transaktionen
        request = new sql.Request(transaktion);
        // input til forespørgslen med data, fra arrayet og MåltidId
        request.input('MåltidId', sql.Int, MåltidId);
        request.input('FoodID', sql.Int, ingredienser.FoodID);
        request.input('Vægt', sql.Int, ingredienser.Vægt);

        // udfører forespørgslen med sql query og gemmer resultatet
        await request.query(`INSERT INTO [dbo].[MåltidIngredienser] ([MåltidId], [FoodID], [Vægt]) VALUES (@MåltidId, @FoodID, @Vægt)`);
      }

      // commiter transaktionen
      await transaktion.commit();
      // returnerer MåltidId
      return { MåltidId: MåltidId };
    } catch (error) {
      // hvis der er en fejl, udskrives fejlen og transaktionen rulles tilbage      
      console.error(`Error adding meal: ${error}`);
      await transaktion.rollback();
      return null;
    }
  }

  // metode til at hente alle måltider fra databasen til MealCreator for en bruger
  async hentMåltiderTilMealCreator(BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med BrugerID, som bliver sendt fra apien
    request.input('BrugerID', sql.Int, BrugerID);

    // udfører forespørgslen med et join på måltider, måltidIngredienser og FoodDatabase og gemmer resultatet
    let result = await request.query(`      
      SELECT
        Måltider.MåltidId,
        Måltider.BrugerID,
        Måltider.Navn,
        FoodDatabase.FoodID,
        MåltidIngredienser.Vægt,
        FoodDatabase.FødevareNavn,
        FoodDatabase.Energi_kJ,
        FoodDatabase.Energi_kcal,
        FoodDatabase.Protein,
        FoodDatabase.Kulhydrat,
        FoodDatabase.Kostfibre,
        FoodDatabase.Fedt,
        FoodDatabase.Tørstof,
        FoodDatabase.Vand
      FROM dbo.Måltider
      INNER JOIN dbo.MåltidIngredienser ON Måltider.MåltidId = MåltidIngredienser.MåltidId
      INNER JOIN dbo.FoodDatabase ON MåltidIngredienser.FoodID = dbo.FoodDatabase.FoodID
      WHERE Måltider.BrugerID = @BrugerID
      order by MåltidId`);

    // returnerer resultatet
    return result.recordset;
  }

  // metode til at slette måltider fra databasen
  async sletMåltid(MåltidId) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med MåltidId, som bliver sendt fra frontend
    request.input('MåltidId', sql.Int, MåltidId);

    // udfører forespørgslen med sql query der sletter alle ingredienser fra MåltidIngredienser og Måltider og gemmer resultatet
    let result = await request.query(`
      DELETE FROM dbo.MåltidIngredienser WHERE MåltidId = @MåltidId; 
      DELETE FROM dbo.Måltider WHERE MåltidId = @MåltidId`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }


  //Meal Tracker

  // metode til at registrere indtaget måltid i databasen
  async registrerMåltid(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
    request.input('BrugerID', sql.Int, BrugerID);
    request.input('MåltidId', sql.Int, data.MåltidId);
    request.input('Vægt', sql.Int, data.Vægt);
    request.input('Længdegrad', sql.Decimal(8, 6), data.Længdegrad);
    request.input('Breddegrad', sql.Decimal(8, 6), data.Breddegrad);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
      INSERT INTO [dbo].[RegistreretMåltider] ([BrugerID], [MåltidId], [Vægt], [Længdegrad], [Breddegrad])
      Values (@BrugerID, @MåltidId, @Vægt, @Længdegrad, @Breddegrad)`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }

  // metode til at hente registrerede måltider fra databasen til MealTracker for en bruger
  async hentRegistreredeMåltiderTilMealTracker(BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }

    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med BrugerID, som bliver sendt fra apien
    request.input('BrugerID', sql.Int, BrugerID);

    // udfører forespørgslen med et join på registrerede måltider, måltider, måltidIngredienser og FoodDatabase og gemmer resultatet
    // Da FoodDatabase bliver brugt to gange, bliver den ene omdøbt til FoodDatabase2 og får navnet IngrediensNavn, IngrediensEnergi_kcal, IngrediensProtein, IngrediensFedt og IngrediensKostfibre
    let result = await request.query(`
      SELECT
        RegistreretMåltider.RegistreretID,
        RegistreretMåltider.BrugerID,
        RegistreretMåltider.Vægt AS RegistreretVægt,
        RegistreretMåltider.Dato,
        RegistreretMåltider.Længdegrad,
        RegistreretMåltider.Breddegrad,
        Måltider.MåltidId,
        Måltider.Navn AS MåltidNavn,
        FoodDatabase.FoodID,
        RegistreretMåltider.IngrediensID,
        MåltidIngredienser.Vægt AS IngrediensVægt,
        FoodDatabase.FødevareNavn,
        FoodDatabase.Energi_kJ,
        FoodDatabase.Energi_kcal,
        FoodDatabase.Protein,
        FoodDatabase.Kulhydrat,
        FoodDatabase.Kostfibre,
        FoodDatabase.Fedt,
        FoodDatabase.Tørstof,
        FoodDatabase.Vand,
        FoodDatabase2.FødevareNavn AS IngrediensNavn,
        FoodDatabase2.Energi_kcal AS IngrediensEnergi_kcal,
        FoodDatabase2.Protein AS IngrediensProtein,
        FoodDatabase2.Fedt AS IngrediensFedt,
        FoodDatabase2.Kostfibre AS IngrediensKostfibre
      FROM dbo.RegistreretMåltider
      LEFT JOIN dbo.Måltider ON dbo.RegistreretMåltider.MåltidId = dbo.Måltider.MåltidId
      LEFT JOIN dbo.MåltidIngredienser ON dbo.Måltider.MåltidId = dbo.MåltidIngredienser.MåltidId
      LEFT JOIN dbo.FoodDatabase ON dbo.MåltidIngredienser.FoodID = dbo.FoodDatabase.FoodID
      LEFT JOIN dbo.FoodDatabase AS FoodDatabase2 ON dbo.RegistreretMåltider.IngrediensID = FoodDatabase2.FoodID
      WHERE dbo.RegistreretMåltider.BrugerID = @BrugerID
      ORDER BY dbo.RegistreretMåltider.Dato DESC;

  `);

    // returnerer resultatet
    return result.recordset;
  }


  // metode til at slette registrerede måltider fra databasen
  async sletRegistreretMåltid(RegistreretID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med RegistreretID, som bliver sendt fra frontend
    request.input('RegistreretID', sql.Int, RegistreretID);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
      DELETE FROM [dbo].[RegistreretMåltider] WHERE RegistreretID = @RegistreretID`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }


  // metode til at redigere registrerede måltider i databasen
  async RedigerRegistreretMåltid(data) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data, som bliver sendt fra frontend
    request.input('RegistreretID', sql.Int, data.RegistreretID);
    request.input('Vægt', sql.Int, data.Vægt);
    request.input('MåltidId', sql.Int, data.MåltidId);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
          UPDATE [dbo].[RegistreretMåltider]
          SET [MåltidId] = @MåltidId
            ,[Vægt] = @Vægt
          WHERE RegistreretID = @RegistreretID`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }


  // metode til at registrere enkelt ingrediens i databasen
  async registrerEnkeltIngrediens(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
    request.input('BrugerID', sql.Int, BrugerID);
    request.input('IngrediensID', sql.Int, data.IngrediensID);
    request.input('Vægt', sql.Int, data.Vægt);
    request.input('Længdegrad', sql.Decimal(8, 6), data.Længdegrad);
    request.input('Breddegrad', sql.Decimal(8, 6), data.Breddegrad);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
      INSERT INTO [dbo].[RegistreretMåltider] ([BrugerID], [IngrediensID], [Vægt], [Længdegrad], [Breddegrad])
      Values (@BrugerID, @IngrediensID, @Vægt, @Længdegrad, @Breddegrad)`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }

  // metode til at redigere registrerede enkelt ingredienser i databasen
  async redigerRegistreretIngrediens(data) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data, som bliver sendt fra frontend
    request.input('RegistreretID', sql.Int, data.RegistreretID);
    request.input('Vægt', sql.Int, data.Vægt);
    request.input('IngrediensID', sql.Int, data.IngrediensID);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
          UPDATE [dbo].[RegistreretMåltider]
          SET [IngrediensID] = @IngrediensID
            ,[Vægt] = @Vægt
          WHERE RegistreretID = @RegistreretID`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }

  // metode til at registrere vand i databasen
  async registrerVand(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
    request.input('BrugerID', sql.Int, BrugerID);
    request.input('Mængde', sql.Int, data.Mængde);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
      INSERT INTO [dbo].[Vand] ([BrugerID], [Mængde])
      Values (@BrugerID, @Mængde)`);

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }


  // Aktivitets Tracker

  // metode til at registrere aktivitet i databasen
  async registrerAktivitet(data, BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med data og BrugerID, som bliver sendt fra frontend
    request.input('BrugerID', sql.Int, BrugerID);
    request.input('Forbrændt', sql.Int, data.Forbrændt);

    // udfører forespørgslen med sql query og gemmer resultatet
    let result = await request.query(`
      INSERT INTO [dbo].[Aktivitet] ([BrugerID], [Forbrændt]) 
      VALUES (@BrugerID, @Forbrændt)
    `)

    // returnerer antal rækker der er blevet påvirket
    return result.rowsAffected[0];
  }

  // Daily nutri

  // metode til at hente daglig nutri data fra databasen
  async hentDagligNutri(BrugerID) {
    // Hvis der ikke er forbindelse til databasen, oprettes en ny forbindelse
    if (this.connected === false){
      await this.connect();
    }    
    
    // opretter en forespørgsel til databasen
    let request = this.poolconnection.request();

    // input til forespørgslen med BrugerID, som bliver sendt fra apien
    request.input('BrugerID', sql.Int, BrugerID);

    // udfører forespørgslen for alle registrerede aktiviteter for en bruger og gemmer resultatet
    let resultAktivitet = await request.query(`
      SELECT 
        dbo.Aktivitet.BrugerID,
        dbo.Aktivitet.Dato AS AktivitetDato,
        dbo.Aktivitet.Forbrændt
      FROM dbo.Aktivitet
      WHERE dbo.Aktivitet.BrugerID = @BrugerID
    `);


    
    // udfører forespørgslen for alle registreringer af måltider for en bruger og gemmer resultatet

    // Bruger ISNULL funktionen til at returnere værdien af udregnet energi(kcal) i måltid, hvis der er en registrering af et måltid (første OUTER APPLY)
    // Hvis der ikke er en registrering af et måltid, men blot et ingrediens, returneres værdien af udregnet energi(kcal) i ingrediens (anden OUTER APPLY)

    // Der bliver brugt OUTER APPLY for at kunne regne ud hvor meget energi der er i et måltid og i en enkelt ingrediens

    // Hvis der er en registrering af et måltid, bliver det samlede energi(kcal) i måltidet udregnet
    // Den summere alle ingrediensers kcal der har samme måltidId og ganger det med vægten af ingrediensen og dividerer det med summen af vægten af den registreret måltid

    // Hvis der er en registrering af en enkelt ingrediens, bliver den individuelle energi(kcal) i ingrediensen udregnet
    // Den dividere kcal i ingrediensen med 100 og ganger det med vægten af den registreret ingrediens
    let resultRegistreretMåltider = await request.query(`
      SELECT 
        dbo.RegistreretMåltider.RegistreretID,
        dbo.RegistreretMåltider.BrugerID,
        dbo.RegistreretMåltider.MåltidId,
        dbo.RegistreretMåltider.IngrediensID,
        dbo.RegistreretMåltider.Vægt AS RegistreretVægt,
        dbo.RegistreretMåltider.Dato AS MåltidDato,
        ISNULL(MåltidEnergi.TotalEnergi_kcal, IngrediensEnergi.IndividuelEnergi_kcal) AS Energi_kcal
      FROM 
          dbo.RegistreretMåltider
      OUTER APPLY (
          SELECT 
              (SUM(dbo.FoodDatabase.Energi_kcal / 100 * dbo.MåltidIngredienser.Vægt) / SUM(dbo.MåltidIngredienser.Vægt)) * dbo.RegistreretMåltider.Vægt AS TotalEnergi_kcal
          FROM 
              dbo.MåltidIngredienser
          INNER JOIN 
              dbo.FoodDatabase ON dbo.MåltidIngredienser.FoodID = dbo.FoodDatabase.FoodID
          WHERE 
              dbo.MåltidIngredienser.MåltidId = dbo.RegistreretMåltider.MåltidId
      ) AS MåltidEnergi
      OUTER APPLY (
          SELECT 
              (dbo.FoodDatabase.Energi_kcal / 100 * dbo.RegistreretMåltider.Vægt) AS IndividuelEnergi_kcal
          FROM 
              dbo.FoodDatabase
          WHERE 
              dbo.FoodDatabase.FoodID = dbo.RegistreretMåltider.IngrediensID
      ) AS IngrediensEnergi
      WHERE 
          dbo.RegistreretMåltider.BrugerID = @BrugerID
    `);


    // udfører forespørgslen for alle registreringer af vand for en bruger og gemmer resultatet
    let resultVand = await request.query(`
    SELECT 
        dbo.Vand.Dato AS VandDato,
        dbo.Vand.Mængde
    FROM dbo.Vand
    WHERE dbo.Vand.BrugerID = @BrugerID
    `);


    // returnerer resultatet
    return { resultAktivitet: resultAktivitet.recordset, resultRegistreretMåltider: resultRegistreretMåltider.recordset, resultVand: resultVand.recordset };
  }
}
