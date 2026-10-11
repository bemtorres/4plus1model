# Imágenes de los ejemplos

Coloca aquí las miniaturas de los casos de estudio del catálogo.

**Convención de nombre:** el archivo debe llamarse exactamente como el `id` del
ejemplo, con extensión `.png`:

```
public/examples/cinenova.png
public/examples/sonoraplay.png
public/examples/novabank.png
...
```

**Tamaño recomendado:** 640 × 360 px (relación 16:9), PNG optimizado por debajo
de 120 KB. El carrusel recorta con `object-cover`, así que cualquier proporción
se adapta.

**Comportamiento actual:** si el archivo no existe, la tarjeta muestra un marcador
con el icono de la categoría y el texto `public/examples/<id>.png`. No hay errores
en consola ni imágenes rotas.

**Cómo obtener el `id`:** está en `src/lib/examples/catalog.ts`, al principio de
cada ejemplo (`id: "cinenova"`). También se puede ver en la URL de la imagen que
intenta cargar el navegador.

Los nombres de los proyectos son ficticios y las imágenes deben ser material
propio o con licencia clara: se usan como casos de estudio independientes.
