const ds = require("fs/promises");
class Konfiguracija {
	constructor() {
		this.konf = {};
	}
	dajKonf() {
		return this.konf;
	}
	async ucitajKonfiguraciju() {
		console.log(this.konf);
		let podaci = await ds.readFile(process.argv[2], "UTF-8");
		this.konf = pretvoriJSONkonfig(podaci);
		console.log(this.konf);
	}
}

function pretvoriJSONkonfig(podaci) {
	console.log(podaci);
	let konf = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		
		var podatakNiz = podatak.split(":");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1];
        provjeraValjanosti(naziv,vrijednost);
		konf[naziv] = vrijednost;
	}
	provjeraSvihPodataka(konf);
	return konf;
}
function provjeraSvihPodataka(konf){
	if(!("jwtValjanost" in konf)){
		throw new Error('Vrjednost jwtValjanost mora biti definirana u konfiguracijskoj datoteci!');
	}else if(!("jwtTajniKljuc" in konf)){
		throw new Error('Vrjednost jwtTajniKljuc mora biti definirana u konfiguracijskoj datoteci!');
	}else if(!("tajniKljucSesija" in konf)){
		throw new Error('Vrjednost tajniKljucSesija mora biti definirana u konfiguracijskoj datoteci!');
	}else if(!("appStranicenje" in konf)){
		throw new Error('Vrjednost appStranicenje mora biti definirana u konfiguracijskoj datoteci!');
	}else if(!("tmdb.apikey.v3" in konf)){
		throw new Error('Vrjednost tmdb.apikey.v3 mora biti definirana u konfiguracijskoj datoteci!');
	}else if(!("tmdb.apikey.v4" in konf)){
		throw new Error('Vrjednost tmdb.apikey.v4 mora biti definirana u konfiguracijskoj datoteci!');
	}
}
function provjeraValjanosti(naziv, vrijednost){
	if(naziv=="jwtValjanost"){
		provjeriJwtValjanost(vrijednost);
	}else if(naziv=="jwtTajniKljuc"){
		provjeriJwtTajniKljuc(vrijednost);
	}else if(naziv=="tajniKljucSesija"){
		provjeriTajniKljucSesija(vrijednost);
	}else if(naziv=="appStranicenje"){
		provjeriAppStranicenje(vrijednost);
	}
}
function provjeriJwtTajniKljuc(vrijednost){
	const provjera = /^[a-zA-Z0-9]+$/;
	if(vrijednost.toString().length<50||vrijednost.toString().length>100){
		throw new Error('Vrjednost jwtTajniKljuc mora biti dužine između 50 i 100!');
	}else if(!provjera.test(vrijednost.toString())){
		throw new Error('Vrjednost jwtTajniKljuc mora samo sadržavati velika i mala slova i brojke!');
	}
}
function provjeriTajniKljucSesija(vrijednost){
	const provjera = /^[a-zA-Z0-9]+$/;
	if(vrijednost.toString().length<50||vrijednost.toString().length>100){
		throw new Error('Vrjednost tajniKljucSesija mora biti dužine između 50 i 100!');
	}else if(!provjera.test(vrijednost.toString())){
		throw new Error('Vrjednost tajniKljucSesija mora samo sadržavati velika i mala slova i brojke!');
	}
}
function provjeriAppStranicenje(vrijednost){
	const provjera = /^[0-9]+$/;
	if(!provjera.test(vrijednost.toString())){
		throw new Error('Vrjednost appStranicenje mora biti broj!');
	}else if(vrijednost<5||vrijednost>100){
		throw new Error('Vrjednost appStranicenje mora biti broj između 5 i 100!');
	}
}
function provjeriJwtValjanost(vrijednost){
	const provjera = /^[0-9]+$/;
	if(!provjera.test(vrijednost.toString())){
		throw new Error('Vrjednost jwtValjanost mora biti broj!');
	}else if(vrijednost<15||vrijednost>3600){
		throw new Error('Vrjednost jwtValjanost mora biti broj između 15 i 3600!');
	}
}

var konfiguracijaInstanca = new Konfiguracija();

module.exports = konfiguracijaInstanca;