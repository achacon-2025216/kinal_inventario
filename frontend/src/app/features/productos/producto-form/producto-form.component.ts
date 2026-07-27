import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.css']
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categorias: any[] = [];
  esEdicion: boolean = false;
  productoId: any = null;
  cargando: boolean = false;
  errorMensaje: string = '';

  // Getter para solucionar la compatibilidad con el HTML
  get modoEdicion(): boolean {
    return this.esEdicion;
  }

  formulario = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoriaId: ['', [Validators.required]]
  });

  // Getters para los campos en el HTML
  get nombre() { return this.formulario.get('nombre')!; }
  get descripcion() { return this.formulario.get('descripcion')!; }
  get precio() { return this.formulario.get('precio')!; }
  get stock() { return this.formulario.get('stock')!; }
  get categoriaId() { return this.formulario.get('categoriaId')!; }

  ngOnInit(): void {
    this.cargarCategorias();
    this.productoId = this.route.snapshot.paramMap.get('id');
    if (this.productoId) {
      this.esEdicion = true;
      this.cargarProducto(this.productoId);
    }
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (res: any) => {
        this.categorias = res.data ?? res ?? [];
      },
      error: (err: any) => console.error(err)
    });
  }

  cargarProducto(id: any): void {
    this.cargando = true;
    this.productoService.obtenerPorId(id).subscribe({
      next: (res: any) => {
        const prod = res.data ?? res;
        this.formulario.patchValue({
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          stock: prod.stock,
          categoriaId: prod.categoriaId
        });
        this.cargando = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMensaje = 'Error al cargar el producto';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.errorMensaje = '';
    const datos = this.formulario.value;

    const operacion = this.esEdicion
      ? this.productoService.actualizar(this.productoId, datos)
      : this.productoService.crear(datos);

    operacion.subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      },
      error: (err: any) => {
        this.errorMensaje = err.error?.mensaje || 'Error al guardar el producto';
        console.error(err);
      }
    });
  }
}