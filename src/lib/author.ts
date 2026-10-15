/**
 * Datos del autor y enlaces del proyecto.
 * Edita aquí para actualizar la página "Acerca de".
 */
export const AUTHOR = {
  name: "Benjamin Mora Torres",
  /** Se muestra junto al nombre; la biografía lo describe en detalle. */
  role: "Informatics engineer & teacher",
  links: {
    linkedin: "https://www.linkedin.com/in/benjamin-mora-torres/",
    github: "https://github.com/bemtorres",
  },
} as const;

export const PROJECT = {
  name: "4+1 Modeler",
  /** Metodología de referencia que implementa la herramienta. */
  methodology: "4+1 View Model of Architecture",
  methodologyUrl: "https://doi.org/10.1109/52.469759",
} as const;

/** Referencias técnicas que se citan en la página. */
export const REFERENCES = [
  {
    id: "4plus1",
    name: "4+1 View Model",
    url: "https://doi.org/10.1109/52.469759",
    description:
      "The methodology implemented here: four concurrent views (logical, process, development, physical) plus a scenario view that illustrates and validates them.",
  },
  {
    id: "uml",
    name: "UML use-case notation",
    url: "https://www.omg.org/spec/UML/",
    description:
      "Official notation behind the scenario view: actors, use cases, «include», «extend» and generalization.",
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
