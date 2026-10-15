import type { APIRoute } from "astro";
import { isDevEditionEnabled, listTestDiagrams } from "@/lib/dev-diagrams";

export const prerender = false;

export const GET: APIRoute = async () => {
  const enabled = isDevEditionEnabled();
  let count = 0;
  if (enabled) {
    try {
      count = listTestDiagrams().length;
    } catch {
      count = 0;
    }
  }

  return new Response(
    JSON.stringify({
      enabled,
      mode: enabled ? "dev" : "prod",
      directory: "test-diagrams",
      count,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
};
