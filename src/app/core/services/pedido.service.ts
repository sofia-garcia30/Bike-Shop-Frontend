import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, PedidoRequest } from '../models/pedido.model';

 
 
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/pedidos`;
 
  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }
 
  getById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }
 
  getPorProveedor(idProveedor: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/proveedor/${idProveedor}`);
  }
 
  crear(pedido: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }
 
  marcarRecibido(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/recibido`, {});
  }
}
