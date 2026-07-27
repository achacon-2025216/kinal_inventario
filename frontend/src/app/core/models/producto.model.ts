import { Categoria } from './categoria.model';

export interface Producto {
  id?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoriaId: string;
  categoria?: Categoria;
  createdAt?: string;
  updatedAt?: string;
}