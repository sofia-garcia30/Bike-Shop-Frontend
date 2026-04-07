import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component')
        .then(m => m.MainLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'bicicletas',
        loadComponent: () =>
          import('./features/bicicletas/bicicletas.component')
            .then(m => m.BicicletasComponent)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes.component')
            .then(m => m.ClientesComponent)
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas.component')
            .then(m => m.VentasComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/pedidos/pedidos.component')
            .then(m => m.PedidosComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores.component')
            .then(m => m.ProveedoresComponent)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' },
        loadComponent: () =>
          import('./features/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { role: 'ADMIN' },
        loadComponent: () =>
          import('./features/reportes/reportes.component')
            .then(m => m.ReportesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
