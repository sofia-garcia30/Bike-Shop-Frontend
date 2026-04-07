export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'EMPLEADO';
  activo?: boolean;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'EMPLEADO';
}


export interface Dashboard {
  totalVentas: number;
  totalClientes: number;
  totalBicicletas: number;
  stockBajo: number;
  sinStock: number;
}
 
export interface TopBicicleta {
  codigo: number;
  marca: string;
  modelo: string;
  totalVendido: number;
}
