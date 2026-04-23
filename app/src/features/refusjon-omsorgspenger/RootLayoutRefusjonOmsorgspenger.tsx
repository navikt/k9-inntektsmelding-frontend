import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { Outlet, useLocation, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";

import { RotLayout } from "../shared/rot-layout/RotLayout";
import { RefusjonOmsorgspengerArbeidsgiverForm } from "./SkjemaStateContext";
import { useInnloggetBruker } from "./useInnloggetBruker";

export const RefusjonOmsorgspengerArbeidsgiverRotLayout = () => {
  const innloggetBruker = useInnloggetBruker();
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    setBreadcrumbs([
      {
        title: "Min side – Arbeidsgiver",
        url: "/min-side-arbeidsgiver",
      },
      {
        title: "Søknad om refusjon for omsorgspenger",
        url: location.pathname,
      },
    ]);
  }, [location.pathname]);

  const erPåKvitteringssiden = matches.some(
    (match) =>
      match.routeId ===
      "/refusjon-omsorgspenger/$organisasjonsnummer/6-kvittering",
  );
  const viserInnsendentRefusjonskrav = matches.some(
    (match) =>
      match.routeId === "/refusjon-omsorgspenger/$organisasjonsnummer/$id",
  );

  return (
    <div>
      <RefusjonOmsorgspengerArbeidsgiverForm>
        <RotLayout
          background={erPåKvitteringssiden ? "bg-default" : "bg-subtle"}
          medAvbrytKnapp={
            !erPåKvitteringssiden && !viserInnsendentRefusjonskrav
          }
          medHjelpetekstToggle={
            !erPåKvitteringssiden && !viserInnsendentRefusjonskrav
          }
          medHvitBoks={!erPåKvitteringssiden}
          tittel="Søknad om refusjon for omsorgspenger"
        >
          <Outlet />
        </RotLayout>
      </RefusjonOmsorgspengerArbeidsgiverForm>
    </div>
  );
};
