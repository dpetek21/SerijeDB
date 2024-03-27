import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PocetnaComponent } from './pocetna/pocetna.component';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { OdjavaComponent } from './odjava/odjava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { DnevnikComponent } from './dnevnik/dnevnik.component';
import { ProfilComponent } from './profil/profil.component';
import { FavoritiComponent } from './favoriti/favoriti.component';
import { FavoritdetaljiComponent } from './favoritdetalji/favoritdetalji.component';
import { SerijadetaljiComponent } from './serijadetalji/serijadetalji.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";

@NgModule({
  declarations: [
    AppComponent,
    PocetnaComponent,
    DokumentacijaComponent,
    PrijavaComponent,
    OdjavaComponent,
    RegistracijaComponent,
    KorisniciComponent,
    DnevnikComponent,
    ProfilComponent,
    FavoritiComponent,
    FavoritdetaljiComponent,
    SerijadetaljiComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RecaptchaV3Module
  ],
  providers: [{ provide: RECAPTCHA_V3_SITE_KEY, useValue: "6LeT00ApAAAAAJGHn6xBFKzudpQGrQqpl3V-IDnM" }],
  bootstrap: [AppComponent]
})
export class AppModule { }
