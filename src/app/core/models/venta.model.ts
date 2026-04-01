export interface Venta {
  id: number;
  documentoCliente: string;
  idUsuario: number;
  fecha: string;
  total: number;
  formaPago: string;
  estado: string;
}

export interface DetalleVenta {
  id: number;
  idVenta: number;
  codigoBicicleta: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
