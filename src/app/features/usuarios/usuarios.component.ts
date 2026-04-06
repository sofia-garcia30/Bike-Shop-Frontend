import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioEditando: Usuario | null = null;
  mostrarFormulario = false;
  loading = true;
  filtroBusqueda: string = '';
usuariosFiltrados: Usuario[] = [];

  // Variables para el modal de confirmación
  showConfirmModal = false;
  modalTitulo = '';
  modalSubtitulo = '';
  modalVariant: 'default' | 'confirm' | 'danger' = 'confirm';
  modalConfirmLabel = '';
  modalMensaje = '';
  usuarioParaToggle: Usuario | null = null;

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO' as 'ADMIN' | 'EMPLEADO'
  };

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

cargarUsuarios(): void {
  this.loading = true;
  this.usuarioService.getAll().subscribe({
    next: (data) => {
      this.usuarios = data;
      this.usuariosFiltrados = data;  // ← Agrega esta línea
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error cargando usuarios', err);
      this.toast.error('Error al cargar los usuarios');
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.usuarioEditando = null;
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: '',
      rol: 'EMPLEADO'
    };
    this.cdr.detectChanges();
  }

  editarUsuario(usuario: Usuario): void {
    this.mostrarFormulario = true;
    this.usuarioEditando = usuario;
    this.nuevoUsuario = {
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    };
    this.cdr.detectChanges();
  }

  guardarUsuario(): void {
    if (!this.nuevoUsuario.nombre?.trim()) {
      this.toast.warning('El nombre es obligatorio');
      return;
    }
    if (!this.nuevoUsuario.email?.trim()) {
      this.toast.warning('El email es obligatorio');
      return;
    }
    if (!this.usuarioEditando && !this.nuevoUsuario.password?.trim()) {
      this.toast.warning('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (this.usuarioEditando) {
      const datosActualizar = {
        nombre: this.nuevoUsuario.nombre,
        email: this.nuevoUsuario.email,
        rol: this.nuevoUsuario.rol,
        ...(this.nuevoUsuario.password && { password: this.nuevoUsuario.password })
      };
      this.usuarioService.actualizar(this.usuarioEditando.id, datosActualizar).subscribe({
        next: (respuesta) => {
          const index = this.usuarios.findIndex(u => u.id === this.usuarioEditando!.id);
          if (index !== -1) {
            this.usuarios[index] = { ...this.usuarios[index], ...respuesta };
            this.usuarios = [...this.usuarios];
          }
          this.mostrarFormulario = false;
          this.usuarioEditando = null;
          this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'EMPLEADO' };
          this.toast.success('Usuario actualizado correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error actualizando usuario', err);
          this.toast.error('Error al actualizar el usuario');
        }
      });
    } else {
      this.usuarioService.crear(this.nuevoUsuario).subscribe({
        next: (respuesta) => {
          this.usuarios = [...this.usuarios, respuesta];
          this.mostrarFormulario = false;
          this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'EMPLEADO' };
          this.toast.success('Usuario creado correctamente');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creando usuario', err);
          this.toast.error('Error al crear el usuario');
        }
      });
    }
  }

  // Abrir modal de confirmación para toggle (activar/desactivar)
  abrirModalToggle(usuario: Usuario): void {
    this.usuarioParaToggle = usuario;
    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.modalTitulo = `${accion === 'activar' ? 'Activar' : 'Desactivar'} Usuario`;
    this.modalSubtitulo = `Esta acción ${accion === 'activar' ? 'habilitará' : 'deshabilitará'} el acceso del usuario`;
    this.modalVariant = usuario.activo ? 'danger' : 'confirm';
    this.modalConfirmLabel = `Sí, ${accion}`;
    this.modalMensaje = `¿Estás seguro de que deseas <strong>${accion}</strong> al usuario <strong>${usuario.nombre}</strong>?`;
    this.showConfirmModal = true;
    this.cdr.detectChanges();
  }

  // Confirmar toggle después del modal
  confirmarToggle(): void {
    if (this.usuarioParaToggle) {
      if (this.usuarioParaToggle.activo) {
        this.usuarioService.desactivar(this.usuarioParaToggle.id).subscribe({
          next: () => {
            this.usuarioParaToggle!.activo = false;
            this.usuarios = [...this.usuarios];
            this.toast.success('Usuario desactivado correctamente');
            this.showConfirmModal = false;
            this.usuarioParaToggle = null;
            this.cdr.detectChanges();
          },
          error: (err) => {
            const mensaje = err.error?.mensaje || err.message || 'Error al desactivar usuario';
            this.toast.error(mensaje);
            this.showConfirmModal = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.usuarioService.activar(this.usuarioParaToggle.id).subscribe({
          next: () => {
            this.usuarioParaToggle!.activo = true;
            this.usuarios = [...this.usuarios];
            this.toast.success('Usuario activado correctamente');
            this.showConfirmModal = false;
            this.usuarioParaToggle = null;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error activando usuario', err);
            this.toast.error('Error al activar el usuario');
            this.showConfirmModal = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // Cerrar modal
  cerrarModal(): void {
    this.showConfirmModal = false;
    this.usuarioParaToggle = null;
    this.cdr.detectChanges();
  }

  // Método toggle que abre el modal (reemplaza el confirm)
  toggleUsuario(usuario: Usuario): void {
    this.abrirModalToggle(usuario);
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.usuarioEditando = null;
    this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'EMPLEADO' };
    this.cdr.detectChanges();
  }

  getRolBadgeClass(rol: string): string {
    return rol === 'ADMIN' ? 'badge-admin' : 'badge-empleado';
  }

  aplicarFiltro(): void {
  if (!this.filtroBusqueda) {
    this.usuariosFiltrados = [...this.usuarios];
  } else {
    const busqueda = this.filtroBusqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(user => 
      user.nombre.toLowerCase().includes(busqueda) ||
      user.email.toLowerCase().includes(busqueda)
    );
  }
}

}