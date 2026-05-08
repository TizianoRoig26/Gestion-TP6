// ===========================================
// Order Entity Types (matching backend API)
// ===========================================

export interface EstadoPedido {
  codigo: string;
  nombre: string;
  descripcion?: string;
  es_terminal: boolean;
}

export interface FormaPago {
  codigo: string;
  nombre: string;
  habilitado: boolean;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_snapshot: number;
  nombre_snapshot: string;
  subtotal: number;
  personalizacion?: number[];
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado_codigo: string;
  direccion_id?: number;
  forma_pago_codigo: string;
  total: number;
  costo_envio: number;
  direccion_snapshot?: string;
  creado_en: string;
  actualizado_en?: string;
  detalles: DetallePedido[];
  estado?: EstadoPedido;
  forma_pago?: FormaPago;
}

export interface PedidoResumen {
  id: number;
  usuario_id: number;
  estado_codigo: string;
  total: number;
  costo_envio: number;
  items_count: number;
  creado_en: string;
  actualizado_en?: string;
}

export interface PedidoCreateRequest {
  direccion_id?: number;
  forma_pago_codigo: string;
  costo_envio?: number;
  direccion_snapshot?: string;
  detalles: DetallePedidoCreateRequest[];
}

export interface DetallePedidoCreateRequest {
  producto_id: number;
  cantidad: number;
  precio_snapshot: number;
  nombre_snapshot: string;
  subtotal: number;
  personalizacion?: number[];
}

export interface CambioEstadoRequest {
  estado_codigo: string;
  observacion?: string;
}

export interface HistorialEstado {
  id: number;
  pedido_id: number;
  estado_desde?: string;
  estado_hacia: string;
  usuario_id?: number;
  observacion?: string;
  creado_en: string;
}

export interface PaginatedPedidosResponse {
  items: PedidoResumen[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface PedidoFilters {
  estado?: string;
  page?: number;
  page_size?: number;
}

export interface AdminPedidoFilters {
  estado?: string;
  desde?: string;
  hasta?: string;
  busqueda?: string;
  page?: number;
  page_size?: number;
}
