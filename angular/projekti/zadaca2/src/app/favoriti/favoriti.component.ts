import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-favoriti',
  template: `
    <div id="poruka"></div><br>
    <table border=1 *ngIf="spremno==1&&privilegije!=3">
      <tr><th>TMDB ID serije</th><th>Naslov</th><th>Opis</th>
      <th>Poster</th><th>Gumb za detalje</th></tr>
      <tr *ngFor="let serija of favoriti">
        <td>{{serija.tmdb_id_serije}}</td><td>{{serija.naziv}}</td>
        <td>{{serija.opis}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+serija.poster_path' width='100'
        [alt]='"Poster serije " + serija.naziv' /></td>
        <td><button (click)="otvoriDetalje(serija.tmdb_id_serije)">Detalji serije</button> </td>
      </tr>
    </table>
    <table border=1 *ngIf="spremno==1&&privilegije==3">
      <tr><th>TMDB ID serije</th><th>Naslov</th><th>Opis</th>
      <th>Poster</th><th>Gumb za detalje</th></tr>
      <tr *ngFor="let serija of favoriti">
        <td>{{serija.id}}</td><td>{{serija.name}}</td>
        <td>{{serija.overview}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+serija.poster_path' width='100'
        [alt]='"Poster serije " + serija.name' /></td>
        <td><button (click)="otvoriDetalje(serija.id)">Detalji serije</button> </td>
      </tr>
    </table>
    
  `,
  styles: [
  ]
})
export class FavoritiComponent {
  constructor(private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef) { }
  spremno : number =0;
  favoriti:any;
  privilegije:any;
  ngOnInit() {
    const naslov = 'Favoriti korisnika';
    this.naslov.setTitle(naslov);
    this.privilegije=sessionStorage.getItem('privilegije');
    this.fetchFavorita();
  }
  ngAfterViewInit(): void {
    
  }
  async fetchFavorita(){
    if(sessionStorage.getItem('privilegije')=='3'){
      let serijespremljene=localStorage.getItem("gitFavoriti");
      let serije;
      if(serijespremljene){
        serije = JSON.parse(serijespremljene);
      }else{
        serije = {};
      }
      console.log(serije);
      serije = Object.values(serije);
      this.favoriti=serije;
      this.spremno=1;
      return 201;
    }else{
      let poruka = document.getElementById("poruka");
      let parametri = { method: "GET" };
      if(parametri)
      parametri = await this.servisFunkcije.dodajToken(parametri);
      let odgovor = await fetch(
        this.servisFunkcije.url+"/baza/favoriti",
        parametri
      );
      if (odgovor.status == 200) {
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);
        this.favoriti=podaci;
        this.spremno=1;
            return podaci;
      } else if (odgovor.status == 401) {
        poruka!.innerHTML = "Neautorizirani pristup! Prijavite se!";
        this.spremno=0;
        return odgovor.status;
      } else {
        poruka!.innerHTML = "Greška u dohvatu favorita!";
        this.spremno=0;
        return odgovor.status;
      }
    }
}
otvoriDetalje(idSerije:any) {
    let url = "/favoritdetalji/"+idSerije;
    window.location.href = url;
  }
}
