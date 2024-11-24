export interface Checklist {
  id: string;
  userId: string;
  fecha: string;
  hora: string;
  patente: string;
  kilometraje: number;
  ubicacion: {
    latitude: number;
    longitude: number;
    direccion?: string;
  };
  items: ChecklistItem[];
  observaciones: string;
}

export interface ChecklistItem {
  nombre: string;
  estado: boolean;
} 