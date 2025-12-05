import { createFileRoute } from "@tanstack/react-router";

import { Steg3Oppsummering } from "~/features/arbeidsgiverinitiert/unntattAAregister/steg/Steg3Oppsummering";

export const Route = createFileRoute(
  "/agi-unntatt-aaregister/$id/oppsummering",
)({
  component: Steg3Oppsummering,
});
