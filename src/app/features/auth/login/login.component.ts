import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  error = '';
  cargando = false;
  mostrarPassword = false;

  login() {
    if (!this.email || !this.password) {
      this.toast.warning('Por favor completa todos los campos');
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.toast.success('Bienvenido al sistema');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.toast.error(err.error?.mensaje || 'Credenciales incorrectas');
          this.cargando = false;
        }
      });
  }
}
