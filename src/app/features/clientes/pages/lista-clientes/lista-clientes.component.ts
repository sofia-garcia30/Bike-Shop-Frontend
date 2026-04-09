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

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtroDocumento = '';
  cargando = false;
  error = '';

  showModal = false;
  editando = false;
  clienteForm: Cliente = { documento: '', nombre: '', telefono: '', email: '', direccion: '' };
  documentoOriginal = '';
  enviando = false;
  errorForm = '';

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() { /* igual que antes */ }
  aplicarFiltro() { /* igual que antes */ }
  abrirModalCrear() { /* igual que antes */ }
  editarCliente(cliente: Cliente) { /* igual que antes */ }
  cerrarModal() { /* igual que antes */ }

  // Método de validación de email
  esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  guardarCliente() {
    if (!this.clienteForm.documento || !this.clienteForm.nombre) {
      this.errorForm = 'Documento y nombre son obligatorios';
      this.cdr.detectChanges();
      return;
    }

    // Validar email si se proporcionó
    if (this.clienteForm.email && !this.esEmailValido(this.clienteForm.email)) {
      this.errorForm = 'Ingresa un email válido (ejemplo: correo@dominio.com)';
      this.cdr.detectChanges();
      return;
    }

    this.enviando = true;
    this.errorForm = '';

    if (this.editando) {
      this.clienteService.actualizar(this.documentoOriginal, this.clienteForm).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarModal();
          this.enviando = false;
        },
        error: (err) => {
          this.errorForm = err.error?.mensaje || 'Error al actualizar';
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
          this.errorForm = err.error?.mensaje || 'Error al crear';
          this.enviando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
