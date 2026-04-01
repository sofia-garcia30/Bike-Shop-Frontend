import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'token';
  private readonly USUARIO_KEY = 'usuario';
  private apiUrl = environment.apiUrl;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(
    this.getUsuario()
  );
  usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ─── Login ───────────────────────────────────────────────────
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USUARIO_KEY, JSON.stringify({
            id: response.id,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol
          }));
          this.usuarioSubject.next(this.getUsuario());
        })
      );
  }

  // ─── Logout ──────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ─── Obtener token ───────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ─── Obtener usuario ─────────────────────────────────────────
  getUsuario(): Usuario | null {
    const data = localStorage.getItem(this.USUARIO_KEY);
    return data ? JSON.parse(data) : null;
  }

  // ─── Verificar si es admin ───────────────────────────────────
  isAdmin(): boolean {
    return this.getUsuario()?.rol === 'ADMIN';
  }

  // ─── Verificar si está logueado ──────────────────────────────
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
