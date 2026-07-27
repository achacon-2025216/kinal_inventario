import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Categoria } from "../../../core/models/categoria.model";
import { AuthService } from "../../../core/services/auth.service";
import { CategoriaService } from "../../../core/services/categoria.service";

@Component({
  selector: "app-categoria-list",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./categoria-list.component.html",
  styleUrl: "./categoria-list.component.css",
})
export class CategoriaListComponent implements OnInit {
  categorias: Categoria[] = [];
  cargando = true;
  errorMensaje = "";

  constructor(
    private categoriaService: CategoriaService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    console.log("1. Iniciando petición...");
    this.categoriaService.listar().subscribe({
      next: (res) => {
        console.log("2. Respuesta recibida:", res);
        this.categorias = res.data ?? [];
        this.cargando = false;
        this.cdr.detectChanges(); // <-- fuerza el repintado
      },
      error: (err) => {
        console.log("3. ERROR:", err);
        this.errorMensaje = "No se pudieron cargar las categorías";
        this.cargando = false;
        this.cdr.detectChanges(); // <-- fuerza el repintado
      },
    });
  }

  eliminar(categoria: Categoria): void {
    const confirmado = confirm(`¿Eliminar la categoría "${categoria.nombre}"?`);
    if (!confirmado) return;

    this.categoriaService.eliminar(categoria.id).subscribe({
      next: () => this.cargar(),
      error: (err) => alert(err.error?.mensaje || "No se pudo eliminar"),
    });
  }
}