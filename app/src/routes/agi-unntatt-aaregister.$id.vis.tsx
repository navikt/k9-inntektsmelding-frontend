import { createFileRoute } from "@tanstack/react-router";

import { VisInnsendtInntektsmelding } from "~/features/arbeidsgiverinitiert/unntattAAregister/VisInnsendtInntektsmelding";

const InntektsmeldingContainer = () => {
  return <VisInnsendtInntektsmelding />;
};
export const Route = createFileRoute("/agi-unntatt-aaregister/$id/vis")({
  component: InntektsmeldingContainer,
});
