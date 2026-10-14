# Catálogo de ejemplos

Catálogo de casos de estudio del editor (diagramas de casos de uso). Para añadir
un caso de estudio basta con empujar un `ExampleSpec` al array `EXAMPLES` de
`catalog.ts`; el builder genera el `Project` (hoja de casos de uso con actores,
sistema, casos, flujos y relaciones) y el filtrado/diálogos lo muestran
automáticamente.

| Archivo | Rol |
| --- | --- |
| `builder.ts` | Tipos (`ExampleSpec`, `CategoryId`…) y `buildExampleProject()`. |
| `catalog.ts` | **El catálogo.** El único archivo que hay que tocar para añadir un ejemplo. |
| `index.ts` | Búsqueda, filtrado y resolución de `?code=` (`findExampleByCode`, `buildProjectFor`). |
| `url.ts` | Lectura/escritura del parámetro `?code=` en la URL. |

Consumidores: `ExamplesDialog` / `ExampleDetailDialog`, abiertos desde el botón
«Ejemplos» de la barra superior del editor (`TopBar.tsx`).
