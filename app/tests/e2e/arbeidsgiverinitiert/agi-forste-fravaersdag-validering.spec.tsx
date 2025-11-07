import { expect, test } from "@playwright/test";
import {
  mockAGIOpplysninger,
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
} from "tests/mocks/shared/utils";

import { agiOpplysningerResponseNyAnsatt } from "../../mocks/arbeidsgiverinitiert/agi-opplysninger";

const FAKE_FNR = "09810198874";

test.describe("AGI Første fraværsdag validering", () => {
  test.beforeEach(async ({ page }) => {
    await mockGrunnbeløp({ page });
  });

  test("Skal validere første fraværsdag før navigering til oppsummering", async ({
    page,
  }) => {
    // Mock successful person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "JA" på refusjon
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    // Mock successful validation for the date
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        const request = route.request();
        const postData = JSON.parse(request.postData() || "{}");

        // Sjekk at riktig data sendes
        expect(postData.fødselsnummer).toBe(FAKE_FNR);
        expect(postData.ytelseType).toBe("PLEIEPENGER_SYKT_BARN");
        expect(postData.førsteFraværsdag).toBe("2024-04-01");

        await route.fulfill({
          json: {
            fornavn: "MOMENTAN",
            etternavn: "TRAKT",
            arbeidsforhold: [
              {
                organisasjonsnavn: "NAV",
                organisasjonsnummer: "974652293",
              },
            ],
            kjønn: "MANN",
          },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Vi skal nå være på oppsummering-steget (validering var vellykket)
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
  });

  test("Skal vise feilmelding når person ikke finnes", async ({ page }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    // Mock failed validation - person not found
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        await route.fulfill({
          status: 404,
          json: { type: "FANT_IKKE_PERSON" },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal vise feilmelding
    await expect(
      page.getByText(
        "Vi finner ingen ansatt registrert hos dere med dette fødselsnummeret",
      ),
    ).toBeVisible();

    await expect(
      page.getByText(
        "Sjekk om fødselsnummeret er riktig og at den ansatte er registrert hos dere i Aa-registeret",
      ),
    ).toBeVisible();

    // Skal fortsatt være på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Skal vise feilmelding når dato er ugyldig", async ({ page }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();

    // Mock failed validation - invalid date
    await page.route(
      "**/*/arbeidsgiverinitiert/arbeidsforhold",
      async (route) => {
        await route.fulfill({
          status: 403,
          json: { type: "INGEN_SAK_FUNNET" },
        });
      },
    );

    // Klikk "Neste steg" - dette skal trigge validering
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Skal vise feilmelding for ugyldig dato
    await expect(
      page.getByText(
        "Du kan ikke sende inn inntektsmelding for pleiepenger sykt barn med denne datoen som første fraværsdag med refusjon.",
      ),
    ).toBeVisible();

    // Skal fortsatt være på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Skal ikke validere når 'NEI' er valgt på refusjon", async ({
    page,
  }) => {
    // Mock successful initial person lookup
    await mockHentPersonOgArbeidsforhold({ page });
    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    // Gå til opprett-siden og opprett inntektsmelding
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");
    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();
    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    // Gå gjennom dine opplysninger
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    // Vi er nå på refusjon-steget
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();

    // Velg "NEI" på refusjon
    await page.locator('input[name="skalRefunderes"][value="NEI"]').click();

    // Knappen skal være disabled når NEI er valgt
    const nesteStegButton = page.getByRole("button", { name: "Neste steg" });
    await expect(nesteStegButton).toBeDisabled();

    // Ingen validering skal skje siden knappen er disabled
  });
});
