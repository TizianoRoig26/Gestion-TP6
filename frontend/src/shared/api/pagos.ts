import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./axios";

// ===========================================
// Query Keys
// ===========================================
const PAGOS_KEY = "pagos";

// ===========================================
// Types
// ===========================================

export interface PagoCreateRequest {
  pedido_id: number;
  card_token: string;
}

export interface PagoResponse {
  id: number;
  pedido_id: number;
  monto: number;
  mp_payment_id: number | null;
  mp_status: string;
  external_reference: string;
  creado_en: string;
}

// ===========================================
// API Functions
// ===========================================

async function crearPago(data: PagoCreateRequest): Promise<PagoResponse> {
  const response = await api.post("/pagos/crear", data);
  return response.data;
}

async function fetchEstadoPago(pedidoId: number): Promise<PagoResponse> {
  const response = await api.get(`/pagos/${pedidoId}`);
  return response.data;
}

// ===========================================
// Hooks
// ===========================================

export function useCrearPago() {
  return useMutation({
    mutationFn: crearPago,
  });
}

/**
 * Polls payment status for a pedido.
 * - Polls every 5 seconds while the payment is pending/processing.
 * - Stops polling when the payment reaches a terminal state (approved/rejected).
 * - Disabled when no pedidoId is provided (e.g. EFECTIVO payment).
 */
export function useEstadoPago(pedidoId: number | undefined) {
  return useQuery({
    queryKey: [PAGOS_KEY, "estado", pedidoId],
    queryFn: () => fetchEstadoPago(pedidoId!),
    enabled: !!pedidoId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 5000;

      // Stop polling for terminal states
      if (data.mp_status === "approved" || data.mp_status === "rejected") {
        return false;
      }

      return 5000;
    },
    retry: 1,
  });
}
