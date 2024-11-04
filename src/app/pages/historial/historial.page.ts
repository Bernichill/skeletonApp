import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  // Columnas que se mostrarán en la tabla
  displayedColumns: string[] = [
    'patente',
    'bocina',
    'aireAcondicionado',
    'neumaticoRepuesto',
    'airbag',
    'baliza',
    'radio'
  ];

  // Fuente de datos para la tabla
  dataSource = new MatTableDataSource<any>();

  constructor() { }

  ngOnInit() {
    this.loadHistorial();
  }

  loadHistorial() {
    const historialGuardado = localStorage.getItem('historial');
    const data = historialGuardado ? JSON.parse(historialGuardado) : [];
    this.dataSource.data = data;
  }
}
