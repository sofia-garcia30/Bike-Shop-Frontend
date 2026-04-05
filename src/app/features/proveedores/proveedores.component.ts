import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Proveedor } from '../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.scss']
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorEditando: Proveedor | null = null;
  mostrarFormulario = false;
  loading = true;

  nuevoProveedor = {
    nombre: '',
    telefono: '',
    email: '',
    frecuenciaEntrega: 'SEMANAL'
  };

  constructor(private proveedorService: ProveedorService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando proveedores', err);
        this.loading = false;
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
  if (!this.nuevoProveedor.nombre?.trim()) {
    alert('El nombre del proveedor es obligatorio');
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
        // 🔥 CIERRE FORZADO
        this.mostrarFormulario = false;
        this.proveedorEditando = null;
        this.nuevoProveedor = { nombre: '', telefono: '', email: '', frecuenciaEntrega: 'SEMANAL' };
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mostrarFormulario = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error actualizando:', err)
    });
  } else {
    this.proveedorService.crear(this.nuevoProveedor).subscribe({
      next: (respuesta) => {
        this.proveedores = [...this.proveedores, respuesta];
        // 🔥 CIERRE FORZADO
        this.mostrarFormulario = false;
        this.nuevoProveedor = { nombre: '', telefono: '', email: '', frecuenciaEntrega: 'SEMANAL' };
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mostrarFormulario = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error('Error creando:', err)
    });
  }
}
  

  eliminarProveedor(id: number): void {
    if (confirm('¿Eliminar este proveedor?')) {
      this.proveedorService.eliminar(id).subscribe({
        next: () => {
          this.proveedores = this.proveedores.filter(p => p.id !== id);
        },
        error: (err) => console.error('Error eliminando', err)
      });
    }
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
}