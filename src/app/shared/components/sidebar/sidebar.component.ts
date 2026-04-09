import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isAdmin = this.authService.isAdmin();
  collapsed = false;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Inventario', icon: 'inventory_2', route: '/bicicletas', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Ventas', icon: 'payments', route: '/ventas', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Pedidos', icon: 'shopping_cart', route: '/pedidos', roles: ['ADMIN', 'EMPLEADO'] },
    { label: 'Proveedores', icon: 'group', route: '/proveedores', roles: ['ADMIN'] },
    { label: 'Usuarios', icon: 'person', route: '/usuarios', roles: ['ADMIN'] },
    { label: 'Clientes', icon: 'people', route: '/clientes', roles: ['ADMIN', 'EMPLEADO'] },
  ];

  get itemsVisibles() {
    const rol = this.authService.getUsuario()?.rol;
    return this.menuItems.filter(item => item.roles.includes(rol ?? ''));
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
