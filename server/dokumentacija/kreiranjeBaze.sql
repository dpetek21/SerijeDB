-- Creator:       MySQL Workbench 8.0.32/ExportSQLite Plugin 0.1.0
-- Author:        Unknown
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2023-11-20 16:38
-- Created:       2023-10-22 06:08

BEGIN;
CREATE TABLE "uloge"(
  "id_uloge" INTEGER PRIMARY KEY NOT NULL,
  "ime_uloge" VARCHAR(50) NOT NULL,
  "privilegija_uloge" INTEGER NOT NULL
);
CREATE TABLE "serije"(
  "tmdb_id_serije" INTEGER PRIMARY KEY NOT NULL,
  "naziv" VARCHAR(50) NOT NULL,
  "opis" TEXT NOT NULL,
  "broj_sezona" INTEGER NOT NULL,
  "broj_epizoda" INTEGER NOT NULL,
  "popularnost" INTEGER NOT NULL,
  "poster_path" VARCHAR(150) NOT NULL,
  "homepage" VARCHAR(100) NOT NULL
);
CREATE TABLE "sezone"(
  "tmdb_id_sezone" INTEGER NOT NULL,
  "tmdb_id_serije" INTEGER NOT NULL,
  "naziv" VARCHAR(50) NOT NULL,
  "opis" TEXT NOT NULL,
  "poster_path" VARCHAR(50) NOT NULL,
  "broj_sezone" INTEGER NOT NULL,
  "broj_epizoda" INTEGER NOT NULL,
  PRIMARY KEY("tmdb_id_sezone","tmdb_id_serije"),
  CONSTRAINT "fk_sezone_serije1"
    FOREIGN KEY("tmdb_id_serije")
    REFERENCES "serije"("tmdb_id_serije")
);
CREATE INDEX "sezone.fk_sezone_serije1_idx" ON "sezone" ("tmdb_id_serije");
CREATE TABLE "korisnici"(
  "id_korisnika" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "e-mail" VARCHAR(100) NOT NULL,
  "korisnicko_ime" VARCHAR(50) NOT NULL,
  "lozinka" VARCHAR(100) NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "uloge_id_uloge" INTEGER NOT NULL,
  "drzava" VARCHAR(50),
  "adresa" VARCHAR(50),
  "interesi" TEXT,
  CONSTRAINT "e-mail_UNIQUE"
    UNIQUE("e-mail"),
  CONSTRAINT "korisnicko_ime_UNIQUE"
    UNIQUE("korisnicko_ime"),
  CONSTRAINT "fk_korisnici_uloge"
    FOREIGN KEY("uloge_id_uloge")
    REFERENCES "uloge"("id_uloge")
);
CREATE INDEX "korisnici.fk_korisnici_uloge_idx" ON "korisnici" ("uloge_id_uloge");
CREATE TABLE "favoriti_korisnika"(
  "id_serije" INTEGER NOT NULL,
  "id_korisnika" INTEGER NOT NULL,
  PRIMARY KEY("id_serije","id_korisnika"),
  CONSTRAINT "fk_favoriti_korisnika_serije1"
    FOREIGN KEY("id_serije")
    REFERENCES "serije"("tmdb_id_serije"),
  CONSTRAINT "fk_favoriti_korisnika_korisnici1"
    FOREIGN KEY("id_korisnika")
    REFERENCES "korisnici"("id_korisnika")
);
CREATE INDEX "favoriti_korisnika.fk_favoriti_korisnika_korisnici1_idx" ON "favoriti_korisnika" ("id_korisnika");
CREATE TABLE "dnevnik"(
  "id_dnevnik" INTEGER NOT NULL,
  "datum_i_vrijeme" DATETIME NOT NULL,
  "korisnicko_ime" VARCHAR(100) NOT NULL,
  "vrsta_zahtjeva" TEXT NOT NULL CHECK("vrsta_zahtjeva" IN('GET', 'POST', 'PUT', 'DELETE')),
  "trazeni_resurs" TEXT NOT NULL,
  "tijelo" TEXT,
  PRIMARY KEY("id_dnevnik","korisnicko_ime"),
  CONSTRAINT "fk_dnevnik_korisnici1"
    FOREIGN KEY("korisnicko_ime")
    REFERENCES "korisnici"("korisnicko_ime")
);
CREATE INDEX "dnevnik.fk_dnevnik_korisnici1_idx" ON "dnevnik" ("korisnicko_ime");
COMMIT;
