import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-korisnici',
  template: `
    <div id="poruka"></div><br>
    <table border=1 *ngIf="spremno==1">
      <tr><th>Id korisnika</th><th>Korisničko ime</th><th>E-mail</th><th>Ime</th><th>Prezime</th>
      <th>Uloga</th><th>Drzava</th><th>Adresa</th><th>Interesi</th></tr>
      <tr *ngFor="let korisnik of korisnici">
        <td>{{korisnik.id_korisnika}}</td><td>{{korisnik.korisnicko_ime}}</td>
        <td>{{korisnik['e-mail']}}</td><td>{{korisnik.ime}}</td>
        <td>{{korisnik.prezime}}</td><td *ngIf="korisnik.uloge_id_uloge==2">Admin</td>
        <td *ngIf="korisnik.uloge_id_uloge==1">Registrirani korisnik</td>
        <td>{{korisnik.drzava}}</td><td>{{korisnik.adresa}}</td>
        <td>{{korisnik.interesi}}</td>
        <td><button (click)="obrisiKorisnika(korisnik.korisnicko_ime)">Izbriši korisnika</button> </td>
      </tr>
    </table>
  `,
  styles: [
  ]
})
export class KorisniciComponent {
  constructor(private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef) { }
  spremno : number =0;
  korisnici:any;
  ngOnInit() {
    const naslov = 'Korisnici';
    this.naslov.setTitle(naslov);
  }
  ngAfterViewInit(): void {
    this.dajKorisnike();
  }
  async dajKorisnike() {
    let parametri = { method: "GET" };
    parametri = await this.servisFunkcije.dodajToken(parametri);
    let odgovor = await fetch(
      this.servisFunkcije.url+"/baza/korisnici",
      parametri
    );
    let poruka = document.getElementById("poruka");
    if (odgovor.status == 200) {
      let podaci = await odgovor.text();
      podaci = JSON.parse(podaci);
      this.korisnici=podaci;
      this.spremno=1;
    } else if (odgovor.status == 401) {
      document.getElementById("sadrzaj")!.innerHTML = "";
      poruka!.innerHTML = "Neautorizirani pristup! Prijavite se!";
    } else {
      poruka!.innerHTML = "Greška u dohvatu korisnika!";
    }
  }
  
  async obrisiKorisnika(korime:string) {
    let parametri = { method: "DELETE" };
    let poruka = document.getElementById("poruka");
      if(korime=="admin"){
          poruka!.innerHTML="Ne može se izbrisati glavni admin!";
      }else{
          parametri = await this.servisFunkcije.dodajToken(parametri);
          let odgovor = await fetch(
              this.servisFunkcije.url+"/baza/korisnici/"+korime,
              parametri
          );
          if (odgovor.status == 201) {
              this.dajKorisnike();
          } else if (odgovor.status == 401) {
              document.getElementById("sadrzaj")!.innerHTML = "";
              poruka!.innerHTML = "Neautorizirani pristup! Prijavite se!";
          } else {
              poruka!.innerHTML = "Greška u brisanju!";
          }
      }
  }
}
