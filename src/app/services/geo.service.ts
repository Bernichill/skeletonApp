import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoService {
  constructor(private http: HttpClient) {}

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada');
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true }
      );
    });
  }

  async getDireccion(lat: number, lng: number): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
      );
      return response.display_name || 'Dirección no encontrada';
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return 'Error obteniendo dirección';
    }
  }
} 