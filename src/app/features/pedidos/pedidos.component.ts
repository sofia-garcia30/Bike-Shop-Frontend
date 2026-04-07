import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
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
  isEmpleado = false;
  filtroBusqueda: string = '';
pedidosFiltrados: Pedido[] = [];

  // Variables para el modal de confirmación
  showConfirmModal = false;
  pedidoIdParaRecibir: number | null = null;
  modalTitulo = '';
  modalSubtitulo = '';
  modalVariant: 'default' | 'confirm' | 'danger' = 'confirm';

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
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isEmpleado = this.authService.isEmpleado();
    
    this.cargarPedidos();
    this.cargarProveedores();
    
    if (this.isAdmin) {
      this.cargarBicicletas();
    }
  }

cargarPedidos(): void {
  this.pedidoService.getAll().subscribe({
    next: (data) => {
      this.pedidos = data;
      this.pedidosFiltrados = data;  // ← Agrega esta línea
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error cargando pedidos', err);
      this.toast.error('Error al cargar los pedidos');
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  cargarProveedores(): void {
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando proveedores', err);
        this.toast.error('Error al cargar los proveedores');
        this.cdr.detectChanges();
      }
    });
  }

  cargarBicicletas(): void {
    this.bicicletaService.getAll().subscribe({
      next: (data) => {
        this.bicicletas = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando bicicletas', err);
        this.toast.error('Error al cargar las bicicletas');
        this.cdr.detectChanges();
      }
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
    if (this.detalleActual.codigoBicicleta && this.detalleActual.cantidad > 0 && this.detalleActual.precioCostoUnitario > 0) {
      const codigoBuscado = Number(this.detalleActual.codigoBicicleta);
      const bicicletaEncontrada = this.bicicletas.find(b => Number(b.codigo) === codigoBuscado);
      const nombreBicicleta = bicicletaEncontrada ? 
        `${bicicletaEncontrada.marca} ${bicicletaEncontrada.modelo}` : 'Desconocida';
      
      this.nuevoPedido.detalles.push({
        codigoBicicleta: this.detalleActual.codigoBicicleta,
        cantidad: this.detalleActual.cantidad,
        precioCostoUnitario: this.detalleActual.precioCostoUnitario,
        nombreBicicleta: nombreBicicleta
      });
      
      this.detalleActual = { codigoBicicleta: 0, cantidad: 0, precioCostoUnitario: 0 };
      this.toast.success('Bicicleta agregada al pedido');
    } else {
      this.toast.warning('Complete todos los campos del detalle');
    }
  }

  eliminarDetalle(index: number): void {
    this.nuevoPedido.detalles.splice(index, 1);
    this.toast.success('Detalle eliminado');
  }

  crearPedido(): void {
    if (!this.nuevoPedido.idProveedor || this.nuevoPedido.detalles.length === 0) {
      this.toast.warning('Seleccione un proveedor y agregue al menos un detalle');
      return;
    }
    
    this.pedidoService.crear(this.nuevoPedido).subscribe({
      next: () => {
        this.toast.success('Pedido creado exitosamente');
        this.cargarPedidos();
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creando pedido', err);
        this.toast.error('Error al crear el pedido');
      }
    });
  }

  // Método para abrir el modal de confirmación
  abrirModalRecibir(id: number): void {
    this.pedidoIdParaRecibir = id;
    this.modalTitulo = 'Marcar pedido como recibido';
    this.modalSubtitulo = 'Esta acción aumentará el stock de las bicicletas';
    this.modalVariant = 'confirm';
    this.showConfirmModal = true;
    this.cdr.detectChanges();
  }

  // Método para confirmar el recibido
  confirmarRecibir(): void {
    if (this.pedidoIdParaRecibir) {
      this.pedidoService.marcarRecibido(this.pedidoIdParaRecibir).subscribe({
        next: () => {
          this.toast.success('Pedido marcado como recibido. El stock se ha actualizado.');
          this.cargarPedidos();
          this.showConfirmModal = false;
          this.pedidoIdParaRecibir = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error marcando recibido', err);
          this.toast.error('Error al marcar el pedido como recibido');
          this.showConfirmModal = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.showConfirmModal = false;
    this.pedidoIdParaRecibir = null;
    this.cdr.detectChanges();
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

  toggleFormulario(): void {
    this.showForm = !this.showForm;
  }

  aplicarFiltro(): void {
  if (!this.filtroBusqueda) {
    this.pedidosFiltrados = [...this.pedidos];
  } else {
    const busqueda = this.filtroBusqueda.toLowerCase();
    this.pedidosFiltrados = this.pedidos.filter(ped => 
      this.getNombreProveedor(ped.idProveedor).toLowerCase().includes(busqueda)
    );
  }
}

}