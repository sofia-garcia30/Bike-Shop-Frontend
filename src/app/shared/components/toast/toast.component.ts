import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Aparece inmediatamente sin delay
    this.visible = true;
    this.cdr.detectChanges();

    const duration = this.toast.duration ?? 2000;
    this.timer = setTimeout(() => {
      this.close();
    }, duration);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  close(): void {
    this.visible = false;
    this.cdr.detectChanges();
    // Salida más rápida
    setTimeout(() => this.dismiss.emit(this.toast.id), 150);
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