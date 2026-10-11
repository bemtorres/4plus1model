# Imágenes de los ejemplos

Coloca aquí las miniaturas de los casos de estudio del catálogo.

**Convención de nombre:** el archivo debe llamarse exactamente como el `id` del
ejemplo, con extensión `.webp`:

```
public/examples/cinenova.webp
public/examples/sonoraplay.webp
public/examples/novabank.webp
...
```

**Tamaño recomendado:** 640 × 360 px (relación 16:9), WebP optimizado por debajo
de 40 KB. El carrusel recorta con `object-cover`, así que cualquier proporción
se adapta.

**Comportamiento actual:** si el archivo no existe, la tarjeta muestra un marcador
con el icono de la categoría y el texto `public/examples/<id>.webp`. No hay errores
en consola ni imágenes rotas.

**Cómo obtener el `id`:** está en `src/lib/examples/catalog.ts`, al principio de
cada ejemplo (`id: "cinenova"`). También se puede ver en la URL de la imagen que
intenta cargar el navegador.

**Conversión automática con Sharp:** si añades imágenes en formato `.png`, puedes convertirlas automáticamente a `.webp` optimizado y borrar los `.png` originales ejecutando:
```bash
npm run convert:webp
```

Los nombres de los proyectos son ficticios y las imágenes deben ser material
propio o con licencia clara: se usan como casos de estudio independientes.
