import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-serijadetalji',
  template: `
    <div id="poruka"></div><br>
    <div id="sadrzaj"></div>
    <table border=1 *ngIf="postoji==1">
    <tr><th>Naslov</th><th>Opis</th><th>Broj sezona</th><th>Broj epizoda</th>
    <th>Popularnost</th><th>Poster</th><th>Poveznica na Homepage</th></tr>
    <tr>
      <td> {{serija.name}}</td>
      <td> {{serija.overview}}</td>
      <td> {{serija.number_of_seasons}}</td>
      <td> {{serija.number_of_episodes}}</td>
      <td> {{serija.popularity}}</td>
      <td><img [src]='"https://image.tmdb.org/t/p/w600_and_h900_bestv2/"+serija.poster_path' width='100'
      [alt]='"Poster serije " + serija.name'/></td>
      <td><a [href]='serija.homepage' target="_blank">{{serija.homepage}}</a></td>
    </table>
    <button id="SpremiSeriju" (click)="SpremiSeriju()" *ngIf="this.privilegije!=0&&postoji==1">Spremi Seriju</button>
  `,
  styles: [
  ]
})
export class SerijadetaljiComponent implements AfterViewInit {
  serija:any;
  postoji=0;
  serijaID:any;
  privilegije:any=0;
  constructor(private servisFunkcije : Funkcije,private renderer: Renderer2, private el: ElementRef,private ruta: ActivatedRoute,private naslov: Title){

  }
  ngOnInit(){
    if(sessionStorage.getItem('privilegije')){
      this.privilegije=sessionStorage.getItem('privilegije');
    }else{
      this.privilegije=0;
    }
  }
  ngAfterViewInit(): void {
    const naslov = 'Stranica detalji';
    this.naslov.setTitle(naslov);
    this.ruta.params.subscribe(params => {
      this.serijaID = params['id'];
    });
    const brojRegex = /^[0-9]+$/;
    if(!brojRegex.test(this.serijaID.toString())){
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Greška u url, id mora biti broj!');
    }else{
      this.uzmiSeriju(this.serijaID);
    }
  }
  SpremiSeriju() {
    if(sessionStorage.getItem('privilegije')!='3'){
      this.dodajSeriju().then(povrat =>{
        if(povrat==201){
          const element = this.el.nativeElement.querySelector('#poruka');
          this.renderer.setProperty(element, 'innerHTML', 'Serija uspješno dodana u favorite!');
        }else if(povrat==400){
          const element = this.el.nativeElement.querySelector('#poruka');
          this.renderer.setProperty(element, 'innerHTML', 'Serija je već u favoritima!');
        }else{
          const element = this.el.nativeElement.querySelector('#poruka');
          this.renderer.setProperty(element, 'innerHTML', 'Login ne valja ili serverski problem!');
        }
      });
    }else{
      let povrat = this.dodajSerijuGit();
      if(povrat==201){
        const element = this.el.nativeElement.querySelector('#poruka');
        this.renderer.setProperty(element, 'innerHTML', 'Serija uspješno dodana u favorite!');
      }else if(povrat==400){
        const element = this.el.nativeElement.querySelector('#poruka');
        this.renderer.setProperty(element, 'innerHTML', 'Serija je već u favoritima!');
      }else{
        const element = this.el.nativeElement.querySelector('#poruka');
        this.renderer.setProperty(element, 'innerHTML', 'Login ne valja ili serverski problem!');
      }
    }
  }
  dodajSerijuGit(){
    let serijespremljene=localStorage.getItem("gitFavoriti");
    let serije:any;
    if(serijespremljene){
       serije = JSON.parse(serijespremljene);
    }else{
      serije = {};
    }
    if(serije[this.serijaID]){
      return 400;
    }
    let novaserija :any= this.serija;
    serije[this.serijaID]=novaserija;
    //console.log("Ovo su spremljene serije "+JSON.stringify(this.serija));
    localStorage.setItem("gitFavoriti",JSON.stringify(serije));
    return 201;
  }
  async dodajSeriju(){
    let zaglavlje = new Headers();
    zaglavlje.set("Content-Type", "application/json");
    let tijelo = {
      idserije: this.serijaID,
    };

    let token = await this.servisFunkcije.dajToken();
    console.log(token);
    if(token)
    zaglavlje.set("Authorization", token);
    let parametri = {
        method: "POST",
        body: JSON.stringify(tijelo),
        headers: zaglavlje,
    };
    let odgovor = await fetch(
      this.servisFunkcije.url+"/baza/favoriti",
        parametri
    );
    if (odgovor.status == 201) {
        console.log("Favorit ubačen na servisu");
        return 201;
    } else {
        console.log(odgovor.status);
        console.log(await odgovor.text());
        return odgovor.status;
    }
  }
  async uzmiSeriju(id: number){
    let zaglavlje = new Headers();
    let token = await this.servisFunkcije.dajToken();
    if(token)
      zaglavlje.set("Authorization", token);
    let parametri = { 
      method: "GET" ,
      headers: zaglavlje,
    };

    let odgovor = await fetch(
      this.servisFunkcije.url+"/api/tmdb/serija?id=" + id,
      parametri
    );
    let podaci:any = await odgovor.text();
      podaci = JSON.parse(podaci);
      this.serija=podaci;
    if (this.serija.success==false) {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Serija s tim ID ne postoji!');
      this.serija=null;
    }else if (odgovor.status == 200) {
      this.postoji=1;
    } else if (odgovor.status == 401) {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Neautorizirani pristup! Prijavite se!');
    } else {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Greška u dohvatu!');
    }
  }
}
