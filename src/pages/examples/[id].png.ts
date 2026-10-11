import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { EXAMPLES } from "@/lib/examples/catalog";

export function getStaticPaths() {
  return EXAMPLES.map((example) => ({
    params: { id: example.id },
  }));
}

export const GET: APIRoute = async ({ params, redirect }) => {
  const id = params.id;
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // Si existe la versión .webp correspondiente, servirla directamente
  const webpPath = path.resolve(process.cwd(), `public/examples/${id}.webp`);
  if (fs.existsSync(webpPath)) {
    const fileBuffer = fs.readFileSync(webpPath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Redirigir por si se encuentra en otra ubicación
  return redirect(`/examples/${id}.webp`, 301);
};
