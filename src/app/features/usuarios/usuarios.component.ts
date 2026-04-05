import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioEditando: Usuario | null = null;
  mostrarFormulario = false;
  loading = true;

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'EMPLEADO' as 'ADMIN' | 'EMPLEADO'
  };

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
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
      alert('El nombre es obligatorio');
      return;
    }
    if (!this.nuevoUsuario.email?.trim()) {
      alert('El email es obligatorio');
      return;
    }
    if (!this.usuarioEditando && !this.nuevoUsuario.password?.trim()) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    if (this.usuarioEditando) {
      // Actualizar usuario
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
          this.cdr.detectChanges();
          this.mostrarFormulario = false;
          this.usuarioEditando = null;
          this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'EMPLEADO' };
          this.cdr.detectChanges();
          setTimeout(() => {
            this.mostrarFormulario = false;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => console.error('Error actualizando usuario', err)
      });
    } else {
      // Crear nuevo usuario
      this.usuarioService.crear(this.nuevoUsuario).subscribe({
        next: (respuesta) => {
          this.usuarios = [...this.usuarios, respuesta];
          this.cdr.detectChanges();
          this.mostrarFormulario = false;
          this.nuevoUsuario = { nombre: '', email: '', password: '', rol: 'EMPLEADO' };
          this.cdr.detectChanges();
          setTimeout(() => {
            this.mostrarFormulario = false;
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => console.error('Error creando usuario', err)
      });
    }
  }

// Reemplaza el método eliminarUsuario por:
toggleUsuario(usuario: Usuario): void {
  const accion = usuario.activo ? 'desactivar' : 'activar';
  const mensaje = `¿${accion} este usuario?`;
  
  if (confirm(mensaje)) {
    if (usuario.activo) {
      this.usuarioService.desactivar(usuario.id).subscribe({
        next: () => {
          usuario.activo = false;
          this.usuarios = [...this.usuarios];
          this.cdr.detectChanges();
        },
        error: (err) => {
        // 🔥 Mostrar mensaje de error del backend
        const mensaje = err.error?.mensaje || err.message || 'Error al desactivar usuario';
        alert(mensaje);
        console.error('Error desactivando usuario', err);
      }

      });
    } else {
      this.usuarioService.activar(usuario.id).subscribe({
        next: () => {
          usuario.activo = true;
          this.usuarios = [...this.usuarios];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error activando usuario', err)
      });
    }
  }
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
}