import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../core/services/cliente.service';
import { ModalComponent, ModalVariant } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './lista-clientes.component.html'
})
export class ListaClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtroDocumento = '';
  cargando = false;
  error = '';

  isModalOpen = false;
  editando = false;
  clienteForm: Cliente = { documento: '', nombre: '', telefono: '', email: '', direccion: '' };
  documentoOriginal = '';
  enviando = false;

  errorFormDocumento = '';
  errorFormNombre = '';
  errorFormEmail = '';

  modalTitle = '';
  modalSubtitle = '';
  modalVariant: ModalVariant = 'default';  // ← tipado correcto

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando = true;
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.aplicarFiltro();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar clientes';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro() {
    const term = this.filtroDocumento.trim().toLowerCase();
    if (!term) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c =>
        c.documento?.toLowerCase().includes(term) ||
        c.nombre?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  abrirModalCrear() {
    this.editando = false;
    this.documentoOriginal = '';
    this.clienteForm = { documento: '', nombre: '', telefono: '', email: '', direccion: '' };
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';
    this.modalTitle = 'Nuevo Cliente';
    this.modalSubtitle = 'Registra un nuevo cliente en el sistema';
    this.modalVariant = 'default';
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  editarCliente(cliente: Cliente) {
    this.editando = true;
    this.documentoOriginal = cliente.documento;
    this.clienteForm = { ...cliente };
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';
    this.modalTitle = 'Editar Cliente';
    this.modalSubtitle = 'Actualiza los datos del cliente';
    this.modalVariant = 'default';
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.enviando = false;
    this.cdr.detectChanges();
  }

  esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validarEmailTiempoReal() {
    const email = this.clienteForm.email;
    if (email && !this.esEmailValido(email)) {
      this.errorFormEmail = 'Ingresa un email válido (ej: usuario@correo.com)';
    } else {
      this.errorFormEmail = '';
    }
    this.cdr.detectChanges();
  }

  guardarCliente() {
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';

    if (!this.clienteForm.documento) {
      this.errorFormDocumento = 'El documento es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    if (!this.clienteForm.nombre) {
      this.errorFormNombre = 'El nombre es obligatorio';
      this.cdr.detectChanges();
      return;
    }
    if (this.clienteForm.email && !this.esEmailValido(this.clienteForm.email)) {
      this.errorFormEmail = 'Ingresa un email válido (ej: usuario@correo.com)';
      this.cdr.detectChanges();
      return;
    }

    this.enviando = true;

    if (this.editando) {
      this.clienteService.actualizar(this.documentoOriginal, this.clienteForm).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          this.enviando = false;
        },
        error: (err) => {
          this.errorFormDocumento = err.error?.mensaje || 'Error al actualizar';
          this.enviando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.clienteService.crear(this.clienteForm).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          this.enviando = false;
        },
        error: (err) => {
          this.errorFormDocumento = err.error?.mensaje || 'Error al crear';
          this.enviando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
