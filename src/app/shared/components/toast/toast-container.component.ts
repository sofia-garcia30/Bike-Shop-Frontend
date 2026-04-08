import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <app-toast
        *ngFor="let toast of toastService.toasts$ | async"
        [toast]="toast"
        (dismiss)="toastService.remove($event)"
      />
    </div>
  `
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}