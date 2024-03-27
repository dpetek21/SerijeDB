const KorisnikDAO = require("./korisnikDAO.js");
const jwt = require("../moduli/jwt.js");
const jwtt = require("jsonwebtoken");
const konfiguracijaInstance = require('../../konfiguracija.js');
const kodovi = require("../moduli/kodovi.js");
const session = require("express-session");
const SerijeDAO = require("./serijeDAO.js");
const mail = require("../moduli/mail.js");

async function provjeriCaptcha(token){
    console.log("Provjerava se captcha " + token);
    if(token==undefined)return false;
    try {
        let odgovor = await fetch('https://www.google.com/recaptcha/api/siteverify?secret='+''+
        '&response='+token, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
        });
        let rezultat = await odgovor.json();
        console.log("Rezultat je !"+rezultat.success);
        let success = rezultat.success;
        let score = rezultat.score;
        if (success && score >= 0.4) {
            console.log("Captcha je valjana!");
          return true;
        } else {
            return false;
        }
      } catch (error) {
        console.error('Error je:', error.message);
        return false;
      }
}

async function ProvjeriGithubLog(token){
    console.log("Provjerava se Github login " + token);
    if(token==undefined)return false;
    try {
        let odgovor = await fetch('https://github.com/login/oauth/access_token?client_id='+''+
        '&client_secret='+''+'&code='+token, {
            method: 'POST',
            //headers: {'Content-Type': 'application/json',},
        });
        let rezultat = await odgovor.text();
        console.log("Rezultat za github je!"+rezultat);
        if (odgovor.ok&&!rezultat.startsWith("error")) {
            console.log("Github je valjana!");
          return true;
        } else {
            return false;
        }
      } catch (error) {
        console.error('Error je:', error.message);
        return false;
      }
}
exports.getKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json");
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
        if(tijelo.privilegije==2){
        let kdao = new KorisnikDAO();
        kdao.dajSve().then((korisnici) => {
            console.log(korisnici);
            odgovor.status(200);
            odgovor.send(JSON.stringify(korisnici));
        });
        }else{
            let porukagotovo = { opis: "zabranjen pristup" }
            odgovor.status(403);
            odgovor.send(JSON.stringify(porukagotovo));
        }
    }
}

exports.postKorisnici = async function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let konfig = konfiguracijaInstance.dajKonf();
    let dobraCaptcha = await provjeriCaptcha(zahtjev.body.token);
    if(dobraCaptcha){
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
            if(tijelo.privilegije==2){
                let podaci = zahtjev.body;
                if(podaci==null||!podaci.lozinka||!podaci.korime||!podaci.email||!podaci.uloga||podaci.korime=="Github"){
                    odgovor.status(417);
                    odgovor.send(JSON.stringify({opis: "neočekivani podaci"}));
                }else{
                    let neenkriptiranaLozinka = podaci.lozinka;
                    podaci.lozinka= kodovi.kreirajSHA256(podaci.lozinka, "solsol");
                    let kdao = new KorisnikDAO();
                    let porukagotovo = { opis: "izvrseno" }
                    kdao.dodaj(podaci).then((poruka) => {
                        if(poruka){
                            odgovor.status(201);
                            odgovor.send(JSON.stringify(porukagotovo));
                            let salje="dpetek21@student.foi.hr";
                            let prima= podaci.email;
                            let subject ="Uspješna registracija";
                            let poruka ="Uspješna registracija vašeg računa sa sljedećim informacijama: Korisničko ime: ";
                            poruka+= podaci.korime +", Lozinka: "+neenkriptiranaLozinka;
                            mail.posaljiMail(salje,prima,subject,poruka);
                        }else{
                            porukagotovo = { opis: "Email ili korisničko ime su zauzeti" }
                            odgovor.status(400);
                            odgovor.send(JSON.stringify(porukagotovo));
                        }

                    });
                }
            }else{
                let porukagotovo = { opis: "zabranjen pristup" }
                odgovor.status(403);
                odgovor.send(JSON.stringify(porukagotovo));
            }
        }
    }else{
        console.log("Nevaljana captcha dobivena!");
        odgovor.status(400);
        odgovor.send(JSON.stringify({opis: "Captcha ne valja"}));
    }
}

