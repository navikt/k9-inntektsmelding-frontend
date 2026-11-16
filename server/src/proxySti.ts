// http-proxy-middleware sender stien rå videre, og backend løser opp ../ og %2e%2e.
// Avvis derfor stier som endres av normalisering, så de ikke kan nå /internal.
export const erTillattProxySti = (url: string): boolean => {
  const sti = url.split("?", 1)[0];
  try {
    return new URL(sti, "http://bff").pathname === sti;
  } catch {
    return false;
  }
};
