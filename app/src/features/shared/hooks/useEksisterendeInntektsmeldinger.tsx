import { getRouteApi, useLocation, useMatches } from "@tanstack/react-router";

type EksisterendeInntektsmeldinger =
  | ReturnType<
      ReturnType<typeof getRouteApi<"/$id">>["useLoaderData"]
    >["eksisterendeInntektsmeldinger"]
  | ReturnType<
      ReturnType<typeof getRouteApi<"/agi/$id">>["useLoaderData"]
    >["eksisterendeInntektsmeldinger"]
  | ReturnType<
      ReturnType<
        typeof getRouteApi<"/agi-unntatt-aaregister/$id">
      >["useLoaderData"]
    >["eksisterendeInntektsmeldinger"];

type LoaderDataMedEksisterendeInntektsmeldinger = {
  eksisterendeInntektsmeldinger: EksisterendeInntektsmeldinger;
};

const harEksisterendeInntektsmeldinger = (
  loaderData: unknown,
): loaderData is LoaderDataMedEksisterendeInntektsmeldinger => {
  if (typeof loaderData !== "object" || loaderData === null) {
    return false;
  }

  if (!("eksisterendeInntektsmeldinger" in loaderData)) {
    return false;
  }

  return Array.isArray(loaderData.eksisterendeInntektsmeldinger);
};

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

  if (!harEksisterendeInntektsmeldinger(aktivMatch.loaderData)) {
    throw new Error(
      `useEksisterendeInntektsmeldinger: mangler eksisterendeInntektsmeldinger i loader-data for route "${aktivMatch.routeId}" på path "${location.pathname}"`,
    );
  }

  return aktivMatch.loaderData.eksisterendeInntektsmeldinger;
};
