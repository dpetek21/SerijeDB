import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Funkcije } from '../funkcije.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-prijava',
  template: `
        <div id="poruka"></div><br>
        <label for="korime">Korisničko ime</label>
        <input name="korime" type="text" id="korime" #korime/>
        <label for="lozinka">Lozinka</label>
        <input name="lozinka" type="password"  id="pass" #pass/>
        <input type="button" value="Šalji" id="salji" (click)="Login(korime.value, pass.value)"/>
        <br/> <br/>
        <input type="button" (click)="GithubRequest()" value="Github login"/>
        <h4>Običan korisnik: korime:"obican", lozinka:"rwa"</h4>
        <h4>Admin korisnik: korime:"admin", lozinka:"rwa"</h4>
  `,
  styles: [
  ]
})
export class PrijavaComponent {
  private subscription!: Subscription;
  private clientid = "fb319968544b7f4a19ec";
  constructor(private recaptcha: ReCaptchaV3Service,private ruter: Router,private naslov: Title, private ruta: ActivatedRoute,private servisFunkcije : Funkcije,private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit() {
    const naslov = 'Prijava';
    this.naslov.setTitle(naslov);
    const parametri = this.ruta.snapshot.queryParams;
    let gitKod = parametri['code'];
    if(gitKod){
      this.GithubLogin(gitKod);
      const element = this.el.nativeElement.querySelector('#poruka');
      this.renderer.setProperty(element, 'innerHTML', 'Pokušaj github logina, molim pričekajte.');
    }
  }
  Login(korime: string, lozinka: string) {
    this.subscription =this.recaptcha.execute('login').subscribe((token) => {
      this.servisFunkcije.zatraziPrijavu(korime,lozinka,token).then(povrat =>{
        if(povrat!=false){
          let parsepovrat = JSON.parse(povrat);
          sessionStorage.setItem('korime',korime);
          sessionStorage.setItem('privilegije',parsepovrat.privilegije);
          window.location.href = '/';
        }else{
          let pass = document.getElementById("poruka");
          sessionStorage.removeItem('korime');
          const element = this.el.nativeElement.querySelector('#poruka');
          this.renderer.setProperty(element, 'innerHTML', 'Login nije uspio, provjerite podatke');
        }
      });
    });
  }
  GithubLogin( gitKod : string) {
    this.subscription =this.recaptcha.execute('login').subscribe((token) => {
      this.servisFunkcije.zatraziPrijavuGit(gitKod,token).then(povrat =>{
        if(povrat!=false){
          let parsepovrat = JSON.parse(povrat);
          sessionStorage.setItem('korime',"Github");
          sessionStorage.setItem('privilegije',"3");
          window.location.href = '/';
        }else{
          let pass = document.getElementById("poruka");
          sessionStorage.removeItem('korime');
          const element = this.el.nativeElement.querySelector('#poruka');
          this.renderer.setProperty(element, 'innerHTML', 'Login nije uspio, provjerite podatke');
        }
      });
    });
  }
  GithubRequest() {
    let url = "https://github.com/login/oauth/authorize?client_id=";
    url += this.clientid;
    url += "&redirect_uri=";
    let redirect = window.location.href;
    redirect = encodeURIComponent(redirect);
    url+=redirect;
    console.log(url);
    window.location.href=url;

  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
