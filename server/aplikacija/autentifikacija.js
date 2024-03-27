const mail = require("./moduli/mail.js");
const kodovi = require("./moduli/kodovi.js");
const Url = require("../url.js");
const urlInstanca = new Url();
const portRest = urlInstanca.dajPort();
class Autentifikacija {
	async dodajKorisnika(korisnik) {
		let tijelo = {
			ime: korisnik.ime,
			prezime: korisnik.prezime,
			lozinka: kodovi.kreirajSHA256(korisnik.lozinka, "solsol"),
			email: korisnik.email,
			korime: korisnik.korime,
			drzava: korisnik.drzava,
			adresa: korisnik.adresa,
			interesi: korisnik.interesi,
			uloga:korisnik.uloga,
		};

		let zaglavlje = new Headers();
		zaglavlje.set("Content-Type", "application/json");

		let parametri = {
			method: "POST",
			body: JSON.stringify(tijelo),
			headers: zaglavlje,
		};
		let odgovor = await fetch(
			urlInstanca.dajUrl()+ "/baza/korisnici",
			parametri
		);
		if (odgovor.status == 201) {
			console.log("Korisnik ubačen na servisu");
			return 201;
		} else {
			console.log(odgovor.status);
			console.log(await odgovor.text());
			return odgovor.status;
		}
	}

	async prijaviKorisnika(korime, lozinka) {
		console.log("Prijava: " + korime + " " + lozinka);
		lozinka = kodovi.kreirajSHA256(lozinka, "solsol");
		let tijelo = {
			lozinka: lozinka,
		};
		let zaglavlje = new Headers();
		zaglavlje.set("Content-Type", "application/json");

		let parametri = {
			method: "POST",
			body: JSON.stringify(tijelo),
			credentials: "include",
			headers: zaglavlje,
		};
		let odgovor = await fetch(
			"http://localhost:" + portRest + "/baza/korisnici/" + korime + "/prijava",
			parametri
		);
		if (odgovor.status == 201) {
			return await odgovor.text();
		} else {
			return false;
		}
	}
}

module.exports = Autentifikacija;
