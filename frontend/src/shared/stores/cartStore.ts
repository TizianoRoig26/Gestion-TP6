import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productoId: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen?: string;
  };
  cantidad: number;
  personalizacion?: {
    ingredientesExcluidos: number[];
  };
}

interface CartState {
  items: CartItem[];

  addItem: (
    producto: CartItem["producto"],
    cantidad: number,
    personalizacion?: CartItem["personalizacion"],
  ) => void;
  removeItem: (productoId: number) => void;
  updateQuantity: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  getItem: (productoId: number) => CartItem | undefined;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, cantidad, personalizacion) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.productoId === producto.id,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productoId === producto.id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productoId: producto.id,
                producto,
                cantidad,
                personalizacion,
              },
            ],
          };
        }),

      removeItem: (productoId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.productoId !== productoId,
          ),
        })),

      updateQuantity: (productoId, cantidad) =>
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter(
                (item) => item.productoId !== productoId,
              ),
            };
          }
          return {
            items: state.items.map((item) =>
              item.productoId === productoId
                ? { ...item, cantidad }
                : item,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItem: (productoId) =>
        get().items.find((item) => item.productoId === productoId),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.cantidad, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.producto.precio * item.cantidad,
          0,
        ),
    }),
    {
      name: "food-store-cart",
    },
  ),
);
