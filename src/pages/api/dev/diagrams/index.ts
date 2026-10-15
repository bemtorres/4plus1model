import type { APIRoute } from "astro";
import { isDevEditionEnabled, listTestDiagrams, writeTestDiagram } from "@/lib/dev-diagrams";

export const prerender = false;

export const GET: APIRoute = async () => {
  if (!isDevEditionEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Modo edición DEV desactivado. Activa PUBLIC_DEV_MODE=true en .env.local para usar esta función.",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  try {
    const items = listTestDiagrams();
    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!isDevEditionEnabled()) {
    return new Response(
      JSON.stringify({
        error: "Modo edición DEV desactivado. Activa PUBLIC_DEV_MODE=true en .env.local para usar esta función.",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  try {
    const body = await request.json();
    const rawTarget = body.filename || body.name || body.id || "diagrama-prueba";
    const project = body.project ?? body;

    const result = writeTestDiagram(rawTarget, project);
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `Diagrama guardado con éxito en test-diagrams/${result.filename}`,
      }),
      { status: 201, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
