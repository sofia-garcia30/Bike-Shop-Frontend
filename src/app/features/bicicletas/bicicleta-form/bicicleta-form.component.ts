import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BicicletaService } from '../../../core/services/bicicleta.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Bicicleta } from '../../../core/models/bicicleta.model';

@Component({
  selector: 'app-bicicleta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './bicicleta-form.component.html'
})
export class BicicletaFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private bicicletaService = inject(BicicletaService);
  private cloudinaryService = inject(CloudinaryService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() bicicletaEditar: Bicicleta | null = null;
  @Output() cerrado = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  subiendoImagen = false;
  guardando = false;
  previstaImagen = '';

  form = this.fb.group({
    marca:       ['', [Validators.required, Validators.minLength(2)]],
    modelo:      ['', [Validators.required, Validators.minLength(2)]],
    tipo:        ['', Validators.required],
    descripcion: [''],
    precioCosto: [null as number | null, [Validators.required, Validators.min(0)]],
    precioVenta: [null as number | null, [Validators.required, Validators.min(0)]],
    imagenUrl:   ['']
  });

  get esEdicion(): boolean {
    return !!this.bicicletaEditar;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar Bicicleta' : 'Nueva Bicicleta';
  }

  ngOnChanges(): void {
    if (this.isOpen && !this.bicicletaEditar) {
      this.form.reset();
      this.previstaImagen = '';
      this.cdr.detectChanges();
    }

    if (this.isOpen && this.bicicletaEditar) {
      this.form.patchValue({
        marca:       this.bicicletaEditar.marca,
        modelo:      this.bicicletaEditar.modelo,
        tipo:        this.bicicletaEditar.tipo,
        descripcion: this.bicicletaEditar.descripcion,
        precioCosto: this.bicicletaEditar.precioCosto,
        precioVenta: this.bicicletaEditar.precioVenta,
        imagenUrl:   this.bicicletaEditar.imagenUrl ?? ''
      });
      this.previstaImagen = this.bicicletaEditar.imagenUrl ?? '';
      this.cdr.detectChanges();
    }
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const archivo = input.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previstaImagen = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(archivo);

    this.subiendoImagen = true;
    this.cloudinaryService.subirImagen(archivo).subscribe({
      next: (url) => {
        this.form.patchValue({ imagenUrl: url });
        this.subiendoImagen = false;
        this.toast.success('Imagen subida correctamente');
        this.cdr.detectChanges();
      },
      error: () => {
        this.subiendoImagen = false;
        this.toast.error('Error al subir la imagen');
        this.cdr.detectChanges();
      }
    });
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Por favor completa todos los campos requeridos');
      this.cdr.detectChanges();
      return;
    }

    if (this.subiendoImagen) {
      this.toast.warning('Espera a que la imagen termine de subir');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const datos = this.form.value as any;

    const peticion = this.esEdicion
      ? this.bicicletaService.update(this.bicicletaEditar!.codigo!, datos)
      : this.bicicletaService.create(datos);

    peticion.subscribe({
      next: () => {
        this.toast.success(
          this.esEdicion
            ? 'Bicicleta actualizada correctamente'
            : 'Bicicleta creada correctamente'
        );
        this.guardando = false;
        this.guardado.emit();
        this.cerrar();
      },
      error: () => {
        this.toast.error('Error al guardar la bicicleta');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrar(): void {
    this.form.reset();
    this.previstaImagen = '';
    this.guardando = false;
    this.cerrado.emit();
  }

  campo(nombre: string) {
    return this.form.get(nombre);
  }

  tieneError(nombre: string): boolean {
    const c = this.campo(nombre);
    return !!(c?.invalid && c?.touched);
  }
}
