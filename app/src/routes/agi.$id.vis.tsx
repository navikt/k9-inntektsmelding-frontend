import { createFileRoute } from "@tanstack/react-router";

import { VisInntektsmelding } from "~/features/arbeidsgiverinitiert/nyansatt/VisInnsendtInntektsmeldingAGI";

export const Route = createFileRoute("/agi/$id/vis")({
  component: VisInntektsmelding,
});
