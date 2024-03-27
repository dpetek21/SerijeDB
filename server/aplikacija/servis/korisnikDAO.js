const e = require("express");
const Baza = require("./baza.js");

class KorisnikDAO {

	constructor() {
		this.baza = new Baza("RWA2023dpetek21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnici;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnici WHERE korisnicko_ime=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		console.log(podaci);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else 
			return null;
	}

	dodaj = async function (korisnik) {
		console.log(korisnik)
		let korisnicizaprovjeru = await this.dajSve();
		let zastava =0;
		korisnicizaprovjeru.forEach(element => {
			if(element["e-mail"]==korisnik.email||element["korisnicko_ime"]==korisnik.korime){
				zastava=1;
			}
		});
		if(zastava==0){
			this.baza.spojiSeNaBazu();
			let sql = `INSERT INTO korisnici (ime,prezime,lozinka,\`e-mail\`,korisnicko_ime,uloge_id_uloge,drzava,adresa,interesi) VALUES (?,?,?,?,?,?,?,?,?)`;
        	let podaci = [korisnik.ime,korisnik.prezime,
        	              korisnik.lozinka,korisnik.email,korisnik.korime,korisnik.uloga,
					      korisnik.drzava,korisnik.adresa,korisnik.interesi];
			await this.baza.izvrsiUpit(sql,podaci);
			this.baza.zatvoriVezu();
			return true;
		}else {
			return false;
		}
	}

	obrisi = async function (korime) {
		let korisnicizaprovjeru = await this.dajSve();
		let zastava =0;
		korisnicizaprovjeru.forEach(element => {
			if(element["korisnicko_ime"]==korime){
				zastava=1;
			}
		});
		if(zastava){
			this.baza.spojiSeNaBazu();
			let sql = "DELETE FROM korisnici WHERE korisnicko_ime=?";
			await this.baza.izvrsiUpit(sql,[korime]);
			this.baza.zatvoriVezu();
			return true;
		}else{
			return false;
		}
		
	}

	azuriraj = async function (korime, korisnik) {
		this.baza.spojiSeNaBazu();
		if(korisnik.lozinka){
			var sql = `UPDATE korisnici SET ime=?, prezime=?, lozinka=?, drzava=?, adresa=?, interesi=?  WHERE korisnicko_ime=?`;
        	var podaci = [korisnik.ime,korisnik.prezime,
                      	korisnik.lozinka,korisnik.drzava,korisnik.adresa,korisnik.interesi,korime];
		}else{
			var sql = `UPDATE korisnici SET ime=?, prezime=?, drzava=?, adresa=?, interesi=?  WHERE korisnicko_ime=?`;
        	var podaci = [korisnik.ime,korisnik.prezime,
                      	korisnik.drzava,korisnik.adresa,korisnik.interesi,korime];
		}
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();
		return true;
	}
}

module.exports = KorisnikDAO;
