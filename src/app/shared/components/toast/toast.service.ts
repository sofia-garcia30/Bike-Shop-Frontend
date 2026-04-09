import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, ToastType } from './toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'success', duration = 2000): void {
    const id = Date.now();
    const newToast: Toast = { id, type, message, duration };
    
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next([...currentToasts, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number): void {
    const currentToasts = this.toastsSubject.getValue();
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  warning(message: string): void { this.show(message, 'warning'); }
}