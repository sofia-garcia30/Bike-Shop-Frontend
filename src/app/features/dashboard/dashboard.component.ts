import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../core/services/dashboard.service';
import { ReporteService } from '../../core/services/reporte.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Datos del dashboard
  metrics: any = {
    totalVentas: 0,
    totalClientes: 0,
    totalBicicletas: 0,
    stockBajo: 0,
    sinStock: 0
  };
  topBicicletas: any[] = [];
  loading = true;

  // Variables para permisos
  isAdmin = false;
  isEmpleado = false;

  // 🔥 Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(
    private dashboardService: DashboardService,
    private reporteService: ReporteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isEmpleado = this.authService.isEmpleado();
    this.cargarDashboard();
    if (this.isAdmin) {
      this.cargarTopBicicletas();
    }
  }

  cargarDashboard(): void {
    this.loading = true;
    this.dashboardService.getResumen().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.toast.error('Error al cargar los datos del dashboard');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTopBicicletas(): void {
    this.dashboardService.getTopBicicletas().subscribe({
      next: (data) => {
        this.topBicicletas = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando top bicicletas', err);
        this.cdr.detectChanges();
      }
    });
  }

  // 🔥 MÉTODO PARA DESCARGAR REPORTE POR FECHA
  descargarReportePorFecha(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.toast.warning('Selecciona ambas fechas');
      return;
    }
    const inicio = `${this.fechaInicio}T00:00:00`;
    const fin = `${this.fechaFin}T23:59:59`;
    this.reporteService.ventasPorFechaPDF(inicio, fin).subscribe(blob => {
      this.reporteService.descargar(blob, `ventas_${this.fechaInicio}_a_${this.fechaFin}.pdf`);
    });
  }

  descargarReporteVentas(): void {
    this.reporteService.ventasPDF().subscribe(blob => {
      this.reporteService.descargar(blob, 'reporte_ventas.pdf');
    });
  }

  descargarReporteInventario(): void {
    this.reporteService.inventarioPDF().subscribe(blob => {
      this.reporteService.descargar(blob, 'reporte_inventario.pdf');
    });
  }

  descargarReportePedidos(): void {
    this.reporteService.pedidosPDF().subscribe(blob => {
      this.reporteService.descargar(blob, 'reporte_pedidos.pdf');
    });
  }

  descargarMisVentas(): void {
    this.reporteService.misVentasPDF().subscribe(blob => {
      this.reporteService.descargar(blob, 'mis_ventas.pdf');
    });
  }
}