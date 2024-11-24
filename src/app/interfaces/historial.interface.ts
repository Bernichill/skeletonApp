export interface Historial {
  fecha: Date;
  respuestas: any[];
  ubicacion?: {
    latitude: number;
    longitude: number;
  };
} 