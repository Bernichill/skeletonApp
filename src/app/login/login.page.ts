import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  credentials = {
    username: '',
    password: ''
  };

  newUser = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    rut: '',
    phone: '',
    empresa: '',
    cargo: '',
    licencia: ''
  };
  
  isLoading = false;
  showRegister = false;
  hidePassword = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private storageService: StorageService
  ) {}

  toggleRegister() {
    this.showRegister = !this.showRegister;
  }

  async onRegister() {
    if (!this.validateForm()) {
      return;
    }

    await this.showLoading('Registrando usuario...');

    this.apiService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.hideLoading();
        this.presentToast('Usuario registrado exitosamente', 'success');
        this.showRegister = false;
        this.credentials.username = this.newUser.username;
        this.credentials.password = this.newUser.password;
      },
      error: (error) => {
        this.hideLoading();
        console.error('Error en registro:', error);
        this.presentToast('Error al registrar usuario', 'danger');
      }
    });
  }

  private validateForm(): boolean {
    if (!this.newUser.username || !this.newUser.password) {
      this.presentToast('Por favor complete todos los campos obligatorios', 'warning');
      return false;
    }
    return true;
  }

  async onSubmit() {
    try {
      await this.showLoading();
      this.apiService.login(this.credentials.username, this.credentials.password)
        .subscribe({
          next: async (user) => {
            if (user) {
              await this.storageService.set('user', user);
              await this.storageService.set('isLoggedIn', true);
              this.hideLoading();
              this.router.navigate(['/home']);
            } else {
              this.hideLoading();
              this.presentToast('Usuario o contraseña incorrectos', 'danger');
            }
          },
          error: (error) => {
            this.hideLoading();
            this.presentToast('Error al iniciar sesión', 'danger');
          }
        });
    } catch (error) {
      this.hideLoading();
      this.presentToast('Error inesperado', 'danger');
    }
  }

  async logout() {
    await this.storageService.clear();
    this.router.navigate(['/login']);
  }

  private async showLoading(message: string = 'Verificando credenciales...') {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: message,
      spinner: 'circular',
    });
    await loading.present();
  }

  private hideLoading() {
    this.isLoading = false;
    this.loadingCtrl.dismiss();
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top',
      cssClass: 'toast-custom'
    });
    toast.present();
  }
}
