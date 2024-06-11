import { BodyLong } from "@navikt/ds-react";
import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";

import { RotLayout } from "~/features/rot-layout/RotLayout";

const route = getRouteApi("/$id/kvittering");

export const Kvittering = () => {
  const { id } = route.useParams();
  useEffect(() => {
    setBreadcrumbs([
      {
        title: "Min side – Arbeidsgiver",
        url: "/",
      },
      {
        title: "Kvittering, inntektsmelding",
        url: `/${id}/kvittering`,
      },
    ]);
  }, [id]);
  return (
    <RotLayout tittel="Kvittering, inntektsmelding omsorgspenger">
      <BodyLong>
        Dette er kvitteringen for inntektsmelding for omsorgspenger.
      </BodyLong>
    </RotLayout>
  );
};
