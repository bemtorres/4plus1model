#!/usr/bin/env node
/**
 * Genera `doc/README.md` con el inventario de proyectos de ejemplo.
 *
 * El documento se deriva del catálogo (`src/lib/examples/catalog.ts`), tanto
 * de sus datos como de los comentarios de arquitectura, así que se puede
 * regenerar con `npm run doc` cada vez que cambien los ejemplos. Editar el
 * Markdown a mano es un error: la siguiente generación lo sobrescribe.
 *
 * Sale con código 1 si falta algún dato (por ejemplo, un comentario de
 * arquitectura que no se pudo emparejar con su ejemplo).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATALOG_TRANSFORMS,
  REFERENCE_TRANSFORMS,
  loadTsModule,
  repoUrl,
} from "./lib/ts-module.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = repoUrl("src/lib/examples/catalog.ts");

/** Etiquetas en español, idénticas a `category.*` de `src/i18n/es.ts`. */
const CATEGORY_LABELS = {
  streaming: "Streaming y entretenimiento",
  ecommerce: "Comercio electrónico y marketplaces",
  fintech: "Finanzas y fintech",
  social: "Redes sociales y comunicación",
  education: "Educación y EdTech",
  health: "Salud y bienestar",
  transport: "Transporte y movilidad",
  productivity: "Productividad y empresa",
  ai: "Inteligencia artificial y datos",
  infra: "Infraestructura, DevOps y seguridad",
};

const DIFFICULTY_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const KIND_LABELS = {
  container: "contenedor",
  database: "base de datos",
  queue: "cola",
};

/**
 * Extrae el comentario de arquitectura que precede a cada ejemplo.
 *
 * Los comentarios viven en el fuente, no en los datos: se recorren las líneas
 * buscando un bloque `/* … *​/` seguido, tras las líneas en blanco, de la
 * apertura del objeto y su `id`. Así se descartan por completo los separadores
 * de sección, que son bloques de comentario sin objeto detrás.
 */
function extractComments(source) {
  const lines = source.split(/\r?\n/);
  const comments = new Map();

  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\/\*/.test(lines[i])) continue;

    const block = [lines[i]];
    while (!/\*\/\s*$/.test(block[block.length - 1]) && i + 1 < lines.length) {
      block.push(lines[++i]);
    }

    let next = i + 1;
    while (next < lines.length && lines[next].trim() === "") next++;
    if (!/^\s*\{\s*$/.test(lines[next] ?? "")) continue;

    let idLine = next + 1;
    while (idLine < lines.length && lines[idLine].trim() === "") idLine++;
    const id = /^\s*id:\s*"([^"]+)",\s*$/.exec(lines[idLine] ?? "")?.[1];
    if (id) comments.set(id, parseComment(block));
  }

  return comments;
}

/** Convierte el bloque de líneas en `{ title, groups }`, sin la indentación. */
function parseComment(block) {
  const lines = block
    .map((line, index) => {
      let text = line;
      if (index === 0) text = text.replace(/^\s*\/\*/, "");
      if (index === block.length - 1) text = text.replace(/\*\/\s*$/, "");
      return text.replace(/^\s*\*?/, "").trim();
    })
    .filter((text) => text !== "");

  const groups = [];
  for (const line of lines) {
    const labelled = /^(L1|L2|L3|Flujo clave):\s*(.*)$/.exec(line);
    if (labelled) groups.push({ label: labelled[1], text: labelled[2] });
    else if (groups.length === 0) groups.push({ label: null, text: line });
    else groups[groups.length - 1].text += ` ${line}`;
  }

  const title = groups.length > 0 && groups[0].label === null ? groups.shift().text : null;
  return { title, groups };
}

/** Texto para una celda de tabla: evita que un `|` rompa la fila. */
const cell = (text) => String(text).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

/** `1 relación` / `11 relaciones`. */
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const { EXAMPLES, CATEGORY_ORDER } = await loadTsModule(CATALOG, CATALOG_TRANSFORMS);
const { referenceUrl } = await loadTsModule(
  repoUrl("src/lib/examples/reference-links.ts"),
  REFERENCE_TRANSFORMS,
);
const comments = extractComments(readFileSync(CATALOG, "utf8"));

const errors = [];
const out = [];
const push = (...lines) => out.push(...lines);

/* ---------------------------------------------------------------- cabecera */

push(
  "# Proyectos de ejemplo",
  "",
  "Los 50 casos de estudio que incluye **C4 Modeler**. Cada uno es la",
  "arquitectura completa de un producto ficticio, modelada con el modelo C4 en",
  "los tres primeros niveles (contexto, contenedores y componentes) y abierta",
  "en la app con el parámetro `?code=<id>`.",
  "",
  "> Documento generado desde `src/lib/examples/catalog.ts` con `npm run doc`.",
  "> No lo edites a mano: la siguiente generación lo sobrescribe.",
  "",
  "> **Nombres ficticios.** Los proyectos no existen. Las empresas citadas como",
  "> *referencia conceptual* sólo indican qué tipo de producto inspira el modelo:",
  "> no implican afiliación ni reproducen arquitecturas propietarias.",
  "",
);

