import { getRouteApi, useLocation } from "@tanstack/react-router";

export const useOpplysninger = () => {
  const location = useLocation();

  const erAGIUnntattAaregister = location.pathname.startsWith(
    "/agi-unntatt-aaregister",
  );
  const erAGI = location.pathname.startsWith("/agi");
  if (erAGIUnntattAaregister) {
    return getRouteApi("/agi-unntatt-aaregister/$id").useLoaderData()
      .opplysninger;
  }
  if (erAGI) {
    return getRouteApi("/agi/$id").useLoaderData().opplysninger;
  }
  return getRouteApi("/$id").useLoaderData().opplysninger;
};
