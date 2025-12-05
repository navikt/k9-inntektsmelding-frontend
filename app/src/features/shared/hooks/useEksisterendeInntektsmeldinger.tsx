import { getRouteApi, useLocation } from "@tanstack/react-router";

export const useEksisterendeInntektsmeldinger = () => {
  const location = useLocation();

  const erAGI = location.pathname.startsWith("/agi");
  const erAGIUnntattAaregister = location.pathname.startsWith(
    "/agi-unntatt-aaregister",
  );
  if (erAGIUnntattAaregister) {
    return getRouteApi("/agi-unntatt-aaregister/$id").useLoaderData()
      .eksisterendeInntektsmeldinger;
  }
  if (erAGI) {
    return getRouteApi("/agi/$id").useLoaderData()
      .eksisterendeInntektsmeldinger;
  }
  return getRouteApi("/$id").useLoaderData().eksisterendeInntektsmeldinger;
};
