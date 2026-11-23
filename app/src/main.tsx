import "./index.css";
// Polyfill for toSorted. Ble introdusert i ES2023, så den mangler i eldre browsere og fører til feil for disse brukerne hvis vi ikke polyfiller.
import "core-js/actual/array/to-sorted";

import { init } from "@nais/apm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";

import { IkkeFunnetFeilside } from "./features/shared/error-boundary/IkkeFunnetFeilside";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

const router = createRouter({
  defaultNotFoundComponent: IkkeFunnetFeilside,
  routeTree,
  basepath: import.meta.env.BASE_URL,
  context: {
    queryClient,
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

init({
  app: "k9-inntektsmelding-frontend",
  namespace: "k9saksbehandling",
  devConsoleEcho: false,
  tracing: true,
});

createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
