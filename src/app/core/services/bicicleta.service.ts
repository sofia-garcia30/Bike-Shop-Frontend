import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bicicleta } from '../models/bicicleta.model';

@Injectable({ providedIn: 'root' })
export class BicicletaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/bicicletas`;

  getAll(): Observable<Bicicleta[]> {
    return this.http.get<Bicicleta[]>(this.url);
  }

  getById(id: number): Observable<Bicicleta> {
    return this.http.get<Bicicleta>(`${this.url}/${id}`);
  }

  create(bicicleta: Bicicleta): Observable<Bicicleta> {
    return this.http.post<Bicicleta>(this.url, bicicleta);
  }

  update(id: number, bicicleta: Bicicleta): Observable<Bicicleta> {
    return this.http.put<Bicicleta>(`${this.url}/${id}`, bicicleta);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }


}
