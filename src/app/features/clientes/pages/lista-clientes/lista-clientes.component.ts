import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html'
})
export class ListaClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  // Listado y filtro
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtroDocumento = '';
  cargando = false;
  error = '';

  // Modal
  showModal = false;
  editando = false;
  clienteForm: Cliente = { documento: '', nombre: '', telefono: '', email: '', direccion: '' };
  documentoOriginal = '';
  enviando = false;

  // Errores individuales por campo
  errorFormDocumento = '';
  errorFormNombre = '';
  errorFormEmail = '';

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
    this.showModal = true;
    this.cdr.detectChanges();
  }

  editarCliente(cliente: Cliente) {
    this.editando = true;
    this.documentoOriginal = cliente.documento;
    this.clienteForm = { ...cliente };
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.showModal = false;
    this.enviando = false;
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';
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
    // Resetear errores
    this.errorFormDocumento = '';
    this.errorFormNombre = '';
    this.errorFormEmail = '';

    // Validaciones
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
