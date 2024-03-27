import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  {path:'', component:PocetnaComponent, pathMatch: 'full', data: { naslov: 'Početna stranica' } },
  {path:'dokumentacija', component:DokumentacijaComponent, data: { naslov: 'Dokumentacija' }},
  {path:'prijava', component:PrijavaComponent, data: { naslov: 'Prijava' }},
  {path:'odjava', component:OdjavaComponent},
  {path:'registracija', component:RegistracijaComponent},
  {path:'korisnici', component:KorisniciComponent},
  {path:'dnevnik', component:DnevnikComponent},
  {path:'profil', component:ProfilComponent},
  {path:'favoriti', component:FavoritiComponent},
  {path:'favoritdetalji/:id', component:FavoritdetaljiComponent},
  {path:'serijadetalji/:id', component:SerijadetaljiComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
