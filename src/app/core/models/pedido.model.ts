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
