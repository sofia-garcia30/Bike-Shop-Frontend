import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/usuario.model';
 
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/usuarios`;
 
  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
 
  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }
 
  crear(usuario: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }
 
  actualizar(id: number, usuario: Partial<UsuarioRequest>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }
 
  // 🔥 Cambiar "eliminar" por "desactivar"
  desactivar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  // 🔥 Agregar método para activar
  activar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/activar`, {});
  }
}