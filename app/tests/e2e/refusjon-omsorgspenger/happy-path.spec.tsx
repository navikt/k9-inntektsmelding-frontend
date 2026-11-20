import { expect, test } from "@playwright/test";
import { sjekkUniversellUtforming } from "tests/e2e/uu";
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

  test(
    "Fullstendig flyt fra intro til kvittering",
    { tag: "@uu" },
    async ({ page }) => {
      await page.goto(
        `/k9-im-dialog/refusjon-omsorgspenger/${ORGANISASJONSNUMMER}/1-intro`,
      );

      // Steg 1: Intro
      await expect(
        page.getByRole("heading", { name: "Om refusjon", exact: true }),
      ).toBeVisible();
      await sjekkUniversellUtforming(page, "Om refusjon for omsorgspenger");
      await page.getByRole("radio", { name: "Ja" }).click();
      await page.getByRole("radio", { name: String(FJORÅRET) }).click();
      await page.getByRole("button", { name: "Neste steg" }).click();

      // Steg 2: Ansatt og arbeidsgiver
      await expect(
        page.getByRole("heading", { name: "Den ansatte og arbeidsgiver" }),
      ).toBeVisible();
      await sjekkUniversellUtforming(page, "Den ansatte og arbeidsgiver");
      const kontaktinformasjon = page.getByRole("region", {
        name: "Kontaktinformasjon",
        exact: true,
      });
      await expect(
        kontaktinformasjon.getByLabel("Navn", { exact: true }),
      ).toHaveAttribute("autocomplete", "name");
      await expect(
        kontaktinformasjon.getByLabel("Telefonnummer"),
      ).toHaveAttribute("autocomplete", "tel");
      await page
        .getByLabel("Ansattes fødselsnummer (11 siffer)")
        .fill(VALID_FNR);
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: "Neste steg" }).click();

      // Steg 3: Omsorgsdager
      await expect(
        page.getByRole("heading", {
          name: "Omsorgsdager dere søker refusjon for",
        }),
      ).toBeVisible({ timeout: 10_000 });
      await sjekkUniversellUtforming(page, "Omsorgsdager");
      await page.getByRole("radio", { name: "Ja" }).click();
      await page
        .getByRole("button", { name: "Legg til periode" })
        .first()
        .click();
      await expect(page.getByLabel("Fra og med").first()).toBeVisible();
      await page.getByLabel("Fra og med").first().fill(`15.06.${FJORÅRET}`);
      await page.getByLabel("Til og med").first().fill(`20.06.${FJORÅRET}`);
      const førstePeriode = page.getByRole("group", {
        name: "Fraværsperiode 1",
        exact: true,
      });
      await expect(førstePeriode.getByLabel("Fra og med")).toHaveValue(
        `15.06.${FJORÅRET}`,
      );
      await page
        .getByRole("button", { name: "Legg til periode" })
        .first()
        .click();
      const andrePeriode = page.getByRole("group", {
        name: "Fraværsperiode 2",
        exact: true,
      });
      await andrePeriode.getByLabel("Fra og med").fill(`23.06.${FJORÅRET}`);
      await andrePeriode.getByLabel("Til og med").fill(`24.06.${FJORÅRET}`);
      await andrePeriode.getByRole("button", { name: "Slett periode" }).click();
      await expect(andrePeriode).toHaveCount(0);
      await expect(førstePeriode.getByLabel("Til og med")).toHaveValue(
        `20.06.${FJORÅRET}`,
      );
      await page
        .getByRole("button", { name: "Legg til dag", exact: true })
        .click();
      const delvisDag = page.getByRole("group", {
        name: "Delvis fraværsdag 1",
        exact: true,
      });
      await expect(delvisDag.getByLabel("Dato")).toBeVisible();
      await expect(delvisDag.getByLabel("Timer fravær")).toBeVisible();
      await page
        .getByRole("button", {
          name: "Eksempler på hvordan du oppgir og omregner arbeidstid",
        })
        .click();
      await sjekkUniversellUtforming(
        page,
        "Delvis fraværsdag med åpen hjelpetekst",
      );
      await delvisDag.getByRole("button", { name: "Slett dag" }).click();
      await page
        .getByRole("button", { name: "Legg til periode" })
        .last()
        .click();
      const trekkperiode = page.getByRole("group", {
        name: "Trekkperiode 1",
        exact: true,
      });
      await expect(trekkperiode.getByLabel("Fra og med")).toBeVisible();
      await expect(trekkperiode.getByLabel("Til og med")).toBeVisible();
      await trekkperiode.getByRole("button", { name: "Slett periode" }).click();
      await sjekkUniversellUtforming(page, "Utfylt fraværsperiode");
      await page.getByRole("button", { name: "Neste steg" }).click();

      // Steg 4: Refusjon (Beregnet månedslønn)
      await expect(
        page.getByRole("heading", { name: "Beregnet månedslønn for refusjon" }),
      ).toBeVisible({ timeout: 10_000 });
      await sjekkUniversellUtforming(page, "Beregnet månedslønn for refusjon");
      await page.getByRole("button", { name: "Neste steg" }).click();

      // Steg 5: Oppsummering
      await expect(
        page.getByRole("heading", { name: "Oppsummering" }),
      ).toBeVisible({ timeout: 10_000 });
      await sjekkUniversellUtforming(page, "Oppsummering for omsorgspenger");

      await page.route(
        "**/*/imdialog/send-inntektsmelding/omsorgspenger-refusjon/v2",
        async (route) => {
          expect(route.request().method()).toBe("POST");
          const forespørsel = route.request().postDataJSON();
          expect(forespørsel).toMatchObject({
            fødselsnummer: VALID_FNR,
            arbeidsgiverIdent: ORGANISASJONSNUMMER,
          });
          expect(forespørsel).not.toHaveProperty("aktorId");
          expect(forespørsel).not.toHaveProperty("ytelse");
          await route.fulfill({ json: sendRefusjonResponse });
        },
      );

      await page.getByRole("button", { name: "Send inn" }).click();

      // Steg 6: Kvittering
      await expect(
        page.getByText("Vi har mottatt refusjonskravet"),
      ).toBeVisible({
        timeout: 10_000,
      });
      await sjekkUniversellUtforming(page, "Kvittering for omsorgspenger");
    },
  );
});
