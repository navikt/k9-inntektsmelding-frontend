import { QueryClient } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";

import { hentArbeidstakerOptions } from "./queries";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("arbeidstakeroppslag bruker v2 og skiller cache mellom arbeidsgivere", async () => {
  const respons = {
    personinformasjon: {
      fornavn: "Test",
      etternavn: "Ansatt",
      fødselsnummer: "16878397960",
      aktørId: "1234567890123",
    },
    arbeidsforhold: [],
  };
  const fetchMock = vi
    .fn()
    .mockImplementation(() => Promise.resolve(Response.json(respons)));
  vi.stubGlobal("fetch", fetchMock);
  const klient = new QueryClient();
  const førsteArbeidsgiver = hentArbeidstakerOptions(
    respons.personinformasjon.fødselsnummer,
    "2025",
    "123456789",
  );
  const andreArbeidsgiver = hentArbeidstakerOptions(
    respons.personinformasjon.fødselsnummer,
    "2025",
    "987654321",
  );

  try {
    await expect(klient.fetchQuery(førsteArbeidsgiver)).resolves.toEqual(
      respons,
    );
    await klient.fetchQuery(førsteArbeidsgiver);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await klient.fetchQuery(andreArbeidsgiver);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [indeks, organisasjonsnummer] of [
      "123456789",
      "987654321",
    ].entries()) {
      expect(fetchMock).toHaveBeenNthCalledWith(
        indeks + 1,
        expect.stringContaining("/refusjon-omsorgsdager/arbeidstaker/v2"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            fødselsnummer: respons.personinformasjon.fødselsnummer,
            organisasjonsnummer,
            ytelseType: "OMSORGSPENGER",
            årstall: 2025,
          }),
        }),
      );
    }
  } finally {
    klient.clear();
  }
});
