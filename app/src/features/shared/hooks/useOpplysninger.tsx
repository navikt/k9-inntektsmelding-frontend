import { useLocation, useMatches } from "@tanstack/react-router";
import { z } from "zod";

import { opplysningerSchema } from "~/types/api-schemas";

const loaderDataSchema = z.object({ opplysninger: opplysningerSchema });

const inntektsmeldingRouteIder = new Set([
  "/$id",
  "/agi/$id",
  "/agi-unntatt-aaregister/$id",
]);

export const useOpplysninger = () => {
  const location = useLocation();
  const matches = useMatches();
  const aktivMatch = matches.find((match) =>
    inntektsmeldingRouteIder.has(match.routeId),
  );

  if (!aktivMatch) {
    throw new Error(
      `useOpplysninger: fant ingen inntektsmelding-route i match-stack for path "${location.pathname}"`,
    );
  }

  const parsed = loaderDataSchema.safeParse(aktivMatch.loaderData);

  if (!parsed.success) {
    throw new Error(
      `useOpplysninger: mangler opplysninger i loader-data for route "${aktivMatch.routeId}" på path "${location.pathname}"`,
    );
  }

  return parsed.data.opplysninger;
};
