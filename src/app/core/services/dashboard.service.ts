import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Dashboard, TopBicicleta } from '../models/usuario.model';
 
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/dashboard`;
 
  getResumen(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.apiUrl);
  }
 
  getTopBicicletas(): Observable<TopBicicleta[]> {
    return this.http.get<TopBicicleta[]>(`${this.apiUrl}/top-bicicletas`);
  }
}