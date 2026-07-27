## instalacion
esto es para iniciar el proyecto

cd backend
pnpm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
pnpm start

cd kinal-inventario-frontend
pnpm install
pnpm approve-builds
pnpm start


## Problemas encontrados y soluciones

### 1. Carpeta de proyecto duplicada
**Problema:** Existían dos carpetas de frontend (`frontend` y `kinal-inventario-frontend`) abiertas en el mismo workspace de VSCode. La carpeta `frontend` no tenía `node_modules` instalado ni configuración correcta de Angular, lo que generaba errores falsos como "Cannot find module '@angular/core'" en el editor.
**Solución:** Se identificó que `kinal-inventario-frontend` era la carpeta real del proyecto (con `node_modules` instalado y donde corría `ng serve` correctamente). Se eliminó la carpeta `frontend` del workspace de VSCode para evitar confusión.

### 2. Error de instalación de dependencias (`node_modules` corrupto)
**Problema:** Al ejecutar `pnpm start`, aparecía el error `SyntaxError: Unexpected token '.'` proveniente de un paquete mal instalado (`semver`) dentro de `@angular/cli`.
**Solución:** Se limpió la caché de pnpm y se reinstalaron las dependencias desde cero:
```bash
pnpm store prune
Remove-Item -Recurse -Force node_modules
Remove-Item -Force pnpm-lock.yaml
pnpm install
pnpm approve-builds
```

### 3. Las categorías y movimientos no se mostraban en pantalla (quedaban en "Cargando...")
**Problema:** A pesar de que el backend respondía correctamente (verificado con status `200`/`304` y el JSON esperado en la pestaña Network de DevTools), y de que los `console.log` confirmaban que los datos llegaban al `subscribe()` del componente, la vista nunca se actualizaba y quedaba congelada en el mensaje "Cargando categorías..." / "Cargando movimientos...".

**Diagnóstico:** Se descartaron, en orden:
- Problemas de CORS (el header `Access-Control-Allow-Origin: *` confirmó que no era esto).
- Problemas de conexión con el backend (la API respondía bien).
- Errores de compilación de Angular (no había errores en consola).
- Caché del navegador (se probó en ventana de incógnito con el mismo resultado).

Finalmente se identificó que era un problema de **detección de cambios (change detection)** de Angular: el `subscribe()` actualizaba las propiedades del componente (`cargando`, `categorias`, `movimientos`) correctamente, pero Angular no repintaba la vista automáticamente después de recibir la respuesta HTTP.

**Solución:** Se inyectó `ChangeDetectorRef` en los componentes afectados (`CategoriaListComponent`, `MovimientoListComponent`) y se llamó a `this.cdr.detectChanges()` dentro de los callbacks `next` y `error` del `subscribe()`, forzando a Angular a actualizar la vista con los datos recibidos.

```typescript
this.categoriaService.listar().subscribe({
  next: (res) => {
    this.categorias = res.data ?? [];
    this.cargando = false;
    this.cdr.detectChanges(); // fuerza el repintado de la vista
  },
  error: () => {
    this.errorMensaje = "No se pudieron cargar las categorías";
    this.cargando = false;
    this.cdr.detectChanges();
  },
});
```

### 4. Estilos visuales poco profesionales
**Problema:** El diseño inicial de la aplicación (navbar, tablas, formularios) era básico y sin una paleta de colores consistente.
**Solución:** Se rediseñaron `styles.css` (estilos globales: tablas, botones, formularios, tarjetas) y `app.component.css` (navbar) con una paleta de colores unificada mediante variables CSS (`:root`), sombras suaves, buen espaciado, estados de `hover`/`focus`, y una tipografía más cuidada.

