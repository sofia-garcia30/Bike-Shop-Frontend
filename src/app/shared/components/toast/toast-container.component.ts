import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { Toast, ToastType } from './toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
      aria-live="polite"
    >
      <app-toast
        *ngFor="let toast of toasts; trackBy: trackById"
        [toast]="toast"
        (dismiss)="remove($event)"
      />
    </div>
  `,
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  trackById(_: number, t: Toast): number {
    return t.id;
  }
}
