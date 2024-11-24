import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Checklist } from '../interfaces/checklist.interface';
import { BehaviorSubject } from 'rxjs';
import { Vehiculo } from '../interfaces/vehiculo.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://10.0.2.2:3000';
  private historySubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    // Cargar historial existente
    this.loadHistory();
  }

  // Servicios para Usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users?username=${username}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user);
  }

  updateUser(user: User) {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  // Servicios para Checklists
  getAllChecklists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/checklists`);
  }

  getChecklistById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/checklists/${id}`);
  }

  getChecklistsByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/checklists?userId=${userId}`);
  }

  createChecklist(checklist: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checklists`, checklist);
  }

  updateChecklist(id: string, checklist: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/checklists/${id}`, checklist);
  }

  deleteChecklist(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/checklists/${id}`);
  }

  // Servicios para Vehículos
  getAllVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehiculos`);
  }

  getVehiculoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vehiculos/${id}`);
  }

  getVehiculoByPatente(patente: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vehiculos?patente=${patente}`);
  }

  createVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vehiculos`, vehiculo);
  }

  updateVehiculo(id: string, vehiculo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vehiculos/${id}`, vehiculo);
  }

  deleteVehiculo(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vehiculos/${id}`);
  }

  // Servicio de autenticación
  login(username: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}/users?username=${username}&password=${password}`)
      .pipe(
        map(users => {
          const user = users.length > 0 ? users[0] : null;
          if (user && user.id) {
            localStorage.setItem('userId', user.id);
          }
          return user;
        })
      );
  }

  // Métodos para el historial
  private loadHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      this.historySubject.next(JSON.parse(savedHistory));
    }
  }

  getHistory(): Observable<any[]> {
    return this.historySubject.asObservable();
  }

  private addToHistory(question: string, response: any) {
    const currentHistory = this.historySubject.value;
    const historyItem = {
      pregunta: question,
      respuesta: response,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [...currentHistory, historyItem];
    this.historySubject.next(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  }

  clearHistory() {
    this.historySubject.next([]);
    localStorage.removeItem('chatHistory');
  }

  // Modificar el método existente de envío de mensajes para incluir el historial
  sendMessage(message: string): Observable<any> {
    return this.http.post<any>('TU_URL_API', { message }).pipe(
      tap(response => {
        this.addToHistory(message, response);
      })
    );
  }

  // Método para obtener las patentes
  getPatentes(): Observable<string[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos`).pipe(
      map(vehiculos => vehiculos.map(vehiculo => vehiculo.patente))
    );
  }

  getCurrentUser(): Observable<User> {
    // Obtener el ID o username del usuario actual del localStorage
    const currentUserId = localStorage.getItem('userId'); // o 'username' según hayas guardado
    
    if (!currentUserId) {
      throw new Error('No hay usuario autenticado');
    }
    
    // Usar el endpoint existente getUserById o getUserByUsername
    return this.http.get<User>(`${this.apiUrl}/users/${currentUserId}`);
    // O si prefieres usar username:
    // return this.getUserByUsername(currentUserId);
  }
}
