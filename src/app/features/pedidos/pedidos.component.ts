import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importar modelos (tipos) desde core/models
import { Pedido, PedidoRequest } from '../../core/models/pedido.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { Bicicleta } from '../../core/models/bicicleta.model';

// Importar servicios desde core/services
import { PedidoService } from '../../core/services/pedido.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { ReporteService } from '../../core/services/reporte.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  proveedores: Proveedor[] = [];
  bicicletas: Bicicleta[] = [];
  showForm = false;
    isAdmin = false;
  isEmpleado = false 

  nuevoPedido: PedidoRequest = {
    idProveedor: 0,
    detalles: []
  };

  detalleActual = {
    codigoBicicleta: 0,
    cantidad: 0,
    precioCostoUnitario: 0
  };

  constructor(
    private pedidoService: PedidoService,
    private proveedorService: ProveedorService,
    private bicicletaService: BicicletaService,
    private reporteService: ReporteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 🔥 Obtener rol del usuario
    this.isAdmin = this.authService.isAdmin();
    this.isEmpleado = this.authService.isEmpleado();
    
    // Cargar datos (ambos roles ven la lista)
    this.cargarPedidos();
    this.cargarProveedores();
    
    // 🔥 Solo ADMIN carga bicicletas (para crear pedidos)
    if (this.isAdmin) {
      this.cargarBicicletas();
    }
  }
  

  cargarPedidos(): void {
    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.loading = false;
      }
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (data) => this.proveedores = data,
      error: (err) => console.error('Error cargando proveedores', err)
    });
  }

  cargarBicicletas(): void {
    this.bicicletaService.getAll().subscribe({
      next: (data) => this.bicicletas = data,
      error: (err) => console.error('Error cargando bicicletas', err)
    });
  }

  getNombreBicicleta(codigo: number): string {
    const bici = this.bicicletas.find(b => b.codigo === codigo);
    return bici ? `${bici.marca} ${bici.modelo}` : 'Desconocida';
  }

  getNombreProveedor(id: number): string {
    const prov = this.proveedores.find(p => p.id === id);
    return prov ? prov.nombre : 'Desconocido';
  }

agregarDetalle(): void {
  console.log('=== AGREGANDO DETALLE ===');
  console.log('detalleActual:', this.detalleActual);
  console.log('Bicicletas disponibles:', this.bicicletas);

  if (this.detalleActual.codigoBicicleta && this.detalleActual.cantidad > 0 && this.detalleActual.precioCostoUnitario > 0) {
    
    // 🔥 SOLUCIÓN: Convertir a número y buscar con == (comparación débil)
    const codigoBuscado = Number(this.detalleActual.codigoBicicleta);
    console.log('Código buscado:', codigoBuscado);
    console.log('Primer elemento del array:', this.bicicletas[0]);
    
    // Usar == en lugar de === para comparar número con string si es necesario
    const bicicletaEncontrada = this.bicicletas.find(b => Number(b.codigo) === codigoBuscado);
    
    console.log('Bicicleta encontrada:', bicicletaEncontrada);
    
    const nombreBicicleta = bicicletaEncontrada ? 
      `${bicicletaEncontrada.marca} ${bicicletaEncontrada.modelo}` : 'Desconocida';
    
    console.log('Nombre encontrado:', nombreBicicleta);
    
    this.nuevoPedido.detalles.push({
      codigoBicicleta: this.detalleActual.codigoBicicleta,
      cantidad: this.detalleActual.cantidad,
      precioCostoUnitario: this.detalleActual.precioCostoUnitario,
      nombreBicicleta: nombreBicicleta
    });
    
    this.detalleActual = { codigoBicicleta: 0, cantidad: 0, precioCostoUnitario: 0 };
  } else {
    alert('Complete todos los campos del detalle');
  }
}

  eliminarDetalle(index: number): void {
    this.nuevoPedido.detalles.splice(index, 1);
  }

  crearPedido(): void {

      console.log('=== CREANDO PEDIDO ===');
  console.log('Bicicletas antes de crear:', this.bicicletas.length);

    if (!this.nuevoPedido.idProveedor || this.nuevoPedido.detalles.length === 0) {
      alert('Seleccione un proveedor y agregue al menos un detalle');
      return;
    }
    this.pedidoService.crear(this.nuevoPedido).subscribe({
      next: () => {
        alert('Pedido creado exitosamente');
        this.cargarPedidos();
        this.resetForm();


      },
      error: (err) => console.error('Error creando pedido', err)
    });
  }

  marcarRecibido(id: number): void {
    if (confirm('¿Marcar este pedido como recibido? Esto aumentará el stock.')) {
      this.pedidoService.marcarRecibido(id).subscribe({
        next: () => {
          alert('Pedido marcado como recibido. El stock se ha actualizado.');
          this.cargarPedidos();
        },
        error: (err) => console.error('Error marcando recibido', err)
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.nuevoPedido = { idProveedor: 0, detalles: [] };
    this.detalleActual = { codigoBicicleta: 0, cantidad: 0, precioCostoUnitario: 0 };
  }

  descargarReportePDF(): void {
  this.reporteService.pedidosPDF().subscribe(blob => {
    this.reporteService.descargar(blob, 'pedidos.pdf');
  });
}

descargarReporteExcel(): void {
  this.reporteService.pedidosExcel().subscribe(blob => {
    this.reporteService.descargar(blob, 'pedidos.xlsx');
  });
}

// Método para toggle del formulario
toggleFormulario(): void {
  this.showForm = !this.showForm;
}

}