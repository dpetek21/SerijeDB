const KorisnikDAO = require("./korisnikDAO.js");
const jwt = require("../moduli/jwt.js");
const jwtt = require("jsonwebtoken");
const konfiguracijaInstance = require('../../konfiguracija.js');
const kodovi = require("../moduli/kodovi.js");
const session = require("express-session");
const DnevnikDao = require("./dnevnikDAO.js");
const mail = require("../moduli/mail.js");

exports.getDnevnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let konfig = konfiguracijaInstance.dajKonf();
    if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
        let porukagotovo = { opis: "potrebna prijava" }
        odgovor.status(401);
        odgovor.send(JSON.stringify(porukagotovo));
    }else{
        let korime;
        let podaci = zahtjev.body;
        if(zahtjev.headers.authorization!=undefined){
            let token = zahtjev.headers.authorization;
            token = token.split(" ");
            token = token[1];
            var tijelo = jwt.dajTijelo(token);
        }
        korime=tijelo.korime;
        if(tijelo.privilegije==2){
            let porukagotovo = { opis: "uspjeh" };
            odgovor.status(201);
            //let ddao = new DnevnikDao();
            /*ddao.dajSve().then((poruka) => {
                odgovor.status(201);
                odgovor.send(JSON.stringify(poruka));
            });*/
        }else{
            let porukagotovo = { opis: "zabranjen pristup" };
            odgovor.status(403);
            odgovor.send(JSON.stringify(porukagotovo));
        }
    }
}

exports.postDnevnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}

exports.deleteDnevnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}

exports.putDnevnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}
