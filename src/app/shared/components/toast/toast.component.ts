import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from './toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<number>();

  visible = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Pequeño delay para que el enter animation se dispare
    requestAnimationFrame(() => (this.visible = true));

    this.timer = setTimeout(() => {
      this.close();
    }, this.toast.duration ?? 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  close(): void {
    this.visible = false;
    // Esperar la animación de salida antes de emitir
    setTimeout(() => this.dismiss.emit(this.toast.id), 300);
  }

  get config(): { icon: string; classes: string; bar: string } {
    const map: Record<string, { icon: string; classes: string; bar: string }> =
      {
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
