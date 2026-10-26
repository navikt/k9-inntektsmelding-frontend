import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
const CDN_URL =
  "https://cdn.nav.no/k9saksbehandling/k9-inntektsmelding-frontend/dist";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
  experimental: {
    // BASE_URL må forbli /k9-im-dialog (router og API). Bare statiske filer skal serveres fra CDN.
    renderBuiltUrl: (filnavn) => `${CDN_URL}/${filnavn}`,
  },
  server: {
    cors: {
      origin: [new RegExp("dev.nav.no$"), "http://localhost:9300"],
    },
    origin: "http://localhost:5173",
  },
});
