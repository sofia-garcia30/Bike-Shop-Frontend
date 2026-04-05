import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reportes`;

  // ─── VENTAS (solo ADMIN) ──────────────────────────
  ventasPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/pdf`, { responseType: 'blob' });
  }

  ventasExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/excel`, { responseType: 'blob' });
  }

  // ─── MIS VENTAS (ADMIN + EMPLEADO) ─────────────────
  misVentasPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/pdf/mis-ventas`, { responseType: 'blob' });
  }

  misVentasExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ventas/excel/mis-ventas`, { responseType: 'blob' });
  }

  // ─── INVENTARIO (solo ADMIN) ───────────────────────
  inventarioPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/pdf`, { responseType: 'blob' });
  }

  inventarioExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/excel`, { responseType: 'blob' });
  }

  stockCriticoPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/pdf/stock-critico`, { responseType: 'blob' });
  }

  // ─── PEDIDOS (solo ADMIN) ─────────────────────────
  pedidosPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pedidos/pdf`, { responseType: 'blob' });
  }

  pedidosExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pedidos/excel`, { responseType: 'blob' });
  }

  // ─── HELPER ───────────────────────────────────────
  descargar(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}