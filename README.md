# C4 Modeler

A browser-based tool for modeling and documenting software architecture using the C4 model (Context, Containers, Components, and Code).

This project helps teams describe systems at the right level of abstraction, from the big picture to implementation details, without mixing concerns in a single diagram.

It is designed to support students and teachers in learning and practicing the C4 modeling approach, turning architecture concepts into a clear and visual exercise.

This project was born from the cafeycodigo.org initiative.

Project website: https://modelc4.cafeycodigo.org

## Why this project exists

Most architecture diagrams fail because they try to show too much at once. The C4 model addresses this by encouraging progressive zooming:

- Context: who uses the system and what external systems it interacts with
- Containers: major applications, services, databases, and message brokers
- Components: internal modules within a container
- Code: key classes, functions, and responsibilities when needed

C4 Modeler makes this workflow interactive and visual, so you can build diagrams, refine them, and export them for documentation or communication.

## Features

- Visual editor for C4 architecture diagrams
- Drill-down between levels: Context, Containers, Components, and Code
- Drag-and-drop element palette
- Relationship editing with labels and technologies
- Auto-layout for elements at each level
- Import/export support for JSON, PlantUML, Mermaid, and Markdown
- Multi-language interface
- Light and dark themes
- Example-based architecture scenarios to explore the model

## Tech stack

- Astro
- React
- TypeScript
- Tailwind CSS
- Hero UI
- React Flow

## Getting started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:4321
```

### Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run check:examples
npm run astro
```

### Script descriptions

- `npm run dev`: starts the Astro development server
- `npm run build`: builds the application for production
- `npm run preview`: serves the built app locally
- `npm run check`: runs TypeScript validation
- `npm run check:examples`: validates the example catalog data
- `npm run astro`: runs Astro CLI commands

## Project structure

```text
.
├── public/                  # Static assets and example resources
├── scripts/                 # Validation and build scripts
├── src/
│   ├── components/          # UI and editor components
│   ├── i18n/                # Translation dictionaries
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Domain logic, types, exports, and example data
│   ├── pages/               # Astro pages
│   ├── styles/              # Global styles
│   └── env.d.ts
├── astro.config.mjs
├── CNAME                    # Custom domain configuration
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Example catalog

The project includes a catalog of example software architectures that can be explored in the app. These examples are defined in the `src/lib/examples` area and are validated by the example checker.

If you want to add or modify example models, use the generator and validation flow defined under `src/lib/examples` and run:

```bash
npm run check:examples
```

## Development notes

This app is designed for modeling architecture as a living artifact: the goal is not to generate a single polished diagram, but to create a structured understanding of a system that can evolve over time.

The exported diagrams can be used in technical documentation, architecture reviews, onboarding, and system discussions.

## Contributing

Contributions are welcome. If you want to improve the tool, add example architectures, or refine the editor experience, please open a pull request with a clear description of the change.

## License

This project is licensed under the MIT License.

This project was born from the cafeycodigo.org project and is distributed under the same open and permissive approach.

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
