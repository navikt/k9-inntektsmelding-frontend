import { expect, Page, test } from "@playwright/test";

import { mangeEksisterendeInntektsmeldingerResponse } from "../../mocks/inntektsmelding/eksisterende-inntektsmeldinger";
import {
  expectError,
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "../../mocks/shared/utils.ts";

test("endringsårsaker uten ekstra felter", async ({ page }) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");
  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await expect(
    page.getByText("Dette hjelper oss å forstå avviket fra rapportert lønn."),
  ).toBeVisible();

  await page.getByLabel("Hva er årsaken til endringen?").selectOption("Bonus");
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Bonus")).toBeVisible({
    visible: false,
  });

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Nyansatt");
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Legg inn dato for Nyansatt")).toBeVisible({
    visible: false,
  });

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Ferietrekk / utbetaling av feriepenger");
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: false });
  await expect(
    page.getByText("Legg inn dato for ferietrekk / utbetaling av feriepenger"),
  ).toBeVisible({ visible: false });

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Feil rapportering til a-ordningen");
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: false });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: false });
  await expect(
    page.getByText("Legg inn dato for Feil rapportering til a-ordningen"),
  ).toBeVisible({ visible: false });
});

test("endringsårsaker med fom dato", async ({ page }) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");
  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await expect(
    page.getByText("Dette hjelper oss å forstå avviket fra rapportert lønn."),
  ).toBeVisible();

  await expect(page.getByText("Legg inn dato for :")).toBeVisible({
    visible: false,
  });

  await forventFomDatoForEndringsÅrsak({
    page,
    endringsÅrsak: "Varig lønnsendring",
  });
  await forventFomDatoForEndringsÅrsak({ page, endringsÅrsak: "Ny stilling" });
  await forventFomDatoForEndringsÅrsak({
    page,
    endringsÅrsak: "Ny stillingsprosent",
  });
});

test("endringsårsaker med fom og tom dato (kun ferie)", async ({ page }) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");
  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await expect(
    page.getByText("Dette hjelper oss å forstå avviket fra rapportert lønn."),
  ).toBeVisible();

  await page.getByLabel("Hva er årsaken til endringen?").selectOption("Ferie");
  await expect(page.getByText(`Legg inn periode for ferie:`)).toBeVisible({
    visible: true,
  });
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: true });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: true });
});

test("endringsårsaker med fom og valgfri tom dato", async ({ page }) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/inntekt-og-refusjon");
  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await expect(
    page.getByText("Dette hjelper oss å forstå avviket fra rapportert lønn."),
  ).toBeVisible();

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Sykefravær");
  await expect(page.getByText(`Legg inn periode for sykefravær:`)).toBeVisible({
    visible: true,
  });
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: true });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: true });
  await page.getByText("Ansatt har fremdeles sykefravær").click();
  await expect(page.getByText("Til og med")).toBeDisabled();

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Permisjon");
  await expect(page.getByText(`Legg inn periode for permisjon:`)).toBeVisible({
    visible: true,
  });
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: true });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: true });
  await page.getByText("Ansatt er fremdeles i permisjon").click();

  await expect(page.getByText("Til og med")).toBeEnabled();

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Permittering");
  await expect(
    page.getByText(`Legg inn periode for permittering:`),
  ).toBeVisible({
    visible: true,
  });
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: true });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: true });
  await page.getByText("Ansatt er fremdeles permittert").click();
  await expect(page.getByText("Til og med")).toBeDisabled();
});

