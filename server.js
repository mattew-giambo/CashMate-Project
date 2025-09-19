const express = require("express");
const crypto = require('crypto');
const path = require("path");
const cors = require("cors");
const fs = require("fs").promises;
const {IBAN, CountryCode} = require("ibankit");
const bcrypt = require('bcrypt');
require("dotenv").config(); // per variabili di ambiente
const nodemailer = require('nodemailer'); // per mandare email
const saltRounds = 10;

// Configura il transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSW,
    },
});

// ======= Inizializzazione e Configurazione del Server Express =======

// Crea un'istanza dell'applicazione Express
const app = express();

// Definisce la porta su cui il server ascolterà le richieste
const port = 8000;

// ======= Middleware =======

// Middleware per servire file statici (CSS, JavaScript, immagini) dalla directory 'public'
app.use("/css", express.static(path.join(__dirname, './public/css')));
app.use("/assets", express.static(path.join(__dirname, './public/assets')));
app.use("/js", express.static(path.join(__dirname, './public/js')));

// Middleware per il parsing del corpo delle richieste in formato JSON
// Aumenta il limite di dimensione a 50MB per consentire l'upload di file più grandi (es. documenti)
app.use(express.json({ limit: '50mb' }));  

// Middleware per abilitare la Cross-Origin Resource Sharing (CORS)
// Permette alle richieste provenienti da domini diversi di accedere alle risorse del server
app.use(cors());

// Definisco il percorso assoluto alla directory contenente i file HTML
const html_path = path.join(__dirname, './public/html');

// Mappa per la gestione delle sessioni utente attive
// La chiave è l'ID dell'utente e il valore è un oggetto contenente l'authCode e la data di scadenza
const sessions = new Map();

// Middleware di logging per tracciare ogni richiesta HTTP
app.use((req, res, next) => {
    console.log(`${req.method}, ${req.url}`);
    next(); // Passa il controllo al prossimo middleware o route handler
});

// ======= Interfaccia Utente (Endpoint per i File HTML) =======

// Root principale (homepage)
app.get("/", (req, res)=>{
    res.sendFile(path.join(html_path,'homepage.html'))
})

// Chi siamo 
app.get("/chi-siamo", (req, res) => {
    res.sendFile(path.join(html_path, 'chi-siamo.html'))
})

// Login
app.get("/login", (req, res) => {
    res.sendFile(path.join(html_path, 'login.html'))
})

// Register
app.get("/register", (req, res) => {
    res.sendFile(path.join(html_path, 'register.html'))
})

// Il mio conto (Dashboard utente)
app.get("/dashboard/conto", (req, res) => {
    res.sendFile(path.join(html_path, 'conto.html'))
})

// Portafoglio (Dashboard utente)
app.get("/dashboard/portafoglio", (req, res) => {
    res.sendFile(path.join(html_path, 'portafoglio.html'))
})

// Operazioni (Dashboard utente)
app.get("/dashboard/operazioni", (req, res) => {
    res.sendFile(path.join(html_path, 'operazioni.html'))
})

// Profilo (Dashboard utente)
app.get("/dashboard/profilo", (req, res) => {
    res.sendFile(path.join(html_path, 'profilo.html'))
})

// Invia denaro (Dashboard utente)
app.get("/dashboard/invia-denaro", (req, res) => {
    res.sendFile(path.join(html_path, 'invia-denaro.html'))
})

// Bonifico (Dashboard utente)
app.get("/dashboard/bonifico", (req, res) => {
    res.sendFile(path.join(html_path, 'bonifico.html'))
})

// ========== GESTIONE CONNESSIONE AL DATABASE (MariaDB) ==========
const mariadb = require('mariadb');

// Configurazione della connessione al database
const dbConfig = {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'rootpw',
    database: 'cashmate'
};

/**
 * Funzione asincrona per stabilire una connessione al database MariaDB.
 * @returns {Promise<mariadb.Connection>} Oggetto di connessione al database.
 * @throws {Error} Se si verifica un errore durante la connessione.
 */
async function getConnection() {
    try {
      const connection = await mariadb.createConnection(dbConfig);
      return connection;
    } catch (err) {
      console.error('Errore di connessione al DB:', err);
      throw err;
    }
}

