import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://modelc4.cafeycodigo.org",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});

