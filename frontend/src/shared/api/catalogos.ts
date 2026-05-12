import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./axios";
import type {
  Producto,
  ProductoList,
  PaginatedResponse,
  ProductoFilters,
} from "../../entities/product/types";
import type {
  CategoriaTreeItem,
  Categoria,
  Ingrediente,
} from "../../entities/category/types";

// ===========================================
// Products
// ===========================================

const PRODUCTS_KEY = "productos";
const PRODUCT_KEY = "producto";

async function fetchProducts(
  filters: ProductoFilters,
): Promise<PaginatedResponse<ProductoList>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoria_id) params.set("categoria_id", String(filters.categoria_id));
  if (filters.alergeno_id) params.set("alergeno_id", String(filters.alergeno_id));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));

  const response = await api.get(`/productos?${params.toString()}`);
  return response.data;
}

export function useProducts(filters: ProductoFilters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: (prev) => prev,
  });
}

async function fetchProduct(id: number): Promise<Producto> {
  const response = await api.get(`/productos/${id}`);
  return response.data;
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => fetchProduct(id!),
    enabled: id !== undefined,
  });
}

// ===========================================
// Categories
// ===========================================

const CATEGORIES_KEY = "categorias";
const CATEGORY_KEY = "categoria";

async function fetchCategories(): Promise<CategoriaTreeItem[]> {
  const response = await api.get("/categorias");
  return response.data;
}

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 min — categories don't change often
  });
}

async function fetchCategory(id: number): Promise<Categoria> {
  const response = await api.get(`/categorias/${id}`);
  return response.data;
}

export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: [CATEGORY_KEY, id],
    queryFn: () => fetchCategory(id!),
    enabled: id !== undefined,
  });
}

// ===========================================
// Ingredients
// ===========================================

const INGREDIENTS_KEY = "ingredientes";

async function fetchIngredients(
  soloAlergenos = false,
): Promise<Ingrediente[]> {
  const params = soloAlergenos ? "?solo_alergenos=true" : "";
  const response = await api.get(`/ingredientes${params}`);
  return response.data;
}

export function useIngredients(soloAlergenos = false) {
  return useQuery({
    queryKey: [INGREDIENTS_KEY, { soloAlergenos }],
    queryFn: () => fetchIngredients(soloAlergenos),
    staleTime: 5 * 60 * 1000,
  });
}

// ===========================================
// Mutations — Stock & Availability (Admin)
// ===========================================

async function updateStock(
  productoId: number,
  stockCantidad: number,
): Promise<ProductoList> {
  const response = await api.patch(`/productos/${productoId}/stock`, {
    stock_cantidad: stockCantidad,
  });
  return response.data;
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productoId,
      stockCantidad,
    }: {
      productoId: number;
      stockCantidad: number;
    }) => updateStock(productoId, stockCantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

async function toggleDisponible(
  productoId: number,
  disponible: boolean,
): Promise<ProductoList> {
  const response = await api.patch(`/productos/${productoId}`, {
    disponible,
  });
  return response.data;
}

export function useToggleDisponible() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productoId,
      disponible,
    }: {
      productoId: number;
      disponible: boolean;
    }) => toggleDisponible(productoId, disponible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}
