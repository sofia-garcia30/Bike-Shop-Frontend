import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from './toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed top-4 right-4 z-[9999] flex items-start gap-3 w-80 rounded-xl shadow-lg px-4 py-4 transition-all duration-150 overflow-hidden"
      [ngClass]="[config.classes, 'animate-slide-in']"
      role="alert"
    >
      <span class="material-symbols-outlined text-xl mt-0.5 flex-shrink-0" [ngClass]="iconColor">
        {{ config.icon }}
      </span>
      <p class="text-sm font-medium flex-1 leading-snug">{{ toast.message }}</p>
      <button (click)="close()" class="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 -mt-0.5" aria-label="Cerrar notificación">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
      <div class="absolute bottom-0 left-0 h-[3px] w-full bg-slate-100">
        <div class="h-full progress-bar" [ngClass]="config.bar" [style.animationDuration]="(toast.duration ?? 2000) + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.15s ease-out;
    }
  `]
})
export class ToastComponent {
  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<number>();

  close(): void {
    this.dismiss.emit(this.toast.id);
  }

  get config(): { icon: string; classes: string; bar: string } {
    const map: Record<string, { icon: string; classes: string; bar: string }> = {
      success: {
        icon: 'check_circle',
        classes: 'border-l-4 border-[#006970] bg-white text-[#00173d]',
        bar: 'bg-[#006970]',
      },
      error: {
        icon: 'cancel',
        classes: 'border-l-4 border-[#ba1a1a] bg-white text-[#00173d]',
        bar: 'bg-[#ba1a1a]',
      },
      warning: {
        icon: 'warning',
        classes: 'border-l-4 border-[#f57c00] bg-white text-[#00173d]',
        bar: 'bg-[#f57c00]',
      },
    };
    return map[this.toast.type];
  }

  get iconColor(): string {
    const map: Record<string, string> = {
      success: 'text-[#006970]',
      error: 'text-[#ba1a1a]',
      warning: 'text-[#f57c00]',
    };
    return map[this.toast.type];
  }
}