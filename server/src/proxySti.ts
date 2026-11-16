const TILLATTE_PATHS = [
  "/arbeidsgiverinitiert/",
  "/imdialog/",
  "/refusjon-omsorgsdager/",
  "/pdf/",
];

// http-proxy-middleware sender stien rå videre, og backend løser opp ../ og %2e%2e.
// Avvis derfor stier som endres av normalisering, ellers kan de gå ut av et tillatt path.
const erNormalisert = (sti: string): boolean => {
  try {
    return new URL(sti, "http://bff").pathname === sti;
  } catch {
    return false;
  }
};

export const erTillattProxySti = (url: string): boolean => {
  const sti = url.split("?", 1)[0];
  return (
    erNormalisert(sti) && TILLATTE_PATHS.some((path) => sti.startsWith(path))
  );
};
