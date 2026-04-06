import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BicicletaService } from '../../core/services/bicicleta.service';
import { Bicicleta } from '../../core/models/bicicleta.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BicicletaFormComponent } from './bicicleta-form/bicicleta-form.component';
import { AuthService } from '../../core/services/auth.service';  // ← AGREGAR

@Component({
  selector: 'app-bicicletas',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, BicicletaFormComponent],
  templateUrl: './bicicletas.component.html',
  styleUrls: ['./bicicletas.component.scss']
})
export class BicicletasComponent implements OnInit {
  private bicicletaService = inject(BicicletaService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);  // ← AGREGAR

  bicicletas: Bicicleta[] = [];
  filtradas: Bicicleta[] = [];
  cargando = true;
  
  // 🔥 Variable para controlar permisos
  isAdmin = false;

  filtroBusqueda = '';
  filtroMarca = '';
  filtroTipo = '';
  filtroStock = '';

  marcas: string[] = [];
  tipos: string[] = [];

  showDeleteModal = false;
  bicicletaAEliminar: Bicicleta | null = null;

  showFormModal = false;
  bicicletaEditar: Bicicleta | null = null;

  ngOnInit(): void {
    // 🔥 Obtener el rol del usuario
    this.isAdmin = this.authService.isAdmin();
    this.cargarBicicletas();
  }

  cargarBicicletas(): void {
    this.cargando = true;
    this.bicicletaService.getAll().subscribe({
      next: (data) => {
        this.bicicletas = data;
        this.filtradas = data;
        this.marcas = [...new Set(data.map(b => b.marca))];
        this.tipos  = [...new Set(data.map(b => b.tipo))];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error al cargar las bicicletas');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    this.filtradas = this.bicicletas.filter(b => {
      const coincideBusqueda =
        !this.filtroBusqueda ||
        b.marca.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        b.modelo.toLowerCase().includes(this.filtroBusqueda.toLowerCase());

      const coincideMarca =
        !this.filtroMarca || b.marca === this.filtroMarca;

      const coincideTipo =
        !this.filtroTipo || b.tipo === this.filtroTipo;

      const coincideStock = !this.filtroStock || (() => {
        switch (this.filtroStock) {
          case 'ok':      return b.cantidad > b.stockMinimo;
          case 'bajo':    return b.cantidad <= b.stockMinimo && b.cantidad > 0;
          case 'agotado': return b.cantidad === 0;
          default:        return true;
        }
      })();

      return coincideBusqueda && coincideMarca && coincideTipo && coincideStock;
    });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroMarca = '';
    this.filtroTipo = '';
    this.filtroStock = '';
    this.filtradas = [...this.bicicletas];
  }

  abrirFormNuevo(): void {
    this.bicicletaEditar = null;
    this.showFormModal = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showFormModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  abrirFormEditar(bicicleta: Bicicleta): void {
    this.bicicletaEditar = { ...bicicleta };
    this.showFormModal = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showFormModal = true;
      this.cdr.detectChanges();
    }, 0);
  }

  onImagenError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const contenedor = img.parentElement;
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="w-10 h-10 rounded-lg bg-[#d8e2ff] flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-[#0b2b5e] text-lg">pedal_bike</span>
        </div>
      `;
    }
  }

  onFormGuardado(): void {
    this.showFormModal = false;
    this.cdr.detectChanges();
    this.cargarBicicletas();
  }

  confirmarEliminar(bicicleta: Bicicleta): void {
    this.bicicletaAEliminar = bicicleta;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  onDeleteConfirmed(): void {
    if (!this.bicicletaAEliminar?.codigo) return;

    this.bicicletaService.delete(this.bicicletaAEliminar.codigo).subscribe({
      next: () => {
        this.toast.success('Bicicleta eliminada correctamente');
        this.showDeleteModal = false;
        this.bicicletaAEliminar = null;
        this.cargarBicicletas();
      },
      error: () => {
        this.toast.error('Error al eliminar la bicicleta');
        this.showDeleteModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStockBadge(b: Bicicleta): { texto: string; clase: string } {
    if (b.cantidad === 0) {
      return { texto: 'Agotado', clase: 'bg-[#ffdad6] text-[#ba1a1a]' };
    } else if (b.cantidad <= b.stockMinimo) {
      return { texto: 'Stock bajo', clase: 'bg-[#fff8e1] text-[#f57c00]' };
    }
    return { texto: 'En stock', clase: 'bg-[#e6f4f1] text-[#006970]' };
  }

  skeletonRows = Array(5);
}