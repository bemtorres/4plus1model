# 4+1 Modeler

Herramienta web para aprender y documentar arquitectura de software con el modelo 4+1 de Philippe Kruchten. Incluye explicaciones de las cinco vistas y un editor visual para representar escenarios y casos de uso.

El objetivo del proyecto es ayudar a describir una arquitectura desde perspectivas complementarias, sin intentar concentrar todas sus preocupaciones en un único diagrama.

## ¿Qué es el modelo 4+1?

Propuesto por Philippe Kruchten, el modelo 4+1 organiza la descripción de una arquitectura de software en cuatro vistas técnicas y una vista de escenarios. Cada vista responde preguntas distintas sobre el sistema; juntas permiten entenderlo desde las necesidades de sus usuarios hasta su despliegue.

| Vista | Pregunta que responde | Qué describe |
| --- | --- | --- |
| **Escenarios (+1)** | ¿Qué hace el sistema y quién lo utiliza? | Actores, casos de uso y flujos que ilustran y validan la arquitectura. Conecta las otras cuatro vistas con requisitos y situaciones de uso. |
| **Lógica** | ¿Cómo está organizada la estructura del sistema? | Elementos conceptuales —por ejemplo, clases o entidades— y sus responsabilidades y relaciones. |
| **Proceso** | ¿Cómo se comporta el sistema mientras se ejecuta? | Procesos, hilos, concurrencia, comunicación y sincronización. |
| **Desarrollo** | ¿Cómo se organiza el software para construirlo? | Módulos, componentes, capas, paquetes y dependencias del código. |
| **Física** | ¿Dónde se ejecuta el software? | Nodos, dispositivos, servidores, redes y la distribución del software sobre la infraestructura. |

El “+1” representa la vista de escenarios: los casos de uso muestran cómo colaboran los elementos y ayudan a comprobar que las decisiones de las cuatro vistas técnicas satisfacen las necesidades planteadas.

### Alcance actual del editor

La aplicación presenta las cinco vistas y explica su propósito. Actualmente, el editor permite modelar la vista de **Escenarios**: actores, sistemas, casos de uso y pasos de sus flujos. Las vistas Lógica, Proceso, Desarrollo y Física se explican como parte del modelo, pero todavía no están disponibles como editores independientes.

## Funcionalidades

- Lienzo visual interactivo para modelar actores, sistemas, casos de uso, pasos y relaciones.
- Navegación por niveles (drill-down) para pasar del contexto de escenarios al detalle de casos de uso y sus flujos.
- Proyectos con varias hojas, notas, edición de relaciones y organización automática del diagrama.
- Deshacer y rehacer cambios.
- Guardado del proyecto en el almacenamiento local del navegador y opción para compartirlo mediante un enlace.
- Exportación a JSON, Markdown y JWT.
- Interfaz disponible en varios idiomas y temas claro y oscuro.

## Tecnologías

- Astro
- React y TypeScript
- Tailwind CSS
- HeroUI
- React Flow (`@xyflow/react`)

## Empezar

### Requisitos

- Node.js 22.12.0 o posterior
- npm

### Instalar dependencias

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Abre la URL local que indique la terminal; normalmente es `http://localhost:4321`.

### Compilar y previsualizar

```bash
npm run build
npm run preview
```

## Scripts disponibles

- `npm run dev`: inicia el servidor local de desarrollo.
- `npm run build`: compila la aplicación para producción.
- `npm run preview`: previsualiza localmente la compilación.
- `npm run check`: valida los tipos de TypeScript.
- `npm run doc`: ejecuta el generador de documentación.
- `npm run astro`: ejecuta comandos de Astro.

## Estructura del proyecto

```text
.
├── public/          # Recursos estáticos
├── src/
│   ├── components/  # Interfaz, página informativa y editor
│   ├── i18n/        # Traducciones
│   ├── layouts/     # Layouts de Astro
│   ├── lib/         # Modelo de datos, almacenamiento, diagramas y exportación
│   ├── pages/       # Rutas de la aplicación
│   └── styles/      # Estilos globales
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Contribuir

Las contribuciones son bienvenidas. Puedes proponer mejoras a las explicaciones del modelo, al editor de escenarios o a la implementación de las vistas técnicas. Describe claramente el cambio al abrir una solicitud de incorporación.

## License

This project is licensed under the MIT License.

Copyright (c) 2026 cafeycodigo.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
