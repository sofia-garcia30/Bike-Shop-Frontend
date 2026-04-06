import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html'
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private bicicletaService = inject(BicicletaService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  // Listas
  clientes: any[] = [];
  bicicletas: any[] = [];
  ventas: any[] = [];
  ventasFiltradas: any[] = [];

  // Formulario
  documentoCliente = '';
  codigoBicicleta: number | null = null;
  cantidad = 1;
  formaPago = 'efectivo';
  precioUnitario = 0;

  // Filtros
  filtroFecha = '';

  // Estado
  cargando = false;
  error = '';
  exito = '';
  vistaActiva: 'formulario' | 'historial' = 'formulario';

  // Detalle expandido
  ventaExpandida: number | null = null;

  formasPago = ['efectivo', 'tarjeta', 'transferencia'];

  // Agregar estas propiedades
  showModalCliente = false;
  nuevoCliente = {
    documento: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  };
  creandoCliente = false;
  errorCliente = '';

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.clienteService.listar().subscribe(data => this.clientes = data);
    this.bicicletaService.getAll().subscribe(data => this.bicicletas = data);
    this.ventaService.listarTodas().subscribe(data => {
      this.ventas = data;
      this.ventasFiltradas = data;
    });
  }

  crearCliente() {
     if (!this.nuevoCliente.documento || !this.nuevoCliente.nombre) {
       this.errorCliente = 'Documento y nombre son obligatorios';
       return;
     }

     this.creandoCliente = true;
     this.errorCliente = '';

     this.http.post(`${environment.apiUrl}/api/clientes`, this.nuevoCliente)
       .subscribe({
         next: (cliente: any) => {
           this.clientes = [...this.clientes, cliente];
           this.documentoCliente = cliente.documento;
           this.nuevoCliente = { documento: '', nombre: '', telefono: '', email: '', direccion: '' };
           this.creandoCliente = false;
           this.showModalCliente = false;
           this.cdr.detectChanges();
         },
         error: (err) => {
           this.errorCliente = err.error?.mensaje || 'Error al crear el cliente';
           this.creandoCliente = false;
           this.cdr.detectChanges();
         }
       });
   }



  onBicicletaChange() {
    const bici = this.bicicletas.find(b => b.codigo == this.codigoBicicleta);
    this.precioUnitario = bici ? bici.precioVenta : 0;
  }

  get totalParcial(): number {
    return this.precioUnitario * this.cantidad;
  }

  registrarVenta() {
    if (!this.documentoCliente || !this.codigoBicicleta) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    const body = {
      documentoCliente: this.documentoCliente,
      formaPago: this.formaPago,
      detalles: [
        {
          codigoBicicleta: this.codigoBicicleta,
          cantidad: this.cantidad
        }
      ]
    };

    this.ventaService.crear(body).subscribe({
      next: () => {
        this.exito = '¡Venta registrada exitosamente!';
        this.cargando = false;
        this.resetFormulario();
        this.cargarDatos();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al registrar la venta';
        this.cargando = false;
      }
    });
  }

  resetFormulario() {
    this.documentoCliente = '';
    this.codigoBicicleta = null;
    this.cantidad = 1;
    this.formaPago = 'efectivo';
    this.precioUnitario = 0;
  }

  filtrarPorFecha() {
    if (!this.filtroFecha) {
      this.ventasFiltradas = this.ventas;
      return;
    }
    this.ventasFiltradas = this.ventas.filter(v =>
      v.fecha.startsWith(this.filtroFecha)
    );
  }

  toggleDetalle(id: number) {
    this.ventaExpandida = this.ventaExpandida === id ? null : id;
  }

  getBadgeClass(estado: string): string {
    const clases: any = {
      'completada': 'bg-[#E6F4F1] text-[#006970]',
      'devuelta': 'bg-[#ffdad6] text-[#ba1a1a]',
      'pendiente': 'bg-[#FFF8E1] text-[#F57C00]'
    };
    return clases[estado] || 'bg-gray-100 text-gray-600';
  }
}
