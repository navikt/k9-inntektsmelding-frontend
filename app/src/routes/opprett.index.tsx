import { createFileRoute } from "@tanstack/react-router";

import { HentOpplysninger } from "~/features/arbeidsgiverinitiert/inngang/Steg0HentOpplysninger";

export const Route = createFileRoute("/opprett/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <HentOpplysninger />;
}
