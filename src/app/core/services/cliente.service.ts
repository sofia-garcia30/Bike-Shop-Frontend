import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cliente {
  id?: number;
  documento: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.api}/api/clientes`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.api}/api/clientes`, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.api}/api/clientes/${id}`, cliente);
  }
}
