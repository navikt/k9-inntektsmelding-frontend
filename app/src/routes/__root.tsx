import * as Sentry from "@sentry/react";
import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import React from "react";

import { hentGrunnbeløpOptions } from "~/api/queries.ts";
import { GenerellFeilside } from "~/features/shared/error-boundary/GenerellFeilside";
import { VisHjelpeteksterStateProvider } from "~/features/shared/Hjelpetekst";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((response) => ({
        default: response.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: ({ context }) => {
    // Bruker prefetch for å ikke vente på dette nettverkskallet, men gjøre det klar i cache så fort som mulig
    context.queryClient.prefetchQuery(hentGrunnbeløpOptions());
  },
  errorComponent: ({ error }) => {
    Sentry.captureException(error);

    return <GenerellFeilside />;
  },

  component: () => {
    return (
      <>
        <React.Suspense fallback="">
          <TanStackRouterDevtools position="bottom-right" />
        </React.Suspense>
        <VisHjelpeteksterStateProvider>
          <Outlet />
        </VisHjelpeteksterStateProvider>
        <ScrollRestoration />
      </>
    );
  },
});
