export interface Pedido {
  id: number;
  idProveedor: number;
  idUsuario: number;
  fecha: string;
  estado: string;
}

export interface DetallePedido {
  id: number;
  idPedido: number;
  codigoBicicleta: number;
  cantidad: number;
  precioCostoUnitario: number;
}

export interface PedidoRequest {
  idProveedor: number;
  detalles: DetallePedidoRequest[];
}
 
export interface DetallePedidoRequest {
  codigoBicicleta: number;
  cantidad: number;
  precioCostoUnitario: number;
  nombreBicicleta?: string;
}
