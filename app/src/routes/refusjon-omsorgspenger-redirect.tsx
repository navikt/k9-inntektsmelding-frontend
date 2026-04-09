import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/refusjon-omsorgspenger-redirect")({
  loader: () => {
    const orgnr = localStorage.getItem("virksomhetsvelger_bedrift");

    if (!orgnr) {
      return globalThis.location.assign(
        "https://arbeidsgiver.nav.no/min-side-arbeidsgiver/",
      );
    }
    return redirect({
      to: `/refusjon-omsorgspenger/$organisasjonsnummer/1-intro`,
      params: { organisasjonsnummer: orgnr },
      replace: true,
      throw: true,
    });
  },
  component: () => null,
});
