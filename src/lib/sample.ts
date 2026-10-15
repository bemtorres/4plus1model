import type { DiagramElement, DiagramRelationship, HandleSide, Project, Sheet } from "./types";
import { createId } from "./id";

type ElementSeed = Omit<DiagramElement, "tags"> & { tags?: string[] };

function element(seed: ElementSeed): DiagramElement {
  return { tags: [], ...seed };
}

type RelationSeed = Omit<
  DiagramRelationship,
  "id" | "sourceHandle" | "targetHandle"
> & {
  sourceHandle?: HandleSide | null;
  targetHandle?: HandleSide | null;
};

function relationship(seed: RelationSeed): DiagramRelationship {
  return {
    id: createId("rel"),
    sourceHandle: null,
    targetHandle: null,
    ...seed,
  };
}

function useCaseSheet(): Sheet {
  const cliente = element({
    id: "uc-actor-cliente",
    kind: "actor",
    name: "Cliente",
    description: "Persona que compra en la tienda.",
    meta: { actorType: "primary" },
    parentId: null,
    x: -520,
    y: 40,
  });

  const pasarela = element({
    id: "uc-actor-pasarela",
    kind: "actor",
    name: "Pasarela de pagos",
    description: "Sistema externo que procesa los cobros.",
    meta: { actorType: "secondary" },
    parentId: null,
    x: 480,
    y: 40,
  });

  const sistema = element({
    id: "uc-system-tienda",
    kind: "system",
    name: "Tienda online",
    description: "Vende productos y gestiona pedidos.",
    parentId: null,
    x: -60,
    y: -20,
  });

  const realizar = element({
    id: "uc-realizar",
    kind: "useCase",
    name: "Realizar pedido",
    description: "El cliente selecciona productos y paga.",
    parentId: sistema.id,
    meta: {
      preconditions: "El cliente está autenticado y hay stock disponible.",
      postconditions: "El pedido queda registrado y confirmado por correo.",
      goalLevel: "user",
    },
    x: 40,
    y: 60,
  });

  const consultar = element({
    id: "uc-consultar",
    kind: "useCase",
    name: "Consultar catálogo",
    description: "El cliente busca y filtra productos.",
    parentId: sistema.id,
    meta: { goalLevel: "user" },
    x: 40,
    y: 240,
  });

  const nota = element({
    id: "uc-note",
    kind: "note",
    name: "Doble clic en el sistema para ver los casos de uso.",
    description: "",
    parentId: null,
    x: -520,
    y: 280,
  });

  return {
    id: createId("sh"),
    name: "Casos de uso",
    diagram: "usecase",
    elements: [cliente, pasarela, sistema, realizar, consultar, nota],
    relationships: [
      relationship({
        source: cliente.id,
        target: realizar.id,
        label: "inicia",
        description: "",
        style: "association",
      }),
      relationship({
        source: cliente.id,
        target: consultar.id,
        label: "",
        description: "",
        style: "association",
      }),
      relationship({
        source: realizar.id,
        target: consultar.id,
        label: "",
        description: "",
        style: "include",
      }),
    ],
    view: { level: "actors", scopeId: null },
  };
}

/** Proyecto inicial: una hoja de casos de uso completamente en blanco lista para diseñar. */
export function createSampleProject(): Project {
  return {
    id: createId("pr"),
    name: "Modelador 4+1",
    description: "",
    sheets: [
      {
        id: createId("sh"),
        name: "Vista 1",
        diagram: "usecase",
        elements: [],
        relationships: [],
        view: { level: "actors", scopeId: null },
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

/** Proyecto vacío con una única hoja de casos de uso en blanco. */
export function createEmptyProject(): Project {
  return createSampleProject();
}