exports.deleteKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}

exports.putKorisnici = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}


exports.getKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let kdao = new KorisnikDAO();
    let konfig = konfiguracijaInstance.dajKonf();
    if(zahtjev.headers.authorization!=undefined){
        let token = zahtjev.headers.authorization;
        token = token.split(" ");
        token = token[1];
        var tijelo = jwt.dajTijelo(token);
    }
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
        let korime = zahtjev.params.korime;
        if((korime ==tijelo.korime || tijelo.privilegije==2)&&korime!="Github"){
            kdao.daj(korime).then((korisnik) => {
                console.log(korisnik);
                odgovor.status(200);
                odgovor.send(JSON.stringify(korisnik));
            });
        }else{
            let porukagotovo = { opis: "zabranjen pristup" }
            odgovor.status(403);
            odgovor.send(JSON.stringify(porukagotovo));
        }
    }
}
exports.postKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(405);
    let poruka = { opis: "zabranjeno" };
    odgovor.send(JSON.stringify(poruka));
}
exports.putKorisnik = async function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let konfig = konfiguracijaInstance.dajKonf();
    let dobraCaptcha = await provjeriCaptcha(zahtjev.body.token);
    if(dobraCaptcha){
        if(!jwt.provjeriToken(zahtjev,konfig["jwtTajniKljuc"])){
            let porukagotovo = { opis: "potrebna prijava" }
            odgovor.status(401);
            odgovor.send(JSON.stringify(porukagotovo));
        }else{
            let korime = zahtjev.params.korime;
            let podaci = zahtjev.body;
            if(zahtjev.headers.authorization!=undefined){
                let token = zahtjev.headers.authorization;
                token = token.split(" ");
                token = token[1];
                var tijelo = jwt.dajTijelo(token);
            }
            if((korime ==tijelo.korime || tijelo.privilegije==2)&&korime!="Github"){
                if(podaci.lozinka){
                    podaci.lozinka= kodovi.kreirajSHA256(podaci.lozinka, "solsol");
                }
                let kdao = new KorisnikDAO();
                let porukagotovo = { opis: "izvrseno" };
                kdao.azuriraj(korime, podaci).then((poruka) => {
                    odgovor.status(201);
                    odgovor.send(JSON.stringify(porukagotovo));
                });
            }else{
                let porukagotovo = { opis: "zabranjen pristup" };
                odgovor.status(403);
                odgovor.send(JSON.stringify(porukagotovo));
            }
        }
    }else{
        console.log("Nevaljana captcha dobivena!");
        odgovor.status(400);
        odgovor.send(JSON.stringify({opis: "Captcha ne valja"}));
    }
}


exports.deleteKorisnik = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    let porukagotovo = { opis: "izvrseno" };
    let korime = zahtjev.params.korime;
    let kdao = new KorisnikDAO();
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
        if(tijelo.privilegije==2){
            console.log("korime je:"+korime);
            kdao.daj(korime).then((korisnik) =>{
                console.log(korisnik);
                if(!korisnik){
                    porukagotovo = { opis: "Nije uspjelo brisanje, naj vjerojatnije nema korisnika s tim imenom" };
                    odgovor.status(400);
                    odgovor.send(JSON.stringify(porukagotovo))
                }else{
                    sdao.obrisiSveFavoriteKorisnika(korisnik.id_korisnika).then((gotovo) =>{
                        kdao.obrisi(korime).then((poruka) => {
                            if(poruka){
                                odgovor.status(201);
                                odgovor.send(JSON.stringify(porukagotovo));
                            }else{
                                porukagotovo = { opis: "Nije uspjelo brisanje, naj vjerojatnije nema korisnika s tim imenom" };
                                odgovor.status(400);
                                odgovor.send(JSON.stringify(porukagotovo));
                            }
                        });
                    });
                }
            });
        }else{
            porukagotovo = { opis: "zabranjen pristup" };
            odgovor.status(403);
            odgovor.send(JSON.stringify(porukagotovo));
        }
    }
}

