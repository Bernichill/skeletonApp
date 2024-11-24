import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user.interface';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-perfil',
  templateUrl: 'perfil.page.html',
  styleUrls: ['perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  @ViewChild('perfilForm') perfilForm!: NgForm;
  user: any = {};

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    try {
      const userData = await this.storageService.get('user');
      if (userData) {
        this.user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      } else {
        this.apiService.getCurrentUser().subscribe({
          next: (user) => {
            this.user = user;
          },
          error: (error) => {
            console.error('Error al obtener usuario:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  async onSubmit() {
    try {
      if (this.perfilForm.valid) {
        await this.apiService.updateUser(this.user);
        await this.storageService.set('user', this.user);
        console.log('Datos actualizados correctamente');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }
}
