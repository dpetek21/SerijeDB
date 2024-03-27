const SerijeDAO = require("./serijeDAO.js");
const jwt = require("../moduli/jwt.js");
const jwtt = require("jsonwebtoken");
const konfiguracijaInstance = require('../../konfiguracija.js');
const kodovi = require("../moduli/kodovi.js");
const session = require("express-session");
const TmdbKlijent = require("./klijentTMDB.js");


exports.getFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let konfig = konfiguracijaInstance.dajKonf();
    if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
        let porukagotovo = { opis: "potrebna prijava" }
        odgovor.status(401);
        odgovor.send(JSON.stringify(porukagotovo));
    }else{
        if(zahtjev.headers.authorization!=undefined){
            let token = zahtjev.headers.authorization;
            token = token.split(" ");
            token = token[1];
            var tijelo = jwt.dajTijelo(token);
        }
        let sdao = new SerijeDAO();
        sdao.dajSveFavoritSerijeZaKorisnika(tijelo.idkorisnika).then((favorit) => {
            console.log(favorit);
            odgovor.status(200);
            odgovor.send(JSON.stringify(favorit));
        });
    }
}

exports.postFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let konfig = konfiguracijaInstance.dajKonf();
    if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
        let porukagotovo = { opis: "potrebna prijava" }
        odgovor.status(401);
        odgovor.send(JSON.stringify(porukagotovo));
    }else{
        if(zahtjev.headers.authorization!=undefined){
            let token = zahtjev.headers.authorization;
            token = token.split(" ");
            token = token[1];
            var tijelo = jwt.dajTijelo(token);
        }
        let podaci = zahtjev.body;
        if(podaci==null||!podaci.idserije){
            odgovor.status(417);
            odgovor.send(JSON.stringify({opis: "neočekivani podaci"}));
        }else{
            let sdao = new SerijeDAO();
            let porukagotovo = { opis: "izvrseno" };
            let tmdb = new TmdbKlijent(konfig["tmdb.apikey.v3"]);
            tmdb.dohvatiSeriju(podaci.idserije).then(serija =>{
                serija = JSON.parse(serija);
                if(serija.success==false){
                    porukagotovo = { opis: "Ne postoji serija s tim ID-om." }
                    odgovor.status(400);
                    odgovor.send(JSON.stringify(porukagotovo));
                }else{
                    sdao.dodajSeriju(serija).then(serija =>{
                        console.log("Dodana za korisnika id!"+tijelo.idkorisnika);
                        console.log("Dodana serija!"+podaci.idserije);
                        sdao.dodajFavorit(tijelo.idkorisnika,podaci.idserije).then((poruka) => {
                            if(poruka){
                                odgovor.status(201);
                                odgovor.send(JSON.stringify(porukagotovo));
                            }else{
                                porukagotovo = { opis: "Favorit je već dodan" }
                                odgovor.status(400);
                                odgovor.send(JSON.stringify(porukagotovo));
                            }
                        });
                    });
                }
            });
    }   }
}

exports.deleteFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}

exports.putFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}

exports.getFavorit = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let sdao = new SerijeDAO();
    let konfig = konfiguracijaInstance.dajKonf();
    if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
        let porukagotovo = { opis: "potrebna prijava" }
        odgovor.status(401);
        odgovor.send(JSON.stringify(porukagotovo));
    }else{
        if(zahtjev.headers.authorization!=undefined){
            let token = zahtjev.headers.authorization;
            token = token.split(" ");
            token = token[1];
            var tijelo = jwt.dajTijelo(token);
        }
        let idserije = zahtjev.params.id;
        sdao.dajFavoritSeriju(tijelo.idkorisnika,idserije).then((serija) => {
            if(!serija){
                let porukagotovo = { opis: "Ta serija nije u favoritima korisnika."};
                odgovor.status(400);
                odgovor.send(JSON.stringify(porukagotovo));
            }else{
                console.log(serija);
                odgovor.status(200);
                odgovor.send(JSON.stringify(serija));
            }
        });
    }
}
exports.postFavorit = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { opis: "zabranjeno" };
    odgovor.send(JSON.stringify(poruka));
}
exports.putFavorit = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { opis: "zabranjeno" };
    odgovor.send(JSON.stringify(poruka));
}


exports.deleteFavorit = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let porukagotovo = { opis: "izvrseno" };
    let idserije = zahtjev.params.id;
    let sdao = new SerijeDAO();
    let konfig = konfiguracijaInstance.dajKonf();
    if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
        let porukagotovo = { opis: "potrebna prijava" }
        odgovor.status(401);
        odgovor.send(JSON.stringify(porukagotovo));
    }else{
        if(zahtjev.headers.authorization!=undefined){
            let token = zahtjev.headers.authorization;
            token = token.split(" ");
            token = token[1];
            var tijelo = jwt.dajTijelo(token);
        }
        sdao.obrisiFavorit(tijelo.idkorisnika,idserije).then((poruka) => {
            if(poruka){
                odgovor.status(201);
                odgovor.send(JSON.stringify(porukagotovo));
            }else{
                porukagotovo = { opis: "Nije uspjelo brisanje, naj vjerojatnije nema seriju s tim id-om u favoritima" };
                odgovor.status(400);
                odgovor.send(JSON.stringify(porukagotovo));
            }
        });
    }
}
