import { Injectable } from '@angular/core';
import {Buffer} from 'buffer';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Injectable({
  providedIn: 'root'
})
export class Funkcije {
  public url :string = environment.apiUrl;
  constructor(private recaptcha: ReCaptchaV3Service) { }
  
  async dodajToken(parametri: any = {}) {
    let zaglavlje = new Headers();
  
    if (parametri.headers != null) zaglavlje = parametri.headers;
  
    let token = await this.dajToken();
    if(token)
    zaglavlje.set("Authorization", token);
    parametri.headers = zaglavlje;
    console.log(parametri);
    return parametri;
  }
  async zatraziPrijavu(korime: string, pass:string, token:string){
    let url=this.url;
    url+="/baza/korisnici/";
    url+= korime;
    url+="/prijava";
    console.log(url);
      let tijelo = {
        lozinka: pass,
        token:token,
      };
      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      let parametri :RequestInit = {
        method: "POST",
        body: JSON.stringify(tijelo),
        credentials: "include",
        headers: zaglavlje,
      };
    let odgovor = await fetch(url, parametri);
      if (odgovor.status == 201) {
        return await odgovor.text();
      } else {
        return false;
        }
  }
  async zatraziPrijavuGit(gitCode: string, token:string){
    let url=this.url;
    url+="/baza/korisnici/";
    url+= "Github";
    url+="/prijava";
    console.log(url);
      let tijelo = {
        gitcode: gitCode,
        token:token,
      };
      console.log(tijelo);
      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      let parametri :RequestInit = {
        method: "POST",
        body: JSON.stringify(tijelo),
        credentials: "include",
        headers: zaglavlje,
      };
    let odgovor = await fetch(url, parametri);
      if (odgovor.status == 201) {
        return await odgovor.text();
      } else {
        return false;
        }
  }
  async zatraziOdjavu(korime:any){
    let url=this.url;
    url+="/baza/korisnici/";
    url+= korime;
    url+="/prijava";
    console.log(url);
      let tijelo = {
      };
      let zaglavlje = new Headers();
      zaglavlje.set("Content-Type", "application/json");
      let parametri :RequestInit = {
        method: "POST",
        body: JSON.stringify(tijelo),
        credentials: "include",
        headers: zaglavlje,
      };
    let odgovor = await fetch(url, parametri);
      if (odgovor.status == 201) {
        return await odgovor.text();
      } else {
        return false;
        }
  }
  async dajToken() {
    if(!(sessionStorage.getItem('korime') !== null)){
      console.log("korime nije postavljeno");
      return "0000";
    }
    let url =this.url;
    url+="/baza/korisnici/";
    url+= sessionStorage.getItem('korime');
    url+="/prijava";
    let odgovor = await fetch(url,{credentials:'include'});
    console.log(odgovor.status);
    console.log(odgovor);

    if(odgovor.status===201){
      let JWT = odgovor.headers.get('Authorization');
      return JWT;
    }else{
      //console.log("korime se brise");
      sessionStorage.removeItem('korime');
      sessionStorage.removeItem('privilegije');
      return "0000"};
  }
  
}