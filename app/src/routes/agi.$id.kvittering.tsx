import { createFileRoute } from "@tanstack/react-router";

import { Steg4Kvittering } from "~/features/arbeidsgiverinitiert/nyansatt/steg/Steg4Kvittering";

export const Route = createFileRoute("/agi/$id/kvittering")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Steg4Kvittering />;
}
