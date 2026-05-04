import { expect, test } from "@playwright/test";
import { mockInnloggetBruker } from "tests/mocks/refusjon-omsorgspenger/utils";
import {
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

import type { OpplysningerDto } from "~/types/api-schemas";

const ORGANISASJONSNUMMER = "974652293";
const FORESPORSEL_UUID = "refusjon-vis-test-uuid";

const opplysninger: OpplysningerDto = {
  person: {
    fornavn: "Test",
    etternavn: "Bruker",
    fødselsnummer: "27527827812",
    aktørId: "1234567890123",
  },
  arbeidsgiver: {
    organisasjonNavn: "Test AS",
    organisasjonNummer: ORGANISASJONSNUMMER,
  },
  innsender: { fornavn: "Inn", etternavn: "Sender" },
  forespørselStatus: "UNDER_BEHANDLING",
  inntektsopplysninger: { gjennomsnittLønn: 50_000, månedsinntekter: [] },
  skjæringstidspunkt: "2025-06-15",
  førsteUttaksdato: "2025-06-15",
  ytelse: "OMSORGSPENGER" as const,
  forespørselType: "OMSORGSPENGER_REFUSJON" as const,
};

const refusjonResponse = {
  id: 5_000_801,
  foresporselUuid: FORESPORSEL_UUID,
  aktorId: "1234567890123",
  ytelse: "OMSORGSPENGER" as const,
  arbeidsgiverIdent: ORGANISASJONSNUMMER,
  kontaktperson: { navn: "Kari Kontakt", telefonnummer: "98765432" },
  refusjon: [{ fom: "2025-06-15", beløp: 50_000 }],
  startdato: "2025-06-15",
  inntekt: 50_000,
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  omsorgspenger: {
    fraværHeleDager: [{ fom: "2025-06-15", tom: "2025-06-20" }],
    fraværDelerAvDagen: [],
    harUtbetaltPliktigeDager: true,
  },
  opprettetTidspunkt: "2026-01-15T10:00:00.000",
};

test.describe("Refusjon Omsorgspenger – vis-rute", () => {
  test("Viser innsendt refusjonskrav fra loader", async ({ page }) => {
    await mockInnloggetBruker({ page });
    await mockOpplysninger({
      page,
      json: opplysninger,
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: [refusjonResponse],
    });

    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/${FORESPORSEL_UUID}`,
    );

    await expect(
      page.getByRole("heading", { name: /Innsendt refusjonskrav/ }),
    ).toBeVisible();

    // Arbeidsgiver og ansatt
    await expect(page.getByText("Arbeidsgiver og den ansatte")).toBeVisible();
    await expect(page.getByText("974652293").first()).toBeVisible();
    await expect(page.getByText("Kari Kontakt")).toBeVisible();
    await expect(page.getByText("98 76 54 32")).toBeVisible();
    await expect(page.getByText("Test Bruker", { exact: false })).toBeVisible();

    // Om refusjon
    await expect(page.getByText("Om refusjon").first()).toBeVisible();

    // Inntekt
    await expect(
      page.getByText("Beregnet månedslønn for refusjon"),
    ).toBeVisible();
    await expect(
      page.getByText("Beregnet månedslønn", { exact: true }),
    ).toBeVisible();

    // Fødselsnummer (formatFodselsnummer: slice(0,6) + " " + slice(6))
    await expect(
      page.getByText("275278 27812", { exact: false }),
    ).toBeVisible();

    // harUtbetaltLønn → "Ja"
    await expect(page.getByText("Ja").first()).toBeVisible();

    // årForRefusjon → "2025"
    await expect(
      page.getByText("2025", { exact: false }).first(),
    ).toBeVisible();

    // harDekket10FørsteOmsorgsdager → "Ja"
    await expect(page.getByText("Ja").first()).toBeVisible();

    // fraværDelerAvDagen = [] → tom liste tekst
    await expect(
      page.getByText("Ingen dager med fravær bare deler av dagen", {
        exact: false,
      }),
    ).toBeVisible();

    // Fraværsdager
    await expect(page.getByText(/15.06.2025/)).toBeVisible();
    await expect(page.getByText(/20.06.2025/)).toBeVisible();

    // Inntekt formatert: 50 000 kr
    await expect(page.getByText("50 000 kr", { exact: false })).toBeVisible();

    // Last ned PDF
    await expect(page.getByText("Last ned PDF")).toBeVisible();
  });
});
