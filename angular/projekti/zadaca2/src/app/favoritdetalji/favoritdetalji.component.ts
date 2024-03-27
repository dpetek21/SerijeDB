import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-favoritdetalji',
  template: `
  <div id="poruka"></div><br>
  <div *ngIf="privilegije!=3">
    <h2>Serija</h2>
    <table border=1 *ngIf="spremno==1">
        <tr><th>TMDB ID serije</th><th>Naslov</th><th>Opis</th><th>Broj sezona</th>
        <th>Broj epizoda</th><th>Popularnost</th><th>Poster</th><th>Poveznica na stranicu</th></tr>
        <tr>
        <td>{{favorit.tmdb_id_serije}}</td><td>{{favorit.naziv}}</td>
        <td>{{favorit.opis}}</td><td>{{favorit.broj_sezona}}</td><td>{{favorit.broj_epizoda}}</td>
        <td>{{favorit.popularnost}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+favorit.poster_path' width='100'
        [alt]='"Poster serije " + favorit.naziv' /></td>
        <td><a [href]='favorit.homepage' target="_blank">{{favorit.homepage}}</a></td>
      </tr>
    </table>
    <hr>
    <h3>Sezone</h3>
    <table border=1 *ngIf="spremno==1">
      <tr><th>TMDB ID sezone</th><th>Naslov</th><th>Opis</th><th>Broj sezone</th>
      <th>Broj epizoda</th><th>Poster</th></tr>
      <tr *ngFor="let sezona of favorit.sezone">
        <td>{{sezona.tmdb_id_sezone}}</td><td>{{sezona.naziv}}</td>
        <td>{{sezona.opis}}</td><td>{{sezona.broj_sezone}}</td><td>{{sezona.broj_epizoda}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+sezona.poster_path' width='100'
        [alt]='"Poster sezone " + sezona.naziv' /></td>
      </tr>
    </table>
  </div>
  <div *ngIf="privilegije==3">
    <h2>Serija</h2>
    <table border=1 *ngIf="spremno==1">
        <tr><th>TMDB ID serije</th><th>Naslov</th><th>Opis</th><th>Broj sezona</th>
        <th>Broj epizoda</th><th>Popularnost</th><th>Poster</th><th>Poveznica na stranicu</th></tr>
        <tr>
        <td>{{favorit.id}}</td><td>{{favorit.name}}</td>
        <td>{{favorit.overview}}</td><td>{{favorit.number_of_seasons}}</td><td>{{favorit.number_of_episodes}}</td>
        <td>{{favorit.popularity}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+favorit.poster_path' width='100'
        [alt]='"Poster serije " + favorit.name' /></td>
        <td><a [href]='favorit.homepage' target="_blank">{{favorit.homepage}}</a></td>
      </tr>
    </table>
    <hr>
    <h3>Sezone</h3>
    <table border=1 *ngIf="spremno==1">
      <tr><th>TMDB ID sezone</th><th>Naslov</th><th>Opis</th><th>Broj sezone</th>
      <th>Broj epizoda</th><th>Poster</th></tr>
      <tr *ngFor="let sezona of favorit.seasons">
        <td>{{sezona.id}}</td><td>{{sezona.name}}</td>
        <td>{{sezona.overview}}</td><td>{{sezona.season_number}}</td><td>{{sezona.episode_count}}</td>
        <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+sezona.poster_path' width='100'
        [alt]='"Poster sezone " + sezona.name' /></td>
      </tr>
    </table>
  </div>
  `,
  styles: [
  ]
})
export class FavoritdetaljiComponent {
  constructor(private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef) { }
  spremno : number =0;
  favorit:any;
  privilegije :any;
  ngOnInit() {
    const naslov = 'Detalji favorita';
    this.naslov.setTitle(naslov);
    this.privilegije=sessionStorage.getItem('privilegije');
    this.fetchFavorita();
  }
  ngAfterViewInit(): void {
  }
  async fetchFavorita(){
    let segmenti = window.location.href.split('/');
    let idserije= segmenti.pop();
    let poruka = document.getElementById("poruka");
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
      let imaserije = 0;
      interface Objekt {
        [key: string]: any;
      }
      let pravifavorit;
      for(let serija of serije as Objekt[]){
        if(serija['id']==idserije){
          pravifavorit = serija;
          imaserije=1;
          break;
        }
      }
      if(imaserije){
        this.favorit=pravifavorit;
        console.log(this.favorit);
        this.spremno=1;
        return 201;
      }else{
        poruka!.innerHTML = "Ta serija nije u favoritima prijavljenog korisnika.";
        return 501;
      }
    }else{
      let parametri = { method: "GET" };
      if(parametri)
      parametri = await this.servisFunkcije.dodajToken(parametri);
      let odgovor = await fetch(
        this.servisFunkcije.url+"/baza/favoriti/"+idserije,
        parametri
      );
      if (odgovor.status == 200) {
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);
        console.log(podaci);
        this.favorit=podaci;
        this.spremno=1;
        return podaci;
      } else if (odgovor.status == 401) {
        poruka!.innerHTML = "Neautorizirani pristup! Prijavite se!";
        return odgovor.status;
      } else {
        poruka!.innerHTML = "Ta serija nije u favoritima prijavljenog korisnika.";
        return odgovor.status;
      }
    }
  }
}
