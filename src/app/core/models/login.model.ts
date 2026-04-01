export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  id: number;
  nombre: string;
  email: string;
  rol: string;
}
