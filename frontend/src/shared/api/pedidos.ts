import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";
import type {
  Pedido,
  PedidoCreateRequest,
  CambioEstadoRequest,
  HistorialEstado,
  PaginatedPedidosResponse,
  PedidoFilters,
  AdminPedidoFilters,
} from "../../entities/order/types";

// ===========================================
// Query Keys
// ===========================================
const ORDERS_KEY = "pedidos";
const ORDER_KEY = "pedido";
const HISTORY_KEY = "historial";

// ===========================================
// Queries — Client
// ===========================================

async function fetchMisPedidos(
  filters: PedidoFilters,
): Promise<PaginatedPedidosResponse> {
  const params = new URLSearchParams();
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));

  const response = await api.get(`/pedidos?${params.toString()}`);
  return response.data;
}

export function useMisPedidos(filters: PedidoFilters = {}) {
  return useQuery({
    queryKey: [ORDERS_KEY, filters],
    queryFn: () => fetchMisPedidos(filters),
    placeholderData: (prev) => prev,
  });
}

async function fetchPedido(id: number): Promise<Pedido> {
  const response = await api.get(`/pedidos/${id}`);
  return response.data;
}

export function usePedido(id: number | undefined) {
  return useQuery({
    queryKey: [ORDER_KEY, id],
    queryFn: () => fetchPedido(id!),
    enabled: id !== undefined,
  });
}

async function fetchHistorialPedido(id: number): Promise<HistorialEstado[]> {
  const response = await api.get(`/pedidos/${id}/historial`);
  return response.data;
}

export function useHistorialPedido(id: number | undefined) {
  return useQuery({
    queryKey: [HISTORY_KEY, id],
    queryFn: () => fetchHistorialPedido(id!),
    enabled: id !== undefined,
  });
}

// ===========================================
// Queries — Admin
// ===========================================

async function fetchAllPedidos(
  filters: AdminPedidoFilters,
): Promise<PaginatedPedidosResponse> {
  const params = new URLSearchParams();
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.busqueda) params.set("busqueda", filters.busqueda);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));

  const response = await api.get(`/admin/pedidos?${params.toString()}`);
  return response.data;
}

export function useAllPedidos(filters: AdminPedidoFilters = {}) {
  return useQuery({
    queryKey: [ORDERS_KEY, "admin", filters],
    queryFn: () => fetchAllPedidos(filters),
    placeholderData: (prev) => prev,
  });
}

async function fetchPedidoAdmin(id: number): Promise<Pedido> {
  const response = await api.get(`/admin/pedidos/${id}`);
  return response.data;
}

export function usePedidoAdmin(id: number | undefined) {
  return useQuery({
    queryKey: [ORDER_KEY, "admin", id],
    queryFn: () => fetchPedidoAdmin(id!),
    enabled: id !== undefined,
  });
}

async function fetchHistorialAdmin(id: number): Promise<HistorialEstado[]> {
  const response = await api.get(`/admin/pedidos/${id}/historial`);
  return response.data;
}

export function useHistorialAdmin(id: number | undefined) {
  return useQuery({
    queryKey: [HISTORY_KEY, "admin", id],
    queryFn: () => fetchHistorialAdmin(id!),
    enabled: id !== undefined,
  });
}

// ===========================================
// Mutations
// ===========================================

async function crearPedido(data: PedidoCreateRequest): Promise<Pedido> {
  const response = await api.post("/pedidos", data);
  return response.data;
}

export function useCrearPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      // Invalidate orders list to refresh
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
}

async function cambiarEstadoPedido(
  pedidoId: number,
  data: CambioEstadoRequest,
): Promise<Pedido> {
  const response = await api.patch(`/admin/pedidos/${pedidoId}/estado`, data);
  return response.data;
}

export function useCambiarEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pedidoId, data }: { pedidoId: number; data: CambioEstadoRequest }) =>
      cambiarEstadoPedido(pedidoId, data),
    onSuccess: () => {
      // Invalidate ALL queries related to pedidos (admin + client)
      queryClient.invalidateQueries({ queryKey: [ORDER_KEY] });     // pedido detail (admin + client)
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });    // pedidos list (admin + client)
      queryClient.invalidateQueries({ queryKey: [HISTORY_KEY] });   // historial (admin + client)
    },
  });
}
