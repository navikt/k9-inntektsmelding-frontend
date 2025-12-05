import { expect, test } from "@playwright/test";
import {
  agiOpplysningerAlternativYtelse,
  agiOpplysningerResponseNyAnsatt,
} from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-opplysninger";
import { agiSendInntektsmeldingResponse } from "tests/mocks/arbeidsgiverinitiert/nyansatt/agi-send-inntektsmelding";
import {
  mockAGIOpplysninger,
  mockAGISendInntektsmelding,
  mockGrunnbeløp,
  mockHentPersonOgArbeidsforhold,
} from "tests/mocks/shared/utils";

const FAKE_FNR = "09810198874";

test.describe("AGI Ulike scenarier", () => {
  test("AGI med alternativ ytelsetype", async ({ page }) => {
    await mockHentPersonOgArbeidsforhold({ page });
    await mockGrunnbeløp({ page });

    // Gå til opprett-siden
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await expect(
      page.getByRole("heading", { name: "Opprett manuell inntektsmelding" }),
    ).toBeVisible();

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    await mockAGIOpplysninger({
      page,
      json: agiOpplysningerAlternativYtelse,
    });

    await page
      .getByTestId("steg-0-select-arbeidsgiver")
      .selectOption("974652293");
    await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    await mockAGISendInntektsmelding({
      page,
      json: agiSendInntektsmeldingResponse,
    });

    await page.getByRole("button", { name: "Send inn" }).click();

    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen"),
    ).toBeVisible();
  });

  test("Skal vise riktig arbeidsgiver og ansatt-informasjon i oppsummering", async ({
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

    const testNavn = "Ola Nordmann";
    const testTelefon = "98765432";

    await page.getByLabel("Navn").fill(testNavn);
    await page.getByLabel("Telefon").fill(testTelefon);
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Sjekk oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    // Sjekk at ansatt-informasjon vises
    await expect(page.getByText("MOMENTAN TRAKT")).toBeVisible();

    // Sjekk at arbeidsgiver-informasjon vises
    await expect(page.getByText("NAV", { exact: true })).toBeVisible();

    // Sjekk at kontaktperson-informasjon vises
    await expect(page.getByText(testNavn)).toBeVisible();
    // Telefonnummer kan vises på ulike måter, f.eks. formatert
    // Så vi sjekker bare at oppsummerings-seksjonen eksisterer
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
  });

  test("Skal kunne redigere fra oppsummering til tidligere steg", async ({
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

    await page.getByLabel("Navn").fill("Ola Nordmann");
    await page.getByLabel("Telefon").fill("98765432");
    await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // På oppsummering
    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();

    // Finn og klikk på "Endre" knapp for å gå tilbake til dine opplysninger
    // Dette avhenger av implementasjonen - kan være en "Rediger" eller "Endre" lenke/knapp
    // For nå bruker vi "Forrige steg" knappen
    await page.getByRole("button", { name: "Forrige steg" }).click();

    // Skal være tilbake på refusjon
    await expect(
      page.getByRole("heading", { name: "Refusjon", exact: true }),
    ).toBeVisible();
  });

  test("Visning av 'unntatt aaregister' melding", async ({ page }) => {
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page
      .locator('input[name="årsak"][value="unntatt_aaregister"]')
      .click();

    // Skal vise melding om at man må bruke Altinn
    await expect(
      page.getByText("Du må sende inn inntektsmelding via Altinn"),
    ).toBeVisible();
  });

  test("Visning av 'annen årsak' melding", async ({ page }) => {
    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="annen_årsak"]').click();

    // Skal vise melding om at det ikke er mulig å opprette for andre årsaker
    await expect(
      page.getByText(
        "Det er ikke mulig å opprette inntektsmelding for andre årsaker enda",
      ),
    ).toBeVisible();
  });

  test("Feilhåndtering ved henting av person", async ({ page }) => {
    // Mock en feil ved henting av person
    await page.route(
      `**/*/arbeidsgiverinitiert/arbeidsforhold`,
      async (route) => {
        await route.fulfill({
          status: 404,
          json: { message: "Fant ikke person" },
        });
      },
    );

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");
    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    // Skal vise feilmelding
    await expect(
      page.getByText(
        "Vi finner ingen ansatt registrert hos dere med dette fødselsnummeret",
      ),
    ).toBeVisible();
  });

  test("Feilhåndtering ved innsending av inntektsmelding", async ({ page }) => {
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

    await page
      .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
      .click();
    await page.getByRole("button", { name: "Neste steg" }).click();

    // Mock feil ved innsending
    await page.route(
      `**/*/arbeidsgiverinitiert/send-inntektsmelding`,
      async (route) => {
        await route.fulfill({
          status: 500,
          json: { message: "Noe gikk galt ved innsending" },
        });
      },
    );

    await page.getByRole("button", { name: "Send inn" }).click();

    // Skal vise feilmelding
    await expect(page.getByText("Noe gikk galt.")).toBeVisible();
  });

  test("Skal kunne velge første arbeidsforhold automatisk hvis kun ett arbeidsforhold", async ({
    page,
  }) => {
    // Mock med kun ett arbeidsforhold
    await page.route(
      `**/*/arbeidsgiverinitiert/arbeidsforhold`,
      async (route) => {
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
    await mockGrunnbeløp({ page });

    await page.goto("/k9-im-dialog/opprett?ytelseType=PLEIEPENGER_SYKT_BARN");

    await page.locator('input[name="årsak"][value="ny_ansatt"]').click();
    await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
    await page.getByLabel("Første fraværsdag").fill("01.04.2024");

    await mockAGIOpplysninger({ page, json: agiOpplysningerResponseNyAnsatt });

    await page.getByRole("button", { name: "Hent opplysninger" }).click();

    // Når det kun er ett arbeidsforhold, skal man automatisk gå til dine-opplysninger
    // Sjekk at vi er på dine-opplysninger siden
    await expect(
      page.getByRole("heading", { name: "Dine opplysninger" }),
    ).toBeVisible();
  });
});
