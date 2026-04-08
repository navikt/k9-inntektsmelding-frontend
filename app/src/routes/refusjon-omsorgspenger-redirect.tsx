import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/refusjon-omsorgspenger-redirect")({
  loader: () => {
    const orgnr = localStorage.getItem("virksomhetsvelger_bedrift");

    if (!orgnr) {
      const rootUrl = new URL(globalThis.location.href).origin;
      return globalThis.location.assign(rootUrl + "/minside-arbeidsgiver");
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
