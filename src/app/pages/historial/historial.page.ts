import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export interface HistorialItem {
  id: string;
  userId: string;
  fecha: string;
  hora: string;
  patente: string;
  ubicacion?: {
    latitude: number;
    longitude: number;
    direccion?: string;
  };
  items: {
    nombre: string;
    estado: boolean;
  }[];
  observaciones: string;
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
  dataSource = new MatTableDataSource<HistorialItem>([]);
  isLoading = false;

  constructor(public apiService: ApiService) {}

  ngOnInit() {
    this.loadRegistros();
  }

  ionViewWillEnter() {
    this.loadRegistros();
  }

  loadRegistros() {
    this.isLoading = true;
    this.apiService.getAllChecklists().subscribe({
      next: (checklists: HistorialItem[]) => {
        this.dataSource.data = checklists.reverse();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los checklists:', error);
        this.isLoading = false;
      }
    });
  }
}
