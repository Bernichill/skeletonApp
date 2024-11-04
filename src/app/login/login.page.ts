import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component'; // Importar AppComponent

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentials = {
    username: '',
    password: ''
  };

  isLoading = false; // Variable para controlar el estado de carga

  constructor(private navCtrl: NavController, private router: Router, private appComponent: AppComponent) {}

  ngOnInit() {}

  onSubmit() {
    if (this.credentials.username && this.credentials.password) {
      this.isLoading = true; // Iniciar el estado de carga
      // Almacenar el username en la variable pública de AppComponent
      this.appComponent.username = this.credentials.username; 

      // Simular un proceso de carga (puedes reemplazarlo con tu lógica de autenticación)
      setTimeout(() => {
        // Redirigir a Home
        this.router.navigate(['/home']);
        console.log(this.appComponent.username);
        this.isLoading = false; // Finalizar el estado de carga
      }, 2000); // Simulando un retraso de 2 segundos
    }
  }
}
