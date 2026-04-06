import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/api/ventas`);
  }

  crear(venta: any): Observable<any> {
    return this.http.post<any>(`${this.api}/api/ventas`, venta);
  }

  cancelar(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/api/ventas/${id}/cancelar`, {});
  }
}
