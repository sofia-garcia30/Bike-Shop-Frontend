import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  @Input() hasRole!: string | string[];

  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit() {
    const rol = this.authService.getUsuario()?.rol ?? '';
    const roles = Array.isArray(this.hasRole) ? this.hasRole : [this.hasRole];

    if (roles.includes(rol)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
