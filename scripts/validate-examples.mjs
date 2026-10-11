#!/usr/bin/env node
/**
 * Validador del catálogo de ejemplos.
 *
 * Comprueba las reglas duras de `src/lib/examples/README.md` sobre los 50
 * casos de estudio: ids slugificables, nombres únicos, relaciones resolubles,
 * contenedores alcanzables y cobertura del nivel 3 (componentes).
 *
 * Uso:  npm run check:examples
 *
 * Sale con código 1 si hay fallos, para poder usarlo en CI o pre-commit.
 * El catálogo es TypeScript pero sólo importa tipos, así que se le quitan las
 * anotaciones y se importa como módulo temporal.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CATALOG = new URL("../src/lib/examples/catalog.ts", import.meta.url);

/** Convierte el catálogo TS en un .mjs importable (sólo tiene tipos al margen). */
function loadCatalog() {
  let source = readFileSync(CATALOG, "utf8");
  source = source
    .replace(/import type \{[^}]+\} from "\.\/builder";/, "")
    .replace(/export const EXAMPLES: ExampleSpec\[\]/, "export const EXAMPLES")
    .replace(/export const CATEGORY_ORDER: CategoryId\[\]/, "export const CATEGORY_ORDER")
    .replace(/export const DIFFICULTIES: Difficulty\[\]/, "export const DIFFICULTIES")
    .replace(/ as const;/g, ";");
  const dir = mkdtempSync(join(tmpdir(), "c4-examples-"));
  const file = join(dir, "catalog.mjs");
  writeFileSync(file, source, "utf8");
  return import(pathToFileURL(file).href);
}

const LEVEL_KINDS = new Set(["container", "database", "queue"]);
const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const STYLES = new Set(["sync", "async", "bi"]);

const errors = [];
const fail = (id, message) => errors.push(`[${id}] ${message}`);

const { EXAMPLES } = await loadCatalog();
const seenIds = new Map();

for (const example of EXAMPLES) {
  const { id } = example;

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    fail(id, `id "${id}" debe ser slug ASCII en minúsculas (a-z, 0-9 y guiones)`);
  }
  if (seenIds.has(id)) fail(id, `id duplicado (también en "${seenIds.get(id)}")`);
  seenIds.set(id, example.name);

  if (!DIFFICULTIES.has(example.difficulty)) fail(id, `difficulty inválida: "${example.difficulty}"`);
  for (const field of ["name", "reference", "summary", "focus"]) {
    if (!String(example[field] ?? "").trim()) fail(id, `falta el campo obligatorio "${field}"`);
  }
  if (!example.people?.length) fail(id, "debe declarar al menos una persona");
  if (!example.containers?.length) fail(id, "debe declarar al menos un contenedor");

  // Nombres únicos en todo el ejemplo: el builder resuelve las relaciones
  // por nombre y una colisión hace que un elemento pise a otro.
  const owners = new Map();
  const claim = (name, where) => {
    if (owners.has(name)) fail(id, `nombre duplicado "${name}" (${owners.get(name)} y ${where})`);
    else owners.set(name, where);
  };

  example.people.forEach(([name], index) => claim(name, `people[${index}]`));
  claim(example.name, "softwareSystem (name)");
  (example.externalSystems ?? []).forEach(([name], index) =>
    claim(name, `externalSystems[${index}]`),
  );
  example.containers.forEach(([name, kind], index) => {
    claim(name, `containers[${index}]`);
    if (!LEVEL_KINDS.has(kind)) {
      fail(id, `containers[${index}] ("${name}") kind "${kind}" debe ser container, database o queue`);
    }
    if (kind !== "container" && example.componentSets?.some((set) => set.container === name)) {
      fail(id, `componentSets apunta a "${name}", que es "${kind}" y no se puede abrir en componentes`);
    }
    for (const [position, label] of [
      [2, "tecnología"],
      [3, "descripción"],
    ]) {
      if (!String(example.containers[index][position] ?? "").trim()) {
        fail(id, `containers[${index}] ("${name}") sin ${label}`);
      }
    }
  });

  (example.componentSets ?? []).forEach((set, index) => {
    if (!example.containers.some(([name]) => name === set.container)) {
      fail(id, `componentSets[${index}] apunta al contenedor inexistente "${set.container}"`);
    }
    if (!set.components?.length) {
      fail(id, `componentSets[${index}] ("${set.container}") sin componentes`);
    }
    set.components.forEach(([name, technology, description], position) => {
      claim(name, `componentSets[${index}].components[${position}]`);
      if (!String(technology ?? "").trim()) fail(id, `componente "${name}" sin tecnología`);
      if (!String(description ?? "").trim()) fail(id, `componente "${name}" sin descripción`);
    });
  });

  if (!example.componentSets?.length) {
    fail(id, "sin componentSets: el nivel de componentes (L3) quedaría vacío");
  }

  example.relations.forEach((relation, index) => {
    const [source, target, label, technology, style] = relation;
    for (const endpoint of [source, target]) {
      if (!owners.has(endpoint)) fail(id, `relations[${index}] usa el nombre inexistente "${endpoint}"`);
    }
    if (source === target) fail(id, `relations[${index}] es un bucle sobre "${source}"`);
    if (!String(label ?? "").trim()) fail(id, `relations[${index}] sin etiqueta`);
    if (!String(technology ?? "").trim()) fail(id, `relations[${index}] ("${source}"→"${target}") sin tecnología`);
    if (style !== undefined && !STYLES.has(style)) fail(id, `relations[${index}] estilo "${style}" inválido`);
  });

  // Alcance: nada del sistema puede quedar suelto. Las bases de datos son
  // sumideros legítimos; el resto necesita alguien que lo llame.
  const connected = new Set(example.relations.flatMap(([source, target]) => [source, target]));
  for (const [name, kind] of example.containers) {
    if (!connected.has(name)) fail(id, `contenedor "${name}" (${kind}) sin ninguna relación`);
  }
  for (const [name] of example.people) {
    if (!connected.has(name)) fail(id, `persona "${name}" sin ninguna relación`);
  }
}

const total = EXAMPLES.length;
console.log(`Catálogo: ${total} ejemplos · ${errors.length} fallos`);
if (errors.length > 0) {
  console.error(errors.map((line) => `  ${line}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Todas las reglas del catálogo se cumplen.");
}
