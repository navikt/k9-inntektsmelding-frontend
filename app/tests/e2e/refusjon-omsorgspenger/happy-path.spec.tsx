import { expect, test } from "@playwright/test";
import {
  mockArbeidstakerOppslag,
  mockInnloggetBruker,
  mockInntektsmeldingForÅr,
  mockInntektsopplysninger,
} from "tests/mocks/refusjon-omsorgspenger/utils";
import { mockGrunnbeløp } from "tests/mocks/shared/utils";

const VALID_FNR = "16878397960";
const ORGANISASJONSNUMMER = "123456789";
const DAGENS_DATO = new Date("2026-03-15").getTime();
const FJORÅRET = 2025;

const sendRefusjonResponse = {
  id: 5_000_801,
  foresporselUuid: "abc-123",
  aktorId: "1234567890123",
  ytelse: "OMSORGSPENGER",
  arbeidsgiverIdent: ORGANISASJONSNUMMER,
  kontaktperson: { navn: "Test Bruker", telefonnummer: "12345678" },
  refusjon: [{ fom: `${FJORÅRET}-06-15`, beløp: 50_000 }],
  startdato: `${FJORÅRET}-06-15`,
  inntekt: 50_000,
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  omsorgspenger: {
    fraværHeleDager: [{ fom: `${FJORÅRET}-06-15`, tom: `${FJORÅRET}-06-20` }],
    fraværDelerAvDagen: [],
    harUtbetaltPliktigeDager: true,
  },
  opprettetTidspunkt: "2026-03-15T10:00:00.000",
};

test.describe("Refusjon Omsorgspenger – happy path", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: DAGENS_DATO });
    await mockInnloggetBruker({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldingForÅr({ page, json: [] });
    await mockInntektsopplysninger({ page });
    await mockArbeidstakerOppslag({ page });
  });

  test("Fullstendig flyt fra intro til kvittering", async ({ page }) => {
    await page.goto(
      `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
    );

    // Steg 1: Intro
    await expect(
      page.getByRole("heading", { name: "Om refusjon", exact: true }),
    ).toBeVisible();
    await page.getByRole("radio", { name: "Ja" }).click();
    await page.getByRole("radio", { name: String(FJORÅRET) }).click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Steg 2: Ansatt og arbeidsgiver
    await expect(
      page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
    ).toBeVisible();
    await page.getByLabel("Ansattes fødselsnummer (11 siffer)").fill(VALID_FNR);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Steg 3: Omsorgsdager
    await expect(
      page.getByRole("heading", {
        name: "Omsorgsdager dere søker refusjon for",
      }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("radio", { name: "Ja" }).click();
    await page
      .getByRole("button", { name: "Legg til periode" })
      .first()
      .click();
    await page.waitForTimeout(500);
    await page.getByLabel("Fra og med").first().fill(`15.06.${FJORÅRET}`);
    await page.getByLabel("Til og med").first().fill(`20.06.${FJORÅRET}`);
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Steg 4: Refusjon (Beregnet månedslønn)
    await expect(
      page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Steg 5: Oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.route(
      "**/*/imdialog/send-inntektsmelding/omsorgspenger-refusjon",
      async (route) => {
        await route.fulfill({ json: sendRefusjonResponse });
      },
    );

    await page.getByRole("button", { name: "Send inn" }).click();

    // Steg 6: Kvittering
    await expect(page.getByText("Vi har mottatt refusjonskravet")).toBeVisible({
      timeout: 10_000,
    });
  });
});
