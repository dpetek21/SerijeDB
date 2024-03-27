const TMDBklijent = require("./klijentTMDB.js");
const jwt = require("../moduli/jwt");

class RestTMDB {
	constructor(api_kljuc,tajniKljucJWT) {
		this.tmdbKlijent = new TMDBklijent(api_kljuc);
		this.tajniKljucJWT = tajniKljucJWT;
	}
	async dohvatiSerije(stranica, kljucnaRijec = "") {
		let putanja =
			url + "/tmdb/serije?stranica=" + stranica + "&trazi=" + kljucnaRijec;
		console.log(putanja);
		let odgovor = await fetch(putanja);
		let podaci = await odgovor.text();
		let serije = JSON.parse(podaci);
		console.log(filmovi);
		return serije;
	}
	getZanr(zahtjev, odgovor) {
		console.log(this);
		this.tmdbKlijent
			.dohvatiZanrove()
			.then((zanrovi) => {
				odgovor.type("application/json");
				odgovor.send(zanrovi);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}
	getSerija(zahtjev, odgovor) {
		if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
			odgovor.status(401);
			odgovor.json({ greska: "potrebna prijava" });
		} else {
			let id = zahtjev.query.id;
			this.tmdbKlijent
				.dohvatiSeriju(id)
				.then((serija) => {
					odgovor.type("application/json");
					odgovor.send(serija);
				})
				.catch((greska) => {
					odgovor.json(greska);
				});
		}
	}

	getSerije(zahtjev, odgovor) {
		if (!jwt.provjeriToken(zahtjev,this.tajniKljucJWT)) {
			odgovor.status(401);
			odgovor.json({ greska: "potrebna prijava" });
		} else {
			console.log(this);
			odgovor.type("application/json");
			let stranica = zahtjev.query.stranica;
			let trazi = zahtjev.query.trazi;

			if (stranica == null || trazi == null) {
				odgovor.status("417");
				odgovor.send({ greska: "neocekivani podaci" });
				return;
			}

			this.tmdbKlijent
				.pretraziSerijePoNazivu(trazi, stranica)
				.then((serije) => {
					odgovor.send(serije);
				})
				.catch((greska) => {
					odgovor.json(greska);
				});
		}
	}
}

module.exports = RestTMDB;
