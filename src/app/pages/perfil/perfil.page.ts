import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss'],
})
export class PerfilPage {
  // Variables para almacenar los datos del usuario
  username: string = this.appComponent.username;
  nombre: string = '';
  apellido: string = '';
  fechaNacimiento: string | null = null;
  faenaTrabajo: string = '';

  constructor(private appComponent: AppComponent) {}

  ngOnInit() {
    // Asignar el username desde AppComponent
    this.username = this.appComponent.username;
    console.log(this.username);
  }

  submitForm() {
    // Manejo del envío del formulario
    console.log('Formulario enviado:', {
      username: this.username,
      nombre: this.nombre,
      apellido: this.apellido,
      fechaNacimiento: this.fechaNacimiento,
      faenaTrabajo: this.faenaTrabajo,
    });
  }

  clearForm() {
    // Limpia los campos del formulario
    this.nombre = '';
    this.apellido = '';
    this.fechaNacimiento = null;
    this.faenaTrabajo = '';
  }
}
