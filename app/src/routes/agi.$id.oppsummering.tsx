import { createFileRoute } from "@tanstack/react-router";

import { Steg3Oppsummering } from "~/features/arbeidsgiverinitiert/nyansatt/steg/Steg3Oppsummering";

export const Route = createFileRoute("/agi/$id/oppsummering")({
  component: Steg3Oppsummering,
});
