import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Guardar datos
  async set(key: string, value: any) {
    await this._storage?.set(key, value);
  }

  // Obtener datos
  async get(key: string) {
    return await this._storage?.get(key);
  }

  // Eliminar un item específico
  async remove(key: string) {
    await this._storage?.remove(key);
  }

  // Limpiar todo el storage
  async clear() {
    await this._storage?.clear();
  }

  // Obtener todas las keys
  async keys() {
    return await this._storage?.keys();
  }
}
