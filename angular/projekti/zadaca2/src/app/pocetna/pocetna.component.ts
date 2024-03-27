import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-pocetna',
  template: `
    <div id="poruka"></div><br>
    Filter: <input type="text" id="filter" placeholder="Ime serije" (keyup)="keyUpFilter($event)"><br>
    <div id="stranicenje"></div>
    <div id="sadrzaj" *ngIf="filter!=''">
      <table border=1>
      <button (click)="PostaviStr(1)" id="prvi" *ngIf="str>1"><<</button>
      <button (click)="PostaviStr(str-1)" id="minusjedan" *ngIf="str>1"><</button>
      <button id="sredina">{{str}}/{{ukupno}}</button>
      <button (click)="PostaviStr(str+1)" id="plusjedan" *ngIf="str<ukupno">></button>
      <button (click)="PostaviStr(ukupno)" id="zadnji" *ngIf="str<ukupno">>></button>
      <tr><th>Naslov</th><th>Opis</th></tr>
      <tr *ngFor="let serija of serije">
      <td>{{serija.name}}</td><td>{{serija.overview}}</td>
      <td><button (click)="otvoriDetalje(serija.id)">Detalji serije</button> </td>

      </tr>
      </table>
    </div>
  `,
  styles: [
  ]
})
export class PocetnaComponent {
  serije : any;
  str : number=1;
  ukupno:number=1;
  filter : string='';
  mozeli : boolean = false;
  constructor(private ruter: Router,private servisFunkcije : Funkcije,private naslov: Title, private ruta: ActivatedRoute,private renderer: Renderer2, private el: ElementRef) { }
  ngOnInit() {
    const naslov = 'Početna stanica';
    this.naslov.setTitle(naslov);
  }
  ngAfterViewInit(): void {
  }
  keyUpFilter(event: Event): void{
    const vrijednost = (event.target as HTMLInputElement).value;
    if(vrijednost.length>=3){
      this.filter=vrijednost;
      this.dajSerije(1);
    }else{
      this.filter="";
    }
  }
  
  PostaviStr(novistr: number) {
    this.str=novistr;
    this.dajSerije(this.str);
  }
  
  async dajSerije(str :number) {
    let zaglavlje = new Headers();
    let token = await this.servisFunkcije.dajToken();
    if(token)
      zaglavlje.set("Authorization", token);
    let parametri :RequestInit= {
        method: "GET",
        headers: zaglavlje,
        credentials:'include',
    };
    let odgovor = await fetch(
        this.servisFunkcije.url+"/api/tmdb/serije?stranica=" + str + "&trazi=" + this.filter,
        parametri
    );
    if (odgovor.status == 200) {
      let podaci:any = await odgovor.text();
      podaci = JSON.parse(podaci);
      this.serije=podaci.results;
      this.ukupno=podaci.total_pages;
      
    } else if (odgovor.status == 401) {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Neautorizirani pristup! Prijavite se!');
    } else {
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Greška u dohvatu!');
    }
  }


 otvoriDetalje(idSerije:any) {
	let url = "/serijadetalji/"+idSerije;
	this.ruter.navigate([url]);
}

}
