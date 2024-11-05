import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

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
      this.isLoading = true; // Iniciar el estado de carga con variable que declaramos más arriba.
      // Almacenar el username en la variable pública de AppComponent que pasaremos a Perfil.
      this.appComponent.username = this.credentials.username; 

      // Simular un proceso de carga para que la barra funcione durante un tiempo determinado
      setTimeout(() => {
        // Redirigir a Home
        this.router.navigate(['/home']);
        console.log(this.appComponent.username);
        this.isLoading = false; // Finalizar el estado de carga
      }, 2000); // Simular un retraso de 2 segundos para carga de barra
    }
  }
}
