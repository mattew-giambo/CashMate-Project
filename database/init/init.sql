DROP DATABASE IF EXISTS cashmate;
CREATE DATABASE cashmate;
USE cashmate;
CREATE TABLE utenti(
    id int AUTO_INCREMENT,
    email varchar(100) NOT NULL,
    password varchar(60) NOT NULL,
    nome varchar(30) NOT NULL,
    cognome varchar(30) NOT NULL,
    cod_fisc varchar(16) NOT NULL,
    data_nasc DATE NOT NULL, -- formato della data YYYY-MM-DD
    citta_res varchar(30) NOT NULL,
    indirizzo_res varchar(30) NOT NULL,
    numero_tel varchar(20) NOT NULL,
    carta_id varchar(20) NOT NULL,
    occupazione varchar(30) NOT NULL,
    cap varchar(5) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(email),
    UNIQUE(cod_fisc),
    UNIQUE(numero_tel),
    UNIQUE(carta_id)
);

CREATE TABLE transazioni (
    id int AUTO_INCREMENT,
    utente int NOT NULL,
    importo DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    mittente VARCHAR(255) DEFAULT NULL,
    destinatario VARCHAR(255) DEFAULT NULL,
    descrizione varchar(50) DEFAULT NULL,
    carta_flag BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    FOREIGN KEY (utente) REFERENCES utenti(id)
);

CREATE TABLE conti(
    id varchar(10),
    iban varchar(27) NOT NULL,
    carta varchar(16) NOT NULL,
    utente int NOT NULL,
    scad_carta DATE NOT NULL,
    limite_spesa int NOT NULL DEFAULT 5000,
    stato_carta BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE (iban),
    UNIQUE (carta),
    FOREIGN KEY (utente) REFERENCES utenti(id),
    CHECK (limite_spesa >= 0 AND limite_spesa <= 5000)
)