test("oppsummering vises riktig når tomdato er gjort valgfri", async ({
  page,
}) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/k9-im-dialog/1/dine-opplysninger");
  await page.getByLabel("Telefon").fill("12312312");
  await page.getByText("Bekreft og gå videre").click();

  await page.getByRole("button", { name: "Endre månedslønn" }).click();
  await page.getByText("Endret månedsinntekt").fill("50000");

  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption("Sykefravær");
  await page.getByLabel("Fra og med").fill("01.6.2028");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    label: "Fra og med",
    error: "Lønnsendring må være før første dag med fravær",
  });
  await page.getByLabel("Fra og med").fill("01.4.2024");
  await page.getByLabel("Til og med").fill("01.7.2024");

  await page.getByText("Ansatt har fremdeles sykefravær").click();

  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", { name: "Nei" })
    .click();
  await page
    .getByRole("group", {
      name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
    })
    .getByRole("radio", { name: "Nei" })
    .click();
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expect(
    page.getByText("Årsaker").locator("..").getByText("Sykefravær"),
  ).toBeVisible();
  await expect(
    page
      .getByText("Årsaker")
      .locator("..")
      .getByText("Fra og med 01.04.2024", { exact: true }),
  ).toBeVisible();

  await page.route(
    `**/*/imdialog/send-inntektsmelding`,
    async (route, request) => {
      const requestBody = request.postData();
      expect(JSON.parse(requestBody ?? "{}").endringAvInntektÅrsaker).toEqual([
        {
          årsak: "SYKEFRAVÆR",
          fom: "2024-04-01", // Viktig at tom er undefined.
        },
      ]);
      await route.continue();
    },
  );

  await page.getByRole("button", { name: "Send inn" }).click();
});

test("tariffendring vises riktig i oppsummering", async ({ page }) => {
  await mockOpplysninger({
    page,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
    json: mangeEksisterendeInntektsmeldingerResponse,
    uuid: "f29dcea7-febe-4a76-911c-ad8f6d3e8858",
  });

  await page.goto("/k9-im-dialog/f29dcea7-febe-4a76-911c-ad8f6d3e8858");
  await page.getByRole("link", { name: "Endre inntekt" }).click();

  // When editing an existing inntektsmelding, there might already be endringsårsaker
  // Click "Legg til ny endringsårsak" to add a new one
  await page.getByRole("button", { name: "Legg til ny endringsårsak" }).click();

  // Find the last endringsårsak select (the one we just added) and select Tariffendring
  const endringsårsakSelects = page.getByLabel("Hva er årsaken til endringen?");
  const count = await endringsårsakSelects.count();
  await endringsårsakSelects.nth(count - 1).selectOption("Tariffendring");

  // Fill in "Fra og med" date - find the last one (for the tariffendring we just added)
  const fraOgMedInputs = page.getByLabel("Fra og med");
  await fraOgMedInputs.nth(2).fill("01.03.2024");

  // Fill in "Ble kjent fra" date - this should be unique to tariffendring
  await page.getByLabel("Ble kjent fra").last().fill("15.03.2024");

  await page
    .getByRole("group", {
      name: "Betaler dere lønn under fraværet og krever refusjon?",
    })
    .getByRole("radio", { name: "Nei" })
    .click();
  await page
    .getByRole("group", {
      name: "Har den ansatte naturalytelser som faller bort ved fraværet?",
    })
    .getByRole("radio", { name: "Nei" })
    .click();
  await page.getByRole("button", { name: "Neste steg" }).click();

  // Verify we're on the summary page
  await expect(
    page.getByRole("heading", { name: "Oppsummering" }),
  ).toBeVisible();

  // Verify tariffendring is displayed correctly
  await expect(
    page.getByText("Årsaker").locator("..").getByText("Tariffendring"),
  ).toBeVisible();

  // Verify the value shows "fra og med [date], ble kjent fra [date]"
  await expect(
    page.getByText("fra og med 01.03.2024, ble kjent fra 15.03.2024"),
  ).toBeVisible();
});

const forventFomDatoForEndringsÅrsak = async ({
  page,
  endringsÅrsak,
}: {
  page: Page;
  endringsÅrsak: string;
}) => {
  await page
    .getByLabel("Hva er årsaken til endringen?")
    .selectOption(endringsÅrsak);
  await expect(
    page.getByText(`Legg inn dato for ${endringsÅrsak}:`),
  ).toBeVisible({
    visible: true,
  });
  await expect(page.getByText("Fra og med")).toBeVisible({ visible: true });
  await expect(page.getByText("Til og med")).toBeVisible({ visible: false });
};
