import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Funkcije } from '../funkcije.service';

@Component({
  selector: 'app-odjava',
  template: `
    <p>Odjavljuje se, pričekajte! </p>
  `,
  styles: [
  ]
})
export class OdjavaComponent {
  constructor(private ruter: Router,private servisFunkcije : Funkcije){}
  ngOnInit(){
    this.servisFunkcije.zatraziOdjavu(sessionStorage.getItem('korime')).then(() =>{
      sessionStorage.removeItem('korime');
      sessionStorage.removeItem('privilegije');
      //this.ruter.navigate(['/']);
      window.location.href = '/prijava';
    });
    
  }
}
