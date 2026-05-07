import { create } from "zustand";

interface PaymentState {
  checkoutStep: "idle" | "processing" | "completed" | "error";
  preferenceId: string | null;
  paymentStatus: string | null;
  error: string | null;

  startCheckout: (pedidoId: number) => void;
  setPreference: (preferenceId: string) => void;
  updatePaymentStatus: (status: string) => void;
  resetPayment: () => void;
  setError: (error: string) => void;
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  checkoutStep: "idle",
  preferenceId: null,
  paymentStatus: null,
  error: null,

  startCheckout: (_pedidoId: number) =>
    set({
      checkoutStep: "processing",
      error: null,
    }),

  setPreference: (preferenceId) =>
    set({ preferenceId }),

  updatePaymentStatus: (status) =>
    set({ paymentStatus: status }),

  resetPayment: () =>
    set({
      checkoutStep: "idle",
      preferenceId: null,
      paymentStatus: null,
      error: null,
    }),

  setError: (error) =>
    set({ error, checkoutStep: "error" }),
}));
