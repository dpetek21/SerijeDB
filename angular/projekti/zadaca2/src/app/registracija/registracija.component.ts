import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-registracija',
  template: `
  <div id="poruka"></div><br>
            <label for="korime">Korisničko ime (obavezno)</label>
            <input type="text" name="korime" id="korime" #korime/>
            <br>
            <label for="lozinka">Lozinka (obavezno)</label>
            <input type="password" name="lozinka" id="lozinka" #lozinka/>
            <br>
            <label for="email">Email (obavezno)</label>
            <input type="mail" name="email" id="email" #email/>
            <br>
            <label for="ime">Ime</label>
            <input type="text" name="ime" id="ime" #ime/>
            <br>
            <label for="prezime">Prezime</label>
            <input type="text" name="prezime" id="prezime" #prezime/>
            <br>
            <label for="uloga">Odaberi ulogu</label>
            <select id="uloga" name="uloga" #uloga>
                <option value="1">Običan</option>
                <option value="2">Admin</option>
            </select>
            <br>
            <label for="drzava">Država</label>
            <input type="text" name="drzava" id="drzava"  #drzava/>
            <br>
            <label for="adresa">Adresa</label>
            <input type="text" name="adresa" id="adresa" #adresa/>
            <br>
            <label for="interesi">Interesi</label>
            <input type="text" name="interesi" id="interesi" #interesi/>
            <br>
            <input type="button" value="Registriraj" id="slanjereg" (click)="PosaljiRegistraciju()"/>
  `,
  styles: [
  ]
})
export class RegistracijaComponent {
  @ViewChild('korime') korime!: ElementRef;
  @ViewChild('lozinka') lozinka!: ElementRef;
  @ViewChild('email') email!: ElementRef;
  @ViewChild('uloga') uloga!: ElementRef;
  @ViewChild('ime') ime!: ElementRef;
  @ViewChild('prezime') prezime!: ElementRef;
  @ViewChild('drzava') drzava!: ElementRef;
  @ViewChild('adresa') adresa!: ElementRef;
  @ViewChild('interesi') interesi!: ElementRef;
  private subscription!: Subscription;
  //this.adresa.nativeElement.value
  constructor(private recaptcha: ReCaptchaV3Service,private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef){
  }
  ngOnInit() {
    const naslov = 'Registracija';
    this.naslov.setTitle(naslov);
  }
  PosaljiRegistraciju() {
    this.subscription =this.recaptcha.execute('registracija').subscribe((token) => {
      this.dodajKorisnika(token).then(povrat =>{
        if(povrat==201){
          let poruka = document.getElementById("poruka");
          poruka!.innerHTML="Dodavanje korisnika je uspjelo";
          this.isprazniPolja();
          //window.location.href = "/";
        }else if(povrat==400){
          let poruka = document.getElementById("poruka");
          poruka!.innerHTML="Dodavanje nije uspjelo jer su email i/ili korisničko ime zauzeti!";
        }else{
          let poruka = document.getElementById("poruka");
          poruka!.innerHTML+="Dodavanje korisnika nije uspjelo, provjerite podatke.";
        }
      });
    });
  }
  isprazniPolja(){
    this.ime.nativeElement.value="";
    this.prezime.nativeElement.value="";
    this.lozinka.nativeElement.value="";
    this.email.nativeElement.value="";
    this.korime.nativeElement.value="";
    this.drzava.nativeElement.value="";
    this.adresa.nativeElement.value="";
    this.interesi.nativeElement.value="";
    this.uloga.nativeElement.value="1";
  }
  async dodajKorisnika(recaptchatoken:string){
      if(this.provjeriInputRegistracija()){
        console.log(recaptchatoken);
        let tijelo = {
            ime: this.ime.nativeElement.value,
            prezime: this.prezime.nativeElement.value,
            lozinka: this.lozinka.nativeElement.value,
            email: this.email.nativeElement.value,
            korime: this.korime.nativeElement.value,
            drzava: this.drzava.nativeElement.value,
            adresa: this.adresa.nativeElement.value,
            interesi: this.interesi.nativeElement.value,
            uloga: this.uloga.nativeElement.value,
            token:recaptchatoken,
        };
        
        let zaglavlje = new Headers();
        zaglavlje.set("Content-Type", "application/json");
        let token = await this.servisFunkcije.dajToken();
        if(token) 
        zaglavlje.set("Authorization", token);
        let parametri :RequestInit = {
            method: "POST",
            body: JSON.stringify(tijelo),
            headers: zaglavlje,
            credentials:'include',
        };
        console.log(parametri);
        let odgovor = await fetch(
            this.servisFunkcije.url+"/baza/korisnici",
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
    }else{
      return 401;
    }
  }
  provjeriInputRegistracija(){
    let zastava = 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nemaRazmakaRegex = /^\S+$/;
    document.getElementById("poruka")!.innerHTML ="";
    if(!emailRegex.test(this.email.nativeElement.value)||this.email.nativeElement.value===""){
      document!.getElementById("poruka")!.innerHTML += "Email nije u dobrom standardnom formatu. ";
      zastava++;
    }
    if(!nemaRazmakaRegex.test(this.korime.nativeElement.value)||this.korime.nativeElement.value===""){
      document.getElementById("poruka")!.innerHTML += "Korisničko ime ne smije imati razmake, i mora biti ispunjeno. ";
      zastava++;
    }
    if(!nemaRazmakaRegex.test(this.lozinka.nativeElement.value)||this.lozinka.nativeElement.value===""){
      document.getElementById("poruka")!.innerHTML += "Lozinka ne smije imati razmake, i mora biti ispunjena. ";
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
