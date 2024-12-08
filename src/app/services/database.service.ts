import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Checklist } from '../interfaces/checklist.interface';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.init();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.db = await this.sqlite.createConnection(
        'safedriving_db',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
      this.initialized = true;

      const schema = `
        CREATE TABLE IF NOT EXISTS checklists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT,
          fecha TEXT,
          hora TEXT,
          patente TEXT,
          kilometraje INTEGER,
          latitude REAL,
          longitude REAL,
          direccion TEXT,
          observaciones TEXT
        );

        CREATE TABLE IF NOT EXISTS items_checklist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          checklist_id INTEGER,
          nombre TEXT,
          estado INTEGER,
          comentario TEXT,
          FOREIGN KEY (checklist_id) REFERENCES checklists (id)
        );
      `;

      await this.db.execute(schema);
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      this.initialized = false;
      throw error;
    }
  }

  async guardarChecklist(checklist: any): Promise<number> {
    try {
      const query = `
        INSERT INTO checklists (
          userId, 
          fecha, 
          hora, 
          patente, 
          kilometraje, 
          latitude, 
          longitude, 
          direccion, 
          observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        checklist.userId,
        checklist.fecha,
        checklist.hora,
        checklist.patente,
        checklist.kilometraje,
        checklist.ubicacion?.latitude,
        checklist.ubicacion?.longitude,
        checklist.ubicacion?.direccion,
        checklist.observaciones
      ];

      const result = await this.db.run(query, values);
      const checklistId = result.changes?.lastId;

      if (!checklistId) {
        throw new Error('No se pudo obtener el ID del checklist');
      }

      // Guardar los items
      for (const item of checklist.items) {
        await this.db.run(`
          INSERT INTO items_checklist (
            checklist_id,
            nombre,
            estado,
            comentario
          ) VALUES (?, ?, ?, ?)
        `, [checklistId, item.nombre, item.estado ? 1 : 0, item.comentario]);
      }

      return checklistId;
    } catch (error) {
      console.error('Error guardando checklist en SQLite:', error);
      throw error;
    }
  }

  async obtenerChecklists(): Promise<Checklist[]> {
    try {
      const query = `
        SELECT c.*, 
               i.nombre as item_nombre, 
               i.estado as item_estado, 
               i.comentario as item_comentario
        FROM checklists c
        LEFT JOIN items_checklist i ON c.id = i.checklist_id
        ORDER BY c.fecha DESC, c.hora DESC
      `;
      
      const result = await this.db.query(query);
      console.log('Datos obtenidos de SQLite:', result);
      
      return this.transformarResultados(result.values || []);
    } catch (error) {
      console.error('Error obteniendo checklists:', error);
      throw error;
    }
  }

  private transformarResultados(results: any[]) {
    const checklistMap = new Map();
    
    results.forEach(row => {
      if (!checklistMap.has(row.id)) {
        checklistMap.set(row.id, {
          id: row.id,
          userId: row.userId,
          fecha: row.fecha,
          hora: row.hora,
          patente: row.patente, // Asegurarnos de incluir la patente
          kilometraje: row.kilometraje,
          ubicacion: {
            latitude: row.latitude,
            longitude: row.longitude,
            direccion: row.direccion
          },
          listaVerificacion: [],
          observaciones: row.observaciones
        });
      }
      
      if (row.item_nombre) {
        checklistMap.get(row.id).listaVerificacion.push({
          nombre: row.item_nombre,
          estado: Boolean(row.item_estado),
          comentario: row.item_comentario
        });
      }
    });
    
    return Array.from(checklistMap.values());
  }
} 