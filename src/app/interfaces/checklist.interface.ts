export interface Checklist {
  id?: string;
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
  listaVerificacion: Array<{
    nombre: string;
    estado: boolean;
    comentario?: string;
  }>;
  observaciones?: string;
}

export interface ChecklistItem {
  nombre: string;
  estado: boolean;
} 