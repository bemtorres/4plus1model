/**
 * Datos del autor y enlaces del proyecto.
 * Edita aquí para actualizar la página "Acerca de".
 */
export const AUTHOR = {
  name: "Benjamin Mora Torres",
  /** Se muestra junto al nombre; la biografía lo describe en detalle. */
  role: "Informatics engineer & teacher",
  links: {
    linkedin: "https://www.linkedin.com/in/bemtorres/",
    github: "https://github.com/bemtorres",
  },
} as const;

export const PROJECT = {
  name: "C4 Modeler",
  /** Metodología de referencia que implementa la herramienta. */
  methodology: "C4 Model",
  methodologyUrl: "https://c4model.com/",
} as const;

/** Referencias técnicas que se citan en la página. */
export const REFERENCES = [
  {
    id: "c4model",
    name: "C4 Model",
    url: "https://c4model.com/",
    description:
      "The methodology implemented here: zoom into the abstractions that actually matter, from system context down to code.",
  },
  {
    id: "structurizr",
    name: "Structurizr for UML",
    url: "https://docs.structurizr.com/",
    description:
      "Reference for the hierarchical workspaces and the way one abstraction level drills down into the next.",
  },
  {
    id: "c4plantuml",
    name: "C4-PlantUML",
    url: "https://github.com/plantuml-stdlib/C4-PlantUML",
    description: "Standard macros used by the PlantUML export (Person, System, Container…).",
  },
  {
    id: "mermaid",
    name: "Mermaid C4 diagrams",
    url: "https://mermaid.js.org/syntax/c4.html",
    description: "Target syntax of the Mermaid export (C4Context, C4Container, C4Component).",
  },
  {
    id: "reactflow",
    name: "React Flow",
    url: "https://reactflow.dev/",
    description: "Canvas, nodes, handles and interactions used by the editor.",
  },
  {
    id: "heroui",
    name: "HeroUI",
    url: "https://heroui.com/",
    description: "Accessible React components and the light/dark design tokens.",
  },
] as const;
