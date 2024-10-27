import { Component, ElementRef, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimationController, Animation, IonCard } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChildren(IonCard, { read: ElementRef }) cards: QueryList<ElementRef<HTMLIonCardElement>> | undefined;

  private animations: Animation[] = [];

  // Variables pasadas desde Login
  username: string | null = null;

  // Variables para mostrar en esta página
  nombre: string = '';
  apellido: string = '';
  nivelEducacional: string | null = null;
  fechaNacimiento: string | null = null;
  submitted: boolean = false;

  constructor(private route: ActivatedRoute, private animationCtrl: AnimationController) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
    });
  }

  ngAfterViewInit() {
    if (this.cards) {
      this.cards.forEach(card => {
        const animation = this.animationCtrl
          .create()
          .addElement(card.nativeElement)
          .duration(1500)
          .iterations(Infinity)
          .fromTo('transform', 'translateX(0px)', 'translateX(100px)')
          .fromTo('opacity', '1', '0.2');
        
        this.animations.push(animation);
      });
    }
  }

  play() {
    this.animations.forEach(animation => animation.play());
  }

  stop() {
    this.animations.forEach(animation => animation.stop());
  }

  submitForm() {
    this.submitted = true;
    // Aquí puedes incluir la lógica para mostrar un popup
  }

  clearForm() {
    this.play(); // Inicia la animación
    setTimeout(() => {
      this.stop(); // Detiene la animación después de 1 segundo
      // Limpia los campos del formulario
      this.nombre = '';
      this.apellido = '';
      this.nivelEducacional = null;
      this.fechaNacimiento = null;
      this.submitted = false;
    }, 1000);
  }
}