exports.getKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let kdao = new KorisnikDAO();
    let setjwt = zahtjev.session.jwt;
    if(setjwt){
        let konfig = konfiguracijaInstance.dajKonf();
        let korisnik ={ korisnicko_ime: zahtjev.session.korime , uloge_id_uloge : zahtjev.session.privilegije,id_korisnika : zahtjev.session.id_korisnika };
        zahtjev.session.jwt = jwt.kreirajToken(korisnik,konfig["jwtTajniKljuc"]);
        odgovor.set('Authorization', `Bearer ${zahtjev.session.jwt}`);
        //odgovor.set('Access-Control-Expose-Headers', 'Authorization');
        odgovor.status(201);
        odgovor.send(JSON.stringify({opis: "izvrseno"}));
    }else{
        odgovor.status(401);
        odgovor.send(JSON.stringify({opis: "zabranjen pristup"}));
    }
}
exports.postKorisnikPrijava = async function (zahtjev, odgovor) {
    odgovor.type("application/json")
    let kdao = new KorisnikDAO();
    let korime = zahtjev.params.korime;
    console.log("Dosao zahtjev za login");

    let konfig = konfiguracijaInstance.dajKonf();
    let dobraCaptcha = await provjeriCaptcha(zahtjev.body.token);
    if(dobraCaptcha){
        if(korime=="Github"){
            console.log("Dosao github zahtjev!");
            let dobarGitLogin = await ProvjeriGithubLog(zahtjev.body.gitcode);
            if(dobarGitLogin){
                zahtjev.session.korime = "Github";
                zahtjev.session.privilegije = "3";
                let korisnik ={ korisnicko_ime: zahtjev.session.korime , uloge_id_uloge : zahtjev.session.privilegije,id_korisnika : zahtjev.session.id_korisnika };
                zahtjev.session.jwt = jwt.kreirajToken(korisnik,konfig["jwtTajniKljuc"]);
                odgovor.status(201);
                odgovor.send(JSON.stringify({korime : "Github" , privilegije : "3"}));
            }else{
                console.log("Krivi github kod!");
                odgovor.status(400);
                odgovor.send(JSON.stringify({opis: "Krivi github kod"}));
            }
        }else{
            kdao.daj(korime).then((korisnik) => {
                let sifrlog = kodovi.kreirajSHA256(zahtjev.body.lozinka, "solsol");
                if(korisnik!=null && korisnik.lozinka==sifrlog){
                    zahtjev.session.jwt = jwt.kreirajToken(korisnik,konfig["jwtTajniKljuc"]);
                    zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
                    zahtjev.session.korime = korisnik.korisnicko_ime;
                    zahtjev.session.privilegije = korisnik.uloge_id_uloge;
                    zahtjev.session.id_korisnika = korisnik.id_korisnika;
                    odgovor.status(201);
                    odgovor.send(JSON.stringify({ jwt: zahtjev.session.jwt, korime : korisnik.korisnicko_ime , privilegije : korisnik.uloge_id_uloge,idkorisnika : korisnik.id_korisnika}));
                }else if(!zahtjev.body.lozinka){
                    zahtjev.session.jwt = null;
                    zahtjev.session.korime = null;
                    zahtjev.session.privilegije= null;
                    zahtjev.session.korisnik = null;
                    zahtjev.session.id_korisnika = null;
                    odgovor.status(417);
                    odgovor.send(JSON.stringify({opis: "neočekivani podaci"}));
                }else{
                    odgovor.status(400);
                    odgovor.send(JSON.stringify({opis: "krivo korsničko ime i/ili lozinka"}));
                }
            });
        }
    }else{
        zahtjev.session.jwt = null;
        zahtjev.session.korime = null;
        zahtjev.session.privilegije= null;
        zahtjev.session.korisnik = null;
        zahtjev.session.id_korisnika = null;
        console.log("Nevaljana captcha dobivena!");
        odgovor.status(400);
        odgovor.send(JSON.stringify({opis: "Captcha ne valja"}));
    }
}

exports.putKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}
exports.deleteKorisnikPrijava = function (zahtjev, odgovor) {
    odgovor.type("application/json");
    odgovor.status(501);
    let poruka = { opis: "metoda nije implementirana" };
    odgovor.send(JSON.stringify(poruka));
}



