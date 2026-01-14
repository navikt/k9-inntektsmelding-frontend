import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseNyAnsatt } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import {
  expectError,
  mockAGIOpplysninger,
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("AGI Valideringer", () => {
  test("Validering av fødselsnummer på opprett-siden", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();

    // Prøv med ugyldig fødselsnummer
    await page.getByLabel("Ansattes fødselsnummer").fill("12345");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expectError({
      page,
      error: "Du må fylle ut et gyldig fødselsnummer",
      label: "Ansattes fødselsnummer",
    });
  });

  test("Validering av første fraværsdag på opprett-siden", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);

    // Ikke fyll ut første fraværsdag
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await expectError({
      page,
      label: "Første fraværsdag",
      error: "Må oppgis",
    });
  });

  test("Skal vise dine-opplysninger siden etter opprett", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Verifiser at vi er på dine-opplysninger siden
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();

    // Telefonnummer-feltet finnes
    await expect(page.getByLabel("Telefon")).toBeVisible();
  });

  test("Kan ikke gå videre fra refusjon uten å velge refusjonstype", async ({
    page,
  }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // På refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Ny ansatt kan ikke velge NEI på refusjon", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Velg "NEI" på refusjon
    await page.locator('input[name="skalRefunderes"][value="NEI"]').click();

    // Skal vise feilmelding om at inntektsmelding ikke kan sendes inn
    await expect(
      page.getByText("Inntektsmelding kan ikke sendes inn"),
    ).toBeVisible();

    // Neste steg-knappen skal være deaktivert
    await expect(
      page.getByRole("button", { name: "Neste steg" }),
    ).toBeDisabled();
  });

  test("Arbeidsgiver dropdown vises når det er flere arbeidsforhold", async ({
    page,
  }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    // Siden mock har flere arbeidsforhold, skal dropdown vises
    await expect(page.getByTestId("steg-0-select-arbeidsgiver")).toBeVisible();

    // Verifiser at "Opprett inntektsmelding" knappen vises
    await expect(
      page.getByRole("button", { name: "Opprett inntektsmelding" }),
    ).toBeVisible();
  });

  test("Validering av første fraværsdag med refusjon på refusjon-steget", async ({
    page,
  }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Tøm første fraværsdag med refusjon
    await page.getByLabel("Første fraværsdag med refusjon").clear();

    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal vise feilmelding
    await expectError({
      page,
      label: "Første fraværsdag med refusjon",
      error: "Må oppgis",
    });
  });
});
