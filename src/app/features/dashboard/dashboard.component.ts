import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { ReporteService } from '../../core/services/reporte.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  // 🔥 Variables para controlar permisos según rol
  isAdmin = false;
  isEmpleado = false;

  constructor(
    private dashboardService: DashboardService,
    private reporteService: ReporteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 🔥 Obtener el rol del usuario logueado
    this.isAdmin = this.authService.isAdmin();
    this.isEmpleado = this.authService.isEmpleado();
    
    // Cargar datos comunes (métricas)
    this.cargarDashboard();
    
    // 🔥 Solo ADMIN carga el top de bicicletas
    if (this.isAdmin) {
      this.cargarTopBicicletas();
    }
  }

  // 📊 Cargar métricas del dashboard (ambos roles)
  cargarDashboard(): void {
    this.loading = true;
    this.dashboardService.getResumen().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.loading = false;
      }
    });
  }

  // 🏆 Cargar top bicicletas (solo ADMIN)
  cargarTopBicicletas(): void {
    this.dashboardService.getTopBicicletas().subscribe({
      next: (data) => {
        this.topBicicletas = data;
      },
      error: (err) => console.error('Error cargando top bicicletas', err)
    });
  }

  // 📄 Reportes para ADMIN
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

  // 📄 Reporte para EMPLEADO (solo sus ventas)
  descargarMisVentas(): void {
    this.reporteService.misVentasPDF().subscribe(blob => {
      this.reporteService.descargar(blob, 'mis_ventas.pdf');
    });
  }
}