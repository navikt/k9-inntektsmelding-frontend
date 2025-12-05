import { createFileRoute } from "@tanstack/react-router";

import { Steg4Kvittering } from "~/features/arbeidsgiverinitiert/unntattAAregister/steg/Steg4Kvittering";

export const Route = createFileRoute("/agi-unntatt-aaregister/$id/kvittering")({
  component: Steg4Kvittering,
});
