import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";

// ===========================================
// Types (matching backend schemas)
// ===========================================

export interface MetricasResumen {
  total_ventas: number;
  cantidad_pedidos: number;
  cantidad_usuarios: number;
  ticket_promedio: number;
}

export interface VentasPorPeriodo {
  fecha: string;
  monto_total: number;
  cantidad_pedidos: number;
}

export interface TopProducto {
  producto_id: number;
  nombre: string;
  cantidad_total: number;
  ingreso_total: number;
}

export interface PedidosPorEstado {
  estado_codigo: string;
  estado_nombre: string;
  cantidad: number;
}

export interface DateRangeFilter {
  desde?: string;
  hasta?: string;
}

// ===========================================
// Query Keys
// ===========================================
const ADMIN_KEY = "admin";

// ===========================================
// Fetch functions
// ===========================================

async function fetchMetricasResumen(
  filters?: DateRangeFilter,
): Promise<MetricasResumen> {
  const params = new URLSearchParams();
  if (filters?.desde) params.set("desde", filters.desde);
  if (filters?.hasta) params.set("hasta", filters.hasta);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get(`/admin/metricas/resumen${query}`);
  return response.data;
}

async function fetchVentasPeriodo(
  desde: string,
  hasta: string,
  granularidad: string = "dia",
): Promise<VentasPorPeriodo[]> {
  const params = new URLSearchParams({ desde, hasta, granularidad });
  const response = await api.get(`/admin/metricas/ventas?${params.toString()}`);
  return response.data;
}

async function fetchTopProductos(
  top: number = 10,
  filters?: DateRangeFilter,
): Promise<TopProducto[]> {
  const params = new URLSearchParams();
  params.set("top", String(top));
  if (filters?.desde) params.set("desde", filters.desde);
  if (filters?.hasta) params.set("hasta", filters.hasta);
  const response = await api.get(
    `/admin/metricas/productos-top?${params.toString()}`,
  );
  return response.data;
}

async function fetchPedidosPorEstado(
  filters?: DateRangeFilter,
): Promise<PedidosPorEstado[]> {
  const params = new URLSearchParams();
  if (filters?.desde) params.set("desde", filters.desde);
  if (filters?.hasta) params.set("hasta", filters.hasta);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get(
    `/admin/metricas/pedidos-por-estado${query}`,
  );
  return response.data;
}

// ===========================================
// Hooks
// ===========================================

export function useMetricasResumen(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: [ADMIN_KEY, "resumen", filters],
    queryFn: () => fetchMetricasResumen(filters),
    refetchInterval: 30_000, // refresh every 30s
  });
}

export function useVentasPeriodo(
  desde: string,
  hasta: string,
  granularidad: string = "dia",
) {
  return useQuery({
    queryKey: [ADMIN_KEY, "ventas", desde, hasta, granularidad],
    queryFn: () => fetchVentasPeriodo(desde, hasta, granularidad),
  });
}

export function useTopProductos(
  top: number = 10,
  filters?: DateRangeFilter,
) {
  return useQuery({
    queryKey: [ADMIN_KEY, "top-productos", top, filters],
    queryFn: () => fetchTopProductos(top, filters),
  });
}

export function usePedidosPorEstado(filters?: DateRangeFilter) {
  return useQuery({
    queryKey: [ADMIN_KEY, "pedidos-estado", filters],
    queryFn: () => fetchPedidosPorEstado(filters),
  });
}

// ===========================================
// User Management — Types
// ===========================================

export interface AdminUsuario {
  id: number;
  nombre: string;
  email: string;
  roles: string[];
  activo: boolean;
  creado_en: string | null;
}

export interface UsuarioPageResponse {
  items: AdminUsuario[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface UsuarioFilters {
  page?: number;
  page_size?: number;
  busqueda?: string;
  rol?: string;
}

export interface UsuarioEditData {
  nombre?: string;
  email?: string;
}

// ===========================================
// User Management — Fetchers
// ===========================================

async function fetchUsuarios(
  filters: UsuarioFilters,
): Promise<UsuarioPageResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.busqueda) params.set("busqueda", filters.busqueda);
  if (filters.rol) params.set("rol", filters.rol);
  const response = await api.get(`/admin/usuarios?${params.toString()}`);
  return response.data;
}

async function editarUsuario(
  userId: number,
  data: UsuarioEditData,
): Promise<AdminUsuario> {
  const response = await api.put(`/admin/usuarios/${userId}`, data);
  return response.data;
}

async function cambiarRol(
  userId: number,
  rolCodigo: string,
): Promise<{ id: number; roles: string[] }> {
  const response = await api.put(`/admin/usuarios/${userId}/rol`, {
    rol_codigo: rolCodigo,
  });
  return response.data;
}

async function toggleEstado(
  userId: number,
  activo: boolean,
): Promise<{ id: number; activo: boolean }> {
  const response = await api.patch(`/admin/usuarios/${userId}/estado`, {
    activo,
  });
  return response.data;
}

// ===========================================
// User Management — Hooks
// ===========================================

export function useUsuarios(filters: UsuarioFilters = {}) {
  return useQuery({
    queryKey: [ADMIN_KEY, "usuarios", filters],
    queryFn: () => fetchUsuarios(filters),
    placeholderData: (prev) => prev,
  });
}

export function useEditarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UsuarioEditData }) =>
      editarUsuario(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_KEY, "usuarios"] });
    },
  });
}

export function useCambiarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rolCodigo }: { userId: number; rolCodigo: string }) =>
      cambiarRol(userId, rolCodigo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_KEY, "usuarios"] });
    },
  });
}

export function useToggleEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, activo }: { userId: number; activo: boolean }) =>
      toggleEstado(userId, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_KEY, "usuarios"] });
    },
  });
}
