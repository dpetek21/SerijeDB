const e = require("express");
const Baza = require("./baza.js");

class DnevnikDAO {

	constructor() {
		this.baza = new Baza("RWA2023dpetek21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM dnevnik;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}
	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM dnevnik WHERE korisnicko_ime=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		console.log(podaci);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else
			return null;
	}

	dodaj = async function (zapis) {
		console.log(zapis)
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO dnevnik (datum_i_vrijeme,korisnicko_ime,vrsta_zahtjeva,trazeni_resurs,tijelo) VALUES (?,?,?,?,?)`;
    	let podaci = [korisnik.ime,korisnik.prezime,
    	              korisnik.lozinka,korisnik.email,korisnik.korime,korisnik.uloga,
				      korisnik.drzava,korisnik.adresa,korisnik.interesi];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();
		return true;
	}

}

module.exports = DnevnikDAO;