/* --------------------------------------------------------------- uso */

push(
  "## Cómo abrir un ejemplo",
  "",
  "1. Abre la app con `?code=<id>`, por ejemplo `/?code=cinenova`. Si no hay",
  "   código, se usa el ejemplo de demostración `online-store`.",
  "2. Usa el selector de nivel para recorrer **L1** (contexto), **L2**",
  "   (contenedores), **L3** (componentes) y **L4** (código).",
  "3. Abre el diálogo de detalle para ver métricas, tecnologías y la tabla de",
  "   relaciones de ese ejemplo.",
  "4. Exporta el ejemplo a **PlantUML**, **Mermaid**, **Markdown** o **JSON**.",
  "",
  "Los diagramas ya vienen colocados: el builder calcula las posiciones a partir",
  "de la estructura declarada, no hay coordenadas escritas a mano.",
  "",
);

/* -------------------------------------------------------------- resumen */

const byCategory = new Map(CATEGORY_ORDER.map((id) => [id, []]));
for (const example of EXAMPLES) byCategory.get(example.category).push(example);

const difficultyCounts = { beginner: 0, intermediate: 0, advanced: 0 };
for (const example of EXAMPLES) difficultyCounts[example.difficulty]++;

push(
  "## Resumen",
  "",
  `- **${EXAMPLES.length} proyectos** repartidos en **${CATEGORY_ORDER.length} categorías**.`,
  `- Dificultad: **${difficultyCounts.beginner}** principiantes, **${difficultyCounts.intermediate}** intermedios y **${difficultyCounts.advanced}** avanzados.`,
  "",
  "| # | Categoría | Ejemplos | Principiante | Intermedio | Avanzado |",
  "| -: | --- | ---: | ---: | ---: | ---: |",
);

CATEGORY_ORDER.forEach((categoryId, index) => {
  const examples = byCategory.get(categoryId);
  const count = (level) => examples.filter((e) => e.difficulty === level).length;
  push(
    `| ${index + 1} | ${CATEGORY_LABELS[categoryId]} | ${examples.length} | ` +
      `${count("beginner")} | ${count("intermediate")} | ${count("advanced")} |`,
  );
});

/* --------------------------------------------------------------- índice */

push(
  "",
  "## Índice",
  "",
  "`L2` son los contenedores de aplicación, `Datos` las bases de datos y colas,",
  "`L3` los componentes del conjunto que se abre y `Rel.` las relaciones",
  "declaradas. Entre paréntesis, cuántas de ellas son `async` (línea discontinua",
  "en el diagrama y `Rel_D` en PlantUML/Mermaid).",
  "",
  "| # | Proyecto | Id | Categoría | Dificultad | Referencia | L2 | Datos | L3 | Rel. |",
  "| -: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |",
);

EXAMPLES.forEach((example, index) => {
  const apps = example.containers.filter(([, kind]) => kind === "container").length;
  const data = example.containers.length - apps;
  const components = example.componentSets.reduce((total, set) => total + set.components.length, 0);
  const asyncCount = example.relations.filter((relation) => relation[4] === "async").length;
  const relations = asyncCount > 0
    ? `${example.relations.length} (${asyncCount} async)`
    : String(example.relations.length);

  push(
    `| ${index + 1} | [${cell(example.name)}](#${example.id}) | \`${example.id}\` | ` +
      `${CATEGORY_LABELS[example.category]} | ${DIFFICULTY_LABELS[example.difficulty]} | ` +
      `${cell(example.reference)} | ${apps} | ${data} | ${components} | ${relations} |`,
  );
});

/* --------------------------------------------------------------- detalle */

push("", "## Detalle por categoría", "");