/**
 * Funzione asincrona per generare un IBAN univoco per un nuovo conto.
 * Verifica che l'IBAN generato non esista già nel database.
 * @returns {Promise<string|undefined>} L'IBAN univoco generato, o undefined in caso di errore.
 */
async function generateUniqueIban() {
    let connection;
    try{
        connection = await getConnection();
        const checkQuery = 'SELECT iban FROM conti';
        const results = await connection.query(checkQuery);

        const existingIbans = results.map(item =>{return item.iban});
        let iban = IBAN.random(CountryCode.IT).value;
  
        while (existingIbans.includes(iban)) {
            iban = IBAN.random(CountryCode.IT).value;
        }
        return iban;
    }
    catch (err){
        console.error('Errore nel login:', err);
        return undefined;
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Funzione asincrona per generare un numero di conto univoco.
 * Verifica che il numero di conto generato non esista già nel database.
 * @returns {Promise<string|undefined>} Il numero di conto univoco generato, o undefined in caso di errore.
 */
async function generateAccountNumber() {
    let connection;
    try{
        connection = await getConnection();
        const checkQuery = 'SELECT id FROM conti';
        const results = await connection.query(checkQuery);

        const existingId = results.map(item =>{return item.id});
        let accountNumber = "";

        for (let i = 0; i < 10; i++) {
            accountNumber += Math.floor(Math.random() * 10);
        }

        while (existingId.includes(accountNumber)) {
            accountNumber = "";

            for (let i = 0; i < 10; i++) {
                accountNumber += Math.floor(Math.random() * 10);
            }
        }
        return accountNumber;
    }
    catch (err){
        console.error('Errore nel login:', err);
        return undefined;
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Funzione asincrona per generare un numero di carta univoco (iniziando con '5').
 * Verifica che il numero di carta generato non esista già nel database.
 * @returns {Promise<string|undefined>} Il numero di carta univoco generato, o undefined in caso di errore.
 */
async function generateCardNumber() {
    let connection;
    try{
        connection = await getConnection();
        const checkQuery = 'SELECT carta FROM conti';
        const results = await connection.query(checkQuery);

        const existingCardNumber= results.map(item =>{return item.id});
        let cardNumber = "5";

        for (let i = 0; i < 15; i++) {
            cardNumber += Math.floor(Math.random() * 10);
        }

        while (existingCardNumber.includes(cardNumber)) {
            cardNumber = "5";

            for (let i = 0; i < 15; i++) {
                cardNumber += Math.floor(Math.random() * 10);
            }
        }
        return cardNumber;
    }
    catch (err){
        console.error('Errore nel login:', err);
        return undefined;
    } finally {
        if (connection) await connection.end();
    }
}

/**
 * Endpoint per la registrazione di un nuovo utente.
 * Riceve i dati dell'utente dal corpo della richiesta, li valida,
 * hasha la password, genera dati univoci per il conto (IBAN, conto ID, numero carta),
 * salva i dati dell'utente e del conto nel database e salva il documento identificativo sul server.
 * @param {object} req Oggetto della richiesta Express.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post('/register-api', async (req, res) => {
    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const data_nascita = req.body.data_nascita;
    const codice_fiscale = req.body.codice_fiscale;
    const citta = req.body.citta;
    const indirizzo = req.body.indirizzo;
    const numero_telefono = req.body.numero_telefono;
    const email = req.body.email;
    const numero_documento = req.body.numero_documento;
    const occupazione = req.body.occupazione;
    const password = req.body.password;
    const cap = req.body.cap;
    const base64_documento = req.body.base64_documento;

    let connection;
    try {
        connection = await getConnection();

        // ========================= VALIDAZIONE DATI UTENTE =========================

        // Controllo se l'email è già registrata
        let checkQuery = 'SELECT * FROM utenti WHERE email = ?';
        let results = await connection.query(checkQuery, [email]);
        if (results.length > 0) {
            return res.status(422).json({ status: 'error', message: 'L\'email è già associata ad un account!' });
        }

        // Controllo se il codice fiscale è già presente
        checkQuery = 'SELECT * FROM utenti WHERE cod_fisc = ?';
        results = await connection.query(checkQuery, [codice_fiscale]);
        if (results.length > 0) {
            return res.status(422).json({ status: 'error', message: 'Il codice fiscale è già associato ad un account!' });
        }

        // Controllo se il numero di telefono è già presente
        checkQuery = 'SELECT * FROM utenti WHERE numero_tel = ?';
        results = await connection.query(checkQuery, [numero_telefono]);
        if (results.length > 0) {
            return res.status(422).json({ status: 'error', message: 'Il numero di telefono è già associato ad un account!' });
        }

        // Controllo se il numero della carta d'identità è già presente
        checkQuery = 'SELECT * FROM utenti WHERE carta_id = ?';
        results = await connection.query(checkQuery, [numero_documento]);
        if (results.length > 0) {
            return res.status(422).json({ status: 'error', message: 'Il numero della carta d\'identità è già associato ad un account!' });
        }

        // Hash della password con bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Genera l'hash della password

        // ========================= GENERAZIONE DATI CONTO =========================

        const iban = await generateUniqueIban();
        if(!iban)
            throw new Error("Errore nella generazione dell'iban");
        const conto_id = await generateAccountNumber();
        if(!conto_id)
            throw new Error("Errore nella generazione del conto_id");
        const card_num = await generateCardNumber();
        if(!card_num)
            throw new Error("Errore nella generazione del numero di carta");

        // ========================= INSERIMENTO DATI NEL DATABASE =========================

        await connection.beginTransaction();

        let insertQuery = `
            INSERT INTO utenti (
                email, password, nome, cognome, cod_fisc, data_nasc,
                citta_res, indirizzo_res, numero_tel, carta_id, occupazione, cap
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.query(insertQuery, [
            email,
            hashedPassword,
            nome,
            cognome,
            codice_fiscale,
            data_nascita,
            citta,
            indirizzo,
            numero_telefono,
            numero_documento,
            occupazione,
            cap
        ]);

        // Recupera l'ID dell'utente appena inserito
        checkQuery = 'SELECT id FROM utenti WHERE email = ?';
        results = await connection.query(checkQuery, [email]);
        if (results.length === 0) {
            throw new Error("Errore del server");
        }
        const utente_id = results[0].id;

        // Calcola la data di scadenza della carta (5 anni dalla data attuale)
        let data_scad = new Date();
        data_scad.setFullYear(data_scad.getFullYear() + 5);
        data_scad = data_scad.toISOString().split("T")[0];

        // Inserisci i dati del conto nella tabella 'conti'
        insertQuery = `INSERT INTO conti (id, iban, carta, utente, scad_carta) VALUES (?, ?, ?, ?, ?)`;
        await connection.query(insertQuery, [conto_id, iban, card_num, utente_id, data_scad]);

        // ========================= SALVATAGGIO DOCUMENTO IDENTIFICATIVO =========================

        const filePath = path.join("./database/users/carteID", `${codice_fiscale}.pdf`);
        const buffer = Buffer.from(base64_documento, 'base64');
        await fs.writeFile(filePath, buffer);

        await connection.commit();

        // Dati dell'email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Benvenuto in CashMate!',
            html: '<h1>Ti diamo il benvenuto in CashMate!</h1> <h3 style="font-weight: 600;"><a href="http://localhost:8000/login">Clicca qui</a> per accedere al tuo account!</h3>'
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) 
                throw new Error("Errore del server");
        });

        return res.status(200).json({ status: 'ok', message: 'Registrazione effettuata con successo!' });
    
    } catch (err) {
        if (connection) await connection.rollback();

        console.error('Errore nella registrazione:', err);
        return res.status(500).json({ status: 'error', message: 'Errore interno del server.' });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Funzione per generare una stringa casuale esadecimale di una data lunghezza.
 * Utilizzata per generare l'authCode per la gestione delle sessioni.
 * @param {number} length Lunghezza desiderata della stringa casuale.
 * @returns {string} La stringa casuale generata.
 */
function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Endpoint per l'autenticazione di un utente (login).
 * Verifica le credenziali dell'utente (email e password) con quelle nel database.
 * In caso di successo, genera un authCode univoco e lo memorizza nella sessione dell'utente.
 * @param {object} req Oggetto della richiesta Express contenente email e password nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/login-api", async (req, res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let connection;
    try{
        connection = await getConnection();
        const checkQuery = 'SELECT id, password FROM utenti WHERE email = ?';
        const utenti = await connection.query(checkQuery, [email]);

        if (utenti.length === 0) {
            return res.status(422).json({ status: 'error', message: 'Non è presente nessun utente associato a questa email!' });
        }
        const checkResult = utenti[0];

        // Confronta la password hashata con quella inserita
        const isMatch = await bcrypt.compare(password, checkResult.password);
        if (!isMatch) {
            return res.status(422).json({ status: 'error', message: 'Password errata, riprovare!' });
        }

        const authCode = generateRandomString(10);
        sessions.set(checkResult.id, {
            authCode: authCode,
            expiresAt: Date.now() + 20 * 60 * 1000 // 20 minuti
        });

        console.log(sessions);
        res.status(200).json({
            status: 'ok', 
            message: {
                authCode: authCode,
                id: checkResult.id
            }
        });
    }
    catch (err){
        console.error('Errore nel login:', err);
        return res.status(500).json({ status: 'error', message: 'Errore interno del server.' });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per la validazione del codice di autenticazione (authCode) di un utente.
 * Utilizzato per verificare se una sessione utente è ancora valida.
 * @param {object} req Oggetto della richiesta Express contenente l'ID utente e l'authCode nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/valida-authCode", async(req, res)=>{
    const authData = req.body;
    const data = sessions.get(authData.id);
    if (data){
        if(data.authCode === authData.authCode){
            if (Date.now() < data.expiresAt)
                return res.status(200).json({ status: 'ok', message: 'autenticato'});

            sessions.delete(authData.id)
        }
    }
    return res.status(422).json({ status: 'error', message: 'errore di autenticazione'});
});

/**
 * Endpoint per recuperare i dati del conto e le informazioni personali di un utente.
 * @param {object} req Oggetto della richiesta Express con l'ID dell'utente come parametro.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.get("/dati-conto-api/:id", async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await getConnection();

        // 1. Recupero dati utente
        let query = "SELECT email, nome, cognome, cod_fisc, citta_res, indirizzo_res, numero_tel, carta_id, occupazione, cap FROM utenti WHERE id = ?";
        let result = await connection.query(query, [id]);
        
        if(result.length === 0){
            return res.status(422).json({ status: 'error', message: 'Non è presente nessun utente associato a questo id!' });
        }

        let utente = result[0];
        const data = {
            email: utente.email,
            nome: utente.nome,
            cognome: utente.cognome,
            cod_fisc: utente.cod_fisc,
            citta_res: utente.citta_res,
            indirizzo_res: utente.indirizzo_res,
            numero_tel: utente.numero_tel,
            carta_id: utente.carta_id,
            occupazione: utente.occupazione,
            cap: utente.cap
        }

        // 2. Recupero dati conto
        query = "SELECT id as conto_id, iban, carta, scad_carta, limite_spesa, stato_carta FROM conti WHERE utente = ?";
        result = await connection.query(query, [id]);

        if(result.length === 0){
            return res.status(422).json({ status: 'error', message: 'Non è presente nessun utente associato a questo id!' });
        }

        utente = result[0];
        data["conto_id"] = utente.conto_id;
        data["iban"] = utente.iban;
        data["carta_num"] = utente.carta;
        data["scad_carta"] = utente.scad_carta;
        data["limite_spesa"] = utente.limite_spesa;
        data["stato_carta"] = utente.stato_carta;

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: "Errore nel recupero dei dati del conto" });
    }finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per recuperare la cronologia delle transazioni di un utente.
 * @param {object} req Oggetto della richiesta Express con l'ID dell'utente come parametro.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.get("/dati-transazioni-api/:id", async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await getConnection();

        let query = "SELECT id, importo, data, mittente, destinatario, descrizione, carta_flag FROM transazioni WHERE utente = ?";
        let result = await connection.query(query, [id]);
        
        const data = {
            transazioni: result.map(t =>{
                return {
                    id: t.id,
                    importo: parseFloat(t.importo),
                    data: `${t.data.getFullYear()}-${String(t.data.getMonth() + 1).padStart(2, '0')}-${String(t.data.getDate()).padStart(2, '0')}`, // risolve problema del fuso orario
                    mittente: t.mittente,
                    destinatario: t.destinatario,
                    descrizione: t.descrizione,
                    carta_flag: t.carta_flag
                }
            })
        };

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({status: 'error', message: "Errore nel recupero delle transazioni" });
    }finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per aggiornare lo stato della carta di un utente (attiva/disattiva).
 * @param {object} req Oggetto della richiesta Express con l'ID dell'utente come parametro nell'URL.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/stato-carta-api/:userId", async(req, res)=>{
    const {userId} = req.params;
    let connection;
    try{
        connection = await getConnection();
        let query = "SELECT stato_carta FROM conti WHERE utente= ?";
        let result = await connection.query(query, [userId]);
        
        if(result.length === 0){
            return res.status(422).json({ status: 'error', message: 'Non è presente nessun utente associato a questo id!' });
        }

        const utente = result[0];
        query = "UPDATE conti SET stato_carta = ? WHERE utente= ?";
        await connection.query(query, [!utente.stato_carta, userId]);
        
        res.status(200).json({ status: 'ok', message: 'Carta aggiornata' })
    }catch (error){
        console.error(error);
        res.status(500).json({ message: "Errore nell'aggiornamento della carta" });
    }finally{
        if (connection) await connection.end();
    }

});

/**
 * Endpoint per aggiornare il limite di spesa della carta di un utente.
 * Riceve l'ID dell'utente come parametro nell'URL e il nuovo limite di spesa nel corpo della richiesta.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri e il limite nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/limite-carta-api/:userId", async(req, res)=>{
    console.log(req.body);
    const {userId} = req.params;
    const {limite_valore} = req.body;
    let connection;
    try{
        connection = await getConnection();
        let query = "SELECT * FROM conti WHERE utente= ?";
        let result = await connection.query(query, [userId]);
        
        if(result.length === 0){
            return res.status(422).json({ status: 'error', message: 'Non è presente nessun utente associato a questo id!' });
        }

        const utente = result[0];
        query = "UPDATE conti SET limite_spesa = ? WHERE utente= ?";
        await connection.query(query, [limite_valore, userId]);

        res.status(200).json({ status: 'ok', message: 'Carta aggiornata' })
    }catch (error){
        console.error(error);
        res.status(500).json({ message:  "Errore nell'aggiornamento della carta" });
    }finally{
        if (connection) await connection.end();
    }

});

/**
 * Endpoint per consentire a un utente di aggiornare la propria password.
 * Richiede l'ID dell'utente come parametro nell'URL e la vecchia e la nuova password nel corpo della richiesta.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri e le password nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/nuova-password-api/:id", async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { vecchia_password, nuova_password } = req.body;

        if (!vecchia_password || !nuova_password) {
            return res.status(400).json({ status: "error", message: "Entrambe le password sono obbligatorie" });
        }

        connection = await getConnection();
        let query = "SELECT * FROM utenti WHERE id = ?";
        let result = await connection.query(query, [id]);

        if(result.length === 0) {
            return res.status(401).json({ status: "error", message: "Non è presente alcun utente associato a questo id!"});
        } // 401 Unauthorized

        const passwordDB = result[0].password;

        const match = await bcrypt.compare(vecchia_password, passwordDB);
        if (!match) {
            return res.status(422).json({ status: "error", message: "Password attuale errata" });
        } // 422 Unprocessable Entity: i dati inviati dal client sono validi dal punto di vista sintattico, ma non soddisfano alcune condizioni logiche

        if (vecchia_password === nuova_password) {
            return res.status(422).json({ status: "error", message: "La nuova password deve essere diversa da quella attuale." });
        } 

        const hashedNewPassword = await bcrypt.hash(nuova_password, saltRounds);

        query = "UPDATE utenti SET password = ? WHERE id = ?";
        await connection.query(query, [hashedNewPassword, id]);

        return res.status(200).json({ status: "ok", message: "Password aggiornata correttamente" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore interno del server" });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per consentire a un utente di effettuare il logout.
 * Elimina la sessione dell'utente dalla mappa 'sessions'.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri.
 * @param {object} res Oggetto della risposta Express.
 * @returns {void}
 */
app.post("/logout-api/:userId", (req, res)=>{
    const {userId} = req.params;
    
    sessions.delete(Number(userId));
    res.status(200).json({status: "ok", message: "Logout eseguito con successo"});
});

/**
 * Endpoint per recuperare il file PDF della carta d'identità di un utente.
 * Richiede l'ID dell'utente come parametro nell'URL.
 * Il file viene letto dalla directory del server e inviato come base64 nella risposta JSON.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.get("/cartaId-api/:userId", async(req, res)=>{
    const { userId } = req.params;
    let connection;
    try {
        connection = await getConnection();

        let query = "SELECT cod_fisc FROM utenti WHERE id= ?";
        const results = await connection.query(query, [userId])

        if(results.length === 0)
            return res.status(422).json({ status: "error", message: "Non è presente alcun utente associato a questo id!" });

        const utente = results[0];
        
        const filePath = path.join("./database/users/carteID", `${utente.cod_fisc}.pdf`);
        const file = await fs.readFile(filePath, {encoding: "base64"});

        return res.status(200).json({document_file: file});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore interno del server" });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per processare un bonifico bancario.
 * Riceve l'ID dell'utente mittente come parametro nell'URL e i dettagli del bonifico nel corpo della richiesta.
 * Gestisce sia bonifici interni (tra utenti della stessa piattaforma) che esterni.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri e i dettagli del bonifico nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/bonifico/:id", async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { nomeDestinatario, ibanDestinatario, importo, data, descrizione } = req.body;

        connection = await getConnection();

        // Verifico saldo utente mittente
        let query = "SELECT SUM(importo) AS saldo FROM transazioni WHERE utente = ?";
        let result = await connection.query(query, [id]);

        const saldoAttuale = result[0].saldo || 0;

        if (saldoAttuale < importo) {
            return res.status(422).json({ status: "error", message: "Saldo insufficiente." });
        }

        await connection.beginTransaction();

        // Verifica se l'IBAN è interno
        query = "SELECT utente FROM conti WHERE iban = ?";
        result = await connection.query(query, [ibanDestinatario]);

        if (result.length > 0) {
            // ========================= BONIFICO INTERNO =========================

            const idDestinatario = result[0].utente;

            let mittenteResult = await connection.query("SELECT nome, cognome FROM utenti WHERE id = ?", [id]);
            const nomeMittente = mittenteResult[0].nome;
            const cognomeMittente = mittenteResult[0].cognome;
            const mittente = nomeMittente + " " + cognomeMittente;

            // Transazione in uscita (mittente)
            query = "INSERT INTO transazioni (utente, importo, data, destinatario, descrizione) VALUES (?, ?, ?, ?, ?)";
            await connection.query(query, [id, -importo, data, nomeDestinatario, descrizione]);

            // Transazione in entrata (destinatario)
            query = "INSERT INTO transazioni (utente, importo, data, mittente, descrizione) VALUES (?, ?, ?, ?, ?)";
            await connection.query(query, [idDestinatario, importo, data, mittente, descrizione]);

            await connection.commit();

            return res.json({ status: "ok", message: "Bonifico interno effettuato con successo." });

        } else {
            // ========================= BONIFICO ESTERNO =========================
            query = "INSERT INTO transazioni (utente, importo, data, destinatario, descrizione) VALUES (?, ?, ?, ?, ?)";
            await connection.query(query, [id, -importo, data, nomeDestinatario, descrizione]);

            await connection.commit();

            return res.json({ status: "ok", message: "Bonifico esterno effettuato con successo." });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore nel processamento del bonifico." });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per validare l'esistenza di un utente tramite la sua email, escludendo l'utente corrente.
 * Utilizzato per la funzionalità di invio denaro per verificare che l'email del destinatario sia valida.
 * @param {object} req Oggetto della richiesta Express con l'ID dell'utente corrente nei parametri e l'email del destinatario nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/valid-utente-api/:id", async (req, res)=>{
    const {email} = req.body;
    const id = req.params.id
    let connection;
    try {
        connection = await getConnection();
        
        const query = "SELECT id FROM utenti WHERE email = ?";
        const result = await connection.query(query, [email]);

        if(result.length === 0)
            return res.status(422).json({ status: "error", message: "Errore, l'utente associato all'email è inesistente!" });

        const utente = result[0];

        if(utente.id == id) // non si puo inviare denaro a se stessi
            return res.status(422).json({ status: "error", message: "Errore, inserisci un'email valida!" });

        return res.status(200).json({ status: "ok", message: "Utente trovato." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore del server." });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per recuperare il nome e il cognome di un utente tramite la sua email.
 * Utilizzato per visualizzare il nome del destinatario durante l'invio di denaro.
 * @param {object} req Oggetto della richiesta Express con l'email nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/nome-utente-api", async(req, res)=>{
    const {email} = req.body;
    let connection;
    try {
        connection = await getConnection();
        
        const query = "SELECT nome, cognome FROM utenti WHERE email = ?";
        const result = await connection.query(query, [email]);

        if(result.length === 0)
            return res.status(422).json({ status: "error", message: "Errore, l'utente associato all'email è inesistente!" });

        const utente = result[0];

        return res.status(200).json({ status: "ok", message: {
            nome: utente.nome,
            cognome: utente.cognome}});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore del server." });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Endpoint per processare l'invio di denaro da un utente a un altro tramite email.
 * Riceve l'ID dell'utente mittente come parametro nell'URL e l'email del destinatario, l'importo e la descrizione nel body.
 * @param {object} req Oggetto della richiesta Express con l'ID utente nei parametri e i dettagli del trasferimento nel body.
 * @param {object} res Oggetto della risposta Express.
 * @returns {Promise<void>}
 */
app.post("/invia-denaro-api/:id", async(req, res)=>{
    const {email_dest, importo, descrizione} = req.body;
    const id = req.params.id
    let connection;
    try {
        connection = await getConnection();
        let query = "SELECT id, nome, cognome FROM utenti WHERE email = ?";
        let result = await connection.query(query, [email_dest]);

        if(result.length === 0)
            return res.status(422).json({ status: "error", message: "Errore, l'utente associato all'email è inesistente!" });

        const id_dest = result[0].id;
        const nome_dest = result[0].nome;
        const cognome_dest = result[0].cognome;
        const destinatario = `${nome_dest} ${cognome_dest}`;

        query = "SELECT nome, cognome FROM utenti WHERE id = ?";
        result = await connection.query(query, [id]);

        if(result.length === 0)
            return res.status(422).json({ status: "error", message: "Errore, l'utente associato all'email è inesistente!" });

        const nome_mitt = result[0].nome;
        const cognome_mitt = result[0].cognome;
        const mittente = `${nome_mitt} ${cognome_mitt}`;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // mesi da 0 a 11
        const day = String(today.getDate()).padStart(2, '0');
        const data = `${year}-${month}-${day}`;

        query = "INSERT INTO transazioni(utente, importo, data, destinatario, descrizione) VALUES (?, ?, ?, ?, ?)";
        await connection.query(query, [id, -importo, data, destinatario, descrizione]);

        query = "INSERT INTO transazioni(utente, importo, data, mittente, descrizione) VALUES (?, ?, ?, ?, ?)";
        await connection.query(query, [id_dest, importo, data, mittente, descrizione]);

        connection.commit();

        res.status(200).json({ status: "error", message: "Operazione avvennuta con successo!"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore del server." });
    } finally {
        if (connection) await connection.end();
    }
});

app.post("/assistenza-api", async(req, res)=>{
    const {oggetto, corpo, mittente} = req.body;
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: `ASSISTENZA ${mittente}`,
            html: `<h1>Richiesta di assistenza</h1>
                    <h2>Mittente: ${mittente}</h2>
                    <h2>Oggetto: "${oggetto}"</h2>
                    <p style="font-size: 1.2rem;">${corpo}</p>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) 
                throw new Error("Errore del server");
        });
        return res.status(200).json({status: "ok", message: "Messaggio inviato con successo!"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Errore del server." });
    }
});

// Gestione degli Errori (Middleware per la Pagina 404)
app.use((req, res, next) => {
    res.status(404)
    res.sendFile(path.join(html_path, 'not-found.html'))
});

// Avvia il server Express e lo mette in ascolto sulla porta definita
app.listen(port, ()=>{
    console.log(`Server avviato sulla porta ${port}`)
});

