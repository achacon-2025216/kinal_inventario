import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.css']
})
export class ProductoListComponent implements OnInit {
  productos: Producto[] = [];
  cargando: boolean = false;
  errorMsg: string = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.productoService.listar().subscribe({
      next: (res: any) => {
        this.productos = res.data ?? res ?? [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg = 'Error al cargar la lista de productos';
        this.cargando = false;
      }
    });
  }

  eliminarProducto(id: any): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => {
          this.productos = this.productos.filter((p: any) => p.id !== id);
        },
        error: (err: any) => {
          alert('Error al eliminar el producto');
          console.error(err);
        }
      });
    }
  }
}