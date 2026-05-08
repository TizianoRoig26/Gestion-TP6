/** Category info embedded in product responses */
export interface CategoriaInfo {
  id: number;
  nombre: string;
}

/** Ingredient info embedded in product responses */
export interface IngredienteInfo {
  id: number;
  nombre: string;
  es_alergeno: boolean;
  es_removible: boolean;
}

/** Product summary (list view) */
export interface ProductoList {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  precio_base: number;
  stock_cantidad: number;
  disponible: boolean;
  creado_en: string;
  categorias: CategoriaInfo[];
}

/** Product detail (includes ingredients) */
export interface Producto extends ProductoList {
  ingredientes: IngredienteInfo[];
}

/** Paginated response from the API */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

/** Filters for product listing */
export interface ProductoFilters {
  search?: string;
  categoria_id?: number;
  alergeno_id?: number;
  page?: number;
  page_size?: number;
}
