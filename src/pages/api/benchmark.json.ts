import type { APIRoute } from "astro";
import { findExampleByCode, buildWorkspaceFor } from "@/lib/examples";
import { C4Compact } from "@/lib/c4-compact";

export const GET: APIRoute = async () => {
  try {
    // 1. Cargar el modelo real CineNova (16 elementos y 11 relaciones)
    const target = findExampleByCode("cinenova");
    if (!target) {
      return new Response(JSON.stringify({ error: "CineNova example not found" }), { status: 404 });
    }
    const cineNova = buildWorkspaceFor(target);

    // 2. Validación de integridad del modelo
    const validation = C4Compact.validate(cineNova);

    // 3. Ejecución de mediciones comparativas exhaustivas
    const measurement = await C4Compact.measure(cineNova);

    // 4. Prueba de conservación de propiedades desconocidas
    const modelWithExtra = JSON.parse(JSON.stringify(cineNova));
    modelWithExtra.customWorkspaceMeta = { author: "Arquitecto C4", year: 2026 };
    modelWithExtra.elements[0].unknownElementProp = "custom-node-meta";
    modelWithExtra.relationships[0].unknownRelProp = 42;

    const compactedExtra = C4Compact.compact(modelWithExtra);
    const decompactedExtra = C4Compact.decompact(compactedExtra);
    const extraPreserved =
      (decompactedExtra as any).customWorkspaceMeta?.author === "Arquitecto C4" &&
      (decompactedExtra.elements[0] as any).unknownElementProp === "custom-node-meta" &&
      (decompactedExtra.relationships[0] as any).unknownRelProp === 42;

    // 5. Prueba de detección y rechazo de versión no compatible
    let invalidVersionCaught = false;
    try {
      C4Compact.decompact({ v: 999, id: "test", n: "bad", e: [], r: [] });
    } catch {
      invalidVersionCaught = true;
    }

    // 6. Prueba de ida y vuelta directa (Compact -> Decompact)
    const compactModel = C4Compact.compact(cineNova);
    const decompacted = C4Compact.decompact(compactModel);
    const roundtripEquiv = C4Compact.areWorkspacesEquivalent(cineNova, decompacted);

    // 7. Prueba de ida y vuelta completa con compresión (Compress -> Decompress)
    const compressedB64 = await C4Compact.compress(cineNova, { algorithm: "deflate" });
    const decompressed = await C4Compact.decompress(compressedB64);
    const compressEquiv = C4Compact.areWorkspacesEquivalent(cineNova, decompressed);

    return new Response(
      JSON.stringify(
        {
          success: true,
          benchmark: measurement,
          validation,
          tests: {
            roundtripCompactValid: roundtripEquiv.equivalent,
            roundtripCompressValid: compressEquiv.equivalent,
            unknownPropertiesPreserved: extraPreserved,
            invalidVersionDetected: invalidVersionCaught,
            diffsCompact: roundtripEquiv.diffs,
            diffsCompress: compressEquiv.diffs,
          },
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
