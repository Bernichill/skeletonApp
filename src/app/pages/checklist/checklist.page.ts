import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GeoService } from '../../services/geo.service';
import { Geolocation } from '@capacitor/geolocation';
import { Historial } from '../../interfaces/historial.interface';
import { trigger, state, style, transition, animate } from '@angular/animations';

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

  selectedPatente: string = '';
  patentes: string[] = [];
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

  constructor(
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private geoService: GeoService
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
    if (!this.selectedPatente) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor seleccione una patente',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    this.isSubmitting = true;

    const checklistData = {
      userId: localStorage.getItem('userId') || '1',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      patente: this.selectedPatente,
      kilometraje: 0,
      ubicacion: this.ubicacion,
      items: this.checklistItems.map(item => ({
        nombre: item.title,
        estado: item.status === 'Bueno'
      })),
      observaciones: this.checklistItems
        .filter(item => item.status === 'Malo' && item.comments)
        .map(item => `${item.title}: ${item.comments}`)
        .join('. ')
    };

    try {
      await this.apiService.createChecklist(checklistData).toPromise();
      
      const toast = await this.toastCtrl.create({
        message: 'Checklist guardado exitosamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      
      this.resetFields();
      this.router.navigate(['/historial']);
    } catch (error) {
      console.error('Error al guardar el checklist:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar el checklist',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isSubmitting = false;
    }
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
      
      const historial: Historial = {
        fecha: new Date(),
        respuestas: this.checklistItems,
        ubicacion: {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude
        }
      };
      
      // ... resto del código de guardado ...
      
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      // Guardar sin ubicación
      const historial: Historial = {
        fecha: new Date(),
        respuestas: this.checklistItems
      };
      // ... resto del código de guardado ...
    }
  }
}
