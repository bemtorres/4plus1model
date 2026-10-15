import type { APIRoute } from "astro";
import {
  isDevEditionEnabled,
  readTestDiagram,
  writeTestDiagram,
  deleteTestDiagram,
} from "@/lib/dev-diagrams";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  if (!isDevEditionEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Modo edición DEV desactivado. Activa PUBLIC_DEV_MODE=true en .env.local para usar esta función.",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta el identificador del archivo" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const { filename, project } = readTestDiagram(id);
    return new Response(
      JSON.stringify({
        filename,
        project,
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  if (!isDevEditionEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Modo edición DEV desactivado. Activa PUBLIC_DEV_MODE=true en .env.local para usar esta función.",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta el identificador del archivo" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const body = await request.json();
    const project = body.project ?? body;
    const result = writeTestDiagram(id, project);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `Diagrama actualizado en test-diagrams/${result.filename}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  if (!isDevEditionEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Modo edición DEV desactivado. Activa PUBLIC_DEV_MODE=true en .env.local para usar esta función.",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "Falta el identificador del archivo" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const deleted = deleteTestDiagram(id);
    if (!deleted) {
      return new Response(
        JSON.stringify({ error: `Archivo ${id} no encontrado en test-diagrams` }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        id,
        message: `Archivo ${id}.json eliminado con éxito`,
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
