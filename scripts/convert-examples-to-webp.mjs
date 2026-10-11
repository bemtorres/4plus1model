#!/usr/bin/env node
/**
 * Script para convertir imágenes PNG de ejemplos a WebP usando Sharp
 * y eliminar los PNG originales después de la conversión exitosa.
 *
 * Uso: npm run convert:webp
 *   o: node scripts/convert-examples-to-webp.mjs [directorio]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const targetDir = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(process.cwd(), "public/examples");

if (!fs.existsSync(targetDir)) {
  console.error(`Directorio no encontrado: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);
const pngFiles = files.filter((f) => f.toLowerCase().endsWith(".png"));

if (pngFiles.length === 0) {
  console.log(`No se encontraron imágenes .png para convertir en: ${targetDir}`);
  process.exit(0);
}

console.log(`Convirtiendo ${pngFiles.length} imágenes PNG a WebP con Sharp...`);

let totalOriginalBytes = 0;
let totalWebpBytes = 0;
let convertedCount = 0;

for (const file of pngFiles) {
  const pngPath = path.join(targetDir, file);
  const baseName = path.basename(file, path.extname(file));
  const webpPath = path.join(targetDir, `${baseName}.webp`);

  try {
    const pngStat = fs.statSync(pngPath);
    totalOriginalBytes += pngStat.size;

    // Conversión a WebP con calidad 85 y esfuerzo óptimo
    await sharp(pngPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);

    const webpStat = fs.statSync(webpPath);
    totalWebpBytes += webpStat.size;

    // Eliminar el archivo PNG original tras la conversión exitosa
    fs.unlinkSync(pngPath);
    convertedCount++;

    const savedPercent = Math.round((1 - webpStat.size / pngStat.size) * 100);
    console.log(
      `✓ ${file} -> ${baseName}.webp ` +
      `(${(pngStat.size / 1024).toFixed(1)} KB -> ${(webpStat.size / 1024).toFixed(1)} KB, -${savedPercent}%) [PNG eliminado]`
    );
  } catch (error) {
    console.error(`✗ Error convirtiendo ${file}:`, error);
  }
}

const totalSaved = totalOriginalBytes > 0
  ? Math.round((1 - totalWebpBytes / totalOriginalBytes) * 100)
  : 0;

console.log("\n--- Resumen de conversión ---");
console.log(`Imágenes convertidas y PNGs eliminados: ${convertedCount}/${pngFiles.length}`);
console.log(`Tamaño total original: ${(totalOriginalBytes / 1024).toFixed(1)} KB`);
console.log(`Tamaño total WebP: ${(totalWebpBytes / 1024).toFixed(1)} KB`);
console.log(`Ahorro total de espacio: -${totalSaved}%`);
