import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  mostrarFormulario = false;
  loading = true;
  filtroBusqueda: string = '';
proveedoresFiltrados: Proveedor[] = [];
emailInvalido = false;
telefonoInvalido = false;

  // Variables para el modal de eliminación
  showDeleteModal = false;
  proveedorAEliminar: Proveedor | null = null;

  nuevoProveedor = {
    nombre: '',
    telefono: '',
    email: '',
    frecuenciaEntrega: 'SEMANAL'
  };

  constructor(
    private proveedorService: ProveedorService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

cargarProveedores(): void {
  this.loading = true;
  this.proveedorService.getAll().subscribe({
    next: (data) => {
      this.proveedores = data;
      this.proveedoresFiltrados = data;  // ← Agrega esta línea
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error cargando proveedores', err);
      this.toast.error('Error al cargar los proveedores');
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.proveedorEditando = null;
    this.nuevoProveedor = {
      nombre: '',
      telefono: '',
      email: '',
      frecuenciaEntrega: 'SEMANAL'
    };
  }

  editarProveedor(proveedor: Proveedor): void {
    this.mostrarFormulario = true;
    this.proveedorEditando = proveedor;
    this.nuevoProveedor = {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      email: proveedor.email,
      frecuenciaEntrega: proveedor.frecuenciaEntrega
    };
  }
guardarProveedor(): void {
  // Validaciones en tiempo real
  this.validarEmailTiempoReal();
  this.validarTelefonoTiempoReal();

  if (!this.nuevoProveedor.nombre?.trim()) {
    this.toast.warning('El nombre del proveedor es obligatorio');
    return;
  }

  // Validar email solo si fue ingresado
  if (this.nuevoProveedor.email && this.emailInvalido) {
    this.toast.warning('Ingresa un email válido');
    return;
  }

  // Validar teléfono solo si fue ingresado
  if (this.nuevoProveedor.telefono && this.telefonoInvalido) {
    this.toast.warning('El teléfono solo debe contener números');
    return;
  }

  if (this.proveedorEditando) {
    this.proveedorService.actualizar(this.proveedorEditando.id, this.nuevoProveedor).subscribe({
      next: (respuesta) => {
        const index = this.proveedores.findIndex(p => p.id === this.proveedorEditando!.id);
        if (index !== -1) {
          this.proveedores[index] = { ...this.proveedores[index], ...this.nuevoProveedor };
          this.proveedores = [...this.proveedores];
        }
        this.mostrarFormulario = false;
        this.proveedorEditando = null;
        this.nuevoProveedor = { nombre: '', telefono: '', email: '', frecuenciaEntrega: 'SEMANAL' };
        this.toast.success('Proveedor actualizado correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error actualizando:', err);
        this.toast.error('Error al actualizar el proveedor');
      }
    });
  } else {
    this.proveedorService.crear(this.nuevoProveedor).subscribe({
      next: (respuesta) => {
        this.proveedores = [...this.proveedores, respuesta];
        this.mostrarFormulario = false;
        this.nuevoProveedor = { nombre: '', telefono: '', email: '', frecuenciaEntrega: 'SEMANAL' };
        this.toast.success('Proveedor creado correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creando:', err);
        this.toast.error('Error al crear el proveedor');
      }
    });
  }
}

  // Abrir modal de confirmación para eliminar
  confirmarEliminar(proveedor: Proveedor): void {
    this.proveedorAEliminar = proveedor;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  // Eliminar después de confirmar
  eliminarProveedorConfirmado(): void {
    if (this.proveedorAEliminar) {
      this.proveedorService.eliminar(this.proveedorAEliminar.id).subscribe({
        next: () => {
          this.proveedores = this.proveedores.filter(p => p.id !== this.proveedorAEliminar!.id);
          this.showDeleteModal = false;
          this.proveedorAEliminar = null;
          this.toast.success('Proveedor eliminado correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error eliminando', err);
          this.toast.error('Error al eliminar el proveedor');
          this.showDeleteModal = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Cerrar modal
  cerrarModal(): void {
    this.showDeleteModal = false;
    this.proveedorAEliminar = null;
    this.cdr.detectChanges();
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.proveedorEditando = null;
    this.nuevoProveedor = {
      nombre: '',
      telefono: '',
      email: '',
      frecuenciaEntrega: 'SEMANAL'
    };
  }

  trackById(index: number, item: Proveedor): number {
    return item.id;
  }

  aplicarFiltro(): void {
  if (!this.filtroBusqueda) {
    this.proveedoresFiltrados = [...this.proveedores];
  } else {
    const busqueda = this.filtroBusqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(prov => 
      prov.nombre.toLowerCase().includes(busqueda)
    );
  }
}

validarEmailTiempoReal(): void {
  if (this.nuevoProveedor.email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailInvalido = !regex.test(this.nuevoProveedor.email);
  } else {
    this.emailInvalido = false;
  }
}

validarTelefonoTiempoReal(): void {
  if (this.nuevoProveedor.telefono) {
    const soloNumeros = /^\d+$/;
    this.telefonoInvalido = !soloNumeros.test(this.nuevoProveedor.telefono);
  } else {
    this.telefonoInvalido = false;
  }
}

}