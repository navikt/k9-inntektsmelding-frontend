import { useLocation, useMatches } from "@tanstack/react-router";
import { z } from "zod";

const loaderDataSchema = z.object({
  eksisterendeInntektsmeldinger: z.array(z.unknown()),
});

const inntektsmeldingRouteIder = new Set([
  "/$id",
  "/agi/$id",
  "/agi-unntatt-aaregister/$id",
]);

export const useEksisterendeInntektsmeldinger = () => {
  const location = useLocation();
  const matches = useMatches();
  const aktivMatch = matches.find((match) =>
    inntektsmeldingRouteIder.has(match.routeId),
  );

  if (!aktivMatch) {
    throw new Error(
      `useEksisterendeInntektsmeldinger: fant ingen inntektsmelding-route i match-stack for path "${location.pathname}"`,
    );
  }

  const parsed = loaderDataSchema.safeParse(aktivMatch.loaderData);

  if (!parsed.success) {
    throw new Error(
      `useEksisterendeInntektsmeldinger: mangler eksisterendeInntektsmeldinger i loader-data for route "${aktivMatch.routeId}" på path "${location.pathname}"`,
    );
  }

  return parsed.data.eksisterendeInntektsmeldinger;
};
