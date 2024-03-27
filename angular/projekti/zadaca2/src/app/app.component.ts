import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Funkcije } from './funkcije.service';

@Component({
  selector: 'app-root',
  template: `
    <header id="imestranice"></header>
     <nav>
      <a routerLink="/" *ngIf="this.privilegije!=0">Početna&nbsp;&nbsp;</a>
      <a routerLink="/prijava" *ngIf="this.privilegije==0">Prijava&nbsp;&nbsp;</a>
      <a routerLink="/odjava" *ngIf="this.privilegije!=0">Odjava&nbsp;&nbsp;</a>
      <a routerLink="/dokumentacija">Dokumentacija&nbsp;&nbsp;</a>
      <a routerLink="/registracija" *ngIf="this.privilegije==2">Registracija&nbsp;&nbsp;</a>
      <a routerLink="/korisnici" *ngIf="this.privilegije==2">Korisnici&nbsp;&nbsp;</a>
      <a routerLink="/dnevnik" *ngIf="this.privilegije==2">Dnevnik (nije implementirano)&nbsp;&nbsp;</a>
      <a routerLink="/profil" *ngIf="this.privilegije>0&&this.privilegije!=3">Profil&nbsp;&nbsp;</a>
      <a routerLink="/favoriti" *ngIf="this.privilegije!=0">Favoriti&nbsp;&nbsp;</a>
    </nav>
    <hr>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit{
  imestranice: string ="";
  privilegije:any;
  constructor(private servisFunkcije : Funkcije,private ruta:ActivatedRoute){}
  ngOnInit(){
    //console.log("korime i privilegije su"+sessionStorage.getItem('korime')+"  "+sessionStorage.getItem('privilegije'));
    this.servisFunkcije.dajToken().then(povrat => {
    });
    if(sessionStorage.getItem('privilegije')){
      this.privilegije=sessionStorage.getItem('privilegije');
    }else{
      this.privilegije=0;
      if ((window.location.pathname !== '/prijava/' && window.location.pathname !== '/dokumentacija/' )&&(window.location.pathname !== '/prijava' && window.location.pathname !== '/dokumentacija' )) {
        window.location.href = '/prijava';
      }
    }
    
  }
}
