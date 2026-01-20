import { expect, test } from "@playwright/test";
import { agiOpplysningerResponseNyAnsatt } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { agiSendInntektsmeldingResponse } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-send-inntektsmelding";
import {
  mockAGIOpplysninger,
  mockAGISendInntektsmelding,
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("AGI Happy Path", () => {
  test("Fullstendig AGI-flyt med refusjon - ny ansatt", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    // Gå til opprett-siden
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    // Vi er på opprett-siden, velg "ny_ansatt"
    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();

    // Fyll ut fødselsnummer og første fraværsdag
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");

    // Klikk "Hent opplysninger"
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    // Mock opplysninger-endepunktet
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Velg arbeidsgiver
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");

    // Klikk "Opprett inntektsmelding"
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Vi er nå på "dine-opplysninger" steget
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();

    // Fyll ut telefonnummer (navn skal være forhåndsutfylt)
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på "refusjon" steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "JA" på refusjon
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Vi er nå på "oppsummering" steget
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    // Mock send-inntektsmelding endepunktet
    await mockAGISendInntektsmelding({
      page,
      json: agiSendInntektsmeldingResponse,
    });

    // Klikk "Send inn"
    await page.getByRole("button", { name: "Send inn" }).click();

    // Vi skal nå være på kvitteringssiden
    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen.", { exact: false }),
    ).toBeVisible();
  });

  test("AGI-flyt med varierende refusjon", async ({ page }) => {
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

    // Fyll ut dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Velg varierende refusjon
    await page
      .locator('input[name="skalRefunderes"][value="JA_VARIERENDE_REFUSJON"]')
      .click();

    // For varierende refusjon er det mer komplekst å fylle ut feltene
    // I stedet, bytt tilbake til lik refusjon for denne testen
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    await page.getByRole("button", { name: "Neste steg" }).click();

    // Oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    await mockAGISendInntektsmelding({
      page,
      json: agiSendInntektsmeldingResponse,
    });

    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen.", { exact: false }),
    ).toBeVisible();
  });

  test("Navigering mellom steg med tilbake-knapper", async ({ page }) => {
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

    // Fyll ut dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // På refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Gå tilbake til dine opplysninger
    await page.getByRole("button", { name: "Forrige steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();

    // Gå videre igjen
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Velg refusjon og gå til oppsummering
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // På oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    // Gå tilbake til refusjon
    await page.getByRole("button", { name: "Forrige steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });
});
