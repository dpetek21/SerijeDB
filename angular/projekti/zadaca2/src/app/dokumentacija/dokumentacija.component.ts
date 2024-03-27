import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dokumentacija',
  templateUrl: `./dokumentacija.component.html`,
  styles: [
  ]
})
export class DokumentacijaComponent {
  constructor(private naslov: Title, private ruta: ActivatedRoute) { }
  ngOnInit() {
    const naslov = 'Dokumentacija';
    this.naslov.setTitle(naslov);
  }
}
