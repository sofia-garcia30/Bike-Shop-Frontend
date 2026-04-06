import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map(response => response.secure_url)
    );
  }
}
