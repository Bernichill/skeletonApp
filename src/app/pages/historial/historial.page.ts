import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DatabaseService } from '../../services/database.service';
import { Network } from '@capacitor/network';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export interface ItemHistorial {
  fecha: string;
  hora: string;
  patente: string;
  ubicacion?: {
    direccion: string;
    latitude: number;
    longitude: number;
  };
  items: Array<{
    nombre: string;
    estado: boolean;
    comentario?: string;
  }>;
  observaciones?: string;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  animations: [
    trigger('tableAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('50ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HistorialPage implements OnInit {
  displayedColumns: string[] = ['fecha', 'hora', 'patente', 'ubicacion', 'items', 'observaciones'];
  dataSource = new MatTableDataSource<ItemHistorial>([]);
  isLoading = false;
  animations: any[] = [];

  constructor(
    public apiService: ApiService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit() {
    this.loadRegistros();
  }

  ionViewWillEnter() {
    this.loadRegistros();
  }

  async loadRegistros() {
    this.isLoading = true;
    try {
      // Verificar si estamos en versión web de manera más robusta
      const isWeb = !('Capacitor' in window) || window.location.protocol === 'http:';
      
      if (isWeb) {
        // En versión web, solo usar la API
        this.apiService.getAllChecklists().subscribe({
          next: (apiData: ItemHistorial[]) => {
            console.log('Datos API:', apiData);
            this.dataSource.data = apiData.sort((a, b) => {
              return new Date(b.fecha + ' ' + b.hora).getTime() - 
                     new Date(a.fecha + ' ' + a.hora).getTime();
            });
          },
          error: (error) => {
            console.error('Error al cargar datos de API:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        try {
          // Verificar si la base de datos está inicializada
          if (!this.databaseService.isInitialized()) {
            await this.databaseService.init();
          }
          
          const localData = await this.databaseService.obtenerChecklists();
          const transformedLocalData = localData.map(checklist => ({
            ...checklist,
            items: checklist.listaVerificacion || []
          })) as ItemHistorial[];
          this.dataSource.data = transformedLocalData;
          
          const networkStatus = await Network.getStatus();
          if (networkStatus.connected) {
            this.apiService.getAllChecklists().subscribe({
              next: (apiData: ItemHistorial[]) => {
                const allData = [...apiData, ...transformedLocalData];
                const uniqueData = this.removeDuplicates(allData);
                this.dataSource.data = uniqueData.sort((a, b) => {
                  return new Date(b.fecha + ' ' + b.hora).getTime() - 
                         new Date(a.fecha + ' ' + a.hora).getTime();
                });
              }
            });
          }
        } catch (error) {
          console.error('Error en versión mobile:', error);
        }
      }
    } catch (error) {
      console.error('Error al cargar los checklists:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private removeDuplicates(data: ItemHistorial[]): ItemHistorial[] {
    const seen = new Set();
    return data.filter(item => {
      const key = `${item.fecha}-${item.hora}-${item.patente}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
