import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseNyAnsatt } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

const FORESPORSEL_UUID = "agi-nyansatt-vis-test-uuid";

const innsendtInntektsmelding = {
  id: 2_000_801,
  foresporselUuid: FORESPORSEL_UUID,
  aktorId: "1234567890123",
  ytelse: "PLEIEPENGER_SYKT_BARN" as const,
  arbeidsgiverIdent: "974652293",
  kontaktperson: { navn: "Kari Kontakt", telefonnummer: "98765432" },
  startdato: "2024-04-01",
  inntekt: 45_000,
  refusjon: [{ fom: "2024-04-01", beløp: 45_000 }],
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  opprettetTidspunkt: "2024-04-15T10:30:00.000",
};

test.describe("AGI nyansatt – vis-rute", () => {
  test("Viser innsendt inntektsmelding fra loader", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: agiOpplysningerResponseNyAnsatt,
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: [innsendtInntektsmelding],
    });

    await page.goto(`/k9-im-dialog/agi/${FORESPORSEL_UUID}/vis`);

    await expect(
      page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
    ).toBeVisible();

    // Arbeidsgiver og den ansatte
    await expect(page.getByText("Arbeidsgiver og den ansatte")).toBeVisible();
    await expect(page.getByText("NAV").first()).toBeVisible();
    await expect(
      page.getByText("974652293", { exact: false }).first(),
    ).toBeVisible();
    await expect(page.getByText("Kari Kontakt").first()).toBeVisible();
    await expect(page.getByText("98 76 54 32").first()).toBeVisible();
    await expect(
      page.getByText("Momentan Trakt", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("098101 98874", { exact: false }),
    ).toBeVisible();

    // Første fraværsdag
    await expect(page.getByText(/1. april 2024/)).toBeVisible();

    // Utbetaling og refusjon
    await expect(page.getByText("Utbetaling og refusjon")).toBeVisible();
    await expect(
      page.getByText("Ja, likt beløp i hele perioden"),
    ).toBeVisible();
    await expect(
      page.getByText("Refusjonsbeløp per måned", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("45 000 kr", { exact: false })).toBeVisible();

    await expect(page.getByText("Last ned inntektsmeldingen")).toBeVisible();
  });

  test("Viser advarsel når forespørsel er UTGÅTT", async ({ page }) => {
    await mockOpplysninger({
      page,
      json: {
        ...agiOpplysningerResponseNyAnsatt,
        forespørselStatus: "UTGÅTT" as const,
      },
      uuid: FORESPORSEL_UUID,
    });
    await mockInntektsmeldinger({
      page,
      uuid: FORESPORSEL_UUID,
      json: [innsendtInntektsmelding],
    });

    await page.goto(`/k9-im-dialog/agi/${FORESPORSEL_UUID}/vis`);

    await expect(
      page.getByText(
        "Du kan ikke endre inntektsmeldingen når oppgaven den er knyttet til er utgått",
        { exact: false },
      ),
    ).toBeVisible();
  });
});
