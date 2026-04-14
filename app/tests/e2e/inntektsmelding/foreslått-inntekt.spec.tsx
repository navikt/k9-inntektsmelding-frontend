import { expect, test } from "@playwright/test";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/shared/utils";

import {
  enkeltOpplysningerResponse,
  opplysningerMedAInntektNede,
  opplysningerMedBådeRapportertOgIkkePassert,
  opplysningerMedFlereEnn3Måneder,
  opplysningerMedSisteMånedIkkeRapportertFørRapporteringsfrist,
  opplysningerMedSisteMånedRapportert0,
} from "../../mocks/inntektsmelding/opplysninger.ts";
import { enkelSendInntektsmeldingResponse } from "../../mocks/inntektsmelding/send-inntektsmelding.ts";

test("[08.05] Alle 3 måneder har rapportert inntekt", async ({ page }) => {
  await mockOpplysninger({ page, json: enkeltOpplysningerResponse });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("Februar:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Mars:50 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("April:57 000")).toBeVisible();
  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("53 000"),
  ).toBeVisible();

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: false });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: false });
});

test("[01.05] Siste måned er ikke rapportert - frist ikke passert", async ({
  page,
}) => {
  await mockOpplysninger({
    page,
    json: opplysningerMedSisteMånedIkkeRapportertFørRapporteringsfrist,
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("Januar:53 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Februar:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Mars:50 000")).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("April:Ikke rapportert"),
  ).toBeVisible();
  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("51 666,67"),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("gjennomsnittinntekt-block")
      .getByText("Gjennomsnittet av lønn fra januar, februar og mars"),
  ).toBeVisible();

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: false });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: true });
});

test("[08.05] mangler siste måned men brukt i gjennomsnitt - frist passert", async ({
  page,
}) => {
  await mockOpplysninger({
    page,
    json: opplysningerMedSisteMånedRapportert0,
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("Februar:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Mars:50 000")).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("April:Ikke rapportert (0kr)"),
  ).toBeVisible();
  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("34 000"),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("gjennomsnittinntekt-block")
      .getByText("Gjennomsnittet av lønn fra februar, mars og april"),
  ).toBeVisible();

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: true });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: false });
});

test("[04.04] 2 siste måneder mangler før rapporteringsfrist", async ({
  page,
}) => {
  await mockOpplysninger({
    page,
    json: opplysningerMedFlereEnn3Måneder,
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("Desember:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Januar:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Februar:52 000")).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("Mars:Ikke rapportert"),
  ).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("April:Ikke rapportert"),
  ).toBeVisible();

  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("52 000"),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("gjennomsnittinntekt-block")
      .getByText("Gjennomsnittet av lønn fra desember, januar og februar"),
  ).toBeVisible();

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: false });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: true });
});

test("[??.??] siste måned ikke passert, nest siste passert", async ({
  page,
}) => {
  await mockOpplysninger({
    page,
    json: opplysningerMedBådeRapportertOgIkkePassert,
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("August:52 000")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("September:52 000")).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("Oktober:Ikke rapportert (0kr)"),
  ).toBeVisible();
  await expect(
    beregnetMånedslønn.getByText("November:Ikke rapportert"),
  ).toBeVisible();

  await expect(
    page.getByTestId("gjennomsnittinntekt-block").getByText("52 000"),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("gjennomsnittinntekt-block")
      .getByText("Gjennomsnittet av lønn fra august, september og oktober"),
  ).toBeVisible();

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: false });
  await expect(
    beregnetMånedslønn.getByTestId(
      "alert-både-ikke-rapportert-og-brukt-i-snitt",
    ),
  ).toBeVisible({ visible: true });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: false });
});

test("A-inntekt er nede", async ({ page }) => {
  await mockOpplysninger({
    page,
    json: opplysningerMedAInntektNede,
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });
  await page.goto("/k9-im-dialog/1/dine-opplysninger");

  // Fyll ut navn og telefonnummer på "dine-opplysninger steget"
  await page.getByLabel("Navn").fill("Test Brukersen");
  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

  const beregnetMånedslønn = page
    .getByRole("heading", { name: "Beregnet månedslønn" })
    .locator("..");

  await expect(beregnetMånedslønn.getByText("Februar:-")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("Mars:-")).toBeVisible();
  await expect(beregnetMånedslønn.getByText("April:-")).toBeVisible();
  await expect(page.getByTestId("gjennomsnittinntekt-block")).toBeVisible({
    visible: false,
  });
  await expect(
    page.getByText("Gjennomsnittet av lønn fra februar, mars og april"),
  ).toBeVisible();

  await page
    .locator("label")
    .filter({ hasText: "Beregnet månedslønn" })
    .fill("34000");

  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-brukt-i-snitt"),
  ).toBeVisible({ visible: false });
  await expect(
    beregnetMånedslønn.getByTestId("alert-a-inntekt-er-nede"),
  ).toBeVisible({ visible: true });
  await expect(
    beregnetMånedslønn.getByTestId("alert-ikke-rapportert-frist-ikke-passert"),
  ).toBeVisible({ visible: false });

  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", { name: "Ja, likt beløp i hele perioden" })
    .click();

  await page
    .getByRole("group", {
      name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
    })
    .getByRole("radio", { name: "Nei" })
    .click();

  await page.getByRole("button", { name: "Neste steg" }).click();

  // Nå er vi på "oppsummering"-steget.
  await expect(
    page.getByRole("heading", { name: "Oppsummering" }),
  ).toBeVisible();

  await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
    await route.fulfill({ json: enkelSendInntektsmeldingResponse });
  });
  await page.getByRole("button", { name: "Send inn" }).click();

  await expect(
    page.getByText("Vi har mottatt inntektsmeldingen"),
  ).toBeVisible();
});
