import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolRequerido = route.data['role'];
  const usuario = authService.getUsuario();

  if (usuario && usuario.rol === rolRequerido) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
