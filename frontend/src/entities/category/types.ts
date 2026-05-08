/** Category as returned from the tree API */
export interface CategoriaTreeItem {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  padre_id: number | null;
  nivel: number;
}

/** Category detail */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  padre_id: number | null;
  nivel: number;
  creado_en: string;
  actualizado_en?: string;
}

/** Ingredient */
export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion?: string;
  es_alergeno: boolean;
  creado_en: string;
}
