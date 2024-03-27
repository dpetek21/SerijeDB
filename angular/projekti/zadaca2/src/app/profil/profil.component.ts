import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-profil',
  template: `
  <style>
        .fejkTextbox {
          border: 1px solid #ccc;
          background-color: #e7e7e7;
          border-radius: 3;
          padding: 2px;
          font-size: small;
          font-family: sans-serif;
          display: inline-block;
        }
      </style>
      <div id="poruka"></div><br>
    <label for="korime">Korisničko ime (nepromjenjivo)</label> <br>
            <div class="fejkTextbox" id="korime"></div>
            <br>
            <label for="lozinka">Lozinka (ako ostavite prazno ne mijenja se)</label> <br>
            <input type="password" name="lozinka" id="lozinka" #lozinka/>
            <br>
            <label for="email">Email (nepromjenjivo)</label> <br>
            <div class="fejkTextbox" id="email"></div>
            <br>
            <label for="ime">Ime</label>
            <input type="text" name="ime" id="ime" #ime/>
            <br>
            <label for="prezime">Prezime</label>
            <input type="text" name="prezime" id="prezime" #prezime/>
            <br>
            <label for="drzava">Država</label>
            <input type="text" name="drzava" id="drzava" #drzava/>
            <br>
            <label for="adresa">Adresa</label>
            <input type="text" name="adresa" id="adresa" #adresa/>
            <br>
            <label for="interesi">Interesi</label>
            <input type="text" name="interesi" id="interesi" #interesi/>
            <br>
            <input type="button" value="Spremi promjene" id="slanjeprof"  (click)="PosaljiPromjene()"/>
  `,
  styles: [
  ]
})
export class ProfilComponent {
  @ViewChild('lozinka') lozinka!: ElementRef;
  @ViewChild('ime') ime!: ElementRef;
  @ViewChild('prezime') prezime!: ElementRef;
  @ViewChild('drzava') drzava!: ElementRef;
  @ViewChild('adresa') adresa!: ElementRef;
  @ViewChild('interesi') interesi!: ElementRef;
  private subscription!: Subscription;
  constructor(private recaptcha: ReCaptchaV3Service,private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef){

  }
  ngOnInit() {
    const naslov = 'Profil';
    this.naslov.setTitle(naslov);
  }
  ngAfterViewInit(): void {
    this.dajKorisnika();
  }
  async dajKorisnika() {
    let parametri = { method: "GET" };
    parametri = await this.servisFunkcije.dodajToken(parametri);
    let odgovor = await fetch(
      this.servisFunkcije.url+"/baza/korisnici/"+sessionStorage.getItem('korime'),
      parametri
    );
    let poruka = document.getElementById("poruka");
    if (odgovor.status == 200) {
      let podaci = await odgovor.text();
      podaci = JSON.parse(podaci);
      this.prikaziKorisnika(podaci);
    } else if (odgovor.status == 401) {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Neautorizirani pristup! Prijavite se!');
    } else {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Greška u dohvatu korisnika!');
    }
  }
  prikaziKorisnika(korisnik:any) {
    let korime = document.getElementById("korime");
    korime!.innerHTML=korisnik.korisnicko_ime;
    let email = document.getElementById("email");
    email!.innerHTML=korisnik['e-mail'];
    this.ime.nativeElement.value = korisnik.ime;
    this.prezime.nativeElement.value = korisnik.prezime;
    this.drzava.nativeElement.value = korisnik.drzava;
    this.adresa.nativeElement.value = korisnik.adresa;
    this.interesi.nativeElement.value = korisnik.interesi;
  }
  PosaljiPromjene() {
    this.subscription =this.recaptcha.execute('profil').subscribe((token) => {
      this.updateKorisnika(token).then(povrat =>{
        console.log(povrat);
        let poruka = document.getElementById("poruka");
            if(povrat==201){
              poruka!.innerHTML+="Update profila je uspio!";
            }else if(povrat==401){
              poruka!.innerHTML+="Update profila nije uspio, potreban login";
            }else{
              poruka!.innerHTML+="Update profila nije uspio.";
        }
      });
    });
  }
  async updateKorisnika(recaptchatoken:string){
    if(this.provjeriInputProfil()){
      let tijelo : any = {
          ime: this.ime.nativeElement.value,
          prezime: this.prezime.nativeElement.value,
          drzava: this.drzava.nativeElement.value,
          adresa: this.adresa.nativeElement.value,
          interesi: this.interesi.nativeElement.value,
          token:recaptchatoken,
      };
	  if(this.lozinka.nativeElement.value!==""){
		  tijelo.lozinka=this.lozinka.nativeElement.value;
	  }
      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      let token = await this.servisFunkcije.dajToken();
      if(token)
      zaglavlje.set("Authorization", token);
      let parametri :RequestInit= {
          method: "PUT",
          body: JSON.stringify(tijelo),
          headers: zaglavlje,
          credentials:'include',
      };
      let odgovor = await fetch(
          this.servisFunkcije.url+"/baza/korisnici/"+sessionStorage.getItem("korime"),
          parametri
      );
      if (odgovor.status == 201) {
          console.log("Korisnik promjenjen na servisu");
          return 201;
      } else {
          console.log(odgovor.status);
          console.log(await odgovor.text());
          return odgovor.status;
      }
    }else{
      return 501;
    }
  }
  provjeriInputProfil(){
    let zastava = 0;
    const nemaRazmakaRegex = /^\S+$/;
    document.getElementById("poruka")!.innerHTML ="";
    if(this.lozinka.nativeElement.value!==""&&!nemaRazmakaRegex.test(this.lozinka.nativeElement.value)){
      document.getElementById("poruka")!.innerHTML += "Lozinka ne smije imati razmake. ";
      zastava++;
    }
    if(zastava>0){
      return false;
    }else{
      return true;
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
