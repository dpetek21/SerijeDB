const e = require("express");
const Baza = require("./baza.js");

class SerijeDAO {

	constructor() {
		this.baza = new Baza("RWA2023dpetek21.sqlite");
	}

	dajSveSerije = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serije;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}
    dajSveSezone = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezone;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}
    dajSveFavorite = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM favoriti_korisnika;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}
    dajSveFavoriteZaKorisnika = async function (idkorisnika) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM favoriti_korisnika WHERE id_korisnika=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [idkorisnika]);
		this.baza.zatvoriVezu();
		return podaci;
	}
    dajSveFavoritSerijeZaKorisnika = async function (idkorisnika) {
		let favoriti = await this.dajSveFavoriteZaKorisnika(idkorisnika);
        let podaci=[];
        let i =0;
            for(let f of favoriti){
               podaci[i]= await this.dajSerijuSSezonama(f.id_serije);
               i++;
            }
		return podaci;
	}

	dajSeriju = async function (idserije) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serije WHERE tmdb_id_serije=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [idserije]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else 
			return null;
	}
    dajSerijuSSezonama = async function (idserije) {
		let serija = await this.dajSeriju(idserije);
        let sezone = await this.dajSezoneZaSeriju(idserije);
        serija.sezone = sezone;
        return serija;
	}
    dajSezonu = async function (idsezone) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezone WHERE tmdb_id_sezone=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [idsezone]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else
			return null;
	}
    dajSezoneZaSeriju = async function (idserije) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezone WHERE tmdb_id_serije=? ORDER BY broj_sezone ASC;"
		var podaci = await this.baza.izvrsiUpit(sql, [idserije]);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dodajSeriju = async function (serija) {
		console.log(serija);
		let postojiserija = await this.dajSeriju(serija.id);
		let zastava =0;
		if(postojiserija!=null){
            zastava=1;
        }
		if(zastava==0){
			this.baza.spojiSeNaBazu();
            serija = this.makniNullSerija(serija);
			let sql = `INSERT INTO serije (tmdb_id_serije,naziv,opis,broj_sezona,broj_epizoda,popularnost,poster_path,homepage) VALUES (?,?,?,?,?,?,?,?)`;
        	let podaci = [serija.id,serija.name,
                            serija.overview,serija.number_of_seasons,serija.number_of_episodes,Math.round(serija.popularity),
                            serija.poster_path,serija.homepage];
			await this.baza.izvrsiUpit(sql,podaci);
            this.baza.zatvoriVezu();
                for (let s of serija.seasons){
                    await this.dodajSezonu(s,serija.id);
                }
			return true;
		}else {
			return false;
		}
	}
    makniNullSerija(serija){
        if(serija.name==null){
            serija.name="";
        }
        if(serija.overview==null){
            serija.overview="";
        }
        if(serija.number_of_seasons==null){
            serija.number_of_seasons=0;
        }
        if(serija.number_of_episodes==null){
            serija.number_of_episodes=0;
        }
        if(serija.popularity==null){
            serija.popularity=0;
        }
        if(serija.poster_path==null){
            serija.poster_path="";
        }
        if(serija.homepage==null){
            serija.homepage="";
        }
        return serija;
    }
    dodajSezonu = async function (sezona,idserije) {
		console.log(sezona);
		let zastava =0;
		this.baza.spojiSeNaBazu();
        sezona = this.makniNullSezona(sezona);
		let sql = `INSERT INTO sezone (tmdb_id_sezone,tmdb_id_serije,naziv,opis,poster_path, broj_sezone,broj_epizoda) VALUES (?,?,?,?,?,?,?)`;
    	let podaci = [sezona.id,idserije,sezona.name,
                        sezona.overview,sezona.poster_path, sezona.season_number,sezona.episode_count];
        await this.baza.izvrsiUpit(sql,podaci);
        this.baza.zatvoriVezu();
		return true;
	}
    makniNullSezona(sezona){
        if(sezona.name==null){
            sezona.name="";
        }
        if(sezona.overview==null){
            sezona.overview="";
        }
        if(sezona.poster_path==null){
            sezona.poster_path="";
        }
        if(sezona.season_number==null){
            sezona.season_number=0;
        }
        if(sezona.episode_count==null){
            sezona.episode_count=0;
        }
        return sezona;
    }
    dodajFavorit = async function (idkorisnika,idserije) {
		let favoriti = await this.dajSveFavoriteZaKorisnika(idkorisnika);
		let zastava =0;
		favoriti.forEach(element => {
			if(element["id_serije"]==idserije){
				zastava=1;
			}
		});
		if(!zastava){
			this.baza.spojiSeNaBazu();
			let sql = "INSERT INTO favoriti_korisnika (id_serije,id_korisnika) VALUES (?,?)";
			await this.baza.izvrsiUpit(sql,[idserije,idkorisnika]);
			this.baza.zatvoriVezu();
			return true;
		}else{
			return false;
		}
	}
    dajFavoritSeriju = async function (idkorisnika,idserije) {
		let favoriti = await this.dajSveFavoriteZaKorisnika(idkorisnika);
		let zastava =0;
		favoriti.forEach(element => {
			if(element["id_serije"]==idserije){
				zastava=1;
			}
		});
		if(zastava){
			return await this.dajSerijuSSezonama(idserije);;
		}else{
			return false;
		}
	}

    obrisiSveFavoriteKorisnika = async function (idkorisnika) {
		let favoriti = await this.dajSveFavoriteZaKorisnika(idkorisnika);
		this.baza.spojiSeNaBazu();
		let sql = "DELETE FROM favoriti_korisnika WHERE id_korisnika=?";
		await this.baza.izvrsiUpit(sql,[idkorisnika]);
		this.baza.zatvoriVezu();
		return true;
	}
	obrisiFavorit = async function (idkorisnika,idserije) {
		let favoriti = await this.dajSveFavoriteZaKorisnika(idkorisnika);
		let zastava =0;
		favoriti.forEach(element => {
			if(element["id_serije"]==idserije){
				zastava=1;
			}
		});
		if(zastava){
			this.baza.spojiSeNaBazu();
			let sql = "DELETE FROM favoriti_korisnika WHERE id_serije=? AND id_korisnika=?";
			await this.baza.izvrsiUpit(sql,[idserije,idkorisnika]);
			this.baza.zatvoriVezu();
			return true;
		}else{
			return false;
		}
	}
}

module.exports = SerijeDAO;
