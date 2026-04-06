import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalSize = 'sm' | 'md' | 'lg';
export type ModalVariant = 'default' | 'confirm' | 'danger';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnChanges, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() subtitle = '';
  @Input() size: ModalSize = 'md';
  @Input() variant: ModalVariant = 'default';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() hideFooter = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  animating = false;
  show = false;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
      this.show = true;
      document.body.style.overflow = 'hidden';
      this.cdr.detectChanges();
      this.openTimer = setTimeout(() => {
        this.animating = true;
        this.cdr.detectChanges();
      }, 10);
    } else {
      if (this.openTimer) {
        clearTimeout(this.openTimer);
        this.openTimer = null;
      }
      this.animating = false;
      document.body.style.overflow = '';
      this.cdr.detectChanges();
      this.closeTimer = setTimeout(() => {
        this.show = false;
        this.cdr.detectChanges();
        this.closeTimer = null;
      }, 250);
    }
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    if (this.openTimer) clearTimeout(this.openTimer);
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.cancel();
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  confirm(): void {
    this.confirmed.emit();
  }

  get sizeClass(): string {
    const map: Record<ModalSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-xl',
      lg: 'max-w-3xl',
    };
    return map[this.size];
  }

  get confirmBtnClass(): string {
    const map: Record<ModalVariant, string> = {
      default: 'bg-[#006970] hover:bg-[#005a61] shadow-[#006970]/20',
      confirm: 'bg-[#0b2b5e] hover:bg-[#00173d] shadow-[#0b2b5e]/20',
      danger:  'bg-[#ba1a1a] hover:bg-[#93000a] shadow-[#ba1a1a]/20',
    };
    return map[this.variant];
  }

  get headerIcon(): string {
    const map: Record<ModalVariant, string> = {
      default: 'info',
      confirm: 'help',
      danger:  'warning',
    };
    return map[this.variant];
  }

  get headerIconColor(): string {
    const map: Record<ModalVariant, string> = {
      default: 'text-[#006970]',
      confirm: 'text-[#0b2b5e]',
      danger:  'text-[#ba1a1a]',
    };
    return map[this.variant];
  }
}
