import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GeoService } from '../../services/geo.service';
import { Geolocation } from '@capacitor/geolocation';
import { Historial } from '../../interfaces/historial.interface';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { StorageService } from '../../services/storage.service';
import { DatabaseService } from '../../services/database.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('iconRotate', [
      state('true', style({ transform: 'rotate(360deg)' })),
      state('false', style({ transform: 'rotate(0)' })),
      transition('* => *', animate('300ms ease-out'))
    ])
  ]
})
export class ChecklistPage implements OnInit {
  dataSource: any = { data: [] };

  selectedPatente: string = '';
  patentes: string[] = [];
  kilometraje: number = 0;
  ubicacion: {
    latitude: number;
    longitude: number;
    direccion: string;
  } = {
    latitude: 0,
    longitude: 0,
    direccion: ''
  };
  respuestas: any[] = [];
  observaciones: string = '';

  constructor(
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private geoService: GeoService,
    private storageService: StorageService,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    await this.loadPatentes();
    await this.obtenerUbicacion();
  }

  async loadPatentes() {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Cargando patentes...'
      });
      await loading.present();

      this.apiService.getPatentes().subscribe({
        next: (patentes) => {
          this.patentes = patentes;
          loading.dismiss();
        },
        error: async (error) => {
          loading.dismiss();
          const toast = await this.toastCtrl.create({
            message: 'Error al cargar las patentes. Por favor, intente nuevamente.',
            duration: 3000,
            color: 'danger'
          });
          toast.present();
          console.error('Error loading patentes:', error);
        }
      });
    } catch (error) {
      console.error('Error in loadPatentes:', error);
    }
  }

  async obtenerUbicacion() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.ubicacion.latitude = coordinates.coords.latitude;
      this.ubicacion.longitude = coordinates.coords.longitude;
      this.ubicacion.direccion = await this.geoService.getDireccion(
        this.ubicacion.latitude,
        this.ubicacion.longitude
      );
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      this.presentToast('No se pudo obtener la ubicación', 'warning');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  checklistItems = [
    {
      name: 'bocina',
      icon: 'megaphone-outline',
      title: 'Bocina',
      status: '',
      comments: ''
    },
    {
      name: 'aireAcondicionado',
      icon: 'thermometer-outline',
      title: 'Aire Acondicionado',
      status: '',
      comments: ''
    },
    {
      name: 'neumaticoRepuesto',
      icon: 'car-outline',
      title: 'Neumático Repuesto',
      status: '',
      comments: ''
    },
    {
      name: 'airbag',
      icon: 'shield-outline',
      title: 'Airbag',
      status: '',
      comments: ''
    },
    {
      name: 'baliza',
      icon: 'warning-outline',
      title: 'Baliza',
      status: '',
      comments: ''
    },
    {
      name: 'radio',
      icon: 'radio-outline',
      title: 'Radio',
      status: '',
      comments: ''
    }
  ];

  isSubmitting: boolean = false;
  async onSubmit() {
    if (!this.validarFormulario()) return;
    
    this.isSubmitting = true;

    try {
      const checklistData = await this.prepararDatosChecklist();

      // 1. Guardar en API
      try {
        await this.apiService.createChecklist(checklistData).toPromise();
        console.log('Guardado en API exitoso');
      } catch (error) {
        console.error('Error guardando en API:', error);
        await this.presentToast('Error al guardar en servidor, se guardará localmente', 'warning');
      }

      // 2. Guardar en SQLite (siempre se guarda localmente)
      try {
        await this.databaseService.guardarChecklist(checklistData);
        console.log('Guardado en SQLite exitoso');
      } catch (error) {
        console.error('Error guardando en SQLite:', error);
        await this.presentToast('Error al guardar localmente', 'danger');
        return;
      }

      await this.presentToast('Checklist guardado exitosamente', 'success');
      this.resetFields();
      this.router.navigate(['/historial']);

    } catch (error) {
      console.error('Error general:', error);
      await this.presentToast('Error al procesar el checklist', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async prepararDatosChecklist() {
    const coordinates = await Geolocation.getCurrentPosition();
    
    return {
      userId: localStorage.getItem('userId') || '1',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES'),
      patente: this.selectedPatente,
      kilometraje: this.kilometraje,
      ubicacion: {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        direccion: await this.geoService.getDireccion(
          coordinates.coords.latitude,
          coordinates.coords.longitude
        )
      },
      listaVerificacion: this.checklistItems.map(item => ({
        nombre: item.title,
        estado: item.status === 'Bueno',
        comentario: item.comments || ''
      })),
      observaciones: this.checklistItems
        .filter(item => item.status === 'Malo' && item.comments)
        .map(item => `${item.title}: ${item.comments}`)
        .join('. ')
    };
  }

  private validarFormulario(): boolean {
    if (!this.selectedPatente) {
      this.presentToast('Por favor seleccione una patente', 'warning');
      return false;
    }
    return true;
  }

  resetFields() {
    this.selectedPatente = '';
    this.checklistItems.forEach(item => {
      item.status = '';
      item.comments = '';
    });
  }

  cleanForm() {
    this.resetFields();
  }

  needsComments(status: string): boolean {
    return status === 'Malo';
  }

  async guardarHistorial() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      
      const checklist = {
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        patente: this.selectedPatente,
        kilometraje: this.kilometraje,
        ubicacion: {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude,
          direccion: await this.geoService.getDireccion(coordinates.coords.latitude, coordinates.coords.longitude)
        },
        items: this.checklistItems,
        observaciones: this.checklistItems
          .filter(item => item.status === 'Malo' && item.comments)
          .map(item => `${item.title}: ${item.comments}`)
          .join('. ')
      };

      // Guardar directamente en la API
      this.apiService.createChecklist(checklist).subscribe({
        next: () => {
          this.presentToast('Checklist guardado correctamente', 'success');
          this.resetFields();
        },
        error: (error) => {
          console.error('Error al guardar checklist:', error);
          this.presentToast('Error al guardar el checklist', 'danger');
        }
      });

    } catch (error) {
      console.error('Error:', error);
      this.presentToast('Error al procesar el checklist', 'danger');
    }
  }

  async logout() {
    await this.storageService.remove('user');
    await this.storageService.remove('isLoggedIn');
    
    console.log('Cerrando sesión...');
    
    this.router.navigate(['/login']);
  }

  async loadRegistros() {
    try {
      const localData = await this.databaseService.obtenerChecklists();
      console.log('Datos locales:', localData); 
      this.dataSource.data = localData;
      
      const networkStatus = await Network.getStatus();
      if (networkStatus.connected) {
        const apiData = await this.apiService.getAllChecklists().toPromise();
        console.log('Datos API:', apiData); 
        this.dataSource.data = apiData;
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
      await this.presentToast('Error al cargar registros', 'danger');
    }
  }
}