import type { C4Element, C4Relationship, HandleSide, Workspace } from "./types";
import { createId } from "./id";

type ElementSeed = Omit<C4Element, "tags"> & { tags?: string[] };

function element(seed: ElementSeed): C4Element {
  return { tags: [], ...seed };
}

type RelationSeed = Omit<
  C4Relationship,
  "id" | "sourceHandle" | "targetHandle"
> & {
  sourceHandle?: HandleSide | null;
  targetHandle?: HandleSide | null;
};

/**
 * Workspace de ejemplo: una tienda online con los cuatro niveles C4
 * (contexto, contenedores, componentes y código) ya poblados.
 */
export function createSampleWorkspace(): Workspace {
  const elements: C4Element[] = [
    // --- Nivel 1: contexto ---
    element({
      id: "ctx-cliente",
      kind: "person",
      name: "Customer",
      description: "Buys products from the web or the mobile app.",
      technology: "",
      parentId: null,
      x: 60,
      y: 120,
    }),
    element({
      id: "ctx-almacen",
      kind: "person",
      name: "Warehouse Staff",
      icon: "users",
      description: "Prepares, packs and ships the orders.",
      technology: "",
      parentId: null,
      x: 60,
      y: 620,
    }),
    element({
      id: "ctx-tienda",
      kind: "softwareSystem",
      name: "Online Store",
      description: "Sells products online and manages the full order lifecycle.",
      technology: "",
      parentId: null,
      x: 400,
      y: 300,
      tags: ["Internal"],
    }),
    element({
      id: "ctx-pagos",
      kind: "externalSystem",
      name: "Payment Gateway",
      icon: "globe",
      description: "Authorises and settles card payments.",
      technology: "",
      parentId: null,
      x: 1400,
      y: 300,
    }),

    // --- Nivel 2: contenedores de "Tienda Online" ---
    element({
      id: "cnt-web",
      kind: "container",
      name: "Web and Mobile App",
      icon: "mobile",
      description: "User interface for catalogue, cart and checkout.",
      technology: "React + TypeScript",
      parentId: "ctx-tienda",
      x: 560,
      y: 160,
    }),
    element({
      id: "cnt-api",
      kind: "container",
      name: "Store API",
      description: "Exposes the public contract and applies authentication and rate limits.",
      technology: "Node.js + Express",
      parentId: "ctx-tienda",
      x: 560,
      y: 340,
    }),
    element({
      id: "cnt-pedidos",
      kind: "container",
      name: "Order Service",
      description: "Creates orders, reserves stock and coordinates shipping.",
      technology: "Java + Spring Boot",
      parentId: "ctx-tienda",
      x: 560,
      y: 520,
    }),
    element({
      id: "cnt-pagos",
      kind: "container",
      name: "Payment Service",
      description: "Orchestates the charge and settles with the external gateway.",
      technology: "Java + Spring Boot",
      parentId: "ctx-tienda",
      x: 880,
      y: 160,
    }),
    element({
      id: "cnt-cola",
      kind: "queue",
      name: "Event Queue",
      description: "Decouples the asynchronous processes of the store.",
      technology: "RabbitMQ",
      parentId: "ctx-tienda",
      x: 880,
      y: 360,
    }),
    element({
      id: "cnt-db",
      kind: "database",
      name: "Store Database",
      description: "Orders, products, inventory and customers.",
      technology: "PostgreSQL",
      parentId: "ctx-tienda",
      x: 880,
      y: 560,
    }),

    // --- Nivel 3: componentes de "Servicio de Pedidos" ---
    element({
      id: "cmp-pedidos-api",
      kind: "component",
      name: "Order API",
      description: "Endpoints to create and query orders.",
      technology: "Spring MVC",
      parentId: "cnt-pedidos",
      x: 560,
      y: 180,
    }),
    element({
      id: "cmp-inventario",
      kind: "component",
      name: "Inventory Manager",
      description: "Reserves and releases stock transactionally.",
      technology: "Spring Service",
      parentId: "cnt-pedidos",
      x: 560,
      y: 380,
    }),
    element({
      id: "cmp-notificaciones",
      kind: "component",
      name: "Notification Worker",
      description: "Queues and sends order status notifications.",
      technology: "Spring Batch",
      parentId: "cnt-pedidos",
      x: 560,
      y: 580,
    }),

    // --- Nivel 4: código de "API de Pedidos" ---
    element({
      id: "cod-controller",
      kind: "code",
      name: "OrderController",
      description: "HTTP entry points of the order resource.",
      technology: "Java",
      parentId: "cmp-pedidos-api",
      x: 520,
      y: 140,
    }),
    element({
      id: "cod-service",
      kind: "code",
      name: "OrderService",
      description: "Business rules of the order lifecycle.",
      technology: "Java",
      parentId: "cmp-pedidos-api",
      x: 520,
      y: 320,
    }),
    element({
      id: "cod-repository",
      kind: "code",
      name: "OrderRepository",
      description: "Access to the orders table.",
      technology: "Spring Data JPA",
      parentId: "cmp-pedidos-api",
      x: 520,
      y: 500,
    }),
  ];

  const relation = (seed: RelationSeed): C4Relationship => ({
    sourceHandle: null,
    targetHandle: null,
    ...seed,
    id: createId("rel"),
  });
  const relationships: C4Relationship[] = [
    // Contexto
    relation({
      source: "ctx-cliente",
      target: "ctx-tienda",
      label: "Buys products",
      sourceHandle: "right",
      targetHandle: "left",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    relation({
      source: "ctx-almacen",
      target: "ctx-tienda",
      label: "Manages assigned orders",
      sourceHandle: "right",
      targetHandle: "left",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    relation({
      source: "ctx-tienda",
      target: "ctx-pagos",
      label: "Processes payments",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    // Contenedores
    relation({
      source: "ctx-cliente",
      target: "cnt-web",
      label: "Browses and places orders",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    relation({
      source: "ctx-almacen",
      target: "cnt-api",
      label: "Queries and marks orders",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-web",
      target: "cnt-api",
      label: "Calls the API",
      technology: "HTTPS/JSON",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-api",
      target: "cnt-pedidos",
      label: "Creates and queries orders",
      technology: "gRPC",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-api",
      target: "cnt-pagos",
      label: "Requests the charge",
      technology: "gRPC",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-pagos",
      target: "ctx-pagos",
      label: "Authorises the transaction",
      sourceHandle: "right",
      targetHandle: "left",
      technology: "HTTPS",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-pedidos",
      target: "cnt-cola",
      label: "Publishes order events",
      technology: "AMQP",
      description: "",
      style: "async",
    }),
    relation({
      source: "cnt-cola",
      target: "cnt-pagos",
      label: "Delivers charge events",
      technology: "AMQP",
      description: "",
      style: "async",
    }),
    relation({
      source: "cnt-pedidos",
      target: "cnt-db",
      label: "Reads and writes orders",
      technology: "JDBC",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cnt-pagos",
      target: "cnt-db",
      label: "Records transactions",
      technology: "JDBC",
      description: "",
      style: "sync",
    }),
    // Componentes
    relation({
      source: "cmp-pedidos-api",
      target: "cmp-inventario",
      label: "Reserves stock",
      technology: "Java",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cmp-pedidos-api",
      target: "cmp-notificaciones",
      label: "Queues notifications",
      technology: "Eventos",
      description: "",
      style: "async",
    }),
    relation({
      source: "cmp-inventario",
      target: "cnt-cola",
      label: "Publishes stock changes",
      technology: "AMQP",
      description: "",
      style: "async",
    }),
    // Código
    relation({
      source: "cod-controller",
      target: "cod-service",
      label: "Delegates the operation",
      technology: "Java",
      description: "",
      style: "sync",
    }),
    relation({
      source: "cod-service",
      target: "cod-repository",
      label: "Persists the order",
      technology: "Java",
      description: "",
      style: "sync",
    }),
  ];

  return {
    id: createId("ws"),
    name: "Online Store",
    description: "Example architecture documented with the C4 model.",
    elements,
    relationships,
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyWorkspace(): Workspace {
  return {
    id: createId("ws"),
    name: "New workspace",
    description: "",
    elements: [],
    relationships: [],
    updatedAt: new Date().toISOString(),
  };
}
