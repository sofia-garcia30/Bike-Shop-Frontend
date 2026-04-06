import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast, ToastType } from './toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toast$ = new Subject<Toast>();
  toast$ = this._toast$.asObservable();
  private nextId = 0;

  show(message: string, type: ToastType = 'success', duration = 3000): void {
    this._toast$.next({ id: this.nextId++, type, message, duration });
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void   { this.show(message, 'error'); }
  warning(message: string): void { this.show(message, 'warning'); }
}
