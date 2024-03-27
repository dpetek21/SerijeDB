import express from "express";
import kolacici from "cookie-parser";
import sesija from "express-session";
import konfiguracijaInstanca from "./konfiguracija.js";
import Url from "./url.js";
import restKorisnik from "./aplikacija/servis/restKorisnik.js";
import RestTMDB from "./aplikacija/servis/restTMDB.js";
import restDnevnik from "./aplikacija/servis/restDnevnik.js";
import restSerije from "./aplikacija/servis/restSerije.js";
import cors from 'cors';
//import portovi from "/var/www/RWA/2023/portovi.js";
//const port = portovi.dpetek21;
var urlInstanca = new Url();
//urlInstanca.postaviUrl("http://spider.foi.hr",portovi.dpetek21)
//urlInstanca.postaviUrl("http://localhost","12000");
const port = urlInstanca.dajPort();
const server = express();

konfiguracijaInstanca
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		console.log(greska);
		if (process.argv.length == 2) {
			console.error("Molim unesite naziv datoteke!");
		} else {
			if(greska.path!==undefined){
				console.error("Naziv datoteke nije dobar: " + greska.path);
			}
		}
	});

function pokreniServer() {
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());
	const corsOpcije={
		origin: ['http://localhost:4200'],
  		optionsSuccessStatus: 200,
		credentials: true,
		exposedHeaders: ['Authorization'],
	};
	server.use(cors(corsOpcije));
	//server.use(cors());
	server.use(kolacici());
	server.use(
		sesija({
			secret: konfiguracijaInstanca.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);
	pripremiPutanjeKorisnik();
	pripremiPutanjeAngular();
	pripremiPutanjeTMDB();
	pripremiPutanjeSerije();
	pripremiPutanjeDnevnik();
	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		odgovor.json({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}
function pripremiPutanjeSerije(){
	server.get("/baza/favoriti", restSerije.getFavoriti);
	server.post("/baza/favoriti", restSerije.postFavoriti);
	server.put("/baza/favoriti", restSerije.putFavoriti);
	server.delete("/baza/favoriti", restSerije.deleteFavoriti);

	server.get("/baza/favoriti/:id", restSerije.getFavorit);
	server.post("/baza/favoriti/:id", restSerije.postFavorit);
	server.put("/baza/favoriti/:id", restSerije.putFavorit);
	server.delete("/baza/favoriti/:id", restSerije.deleteFavorit);
}
function pripremiPutanjeAngular() {
	server.use("/", express.static("./angular"));
	server.use("/dokumentacija", express.static("./angular"));
	server.use("/prijava", express.static("./angular"));
	server.use("/odjava", express.static("./angular"));
	server.use("/registracija", express.static("./angular"));
	server.use("/korisnici", express.static("./angular"));
	server.use("/dnevnik", express.static("./angular"));
	server.use("/profil", express.static("./angular"));
	server.use("/favoriti", express.static("./angular"));
	server.use("/favoritdetalji/:id", express.static("./angular"));
	server.use("/serijadetalji/:id", express.static("./angular"));
	server.use("/era_diagram.png", express.static("./dokumentacija/era_diagram.png"));
}

function pripremiPutanjeKorisnik() {
	server.get("/baza/korisnici", restKorisnik.getKorisnici);
	server.post("/baza/korisnici", restKorisnik.postKorisnici);
	server.put("/baza/korisnici", restKorisnik.putKorisnici);
	server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

	server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
	server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
	server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
	server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);

	server.post("/baza/korisnici/:korime/prijava",restKorisnik.postKorisnikPrijava);
	server.get("/baza/korisnici/:korime/prijava",restKorisnik.getKorisnikPrijava);
	server.put("/baza/korisnici/:korime/prijava",restKorisnik.putKorisnikPrijava);
	server.delete("/baza/korisnici/:korime/prijava",restKorisnik.deleteKorisnikPrijava);
}
function pripremiPutanjeDnevnik() {
	server.get("/baza/dnevnik", restDnevnik.getDnevnik);
	server.post("/baza/dnevnik", restDnevnik.postDnevnik);
	server.put("/baza/dnevnik", restDnevnik.putDnevnik);
	server.delete("/baza/dnevnik", restDnevnik.deleteDnevnik);
}


function pripremiPutanjeTMDB() {
	let restTMDB = new RestTMDB(konfiguracijaInstanca.dajKonf()["tmdb.apikey.v3"],konfiguracijaInstanca.dajKonf().jwtTajniKljuc);
	server.get("/api/tmdb/serije", restTMDB.getSerije.bind(restTMDB));
	server.get("/api/tmdb/serija", restTMDB.getSerija.bind(restTMDB));
}
