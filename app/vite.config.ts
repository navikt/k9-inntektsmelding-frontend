import { fileURLToPath, URL } from "node:url";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    sentryVitePlugin({
      url: "https://sentry.gc.nav.no",
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: process.env.SENTRY_RELEASE,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ["dist/**/*.map"],
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    cors: {
      origin: [new RegExp("dev.nav.no$"), "http://localhost:9300"],
    },
    origin: "http://localhost:5173",
  },
});
