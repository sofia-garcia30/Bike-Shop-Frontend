import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-clientes.component.html'
})
export class ListaClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  filtroDocumento = '';
  cargando = false;
  error = '';

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
      },
      error: (err) => {
        this.error = 'Error al cargar clientes';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro() {
    const term = this.filtroDocumento.trim().toLowerCase();
    if (!term) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      this.clientesFiltrados = this.clientes.filter(c =>
        c.documento?.toLowerCase().includes(term)
      );
    }
  }
}
