const jwt = require("jsonwebtoken");
const konfiguracijaInstance = require('../../konfiguracija.js');
exports.kreirajToken = function(korisnik, tajniKljucJWT){
	let vrijeme = konfiguracijaInstance.dajKonf().jwtValjanost +"s";
	let podaci ={ korime: korisnik.korisnicko_ime, privilegije : korisnik.uloge_id_uloge,idkorisnika : korisnik.id_korisnika };
	let token = jwt.sign(podaci, tajniKljucJWT, { expiresIn: vrijeme });
	console.log(token);
    return token;
}

exports.provjeriToken = function(zahtjev, tajniKljucJWT) {
    console.log("Provjera zahtjeva: "+zahtjev);
	console.log("Provjera tokena 22: "+zahtjev.headers.authorization);
    if (zahtjev.headers.authorization != null) {
		let splitano = zahtjev.headers.authorization.split(" ");
        let token = splitano[1];
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
			return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    return false;
}
exports.provjeriToken = function(zahtjev, tajniKljucJWT) {
	console.log("Provjera tokena: "+zahtjev.headers.authorization);
    if (zahtjev.headers.authorization != null) {
		let splitano = zahtjev.headers.authorization.split(" ");
        let token = splitano[1];
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
            console.log("JWT podaci: "+podaci);
			return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    return false;
}

exports.ispisiDijelove = function(token){
	let dijelovi = token.split(".");
	let zaglavlje =  dekodirajBase64(dijelovi[0]);
	console.log(zaglavlje);
	let tijelo =  dekodirajBase64(dijelovi[1]);
	console.log(tijelo);
	let potpis =  dekodirajBase64(dijelovi[2]);
	console.log(potpis);
}

exports.dajTijelo = function(token){
	let dijelovi = token.split(".");
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data){
	let buff = new Buffer(data, 'base64');
	return buff.toString('ascii');
}