for (const [categoryIndex, categoryId] of CATEGORY_ORDER.entries()) {
  const examples = byCategory.get(categoryId);
  push(
    `### ${categoryIndex + 1}. ${CATEGORY_LABELS[categoryId]}`,
    "",
    `${examples.length} proyectos: ` +
      examples.map((example) => `[${example.name}](#${example.id})`).join(", ") +
      ".",
    "",
  );

  for (const example of examples) {
    const comment = comments.get(example.id);
    if (!comment) errors.push(`[${example.id}] sin comentario de arquitectura`);

    const url = referenceUrl(example.reference);
    const reference = url ? `[${example.reference}](${url})` : example.reference;
    const containers = example.containers;
    const applications = containers.filter(([, kind]) => kind === "container");
    const stores = containers.filter(([, kind]) => kind !== "container");
    const asyncCount = example.relations.filter((relation) => relation[4] === "async").length;
    const biCount = example.relations.filter((relation) => relation[4] === "bi").length;

    push(
      `<a id="${example.id}"></a>`,
      "",
      `#### ${example.name}`,
      "",
      `*Id: \`${example.id}\` · ${CATEGORY_LABELS[example.category]} · ` +
        `${DIFFICULTY_LABELS[example.difficulty]} · referencia conceptual: ${reference}*`,
      "",
      `**Qué es.** ${example.summary}`,
      "",
      `**Qué muestran los diagramas.** ${example.focus}`,
      "",
    );

    if (comment?.title) push(`**Arquitectura.** ${comment.title}`, "");
    if (comment?.groups.length) {
      push("> " + comment.groups.map((group) => `- **${group.label}:** ${group.text}`).join("\n> "), "");
    }

    push(
      `- **L1 · Personas:** ${example.people
        .map(([name, description]) => `\`${name}\` — ${description}`)
        .join(" · ")}`,
    );
    if (example.externalSystems?.length) {
      push(
        `- **L1 · Sistemas externos:** ${example.externalSystems
          .map(([name, description, technology]) =>
            technology ? `\`${name}\` (${technology}) — ${description}` : `\`${name}\` — ${description}`,
          )
          .join(" · ")}`,
      );
    }
    push("");

    push(
      `| L2 · contenedores | Tecnología | Descripción |`,
      "| --- | --- | --- |",
      ...applications.map(
        ([name, , technology, description]) => `| \`${name}\` | ${cell(technology)} | ${cell(description)} |`,
      ),
    );
    push("");

    if (stores.length) {
      push(
        "| L2 · almacenes y colas | Tipo | Tecnología | Descripción |",
        "| --- | --- | --- | --- |",
        ...stores.map(
          ([name, kind, technology, description]) =>
            `| \`${name}\` | ${KIND_LABELS[kind] ?? kind} | ${cell(technology)} | ${cell(description)} |`,
        ),
      );
      push("");
    }

    for (const set of example.componentSets) {
      push(
        `| L3 · componentes de \`${set.container}\` | Tecnología | Descripción |`,
        "| --- | --- | --- |",
        ...set.components.map(
          ([name, technology, description]) => `| \`${name}\` | ${cell(technology)} | ${cell(description)} |`,
        ),
      );
      push("");
    }

    const details = [plural(example.relations.length, "relación", "relaciones")];
    if (asyncCount > 0) details.push(plural(asyncCount, "asíncrona", "asíncronas"));
    if (biCount > 0) details.push(plural(biCount, "bidireccional", "bidireccionales"));
    push(`**Relaciones.** ${details.join(" · ")}.`, "");
  }
}

/* ----------------------------------------------------------- mantenimiento

   Aquí termina el cuerpo del documento; el pie se añade tras comprobar que no
   falta ningún comentario de arquitectura. */
/* ------------------------------------------------------------------ pie */

if (errors.length > 0) {
  console.error(errors.map((line) => `  ${line}`).join("\n"));
  process.exitCode = 1;
}

const totalRelations = EXAMPLES.reduce(
  (total, example) => total + example.relations.length,
  0,
);
const totalAsync = EXAMPLES.reduce(
  (total, example) => total + example.relations.filter((r) => r[4] === "async").length,
  0,
);
const totalBi = EXAMPLES.reduce(
  (total, example) => total + example.relations.filter((r) => r[4] === "bi").length,
  0,
);

push(
  "## Mantenimiento",
  "",
  "| Tarea | Dónde / cómo |",
  "| --- | --- |",
  "| Añadir o editar un proyecto | `src/lib/examples/catalog.ts` |",
  "| Reglas de autoría y convenciones | [`src/lib/examples/README.md`](../src/lib/examples/README.md) |",
  "| Enlaces de las tecnologías | `src/lib/examples/tech-links.ts` |",
  "| Enlaces de las referencias conceptuales | `src/lib/examples/reference-links.ts` |",
  "| Miniaturas de las tarjetas | `public/examples/<id>.webp` (640×360) |",
  "| Regenerar este documento | `npm run doc` |",
  "| Validar el catálogo | `npm run check:examples` |",
  "| Typecheck y build | `npm run check` · `npm run build` |",
  "",
  "| Cifra del catálogo | Valor |",
  "| --- | --- |",
  "| Relaciones totales | " + totalRelations + " |",
  `| Relaciones \`async\` | ${totalAsync} (${Math.round((totalAsync / totalRelations) * 100)}%) en ${EXAMPLES.filter((e) => e.relations.some((r) => r[4] === "async")).length} proyectos |`,
  "| Relaciones `bi` | " + totalBi + " |",
  "| Componentes declarados (L3) | " +
    EXAMPLES.reduce((total, example) => total + example.componentSets.reduce((sum, set) => sum + set.components.length, 0), 0) +
    " |",
  "",
);

const target = join(ROOT, "doc", "README.md");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out.join("\n"), "utf8");

const written = readFileSync(target, "utf8");
console.log(`doc/README.md generado: ${EXAMPLES.length} proyectos, ${written.split(/\r?\n/).length} líneas`);
if (errors.length > 0) console.error(`${errors.length} ejemplo(s) sin comentario de arquitectura`);
